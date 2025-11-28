// filename: app/api/public/favicon/route.ts
import { NextResponse } from "next/server";
import getDb from "../../../database/db";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const db = await getDb();
    const settings = db
      .prepare("SELECT site_favicon FROM global_settings LIMIT 1")
      .get() as { site_favicon?: string };

   
    if (!settings?.site_favicon) {
      const defaultFaviconPath = path.join(
        process.cwd(),
        "public",
        "favicon.ico"
      );

      if (fs.existsSync(defaultFaviconPath)) {
        const fileBuffer = fs.readFileSync(defaultFaviconPath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "image/x-icon",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
      return new NextResponse("Favicon not found", { status: 404 });
    }

    // Look for favicon in public/uploads directory
    const faviconPath = path.join(
      process.cwd(),
      "public", // Add 'public' to the path
      settings.site_favicon
    );

    if (fs.existsSync(faviconPath)) {
      const fileBuffer = fs.readFileSync(faviconPath);
      const mimeType = getMimeType(settings.site_favicon);

    
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return new NextResponse("Favicon file not found", { status: 404 });
  } catch (error) {
    console.error("Favicon serve error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream";
}
