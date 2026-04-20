import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type BackfillEvent = {
  pageViewId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

// Public backfill endpoint (TEMPORARY)
// This endpoint is intentionally placed under /api/backfill for the one-time backfill job.
// It is not protected by admin session checks — remove or lock down after backfill is complete.
export async function POST(req: NextRequest) {
  try {
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
      } catch (e: unknown) {
        errors.push({
          id: ev.pageViewId,
          error: String(e instanceof Error ? e.message : e),
        });
      }
    }

    return NextResponse.json({ updated, skipped, errors });
  } catch (e) {
    console.error("/api/backfill/pageviews/apply error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
