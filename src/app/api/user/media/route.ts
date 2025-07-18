import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  const { type, cloudinary_url, wedding_page_id } = await req.json();

  // Ownership check
  const weddingPage = await prisma.weddingPage.findUnique({
    where: { id: wedding_page_id },
  });

  if (!weddingPage || weddingPage.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const media = await prisma.mediaUpload.create({
    data: {
      type,
      cloudinary_url,
      weddingPageId: wedding_page_id,
    },
  });

  return NextResponse.json({ media });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  const { id } = await req.json();

  // Find media and verify ownership
  const media = await prisma.mediaUpload.findUnique({
    where: { id },
    include: {
      weddingPage: true,
    },
  });

  if (!media || media.weddingPage.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.mediaUpload.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
