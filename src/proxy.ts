import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/utils/protect";
import { getGlobalSettings } from "@/utils/getGlobalSettings";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (
    pathname.startsWith("/admin-auth") ||
    pathname.startsWith("/admin-dashboard") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const settings = await getGlobalSettings();
  const { site_under_construction, site_password_enabled } = settings;

  if (site_under_construction) {
    if (pathname.startsWith("/construction")) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/construction", req.url), {
  status: 307
});

  }

  if (!site_password_enabled) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/password") ||
    pathname.startsWith("/api/password")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("site_access")?.value;
  const verified = verifyToken(token, req);

  if (verified === "granted") {
    return NextResponse.next();
  }

  const encoded = Buffer.from(pathname).toString("base64");
  return NextResponse.redirect(new URL(`/password?return=${encoded}`, req.url));
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|assets/).*)"],
};
