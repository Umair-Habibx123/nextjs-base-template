// app/api/public/email-templates/route.js
import { NextResponse } from "next/server";
import getDb from "../../../database/db";

export async function GET() {
  try {
    const db = await getDb();
    const templates = db
      .prepare("SELECT * FROM email_templates ORDER BY updatedAt DESC")
      .all();
    return NextResponse.json({ success: true, templates });
  } catch (err) {
    console.error("GET /api/public/email-templates error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
