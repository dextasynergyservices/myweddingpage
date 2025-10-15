import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const id = String(body?.id || "").trim();
    const thumbnailUrl = body?.thumbnailUrl ? String(body.thumbnailUrl) : null;
    const publicId = body?.publicId ? String(body.publicId) : null;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updated = await prisma.template.update({
      where: { id },
      data: { thumbnail: thumbnailUrl || "", thumbnailPublicId: publicId ?? null },
    });
    return NextResponse.json({ template: updated });
  } catch (err: unknown) {
    console.error("Failed to update template thumbnail:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const id = String(body?.id || "").trim();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // fetch existing template to see if we have a stored public id to delete
    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

    // attempt to delete the Cloudinary resource if public id exists
    const remoteDeletion = { attempted: false, success: false, publicId: null as string | null };
    try {
      const publicId = existing.thumbnailPublicId;
      remoteDeletion.publicId = publicId || null;
      if (publicId) {
        remoteDeletion.attempted = true;
        if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          try {
            const res = await cloudinary.uploader.destroy(publicId, {
              invalidate: true,
              resource_type: "image",
            });
            const resultField =
              (res as unknown) &&
              typeof res === "object" &&
              (res as { [k: string]: unknown }).result
                ? (res as { [k: string]: unknown }).result
                : null;
            const ok = resultField === "ok" || resultField === "not_found";
            remoteDeletion.success = Boolean(ok);
            if (ok) console.log(`Deleted cloudinary resource ${publicId}`);
            else console.warn(`Cloudinary destroy returned:`, res);
          } catch (e) {
            console.warn(`Failed to delete cloudinary resource ${publicId}:`, e);
          }
        }

        // If remote deletion didn't succeed, ensure there's a GC record to retry
        if (!remoteDeletion.success) {
          try {
            // Try to find an existing GC record for this publicId
            const existingGC = await prisma.remoteMediaGC.findFirst({ where: { publicId } });
            if (existingGC) {
              await prisma.remoteMediaGC.update({
                where: { id: existingGC.id },
                data: {
                  status: "pending",
                  attempts: { increment: 1 },
                  lastError: null,
                  templateId: id,
                },
              });
            } else {
              await prisma.remoteMediaGC.create({
                data: {
                  publicId,
                  resourceType: "image",
                  source: "thumbnail",
                  templateId: id,
                  status: "pending",
                },
              });
            }
          } catch (e) {
            console.warn("Failed to create remote media GC record:", e);
          }
        }
      }
    } catch (e) {
      console.warn("Error while attempting to delete remote image:", e);
    }

    const updated = await prisma.template.update({
      where: { id },
      data: { thumbnail: "", thumbnailPublicId: null },
    });

    return NextResponse.json({ template: updated, remoteDeletion });
  } catch (err: unknown) {
    console.error("Failed to clear template thumbnail:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
