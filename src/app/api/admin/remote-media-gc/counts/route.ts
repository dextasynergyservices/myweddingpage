import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // counts by source
    const bySourceRaw = await prisma.remoteMediaGC.groupBy({
      by: ["source"],
      _count: { _all: true },
    });
    type GroupBySource = { source: string | null; _count?: { _all?: number } };
    const bySource = (bySourceRaw as GroupBySource[]).map((r) => ({
      source: r.source || "unknown",
      count: r._count?._all || 0,
    }));

    // top templates by pending count (sorted in JS to avoid TS issues with orderBy _count)
    const byTemplateRaw = await prisma.remoteMediaGC.groupBy({
      by: ["templateId"],
      where: { templateId: { not: null } },
      _count: { _all: true },
      take: 50,
      orderBy: { _count: { templateId: "desc" } },
    });
    type GroupByTemplate = {
      templateId: string | null;
      _count?: { _all?: number };
    };
    const byTemplateRawTyped = (byTemplateRaw as GroupByTemplate[]).slice();
    byTemplateRawTyped.sort(
      (a, b) => (b._count?._all || 0) - (a._count?._all || 0)
    );

    const templateIds = byTemplateRawTyped.map((r) => r.templateId as string);
    const templates = templateIds.length
      ? await prisma.template.findMany({
          where: { id: { in: templateIds } },
          select: { id: true, name: true },
        })
      : [];
    const templateMap = new Map(templates.map((t) => [t.id, t.name]));

    const byTemplate = byTemplateRawTyped.map((r) => ({
      templateId: r.templateId,
      label: r.templateId
        ? templateMap.get(r.templateId as string) || (r.templateId as string)
        : "(none)",
      count: r._count?._all || 0,
    }));

    return NextResponse.json({ bySource, byTemplate });
  } catch (err) {
    console.error("Failed to compute remote-media-gc counts:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
