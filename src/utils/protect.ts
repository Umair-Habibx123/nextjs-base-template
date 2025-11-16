import crypto from "crypto";

const SECRET = process.env.SITE_PASSWORD_SECRET!;

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function signToken(value: string, req: Request) {
  const timestamp = Date.now().toString();
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  const ipHash = sha256(ip);
  const uaHash = sha256(ua);

  const nonce = crypto.randomBytes(16).toString("hex");

  const payload = `${value}.${timestamp}.${ipHash}.${uaHash}.${nonce}`;

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  return `${Buffer.from(value).toString("base64")}.` +
         `${Buffer.from(timestamp).toString("base64")}.` +
         `${ipHash}.${uaHash}.${nonce}.${signature}`;
}

export function verifyToken(token: string | undefined, req: Request) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 6) return null;

  const [valueB64, timeB64, ipHash, uaHash, nonce, signature] = parts;

  const value = Buffer.from(valueB64, "base64").toString();
  const timestamp = Buffer.from(timeB64, "base64").toString();

  // replay expiry (10 minutes recommended)
  if (Date.now() - parseInt(timestamp) > 1000 * 60 * 10) {
    return null; 
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  if (sha256(ip) !== ipHash) return null;
  if (sha256(ua) !== uaHash) return null;

  const payload = `${value}.${timestamp}.${ipHash}.${uaHash}.${nonce}`;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  if (expected !== signature) return null;

  return value; // "granted"
}
