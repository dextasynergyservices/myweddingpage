import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") || "30");
    const limit = Number(url.searchParams.get("limit") || "10");

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    const groups = await prisma.$queryRaw<
      Array<{ weddingPageId: string; count: bigint }>
    >`
      SELECT "weddingPageId", COUNT(*) as count
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY "weddingPageId"
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    const ids = groups.map((g) => g.weddingPageId);
    const pages = await prisma.weddingPage.findMany({
      where: { id: { in: ids } },
      select: { id: true, slug: true, title: true },
    });

    const top = groups.map((g) => ({
      weddingPageId: g.weddingPageId,
      count: Number(g.count),
      page: pages.find((p) => p.id === g.weddingPageId) ?? null,
    }));

    return NextResponse.json({ top });
  } catch (err) {
    console.error("/api/admin/analytics/top error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
