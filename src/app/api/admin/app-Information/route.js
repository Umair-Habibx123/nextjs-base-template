import { NextResponse } from "next/server";
import getDb from "../../../database/db";

export const runtime = "nodejs";

function startOfDayUnixUTC(d = new Date()) {
  return Math.floor(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000
  );
}

export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();
    const todayStart = startOfDayUnixUTC(now);
    const sevenDaysAgo = todayStart - 6 * 24 * 3600;

    // Visitors today (unique fingerprints)
    const visitorsToday = db
      .prepare(
        `SELECT COUNT(DISTINCT fingerprint) AS total FROM sessions WHERE first_seen >= ?`
      )
      .get(todayStart).total;

    // Unique visitors (unique device/browser combos)
    const uniqueVisitors = db
      .prepare(
        `
        SELECT COUNT(DISTINCT ip_hash || '|' || browser || '|' || os || '|' || device_type) AS c 
        FROM visits WHERE createdAt >= ?
      `
      )
      .get(todayStart).c;

    // Logins today
    const logins = db
      .prepare(
        `SELECT COUNT(*) AS c FROM events WHERE type = 'login' AND createdAt >= ?`
      )
      .get(todayStart).c;

    // Sessions for bounce & duration
    const sessions = db
      .prepare(
        `SELECT pageviews, (last_seen - first_seen) AS dur FROM sessions WHERE last_seen >= ?`
      )
      .all(todayStart);

    const totalSessions = sessions.length;
    const bounces = sessions.filter((s) => s.pageviews <= 1).length;
    const bounceRate = totalSessions ? (bounces / totalSessions) * 100 : 0;
    const avgDur = totalSessions
      ? sessions.reduce((a, s) => a + Math.max(0, s.dur), 0) / totalSessions
      : 0;

    // 7-day trend
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = todayStart - i * 86400;
      const dayEnd = dayStart + 86400;
      const label = new Date(dayStart * 1000).toISOString().slice(0, 10);

      const visitors = db
        .prepare(
          `SELECT COUNT(DISTINCT fingerprint) AS c FROM sessions WHERE first_seen BETWEEN ? AND ?`
        )
        .get(dayStart, dayEnd).c;

      const loginsDay = db
        .prepare(
          `SELECT COUNT(*) AS c FROM events WHERE type = 'login' AND createdAt BETWEEN ? AND ?`
        )
        .get(dayStart, dayEnd).c;

      days.push({ day: label, visitors, logins: loginsDay });
    }

   // 🌍 Top 5 countries (unique visitors by fingerprint)
const topCountries = db
  .prepare(
    `
    SELECT country, COUNT(DISTINCT fingerprint) AS c
    FROM (
      SELECT country, ip_hash || '|' || browser || '|' || os || '|' || device_type AS fingerprint
      FROM visits
      WHERE createdAt >= ?
    )
    GROUP BY country
    ORDER BY c DESC
    LIMIT 5
  `
  )
  .all(sevenDaysAgo);

// 🏙️ Top 5 cities (unique visitors by fingerprint)
const topCities = db
  .prepare(
    `
    SELECT city, country, COUNT(DISTINCT fingerprint) AS c
    FROM (
      SELECT city, country, ip_hash || '|' || browser || '|' || os || '|' || device_type AS fingerprint
      FROM visits
      WHERE createdAt >= ?
    )
    GROUP BY city, country
    ORDER BY c DESC
    LIMIT 5
  `
  )
  .all(sevenDaysAgo);


    return NextResponse.json({
      success: true,
      data: {
        visitorsToday,
        uniqueVisitors,
        logins,
        avgSessionDuration: +(avgDur / 60).toFixed(1),
        bounceRate: +bounceRate.toFixed(1),
        trend: days,
        systemStatus: "Online",
        topCountries,
        topCities,
      },
    });
  } catch (err) {
    console.error("App info error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
