// filename: src/app/api/super-admin/upload/route.ts

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import getDb from "../../../database/db";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public/uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const cleanName = file.name.replace(/\s+/g, "_");
    const fileName = `${timestamp}-${cleanName}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    const db = await getDb();
    db.prepare(
      `INSERT INTO uploads (file_name, file_path, mime_type, size, uploaded_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(fileName, fileUrl, file.type, buffer.length, timestamp);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("Admin upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
