import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const pages = await prisma.weddingPage.findMany({
      where: { is_live: true },
      select: {
        id: true,
        title: true,
        slug: true,
        color_theme: true,
        template: {
          select: {
            id: true,
            name: true,
            thumbnail_url: true,
          },
        },
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
