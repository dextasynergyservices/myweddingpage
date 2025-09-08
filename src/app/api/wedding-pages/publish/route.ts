import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, slug, title, content, colorScheme } = await req.json();

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userTemplates: {
          where: { templateId },
          include: {
            template: true,
          },
        },
        weddingPages: {
          where: { is_live: true },
          orderBy: { created_at: "desc" },
          take: 1,
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

    const existingWeddingPage = user.weddingPages[0];

    // If this is a new publication (no existing live page)
    if (!existingWeddingPage) {
      if (!slug) {
        return NextResponse.json(
          { error: "Slug is required for new publication" },
          { status: 400 }
        );
      }

      // Check if slug is already taken
      const slugExists = await prisma.weddingPage.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json({ error: "Slug is already taken" }, { status: 400 });
      }

      // Create new wedding page
      const weddingPage = await prisma.weddingPage.create({
        data: {
          userId: user.id,
          templateId,
          title: title || `${user.groomName || "Groom"} & ${user.brideName || "Bride"} Wedding`,
          slug,
          ai_data: content || userTemplate.content,
          layout_data: userTemplate.content === null ? undefined : userTemplate.content,
          color_theme: JSON.stringify(colorScheme || userTemplate.colorScheme),
          is_live: true,
        },
        include: {
          template: true,
        },
      });

      return NextResponse.json({
        success: true,
        weddingPage,
        isNewPublication: true,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
      });
    } else {
      // Update existing wedding page
      const updatedWeddingPage = await prisma.weddingPage.update({
        where: { id: existingWeddingPage.id },
        data: {
          ai_data: content || userTemplate.content,
          layout_data: userTemplate.content === null ? undefined : userTemplate.content,
          color_theme: JSON.stringify(colorScheme || userTemplate.colorScheme),
        },
        include: {
          template: true,
        },
      });

      return NextResponse.json({
        success: true,
        weddingPage: updatedWeddingPage,
        isNewPublication: false,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${updatedWeddingPage.slug}`,
      });
    }
  } catch (error) {
    console.error("Error publishing wedding page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        weddingPages: {
          where: { is_live: true },
          orderBy: { created_at: "desc" },
          take: 1,
          include: {
            template: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const weddingPage = user.weddingPages[0];

    if (!weddingPage) {
      return NextResponse.json({ error: "No published wedding page found" }, { status: 404 });
    }

    return NextResponse.json({
      weddingPage,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${weddingPage.slug}`,
    });
  } catch (error) {
    console.error("Error fetching wedding page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
