import getDb from "../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const db = await getDb();
    const rows = db
      .prepare(`SELECT * FROM contacts ORDER BY createdAt DESC`)
      .all();

    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch contacts:", err);
    return NextResponse.json(
      { error: "Failed to load contacts" },
      { status: 500 }
    );
  }
}
