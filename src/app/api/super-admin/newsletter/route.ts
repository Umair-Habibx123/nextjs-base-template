import getDb from "../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 📋 Secure: Fetch all subscribers (Admin only)
export async function GET(req: NextRequest) {
  // Only superadmins or admin roles allowed
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const db = await getDb();
    const rows = db
      .prepare("SELECT * FROM newsletter_subscribers ORDER BY createdAt DESC")
      .all();
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error("Newsletter fetch error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ❌ Secure: Delete selected subscribers (Admin only)
export async function DELETE(req: NextRequest) {
  // Only superadmins
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, message: "No emails provided for deletion." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const placeholders = emails.map(() => "?").join(",");
    const stmt = db.prepare(
      `DELETE FROM newsletter_subscribers WHERE email IN (${placeholders})`
    );
    const result = stmt.run(...emails);

    if (result.changes > 0) {
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.changes} subscriber(s).`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No matching subscribers found.",
      });
    }
  } catch (err: any) {
    console.error("Newsletter delete error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete subscribers." },
      { status: 500 }
    );
  }
}
