import { NextResponse } from "next/server";
import getDb from "../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, session } = await requireAuth(req, {
      roles: "superadmin",
    });
    if (errorResponse) return errorResponse;

    const db = await getDb();
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "7"; // '7', '30', 'all'
    const today = new Date().toISOString().split("T")[0];

    // Dynamic range
    let dateCondition = "";
    if (range !== "all") {
      dateCondition = `WHERE day >= DATE('now', '-${range} day')`;
    }

    // Visitors & signups
    const visitorsToday = db
      .prepare(`SELECT COUNT(*) AS c FROM analytics_visits WHERE day = ?`)
      .get(today).c;
    const uniqueVisitors = db
      .prepare(
        `SELECT COUNT(DISTINCT ip_hash) AS c FROM analytics_visits WHERE day = ?`
      )
      .get(today).c;
    const signups = db
      .prepare(
        `
  SELECT COUNT(*) AS c
  FROM user
  WHERE DATE(createdAt / 1000, 'unixepoch') = DATE('now', 'localtime')
`
      )
      .get().c;

    const signupsByRole = db
      .prepare(
        `
  SELECT role, COUNT(*) AS c
  FROM user
  WHERE DATE(createdAt / 1000, 'unixepoch') = DATE('now', 'localtime')
  GROUP BY role
`
      )
      .all();

    // Trend
    const trend = db
      .prepare(
        `
      SELECT day, COUNT(DISTINCT ip_hash) AS visitors
      FROM analytics_visits
      ${dateCondition}
      GROUP BY day
      ORDER BY day ASC
    `
      )
      .all();

    // Top locations
    const topCountries = db
      .prepare(
        `
      SELECT country, COUNT(*) AS c
      FROM analytics_visits
      ${dateCondition}
      GROUP BY country
      ORDER BY c DESC
      LIMIT 10
    `
      )
      .all();

    const topCities = db
      .prepare(
        `
      SELECT city, country, COUNT(*) AS c
      FROM analytics_visits
      ${dateCondition}
      GROUP BY city, country
      ORDER BY c DESC
      LIMIT 10
    `
      )
      .all();

    // Mock performance metrics (replace with real if available)
    const avgSessionDuration = 3 + Math.floor(Math.random() * 5);
    const bounceRate = 40 + Math.floor(Math.random() * 20);
    const systemStatus = "Online";

    return NextResponse.json({
      success: true,
      data: {
        visitorsToday,
        uniqueVisitors,
        signups,
        signupsByRole,
        avgSessionDuration,
        bounceRate,
        trend,
        topCountries,
        topCities,
        systemStatus,
      },
    });
  } catch (err) {
    console.error("App Info Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
