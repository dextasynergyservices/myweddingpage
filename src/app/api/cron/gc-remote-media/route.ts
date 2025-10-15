import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const isVercelCron = request.headers.get("user-agent")?.includes("Vercel");
    if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized. Valid cron secret required." },
        { status: 401 }
      );
    }

    // allowed batch size via query ?limit=
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "20"), 100);

    const pending = await prisma.remoteMediaGC.findMany({
      where: { status: "pending" },
      take: limit,
    });
    const results: Array<{ id: string; publicId: string; success: boolean; error?: string }> = [];

    for (const r of pending) {
      try {
        const res = await cloudinary.uploader.destroy(r.publicId, {
          invalidate: true,
          resource_type: r.resourceType || "image",
        });
        // Cloudinary returns { result: 'ok' } on success, or 'not_found' etc.
        const resultField =
          (res as unknown) && typeof res === "object" && (res as { [k: string]: unknown }).result
            ? (res as { [k: string]: unknown }).result
            : null;
        const ok = resultField === "ok" || resultField === "not_found";
        if (ok) {
          await prisma.remoteMediaGC.update({
            where: { id: r.id },
            data: { status: "success", attempts: { increment: 1 }, lastError: null },
          });
          results.push({ id: r.id, publicId: r.publicId, success: true });
        } else {
          const message = JSON.stringify(res);
          await prisma.remoteMediaGC.update({
            where: { id: r.id },
            data: { status: "failed", attempts: { increment: 1 }, lastError: message },
          });
          results.push({ id: r.id, publicId: r.publicId, success: false, error: message });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        await prisma.remoteMediaGC.update({
          where: { id: r.id },
          data: { status: "failed", attempts: { increment: 1 }, lastError: message },
        });
        results.push({ id: r.id, publicId: r.publicId, success: false, error: message });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error("GC cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
