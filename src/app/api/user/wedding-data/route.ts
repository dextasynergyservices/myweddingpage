import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
        weddingPages: {
          where: { is_live: true },
          orderBy: { created_at: "desc" },
          take: 1,
          include: { mediaUploads: true, comments: true },
        },
        galleryMedias: true,
        guests: true,
        gifts: true,
        bankDetails: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine the selected template (either the query param or the user's selected template)
    const selectedTemplate = templateId
      ? user.userTemplates.find((ut) => ut.templateId === templateId)?.template
      : user.userTemplates[0]?.template;

    // Build a comprehensive userData object merging User and WeddingPage info
    const livePage = user.weddingPages?.[0] || null;

    const userData = {
      id: user.id,
      email: user.email,
      brideName: user.brideName || null,
      groomName: user.groomName || null,
      weddingDate: user.weddingDate ? formatWeddingDate(user.weddingDate) : null,
      plan: user.plan || null,
      page: livePage
        ? {
            id: livePage.id,
            title: livePage.title,
            slug: livePage.slug,
            hero_image: livePage.hero_image || null,
            story_image: livePage.story_image || null,
            venue: livePage.venue || null,
            welcomeMessage: livePage.welcomeMessage || null,
            media: livePage.mediaUploads || [],
            comments: livePage.comments || [],
          }
        : null,
      gallery: user.galleryMedias || [],
      guests: user.guests || [],
      gifts: user.gifts || [],
      bankDetails: user.bankDetails || [],
      userTemplate: user.userTemplates?.[0] || null,
    };

    const ourStory = {
      content:
        livePage?.welcomeMessage ||
        (selectedTemplate as { previewData?: { welcomeMessage?: string } })?.previewData
          ?.welcomeMessage ||
        "Our story will appear here...",
      imageUrl:
        livePage?.story_image ||
        (selectedTemplate as { story_image?: string })?.story_image ||
        (selectedTemplate as { hero_image?: string })?.hero_image ||
        "/default-story.jpg",
    };

    return NextResponse.json({
      template: selectedTemplate || null,
      userData,
      ourStory,
      weddingPage: livePage || null,
      selectedUserTemplate: user.userTemplates?.[0] || null,
      gallery: user.galleryMedias || [],
      guests: user.guests || [],
      gifts: user.gifts || [],
    });
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
