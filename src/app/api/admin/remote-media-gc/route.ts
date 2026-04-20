import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const q = new URL(request.url).searchParams;
    const status = q.get("status") || undefined;
    const templateId = q.get("templateId") || undefined;
    const qterm = q.get("q") || undefined;
    const page = Math.max(1, Number(q.get("page") || "1"));
    const take = Math.min(Math.max(Number(q.get("take") || "20"), 1), 200);
    const skip = (page - 1) * take;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (templateId) where.templateId = templateId;
    if (qterm) {
      where.OR = [{ publicId: { contains: qterm } }, { source: { contains: qterm } }];
    }

    const [total, rows] = await Promise.all([
      prisma.remoteMediaGC.count({ where }),
      prisma.remoteMediaGC.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);
    return NextResponse.json({ rows, total, page, take });
  } catch (err) {
    console.error("Failed to list remote media gc:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Retry specific GC records (accepts { ids: string[] })
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    if (!ids.length) return NextResponse.json({ error: "ids required" }, { status: 400 });

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];
    for (const id of ids) {
      const rec = await prisma.remoteMediaGC.findUnique({ where: { id } });
      if (!rec) {
        results.push({ id, ok: false, error: "not found" });
        continue;
      }
      try {
        const res = await cloudinary.uploader.destroy(rec.publicId, {
          invalidate: true,
          resource_type: rec.resourceType || "image",
        });
        const resultField =
          (res as unknown) && typeof res === "object" && (res as { [k: string]: unknown }).result
            ? (res as { [k: string]: unknown }).result
            : null;
        const ok = resultField === "ok" || resultField === "not_found";
        if (ok) {
          await prisma.remoteMediaGC.update({
            where: { id },
            data: {
              status: "success",
              attempts: { increment: 1 },
              lastError: null,
            },
          });
          results.push({ id, ok: true });
        } else {
          const message = JSON.stringify(res);
          await prisma.remoteMediaGC.update({
            where: { id },
            data: {
              status: "failed",
              attempts: { increment: 1 },
              lastError: message,
            },
          });
          results.push({ id, ok: false, error: message });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        await prisma.remoteMediaGC.update({
          where: { id },
          data: {
            status: "failed",
            attempts: { increment: 1 },
            lastError: message,
          },
        });
        results.push({ id, ok: false, error: message });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Retry GC error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
