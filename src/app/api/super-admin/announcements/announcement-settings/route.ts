import getDb from "../../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export async function GET() {
  try {
    const db = await getDb();
    const settings = db
      .prepare("SELECT * FROM announcement_settings LIMIT 1")
      .get();
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

// 🔒 SECURE PUT — Only admins update announcement settings
export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { theme, bg_color, text_color, speed, custom_html, custom_css } =
      await req.json();

    const db = await getDb();
    db.prepare(
      `
      UPDATE announcement_settings
      SET theme=?, bg_color=?, text_color=?, speed=?, custom_html=?, custom_css=?, updatedAt=?
      WHERE id=1
    `
    ).run(
      theme,
      bg_color,
      text_color,
      speed,
      custom_html,
      custom_css,
      Date.now()
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
