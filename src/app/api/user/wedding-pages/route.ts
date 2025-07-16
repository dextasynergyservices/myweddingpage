import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getAuthUser();
  const page = await prisma.weddingPage.findFirst({
    where: { user_id: user.id },
    include: { media: true, comments: true },
  });
  return NextResponse.json({ page });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  const data = await req.json();
  const updated = await prisma.weddingPage.updateMany({
    where: { user_id: user.id },
    data,
  });
  return NextResponse.json({ updated });
}
