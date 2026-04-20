import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // First, let's check if there are any templates at all
    const templateCount = await prisma.template.count();
    console.log("Total templates in database:", templateCount);

    // Fetch all active templates with just the essential fields for thumbnails
    const templates = await prisma.template.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        hero_image: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        colorSchemes: true,
        sections: {
          select: {
            id: true,
            type: true,
            layout: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    console.log("Active templates found:", templates.length);
    console.log(
      "Template data:",
      templates.map((t) => ({
        name: t.name,
        thumbnail: t.thumbnail,
        hero_image: t.hero_image,
      }))
    );

    return NextResponse.json({
      count: templateCount,
      activeCount: templates.length,
      templates: templates,
    });
  } catch (error) {
    console.error("Failed to fetch template thumbnails:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
