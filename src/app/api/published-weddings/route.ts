import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import WeddingDesignService from "@/lib/weddingDesign";
import TokenStore from "@/lib/tokenStore";
import { JsonValue } from "@prisma/client/runtime/library";

interface WeddingData {
  venue?: string | null;
  color_theme?: string | null;
  hero_image?: string | null;
  story_image?: string | null;
  ai_data?: JsonValue | null;
  welcomeMessage?: string | null;
  [key: string]: unknown;
}

interface UserData {
  brideName?: string | null;
  groomName?: string | null;
  weddingDate?: Date | null;
  [key: string]: unknown;
}

// Helper function to get Canva image URL or fallback
async function getThumbnailUrl(
  searchTerms: string[],
  weddingData: WeddingData,
  user: UserData
): Promise<string> {
  // Try Canva if we have access token
  const canvaAccessToken = TokenStore.getAccessToken();

  if (canvaAccessToken) {
    try {
      console.log("Using Canva API for thumbnail generation");
      const options = {
        brideName: user.brideName || undefined,
        groomName: user.groomName || undefined,
        venue: weddingData.venue || undefined,
        weddingDate: user.weddingDate || undefined,
        colorTheme: weddingData.color_theme || undefined,
        style: extractStyleFromSearchTerms(searchTerms),
        heroImageUrl: weddingData.hero_image || undefined,
        storyImageUrl: weddingData.story_image || undefined,
      };

      const canvaResult = await WeddingDesignService.generateWeddingThumbnail(
        canvaAccessToken,
        options
      );
      console.log(
        "Canva thumbnail generated successfully:",
        canvaResult.thumbnailUrl
      );
      return canvaResult.thumbnailUrl;
    } catch (error) {
      console.warn("Canva thumbnail generation failed, using fallback:", error);
    }
  } else {
    console.log("No Canva access token available, using fallback");
  }

  // Use fallback image
  return WeddingDesignService.generateFallbackThumbnail({
    brideName: user.brideName || undefined,
    groomName: user.groomName || undefined,
    venue: weddingData.venue || undefined,
    colorTheme: weddingData.color_theme || undefined,
    style: extractStyleFromSearchTerms(searchTerms),
    heroImageUrl: weddingData.hero_image || undefined,
    storyImageUrl: weddingData.story_image || undefined,
  });
}

// Helper function to extract style from search terms
function extractStyleFromSearchTerms(searchTerms: string[]): string {
  const styles = [
    "beach",
    "garden",
    "rustic",
    "elegant",
    "vintage",
    "modern",
    "traditional",
    "outdoor",
    "indoor",
    "destination",
    "luxury",
    "bohemian",
    "classic",
  ];
  const foundStyle = searchTerms.find((term) =>
    styles.includes(term.toLowerCase())
  );
  return foundStyle || "elegant";
}

// Helper function to extract search terms from wedding data
function extractSearchTerms(
  weddingPage: WeddingData,
  user: UserData
): string[] {
  const terms: string[] = ["wedding"];

  // Add bride and groom names
  if (user.brideName && user.brideName.trim())
    terms.push(user.brideName.trim());
  if (user.groomName && user.groomName.trim())
    terms.push(user.groomName.trim());

  // Add venue/location
  if (weddingPage.venue && weddingPage.venue.trim())
    terms.push(weddingPage.venue.trim());

  // Add color theme
  if (weddingPage.color_theme && weddingPage.color_theme.trim())
    terms.push(weddingPage.color_theme.trim());

  // Extract terms from ai_data if available
  if (
    weddingPage.ai_data &&
    typeof weddingPage.ai_data === "object" &&
    weddingPage.ai_data !== null &&
    !Array.isArray(weddingPage.ai_data)
  ) {
    try {
      const aiDataStr = JSON.stringify(weddingPage.ai_data).toLowerCase();

      // Only process if aiDataStr is not just empty brackets
      if (aiDataStr !== "{}" && aiDataStr.length > 2) {
        // Look for common wedding styles/themes
        const weddingStyles = [
          "beach",
          "garden",
          "rustic",
          "elegant",
          "vintage",
          "modern",
          "traditional",
          "outdoor",
          "indoor",
          "destination",
          "luxury",
          "bohemian",
          "classic",
        ];
        const foundStyles = weddingStyles.filter((style) =>
          aiDataStr.includes(style)
        );
        terms.push(...foundStyles);

        // Look for locations/venues
        const locations = [
          "church",
          "beach",
          "garden",
          "vineyard",
          "hotel",
          "resort",
          "castle",
          "barn",
          "rooftop",
        ];
        const foundLocations = locations.filter((loc) =>
          aiDataStr.includes(loc)
        );
        terms.push(...foundLocations);
      }
    } catch (error) {
      console.log("Error parsing ai_data:", error);
    }
  }

  // Filter out empty strings and duplicates
  return [...new Set(terms.filter((term) => term && term.trim() !== ""))];
}

