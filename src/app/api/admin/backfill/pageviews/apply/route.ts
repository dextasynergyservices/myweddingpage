import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

type BackfillEvent = {
  pageViewId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session as { user?: { role?: string } })?.user?.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!Array.isArray(body))
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const events: BackfillEvent[] = body;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const ev of events) {
      if (!ev.pageViewId) {
        errors.push({ id: ev.pageViewId ?? "", error: "missing pageViewId" });
        continue;
      }
      try {
        const data: Record<string, unknown> = {};
        if (ev.ipAddress !== undefined) data.ipAddress = ev.ipAddress; // may be null
        if (ev.userAgent !== undefined) data.userAgent = ev.userAgent; // may be null

        if (Object.keys(data).length === 0) {
          skipped++;
          continue;
        }

        await prisma.pageView.update({ where: { id: ev.pageViewId }, data });
        updated++;
      } catch (err) {
        errors.push({
          id: ev.pageViewId,
          error: String(err instanceof Error ? err.message : err),
        });
      }
    }

    return NextResponse.json({ updated, skipped, errors });
  } catch (e) {
    console.error("/api/admin/backfill/pageviews/apply error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
