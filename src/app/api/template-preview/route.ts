// app/api/template-preview/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Parse JSON fields safely
    const layoutData = template.layout_data ? template.layout_data : { components: [] };
    const components = template.components ? template.components : [];
    const previewData = template.previewData ? template.previewData : {};

    // Provide default preview values if missing
    const responseData = {
      id: template.id,
      name: template.name,
      description: template.description,
      thumbnail: template.thumbnail,
      heroImage: previewData.heroImage || template.hero_image || "/default-hero.jpg",
      storyImage: previewData.storyImage || "/default-story.jpg",
      venue: previewData.venue || "Venue",
      weddingDate: previewData.weddingDate || new Date().toISOString(),
      welcomeMessage: previewData.welcomeMessage || "Welcome to our wedding",
      galleryPhotos: previewData.galleryPhotos || [],
      gifts: previewData.gifts || [],
      comments: previewData.comments || [],
      layoutData,
      components,
      colorSchemes: template.colorSchemes || [],
      categoryId: template.categoryId,
      isActive: template.isActive,
      createdAt: template.created_at,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch template preview:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
