import getDb from "../../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, context: any) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  const { params } = context;
  const lang = params?.lang;

  if (!lang) {
    return NextResponse.json(
      { success: false, message: "Missing language code" },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    db.prepare("DELETE FROM translations WHERE lang_code = ?").run(lang);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting translation:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete translation" },
      { status: 500 }
    );
  }
}
