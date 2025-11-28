// app/api/super-admin/email-templates/route.js
import { NextResponse } from "next/server";
import getDb from "../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

// 🔒 Create new template — SUPERADMIN ONLY
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const db = await getDb();
    const { name, html = "", json = "{}" } = await req.json();
    const now = Date.now();

    db.prepare(
      `INSERT INTO email_templates (name, html, json, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`
    ).run(name, html, json, now, now);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/public/email-templates error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// 🔒 Update existing template — SUPERADMIN ONLY
export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const db = await getDb();
    const { id, name, html, json } = await req.json();
    const now = Date.now();

    db.prepare(
      `UPDATE email_templates 
       SET name = ?, html = ?, json = ?, updatedAt = ? 
       WHERE id = ?`
    ).run(name, html, json, now, id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /api/public/email-templates error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// 🔒 Delete template — SUPERADMIN ONLY
export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const db = await getDb();
    const { id } = await req.json();

    db.prepare("DELETE FROM email_templates WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/public/email-templates error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
