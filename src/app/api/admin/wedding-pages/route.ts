import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const pages = await prisma.weddingPage.findMany({
      include: { user: true, template: true },
    });
    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = await req.json();
    const page = await prisma.weddingPage.create({ data });
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, ...updates } = await req.json();
    const page = await prisma.weddingPage.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { id } = await req.json();
    await prisma.weddingPage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
