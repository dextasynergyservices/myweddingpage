import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (p.startsWith(name + "=")) {
      return decodeURIComponent(p.substring(name.length + 1));
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Prefer explicit header (sent by middleware), fall back to cookie header
    const headerToken = request.headers.get("x-session-token");
    let token = headerToken;

    if (!token) {
      const cookieHeader = request.headers.get("cookie");
      token =
        parseCookieHeader(cookieHeader, "__Secure-next-auth.session-token") ||
        parseCookieHeader(cookieHeader, "__Host-next-auth.session-token") ||
        parseCookieHeader(cookieHeader, "next-auth.session-token") ||
        null;
    }

    if (!token) {
      return NextResponse.json({ ok: false, reason: "no-session-token" }, { status: 401 });
    }

    await prisma.session.updateMany({
      where: { sessionToken: token },
      data: { lastAccessedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Session ping error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
