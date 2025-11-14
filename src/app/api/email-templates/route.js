// app/api/email-templates/route.js
import { NextResponse } from "next/server";
import getDb from "../../database/db";

export async function GET() {
  try {
    const db = await getDb();
    const templates = db.prepare("SELECT * FROM email_templates ORDER BY updatedAt DESC").all();
    return NextResponse.json({ success: true, templates });
  } catch (err) {
    console.error("GET /api/email-templates error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const db = await getDb();
    const { name, html = "", json = "{}" } = await req.json();
    const now = Date.now();

    db.prepare(
      `INSERT INTO email_templates (name, html, json, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`
    ).run(name, html, json, now, now);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/email-templates error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const db = await getDb();
    const { id, name, html, json } = await req.json();
    const now = Date.now();

    db.prepare(
      `UPDATE email_templates SET name = ?, html = ?, json = ?, updatedAt = ? WHERE id = ?`
    ).run(name, html, json, now, id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/email-templates error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const db = await getDb();
    const { id } = await req.json();

    db.prepare("DELETE FROM email_templates WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/email-templates error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
