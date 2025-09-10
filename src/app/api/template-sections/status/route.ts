import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userTemplates: {
          where: { templateId },
          include: {
            template: {
              include: {
                sections: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userTemplate = user.userTemplates[0];
    if (!userTemplate) {
      return NextResponse.json({ error: "User template not found" }, { status: 404 });
    }

    const template = userTemplate.template;
    const userContent = (userTemplate.content as Record<string, unknown>) || {};

    // Check completion status for each section
    const sectionStatus = template.sections.map((section) => {
      const sectionContent = (userContent[section.id] as Record<string, unknown>) || {};
      let isComplete = false;

      switch (section.type) {
        case "HERO":
          isComplete = Boolean(
            sectionContent.title || sectionContent.groomName || sectionContent.brideName
          );
          break;
        case "STORY":
          isComplete = Boolean(sectionContent.text || sectionContent.content);
          break;
        case "GALLERY": {
          const imgs = (sectionContent as Record<string, unknown>)?.images;
          isComplete = Array.isArray(imgs) && imgs.length > 0;
          break;
        }
        case "REGISTRY":
          isComplete = Boolean(sectionContent.content || sectionContent.description);
          break;
        case "WISHES":
          isComplete = Boolean(sectionContent.content || sectionContent.description);
          break;
        default:
          isComplete = Boolean(sectionContent.content);
      }

      return {
        sectionId: section.id,
        type: section.type,
        isComplete,
        hasContent: Object.keys(sectionContent).length > 0,
      };
    });

    const totalSections = sectionStatus.length;
    const completedSections = sectionStatus.filter((s) => s.isComplete).length;
    const completionPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

    return NextResponse.json({
      sectionStatus,
      totalSections,
      completedSections,
      completionPercentage,
      isFullyComplete: completedSections === totalSections,
    });
  } catch (error) {
    console.error("Error fetching section status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
