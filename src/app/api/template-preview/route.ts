// src/app/api/template-preview/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to format wedding date in a user-friendly way
function formatWeddingDate(date: Date): string {
  try {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting wedding date:", error);
    return date.toISOString().split("T")[0]; // Fallback to YYYY-MM-DD format
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");
    const userId = searchParams.get("userId"); // pass this from frontend

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    // Fetch template with sections
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        sections: { orderBy: { order: "asc" } },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Try to fetch user's wedding page for this template
    if (userId) {
      await prisma.weddingPage.findFirst({
        where: { userId, templateId },
      });
    }

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        thumbnail: template.thumbnail,
        sections: template.sections,
        layout_data: template.layout_data,
        components: template.components,
        colorSchemes: template.colorSchemes,
        previewData: template.previewData,
      },
      previewData: {
        brideName: "Bride",
        groomName: "Groom",
        weddingDate: formatWeddingDate(new Date()),
        venue: "Wedding Venue",
        welcomeMessage: "Welcome to our wedding celebration",
      },
    });
  } catch (error) {
    console.error("Failed to fetch template preview:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
