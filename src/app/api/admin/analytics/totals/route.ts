import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalPageViews = await prisma.pageView.count();

    const totalUsers = await prisma.user.count();
    // Count distinct users who had a session in the last 7 days.
    // Prisma's typed where filters for `not: null` can be awkward; use a lightweight raw query here.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersRows = (await prisma.$queryRawUnsafe(
      'SELECT COUNT(DISTINCT "userId") as c FROM "Session" WHERE "lastAccessedAt" >= $1 AND "userId" IS NOT NULL',
      sevenDaysAgo
    )) as Array<{ c: bigint }>;
    let activeUsers = Number(activeUsersRows?.[0]?.c ?? 0);
    // If there are no recent sessions, fall back to a PageView-based proxy (distinct IPs)
    let activeUsersSource: "sessions" | "pageviews" = "sessions";
    if (activeUsers === 0) {
      const pvRows = (await prisma.$queryRawUnsafe(
        'SELECT COUNT(DISTINCT "ipAddress") as c FROM "PageView" WHERE "createdAt" >= $1',
        sevenDaysAgo
      )) as Array<{ c: bigint }>;
      const pvDistinct = Number(pvRows?.[0]?.c ?? 0);
      if (pvDistinct > 0) {
        activeUsers = pvDistinct;
        activeUsersSource = "pageviews";
      }
    }

    const top = await prisma.pageView.groupBy({
      by: ["weddingPageId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const pageIds = top.map((t) => t.weddingPageId);
    const pages = await prisma.weddingPage.findMany({
      where: { id: { in: pageIds } },
      select: { id: true, slug: true, title: true },
    });

    const topPages = top.map((t) => ({
      weddingPageId: t.weddingPageId,
      count: t._count.id,
      page: pages.find((p) => p.id === t.weddingPageId) ?? null,
    }));

    return NextResponse.json({
      totalPageViews,
      totalUsers,
      activeUsers,
      activeUsersSource,
      topPages,
    });
  } catch (e) {
    console.error("/api/admin/analytics/totals error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
