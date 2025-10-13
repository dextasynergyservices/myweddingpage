import { NextRequest } from "next/server";
import crypto from "crypto";

// Try a variety of common headers to reliably detect the client's IP address
export function getClientIp(req: NextRequest): string | undefined {
  // Check common forwarding headers
  const headerCandidates = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-client-ip",
    "fastly-client-ip",
    "true-client-ip",
    "x-vercel-forwarded-for",
  ];

  for (const h of headerCandidates) {
    const v = req.headers.get(h);
    if (v) {
      // x-forwarded-for may contain a comma-separated list
      return v.split(",")[0].trim();
    }
  }

  // Fallback: try the standard header
  const forwarded = req.headers.get("forwarded");
  if (forwarded) {
    // forwarded: for=<ip>;proto=...;
    const m = forwarded.match(/for=\"?([^;\"]+)\"?/i);
    if (m) return m[1];
  }

  // Nothing found
  return undefined;
}

export function hashIp(ip?: string) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex");
}
