import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const page = await prisma.weddingPage.findUnique({
      where: { slug },
      include: {
        template: true,
        mediaUploads: true,
        comments: { where: { approved: true } },
      },
    });

    if (!page || !page.is_live) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
