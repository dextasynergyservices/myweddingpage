import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Extract slug from the pathname
    const slug = req.nextUrl.pathname.split("/").pop();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

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
