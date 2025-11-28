import getDb from "../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    const rows = db
      .prepare("SELECT * FROM announcements ORDER BY createdAt DESC")
      .all();
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}


export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Announcement text is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    db.prepare(
      `
      INSERT INTO announcements (text, is_active, createdAt, updatedAt)
      VALUES (?, 1, ?, ?)
    `
    ).run(text, Date.now(), Date.now());

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}


export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { id, text, is_active } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    db.prepare(
      `
      UPDATE announcements
      SET text=?, is_active=?, updatedAt=?
      WHERE id=?
    `
    ).run(text, is_active ? 1 : 0, Date.now(), id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}


export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    db.prepare("DELETE FROM announcements WHERE id=?").run(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
