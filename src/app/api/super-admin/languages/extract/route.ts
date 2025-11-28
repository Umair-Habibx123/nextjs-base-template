import { NextResponse } from "next/server";
import { extractTranslations } from "../../../../utils/extractor";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const result = await extractTranslations();
    return NextResponse.json({
      success: true,
      message: `✅ Extracted ${result.keys} keys from ${result.files} files.`,
    });
  } catch (err: any) {
    console.error("❌ Extraction failed:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Extraction failed" },
      { status: 500 }
    );
  }
}
