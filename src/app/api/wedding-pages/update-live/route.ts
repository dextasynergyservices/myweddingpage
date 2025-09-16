import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("=== UPDATE LIVE API CALLED ===");
    const session = await getServerSession(authOptions);
    console.log("update-live - Session:", session?.user?.email);

    if (!session?.user?.email) {
      console.log("update-live - No session found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await req.json();

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userTemplates: {
          where: { templateId },
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

    const weddingPage = user.weddingPages[0];
    if (!weddingPage) {
      return NextResponse.json({ error: "No live wedding page found" }, { status: 404 });
    }

    // Extract specific fields from userTemplate content
    const extractWeddingPageFields = (userContent: Record<string, unknown>) => {
      const content = userContent || {};
      let heroImage = null;
      let storyImage = null;
      let venue = null;
      let welcomeMessage = null;
      let logoUrl = null;
      let logoAlt = null;

      console.log(
        "update-live - extractWeddingPageFields - userContent:",
        JSON.stringify(userContent, null, 2)
      );
      console.log("update-live - extractWeddingPageFields - content keys:", Object.keys(content));

      // Also check if logo data is at the top level of userContent
      if (userContent && typeof userContent === "object") {
        console.log("update-live - Top level logo data:", {
          logoUrl: userContent.logoUrl,
          logo_url: userContent.logo_url,
          logoAlt: userContent.logoAlt,
          logo_alt: userContent.logo_alt,
        });
      }

      // Check all sections for data - be more flexible with section identification
      for (const [sectionId, sectionContent] of Object.entries(content)) {
        if (sectionContent && typeof sectionContent === "object") {
          const section = sectionContent as Record<string, unknown>;
          console.log(`update-live - Checking section ${sectionId}:`, {
            sectionType: section.sectionType,
            type: section.type,
            layout: section.layout,
            hasHeroImage: !!section.heroImage,
            hasStoryImage: !!section.storyImage,
            hasLogoUrl: !!section.logoUrl,
            hasVenue: !!section.venue,
            hasWelcomeMessage: !!section.welcomeMessage,
            allKeys: Object.keys(section),
          });

          // Check if this is a hero section (multiple ways to identify)
          const isHeroSection =
            section.sectionType === "HERO" ||
            section.type === "HERO" ||
            section.layout?.toString().includes("hero") ||
            sectionId.includes("hero");

          if (isHeroSection) {
            console.log(`update-live - Found hero section: ${sectionId}`);
            heroImage = (section.heroImage as string) || heroImage;
            venue = (section.venue as string) || venue;
            welcomeMessage = (section.welcomeMessage as string) || welcomeMessage;
            logoUrl = (section.logoUrl as string) || logoUrl;
            logoAlt = (section.logoAlt as string) || logoAlt;
          }

          // Check if this is a story section
          const isStorySection =
            section.sectionType === "STORY" ||
            section.type === "STORY" ||
            section.layout?.toString().includes("story") ||
            sectionId.includes("story");

          if (isStorySection) {
            console.log(`update-live - Found story section: ${sectionId}`);
            storyImage = (section.storyImage as string) || storyImage;

            // Handle Luxe template storyItems (both array and nested object structures)
            if (section.storyItems) {
              if (Array.isArray(section.storyItems)) {
                const firstStoryItem = section.storyItems[0];
                if (firstStoryItem && firstStoryItem.image) {
                  storyImage = firstStoryItem.image as string;
                  console.log(
                    `update-live - Found story image in Luxe storyItems array: ${storyImage}`
                  );
                }
              } else if (typeof section.storyItems === "object") {
                console.log(
                  `update-live - Found storyItems object in section ${sectionId}:`,
                  section.storyItems
                );
                // Handle nested object structure (stored in UserTemplate)
                const firstStoryItem =
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (section.storyItems as any)[0] || (section.storyItems as any)["0"];
                if (firstStoryItem && firstStoryItem.image) {
                  storyImage = firstStoryItem.image as string;
                  console.log(
                    `update-live - Found story image in Luxe storyItems object: ${storyImage}`
                  );
                }
              }
            }

            // Handle Elegance template stories (both array and nested object structures)
            if (section.stories) {
              if (Array.isArray(section.stories)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const firstStory = (section.stories as any)[0];
                if (firstStory && firstStory.image) {
                  storyImage = firstStory.image as string;
                  console.log(
                    `update-live - Found story image in Elegance stories array: ${storyImage}`
                  );
                }
              } else if (typeof section.stories === "object") {
                console.log(
                  `update-live - Found stories object in section ${sectionId}:`,
                  section.stories
                );
                // Handle nested object structure (stored in UserTemplate)
                const firstStory =
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (section.stories as any)[0] || (section.stories as any)["0"];
                if (firstStory && firstStory.image) {
                  storyImage = firstStory.image as string;
                  console.log(
                    `update-live - Found story image in Elegance stories object: ${storyImage}`
                  );
                }
              }
            }
          }

          // Check for any data in any section (fallback)
          if (!heroImage && section.heroImage) {
            heroImage = section.heroImage as string;
            console.log(`update-live - Found heroImage in section ${sectionId}:`, heroImage);
          }
          if (!storyImage && section.storyImage) {
            storyImage = section.storyImage as string;
            console.log(`update-live - Found storyImage in section ${sectionId}:`, storyImage);
          }

          // Check for story images in storyItems (Luxe template) - both array and object structures
          if (!storyImage && section.storyItems) {
            if (Array.isArray(section.storyItems)) {
              const firstStoryItem = section.storyItems[0];
              if (firstStoryItem && firstStoryItem.image) {
                storyImage = firstStoryItem.image as string;
                console.log(
                  `update-live - Found story image in storyItems array in section ${sectionId}:`,
                  storyImage
                );
              }
            } else if (typeof section.storyItems === "object") {
              console.log(
                `update-live - Found storyItems object in section ${sectionId}:`,
                section.storyItems
              );
              const firstStoryItem =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (section.storyItems as any)[0] || (section.storyItems as any)["0"];
              if (firstStoryItem && firstStoryItem.image) {
                storyImage = firstStoryItem.image as string;
                console.log(
                  `update-live - Found story image in storyItems object in section ${sectionId}:`,
                  storyImage
                );
              }
            }
          }

          // Check for story images in stories (Elegance template) - both array and object structures
          if (!storyImage && section.stories) {
            if (Array.isArray(section.stories)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const firstStory = (section.stories as any)[0];
              if (firstStory && firstStory.image) {
                storyImage = firstStory.image as string;
                console.log(
                  `update-live - Found story image in stories array in section ${sectionId}:`,
                  storyImage
                );
              }
            } else if (typeof section.stories === "object") {
              console.log(
                `update-live - Found stories object in section ${sectionId}:`,
                section.stories
              );
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const firstStory = (section.stories as any)[0] || (section.stories as any)["0"];
              if (firstStory && firstStory.image) {
                storyImage = firstStory.image as string;
                console.log(
                  `update-live - Found story image in stories object in section ${sectionId}:`,
                  storyImage
                );
              }
            }
          }
          if (!venue && section.venue) {
            venue = section.venue as string;
            console.log(`update-live - Found venue in section ${sectionId}:`, venue);
          }
          if (!welcomeMessage && section.welcomeMessage) {
            welcomeMessage = section.welcomeMessage as string;
            console.log(
              `update-live - Found welcomeMessage in section ${sectionId}:`,
              welcomeMessage
            );
          }

          // Check for logo data with multiple possible field names
          if (!logoUrl) {
            const possibleLogoUrl =
              section.logoUrl || section.logo_url || section.logoImage || section.logo_image;
            const possibleLogoAlt =
              section.logoAlt || section.logo_alt || section.logoAltText || section.logo_alt_text;

            if (possibleLogoUrl) {
              logoUrl = possibleLogoUrl as string;
              logoAlt = (possibleLogoAlt as string) || "Wedding Logo";
              console.log(`update-live - Found logo in section ${sectionId}:`, {
                logoUrl,
                logoAlt,
                originalFields: {
                  logoUrl: section.logoUrl,
                  logo_url: section.logo_url,
                  logoImage: section.logoImage,
                  logo_image: section.logo_image,
                },
              });
            }
          }
        }
      }

      // Final fallback: check top level of userContent for logo data
      if (!logoUrl && userContent && typeof userContent === "object") {
        const topLevelLogoUrl =
          userContent.logoUrl ||
          userContent.logo_url ||
          userContent.logoImage ||
          userContent.logo_image;
        const topLevelLogoAlt =
          userContent.logoAlt ||
          userContent.logo_alt ||
          userContent.logoAltText ||
          userContent.logo_alt_text;

        if (topLevelLogoUrl) {
          logoUrl = topLevelLogoUrl as string;
          logoAlt = (topLevelLogoAlt as string) || "Wedding Logo";
          console.log("update-live - Found logo at top level of userContent:", {
            logoUrl,
            logoAlt,
          });
        }
      }

      const extractedFields = { heroImage, storyImage, venue, welcomeMessage, logoUrl, logoAlt };
      console.log("update-live - Final extracted fields:", extractedFields);

      return extractedFields;
    };

    console.log(
      "Update Live API - userTemplate.content structure:",
      JSON.stringify(userTemplate.content, null, 2)
    );
    console.log(
      "Update Live API - userTemplate.content keys:",
      Object.keys(userTemplate.content || {})
    );

    const extractedFields = extractWeddingPageFields(
      userTemplate.content as Record<string, unknown>
    );

    // Update the live wedding page with extracted fields
    const updateData = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ai_data: userTemplate.content as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layout_data: userTemplate.content as any,
      color_theme: JSON.stringify(userTemplate.colorScheme),
      // Extract and update specific fields
      hero_image: extractedFields.heroImage,
      story_image: extractedFields.storyImage,
      venue: extractedFields.venue,
      welcomeMessage: extractedFields.welcomeMessage,
      logo_url: extractedFields.logoUrl,
      logo_alt: extractedFields.logoAlt,
    };

    console.log("update-live - Updating wedding page with data:", updateData);
    console.log("update-live - Story image being updated:", {
      storyImage: extractedFields.storyImage,
      isNull: extractedFields.storyImage === null,
      isUndefined: extractedFields.storyImage === undefined,
      type: typeof extractedFields.storyImage,
    });

    const updatedWeddingPage = await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: updateData,
      include: {
        template: true,
      },
    });

    console.log("update-live - Wedding page updated successfully:", updatedWeddingPage);

    return NextResponse.json({
      success: true,
      weddingPage: updatedWeddingPage,
      message: "Live site updated successfully!",
    });
  } catch (error) {
    console.error("Error updating live site:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
