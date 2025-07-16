import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getAuthUser();
  const comments = await prisma.comment.findMany({
    where: { weddingPage: { user_id: user.id } },
  });
  return NextResponse.json({ comments });
}

export async function PUT(req: NextRequest) {
  const { id, approved } = await req.json();
  const comment = await prisma.comment.update({
    where: { id },
    data: { approved },
  });
  return NextResponse.json({ comment });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
