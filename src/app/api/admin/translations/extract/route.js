import { NextResponse } from "next/server";
import { extractTranslations } from "../../../../utils/extractor";

export async function GET() {
  try {
    const result = await extractTranslations();
    return NextResponse.json({
      success: true,
      message: `✅ Extracted ${result.keys} keys from ${result.files} files.`,
    });
  } catch (err) {
    console.error("❌ Extraction failed:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Extraction failed" },
      { status: 500 }
    );
  }
}