export async function GET() {
  try {
    // Include both live and not-live pages for the wedding pages gallery
    const publishedWeddings = await prisma.weddingPage.findMany({
      where: {
        OR: [
          { is_live: true }, // Live pages (accessible)
          { is_live: false, deleted_at: { not: null } }, // Not-live pages (preview only)
        ],
      },
      include: {
        user: {
          select: {
            brideName: true,
            groomName: true,
            weddingDate: true,
          },
        },
        template: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Transform data to match the Wedding interface
    const transformedWeddings = await Promise.all(
      publishedWeddings.map(async (wedding) => {
        const searchTerms = extractSearchTerms(wedding, wedding.user);
        const thumbnailUrl = await getThumbnailUrl(
          searchTerms,
          wedding,
          wedding.user
        );

        // Create title from bride and groom names
        const title =
          wedding.user.brideName && wedding.user.groomName
            ? `${wedding.user.brideName} & ${wedding.user.groomName}`
            : wedding.title;

        // Format date
        const formattedDate = wedding.user.weddingDate
          ? wedding.user.weddingDate.toISOString().split("T")[0]
          : new Date(wedding.created_at).toISOString().split("T")[0];

        // Create excerpt from welcome message or AI data
        let excerpt =
          wedding.welcomeMessage || "A beautiful wedding celebration";
        if (!excerpt || excerpt.trim() === "") {
          // Try to extract meaningful text from ai_data
          if (
            wedding.ai_data &&
            typeof wedding.ai_data === "object" &&
            wedding.ai_data !== null &&
            !Array.isArray(wedding.ai_data)
          ) {
            try {
              // Look for common text fields in ai_data
              const aiData = wedding.ai_data as Record<string, unknown>;
              const textFields = [
                "description",
                "story",
                "about",
                "summary",
                "content",
              ];

              for (const field of textFields) {
                if (
                  aiData[field] &&
                  typeof aiData[field] === "string" &&
                  (aiData[field] as string).trim()
                ) {
                  excerpt = (aiData[field] as string).trim();
                  if (excerpt.length > 100) {
                    excerpt = excerpt.substring(0, 97) + "...";
                  }
                  break;
                }
              }
            } catch {
              // Keep default excerpt
            }
          }
        }

        // Generate tags from search terms (excluding names and generic terms)
        const excludeTerms = [
          "wedding",
          wedding.user.brideName?.toLowerCase(),
          wedding.user.groomName?.toLowerCase(),
          wedding.user.brideName?.toLowerCase().split(" ")[0], // First name only
          wedding.user.groomName?.toLowerCase().split(" ")[0], // First name only
          "", // Empty strings
          "{}", // Empty objects
          "undefined",
          "null",
        ].filter(Boolean); // Remove undefined/null values

        const tags = searchTerms
          .filter((term) => {
            const lowerTerm = term.toLowerCase().trim();
            return (
              lowerTerm &&
              lowerTerm !== "{}" &&
              lowerTerm.length > 1 &&
              !excludeTerms.includes(lowerTerm)
            );
          })
          .slice(0, 3); // Limit to 3 tags

        return {
          id: wedding.id,
          title,
          date: formattedDate,
          location: wedding.venue || "Beautiful Location",
          image: thumbnailUrl,
          excerpt,
          tags,
          slug: wedding.slug,
          views: wedding.views,
          is_live: wedding.is_live, // Include live status for badge display
          deleted_at: wedding.deleted_at, // Include for determining status
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: transformedWeddings,
      count: transformedWeddings.length,
    });
  } catch (error) {
    console.error("Error fetching published weddings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wedding pages" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
