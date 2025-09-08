import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, sectionId, content } = await req.json();

    if (!templateId || !sectionId || !content) {
      return NextResponse.json(
        { error: "Template ID, section ID, and content are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create user template
    let userTemplate = await prisma.userTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId,
        },
      },
    });

    if (!userTemplate) {
      userTemplate = await prisma.userTemplate.create({
        data: {
          userId: user.id,
          templateId,
          content: {},
          colorScheme: {},
        },
      });
    }

    // Update the specific section content
    const currentContent = (userTemplate.content as any) || {};
    const updatedContent = {
      ...currentContent,
      [sectionId]: {
        ...currentContent[sectionId],
        ...content,
        updatedAt: new Date().toISOString(),
      },
    };

    const updatedUserTemplate = await prisma.userTemplate.update({
      where: { id: userTemplate.id },
      data: {
        content: updatedContent,
        updatedAt: new Date(),
      },
      include: {
        template: {
          include: {
            sections: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      userTemplate: updatedUserTemplate,
      sectionContent: updatedContent[sectionId],
    });
  } catch (error) {
    console.error("Error updating section content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");
    const sectionId = searchParams.get("sectionId");

    if (!templateId || !sectionId) {
      return NextResponse.json(
        { error: "Template ID and section ID are required" },
        { status: 400 }
      );
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
                  where: { id: sectionId },
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

    const section = userTemplate.template.sections[0];
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const sectionContent = (userTemplate.content as any)?.[sectionId] || {};

    return NextResponse.json({
      section,
      content: sectionContent,
    });
  } catch (error) {
    console.error("Error fetching section content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
