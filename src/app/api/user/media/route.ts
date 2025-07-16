import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  const { type, cloudinary_url, wedding_page_id } = await req.json();
  const media = await prisma.mediaUpload.create({
    data: { type, cloudinary_url, wedding_page_id },
  });
  return NextResponse.json({ media });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  const { id } = await req.json();
  await prisma.mediaUpload.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
