// /utils/analytics.js
import { UAParser } from "ua-parser-js";
import crypto from "crypto";

export function parseUA(uaRaw) {
  const parser = new UAParser(uaRaw || "");
  const browser = parser.getBrowser().name || "Unknown";
  const os = parser.getOS().name || "Unknown";
  const device = parser.getDevice();
  let deviceType = "desktop";
  if (device.type === "mobile") deviceType = "mobile";
  else if (device.type === "tablet") deviceType = "tablet";
  else if (!browser && !os) deviceType = "bot";
  return { browser, os, deviceType };
}

export function ipFromHeaders(headers) {
  const xff = headers.get("x-forwarded-for");
  return (
    (xff && xff.split(",")[0].trim()) || headers.get("x-real-ip") || "127.0.0.1"
  );
}

export function ipHash(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function countryFromIP(ip) {
  try {
    const res = await fetch(`https://ipwho.is/${ip}`);
    const data = await res.json();
    if (!data.success) throw new Error("Lookup failed");

    return {
      country: data.country || "UNK",
      region: data.region || "UNK",
      city: data.city || "UNK",
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    };
  } catch {
    return {
      country: "UNK",
      region: "UNK",
      city: "UNK",
      latitude: 0,
      longitude: 0,
    };
  }
}

export function fingerprint(ipHashVal, ua) {
  return `${ipHashVal}|${ua.browser}|${ua.os}|${ua.deviceType}`;
}

export const SESSION_TTL_SECONDS = 30 * 60; // 30 minutes
