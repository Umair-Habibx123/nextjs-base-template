export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/utils/protect";

export default function proxy(req: NextRequest) {
  console.log("🔥 PROXY IS RUNNING");

  if (process.env.SITE_PASSWORD_ENABLED === "false") {
    return NextResponse.next();
  }

  const token = req.cookies.get("site_access")?.value;
  const verified = verifyToken(token, req);

  const pathname = req.nextUrl.pathname;

  if (
    pathname.startsWith("/password") ||
    pathname.startsWith("/api/password")
  ) {
    return NextResponse.next();
  }

  if (verified === "granted") {
    return NextResponse.next();
  }

  const encoded = Buffer.from(pathname).toString("base64");

  const url = new URL(`/password?return=${encoded}`, req.url);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|static|public).*)"],
};

// ❌ Stolen cookie → INVALID
// ❌ Cookie copied to other PC → INVALID
// ❌ Cookie copied to other browser → INVALID
// ❌ Changing IP (VPN/4G/WiFi) → INVALID
// ❌ Cookie older than X minutes → INVALID
// ❌ Modifying 1 character → INVALID
// ✔ Only valid on original device + network + browser
