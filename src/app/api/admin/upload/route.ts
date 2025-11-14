// filename: src/app/api/admin/upload/route.ts

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import getDb from "../../../database/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public/uploads");

    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    // Save record to DB (optional)
    const db = await getDb();
    db.prepare(
      `INSERT INTO uploads (file_name, file_path, mime_type, size, uploaded_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(file.name, fileUrl, file.type, buffer.length, timestamp);

    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
