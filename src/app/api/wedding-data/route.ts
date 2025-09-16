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

    // Get user with selected template and related data needed for previews
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
          include: {
            mediaUploads: true,
            comments: true,
          },
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

    // Get selected template (either explicit or the user's selected one)
    const selectedUserTemplate = templateId
      ? user.userTemplates.find((ut) => ut.templateId === templateId)
      : user.userTemplates[0];

    const selectedTemplate = selectedUserTemplate?.template || null;

    // Grab the live wedding page (if any)
    const weddingPage = user.weddingPages?.[0] ?? null;

    // If we found a weddingPage, explicitly fetch its latest `views` value to avoid
    // any cases where the nested include doesn't surface the scalar correctly.
    let latestWeddingPageViews: number | null = null;
    if (weddingPage?.id) {
      try {
        const wpSelect = await prisma.weddingPage.findUnique({
          where: { id: weddingPage.id },
          select: { views: true },
        });
        latestWeddingPageViews = wpSelect?.views ?? null;
      } catch (err) {
        console.error("Failed to fetch latest weddingPage.views:", err);
      }
    }

    const wpAi =
      (weddingPage?.ai_data as Record<string, unknown> | undefined) ??
      (weddingPage?.layout_data as Record<string, unknown> | undefined) ??
      {};
    const utContent = (selectedUserTemplate?.content as Record<string, unknown> | undefined) ?? {};

    // Convert form data structure to component structure for story sections
    const convertStoryDataForComponent = (content: Record<string, unknown>) => {
      const converted = { ...content };

      // Convert stories object to array for Elegance template
      if (
        converted.stories &&
        typeof converted.stories === "object" &&
        !Array.isArray(converted.stories)
      ) {
        const storiesArray = [];
        let index = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        while ((converted.stories as any)[index]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          storiesArray.push((converted.stories as any)[index]);
          index++;
        }
        converted.stories = storiesArray;
      }

      // Convert storyItems object to array for Luxe template
      if (
        converted.storyItems &&
        typeof converted.storyItems === "object" &&
        !Array.isArray(converted.storyItems)
      ) {
        const storyItemsArray = [];
        let index = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        while ((converted.storyItems as any)[index]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          storyItemsArray.push((converted.storyItems as any)[index]);
          index++;
        }
        converted.storyItems = storyItemsArray;
      }

      // Convert milestones object to array for Bloom template
      if (
        converted.milestones &&
        typeof converted.milestones === "object" &&
        !Array.isArray(converted.milestones)
      ) {
        const milestonesArray = [];
        let index = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        while ((converted.milestones as any)[index]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          milestonesArray.push((converted.milestones as any)[index]);
          index++;
        }
        converted.milestones = milestonesArray;
      }

      return converted;
    };

    // Convert story data for all sections
    const convertedUtContent = Object.keys(utContent).reduce(
      (acc, sectionId) => {
        acc[sectionId] = convertStoryDataForComponent(
          utContent[sectionId] as Record<string, unknown>
        );
        return acc;
      },
      {} as Record<string, unknown>
    );

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
        (user.weddingDate && formatWeddingDate(user.weddingDate)) ||
        (wpAi?.weddingDate && formatWeddingDate(new Date(wpAi.weddingDate as string))) ||
        (wpAi?.wedding_date && formatWeddingDate(new Date(wpAi.wedding_date as string))) ||
        (utContent?.weddingDate && formatWeddingDate(new Date(utContent.weddingDate as string))) ||
        null,
      venue: weddingPage?.venue || wpAi?.venue || utContent?.venue || null,
      welcomeMessage:
        weddingPage?.welcomeMessage || wpAi?.welcomeMessage || utContent?.welcomeMessage || null,
      // Include hero image for hero components
      heroImage: weddingPage?.hero_image || null,
      // Include story image for story components
      storyImage: weddingPage?.story_image || null,
      // Include logo for header components
      logoUrl: weddingPage?.logo_url || null,
      logoAlt: weddingPage?.logo_alt || null,
      // Include gallery data for gallery components
      gallery: user.galleryMedias ?? [],
      // Include gifts data for gift components (transform to expected format)
      gifts: (user.gifts ?? []).map((gift) => ({
        id: gift.id,
        item: gift.name, // Map name to item for component compatibility
        name: gift.name,
        description: gift.description,
        price: gift.price.toString(), // Convert Float to String
        image: gift.image || "",
        link: gift.link || "",
        purchased: gift.purchased,
        purchasedBy: gift.purchasedBy,
      })),
      // Include guests data for guest components
      guests: user.guests ?? [],
      // Include bank details for gift components
      bankDetails: user.bankDetails ?? [],
      // Include full section content for dynamic rendering (converted to component structure)
      sections: convertedUtContent,
      userTemplate: selectedUserTemplate,
      // expose raw objects for templates that expect different shapes
      _raw: {
        user: user,
        weddingPage: weddingPage,
        userTemplate: selectedUserTemplate,
        wpAi,
        utContent,
      },
    } as Record<string, unknown>;

    // safe-access previewData which can be Json
    const selectedPreviewData: Record<string, unknown> =
      (selectedTemplate as { previewData?: Record<string, unknown> } | null)?.previewData ?? {};

    const ourStory = {
      content:
        userData.welcomeMessage ||
        selectedPreviewData?.welcomeMessage ||
        "Our story will appear here...",
      imageUrl:
        (weddingPage as { story_image?: string })?.story_image ||
        selectedPreviewData?.story_image ||
        (selectedTemplate as { hero_image?: string })?.hero_image ||
        "/default-story.jpg",
    };

    // Ensure weddingPage.views is a number for consumers (in case existing rows are null)
    const weddingPageWithViews = weddingPage
      ? {
          ...weddingPage,
          // Prefer the freshly selected views value when available
          views: latestWeddingPageViews ?? (weddingPage as { views?: number })?.views ?? 0,
        }
      : null;

    const responseData = {
      template: selectedTemplate,
      userData: {
        ...userData,
        // Include full section content for dynamic rendering (converted to component structure)
        sections: convertedUtContent,
        userTemplate: selectedUserTemplate,
      },
      ourStory,
      weddingPage: weddingPageWithViews,
      // Expose views at top-level for easier debugging in network tab (temporary)
      views: (weddingPageWithViews as { views?: number } | null)?.views ?? 0,
      gallery: user.galleryMedias ?? [],
      guests: user.guests ?? [],
      gifts: (user.gifts ?? []).map((gift) => ({
        id: gift.id,
        item: gift.name, // Map name to item for component compatibility
        name: gift.name,
        description: gift.description,
        price: gift.price.toString(), // Convert Float to String
        image: gift.image || "",
        link: gift.link || "",
        purchased: gift.purchased,
        purchasedBy: gift.purchasedBy,
      })),
      bankDetails: user.bankDetails ?? [],
      userTemplate: selectedUserTemplate ?? null,
      plan: user.plan ?? null,
    };

    // Debug logging
    console.log("API wedding-data response:", {
      utContent,
      sections: utContent,
      userData: responseData.userData,
      // Log weddingPage.views explicitly to help debug dashboard fetches
      weddingPageViews: (weddingPageWithViews as { views?: number } | null)?.views,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
