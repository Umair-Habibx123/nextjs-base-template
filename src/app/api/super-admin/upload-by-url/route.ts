import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // 🔒 Require superadmin
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: 0, message: "URL missing" });
    }

    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = url.split(".").pop()?.split("?")[0] || "jpg";
    const fileName = `${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: 1,
      file: { url: `/uploads/${fileName}` },
    });
  } catch (err) {
    console.error("Upload-by-URL error:", err);
    return NextResponse.json({ success: 0 });
  }
}
