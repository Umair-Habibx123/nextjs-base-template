import getDb from "../../../../database/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

export async function GET() {
  const db = await getDb();
  const row = db.prepare("SELECT * FROM global_settings LIMIT 1").get();

  return NextResponse.json({
    success: true,
    data: row || {},
  });
}

// 🔒 SUPERADMIN-ONLY — Update global settings
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  const db = await getDb();
  const body = await req.json();

  const {
    site_logo,
    site_favicon,
    site_password_enabled,
    site_password,
    site_under_construction,
  } = body;

  db.prepare(
    `
    UPDATE global_settings SET 
      site_logo = ?,
      site_favicon = ?,
      site_password_enabled = ?,
      site_password = ?,
      site_under_construction = ?, 
      updatedAt = strftime('%s','now')
    WHERE id = 1
  `
  ).run(
    site_logo,
    site_favicon,
    site_password_enabled ? 1 : 0,
    site_password,
    site_under_construction ? 1 : 0
  );

  return NextResponse.json({
    success: true,
    message: "Settings updated successfully",
  });
}
