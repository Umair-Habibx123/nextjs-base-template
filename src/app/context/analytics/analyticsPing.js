// /components/analyticsPing.js
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsPing() {
  const pathname = usePathname();

  useEffect(() => {
    const ref = typeof document !== "undefined" ? document.referrer : "";
    fetch("/api/admin/analytics-api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: ref }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
