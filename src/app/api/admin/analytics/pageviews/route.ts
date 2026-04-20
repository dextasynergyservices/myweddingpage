/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashIp(ip?: string) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || undefined;
    const limit = Math.min(100, Number(url.searchParams.get("limit") || "25"));
    const afterId = url.searchParams.get("afterId") || undefined;
    // default to anonymize unless explicitly requested false
    let anonymize = true;
    const anonymizeParam = url.searchParams.get("anonymize");
    if (anonymizeParam === "false") anonymize = false;

    // For security, read the authoritative flag from the database for the current user
    // (this avoids needing a session/token refresh after the admin toggles the setting)
    const userId = (session as any)?.user?.id as string | undefined;
    let sessionAllowsRaw = false;
    if (userId) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { showRawIps: true },
        });
        sessionAllowsRaw = Boolean(dbUser?.showRawIps);
      } catch (e) {
        console.error("Failed to read user showRawIps from DB:", e);
        sessionAllowsRaw = false;
      }
    }

    // Only allow raw IPs when the DB flag permits it. The client may request anonymize=false,
    // but we will only honor that when sessionAllowsRaw === true.
    if (anonymizeParam === "false" && sessionAllowsRaw) {
      anonymize = false;
    } else {
      anonymize = true;
    }

    // Diagnostic logging to help debug why IP/UA may be missing in responses
    try {
      console.log(
        "/api/admin/analytics/pageviews called by userId=",
        userId,
        "anonymizeParam=",
        anonymizeParam,
        "sessionAllowsRaw=",
        sessionAllowsRaw
      );
    } catch {
      // ignore
    }

    const where: Record<string, unknown> = {};
    if (slug) {
      const page = await prisma.weddingPage.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!page) return NextResponse.json({ items: [], nextCursor: null });
      where.weddingPageId = page.id;
    }

    // keyset pagination by id (createdAt desc, id desc)
    const orderBy = [{ createdAt: "desc" }, { id: "desc" }];

    const args: {
      where: Record<string, unknown>;
      orderBy: any[];
      take: number;
      cursor?: { id: string };
      skip?: number;
    } = { where, orderBy, take: limit + 1 };
    if (afterId) {
      args.cursor = { id: afterId };
      args.skip = 1;
    }

    const rows = await prisma.pageView.findMany(args);
    const hasMore = rows.length === limit + 1;
    if (hasMore) rows.pop();

    const items = await Promise.all(
      rows.map(async (r) => {
        const page = await prisma.weddingPage.findUnique({
          where: { id: r.weddingPageId },
          select: { slug: true, title: true },
        });
        return {
          id: r.id,
          weddingPageId: r.weddingPageId,
          slug: page?.slug ?? null,
          title: page?.title ?? null,
          userAgent: r.userAgent ?? null,
          ipAddress: anonymize ? hashIp(r.ipAddress ?? undefined) : (r.ipAddress ?? null),
          createdAt: r.createdAt,
        };
      })
    );

    const nextCursor = items.length ? items[items.length - 1].id : null;
    return NextResponse.json({
      items,
      nextCursor: hasMore ? nextCursor : null,
      anonymize,
    });
  } catch (err) {
    console.error("/api/admin/analytics/pageviews error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
