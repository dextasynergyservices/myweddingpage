import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    // Fetch template with its sections
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Return static preview data
    return NextResponse.json({
      id: template.id,
      name: template.name,
      description: template.description,
      thumbnail: template.thumbnail,
      sections: template.sections,
      previewData: template.previewData || {
        brideName: "Bride",
        groomName: "Groom",
        weddingDate: new Date().toISOString(),
        venue: "Wedding Venue",
        welcomeMessage: "Welcome to our wedding celebration",
      },
    });
  } catch (error) {
    console.error("Failed to fetch template preview:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
