import getDb from "../../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    const templates = db
      .prepare("SELECT * FROM announcement_templates ORDER BY createdAt DESC")
      .all();

    return NextResponse.json({ success: true, data: templates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

// 🔒 SECURE: Create a template
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { name, html, css } = await req.json();
    const db = await getDb();

    db.prepare(
      `
      INSERT INTO announcement_templates (name, html, css, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(name, html, css, Date.now(), Date.now());

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

// 🔒 SECURE: Update template
export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { id, name, html, css } = await req.json();
    const db = await getDb();

    db.prepare(
      `
      UPDATE announcement_templates
      SET name=?, html=?, css=?, updatedAt=?
      WHERE id=?
    `
    ).run(name, html, css, Date.now(), id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

// 🔒 SECURE: Delete template
export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { id } = await req.json();
    const db = await getDb();

    db.prepare("DELETE FROM announcement_templates WHERE id=?").run(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
