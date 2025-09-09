import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Find the wedding page with all related data
    const weddingPage = await prisma.weddingPage.findUnique({
      where: { slug },
      include: {
        user: {
          include: {
            plan: true,
            userTemplates: {
              where: { isSelected: true },
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
            galleryMedias: true,
            guests: true,
            gifts: true,
            bankDetails: true,
          },
        },
        template: {
          include: {
            sections: {
              orderBy: { order: "asc" },
            },
          },
        },
        mediaUploads: true,
        comments: {
          where: { approved: true },
          orderBy: { created_at: "desc" }
        },
      },
    });

    if (!weddingPage || !weddingPage.is_live) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const user = weddingPage.user;
    const selectedUserTemplate = user.userTemplates[0];
    const selectedTemplate = selectedUserTemplate?.template || weddingPage.template;

    if (!selectedTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Merge data from several sources (same logic as /api/wedding-data)
    const wpAi = (weddingPage.ai_data as Record<string, unknown>) ?? (weddingPage.layout_data as Record<string, unknown>) ?? {};
    const utContent = (selectedUserTemplate?.content as Record<string, unknown>) ?? {};

    // Create userData object with all the data needed for rendering
    const userData = {
      id: user.id, // Add user ID for gift components
      brideName:
        user.brideName ||
        wpAi?.brideName ||
        wpAi?.bride_name ||
        utContent?.brideName ||
        utContent?.bride_name ||
        "Bride",
      groomName:
        user.groomName ||
        wpAi?.groomName ||
        wpAi?.groom_name ||
        utContent?.groomName ||
        utContent?.groom_name ||
        "Groom",
      weddingDate:
        (user.weddingDate && user.weddingDate.toISOString()) ||
        wpAi?.weddingDate ||
        wpAi?.wedding_date ||
        utContent?.weddingDate ||
        null,
      venue: weddingPage.venue || wpAi?.venue || utContent?.venue || null,
      welcomeMessage:
        weddingPage.welcomeMessage || wpAi?.welcomeMessage || utContent?.welcomeMessage || null,
      // Include hero image for hero components
      heroImage: weddingPage.hero_image || null,
      // Include story image for story components
      storyImage: weddingPage.story_image || null,
      // Include logo for header components
      logoUrl: weddingPage.logo_url || null,
      logoAlt: weddingPage.logo_alt || null,
      // Include gallery data for gallery components
      gallery: user.galleryMedias ?? [],
      // Include gifts data for gift components
      gifts: user.gifts ?? [],
      // Include guests data for guest components
      guests: user.guests ?? [],
      // Include bank details for gift components
      bankDetails: user.bankDetails ?? [],
      // Include full section content for dynamic rendering
      sections: utContent,
      userTemplate: selectedUserTemplate,
    };

    // Create ourStory object
    const ourStory = {
      content:
        userData.welcomeMessage ||
        "Our story will appear here...",
      imageUrl:
        (weddingPage as { story_image?: string })?.story_image ||
        "/default-story.jpg",
    };

    const responseData = {
      template: selectedTemplate,
      userData,
      ourStory,
      weddingPage,
      gallery: user.galleryMedias ?? [],
      guests: user.guests ?? [],
      gifts: user.gifts ?? [],
      bankDetails: user.bankDetails ?? [],
      userTemplate: selectedUserTemplate ?? null,
      plan: user.plan ?? null,
      comments: weddingPage.comments,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching public wedding data:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
