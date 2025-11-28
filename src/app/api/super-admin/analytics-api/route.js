import { NextResponse } from "next/server";
import getDb from "../../../database/db";
import {
  parseUA,
  ipFromHeaders,
  ipHash,
  countryFromIP,
  fingerprint,
} from "../../../utils/analytics.js";

export const runtime = "nodejs";

export async function POST(req) {
  try {
  const db = await getDb();


    const now = Math.floor(Date.now() / 1000);
    const day = new Date().toISOString().split("T")[0];

    let { path, referrer } = await req.json().catch(() => ({}));

    const headers = req.headers;
    const ip = ipFromHeaders(headers);
    const ip_hash = ipHash(ip);
    const uaRaw = headers.get("user-agent") || "";
    const ua = parseUA(uaRaw);
    const loc = await countryFromIP(ip);
    const { country, region, city } = loc;
    const fp = fingerprint(ip_hash, ua);

    // Single entry per IP per day
    const existing = db
      .prepare(`SELECT id FROM analytics_visits WHERE ip_hash = ? AND day = ?`)
      .get(ip_hash, day);

    if (existing) {
      db.prepare(
        `UPDATE analytics_visits SET visits = visits + 1 WHERE id = ?`
      ).run(existing.id);
    } else {
      db.prepare(
        `
        INSERT INTO analytics_visits (
          ip_hash, fingerprint, browser, os, device_type,
          country, region, city, path, referrer, day, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      ).run(
        ip_hash,
        fp,
        ua.browser,
        ua.os,
        ua.deviceType,
        country,
        region,
        city,
        path || "",
        referrer || "",
        day,
        now
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
