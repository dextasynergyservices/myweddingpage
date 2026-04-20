import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") || "30");
    const anonymize = url.searchParams.get("anonymize") === "true";

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    const rows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*) as count
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `;

    // map into full series filling missing days with 0
    const map = new Map(
      rows.map((r) => [r.day.toISOString().split("T")[0], Number(r.count)])
    );
    const series: Array<{ date: string; count: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      series.push({ date: key, count: map.get(key) ?? 0 });
    }

    return NextResponse.json({ series, anonymize });
  } catch (err) {
    console.error("/api/admin/analytics/daily error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
