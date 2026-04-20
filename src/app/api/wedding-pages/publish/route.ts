import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("=== PUBLISH API CALLED ===");
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.email);

    if (!session?.user?.email) {
      console.log("No session found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, slug, title, content, colorScheme } = await req.json();
    console.log("Request body:", {
      templateId,
      slug,
      title,
      content,
      colorScheme,
    });

    if (!templateId) {
      console.log("No templateId provided, returning 400");
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "User template not found" },
        { status: 404 }
      );
    }

    const existingWeddingPage = user.weddingPages[0];

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
        "extractWeddingPageFields - userContent:",
        JSON.stringify(userContent, null, 2)
      );
      console.log(
        "extractWeddingPageFields - content keys:",
        Object.keys(content)
      );

      // Also check if logo data is at the top level of userContent
      if (userContent && typeof userContent === "object") {
        console.log("extractWeddingPageFields - Top level logo data:", {
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
          console.log(`Checking section ${sectionId}:`, {
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
            console.log(`Found hero section: ${sectionId}`);
            heroImage = (section.heroImage as string) || heroImage;
            venue = (section.venue as string) || venue;
            welcomeMessage =
              (section.welcomeMessage as string) || welcomeMessage;
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
            console.log(`Found story section: ${sectionId}`);
            storyImage = (section.storyImage as string) || storyImage;

            // Handle Luxe template storyItems (both array and nested object structures)
            if (section.storyItems) {
              if (Array.isArray(section.storyItems)) {
                console.log(
                  `Found storyItems array in section ${sectionId}:`,
                  section.storyItems
                );
                // For Luxe template, store the first image as story_image for compatibility
                const firstStoryItem = section.storyItems[0];
                if (firstStoryItem && firstStoryItem.image) {
                  storyImage = firstStoryItem.image as string;
                  console.log(
                    `Found story image in Luxe storyItems array: ${storyImage}`
                  );
                } else {
                  console.log(`First storyItem has no image:`, firstStoryItem);
                }
              } else if (typeof section.storyItems === "object") {
                console.log(
                  `Found storyItems object in section ${sectionId}:`,
                  section.storyItems
                );
                // Handle nested object structure (stored in UserTemplate)
                const storyItemsObj = section.storyItems as Record<
                  string,
                  { image?: string }
                >;
                const firstStoryItem = storyItemsObj[0] || storyItemsObj["0"];
                if (firstStoryItem && firstStoryItem.image) {
                  storyImage = firstStoryItem.image as string;
                  console.log(
                    `Found story image in Luxe storyItems object: ${storyImage}`
                  );
                } else {
                  console.log(
                    `First storyItem in object has no image:`,
                    firstStoryItem
                  );
                }
              }
            } else {
              console.log(`No storyItems found in section ${sectionId}`);
            }

            // Handle Elegance template stories (both array and nested object structures)
            if (section.stories) {
              if (Array.isArray(section.stories)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const firstStory = (section.stories as any)[0];
                if (firstStory && firstStory.image) {
                  storyImage = firstStory.image as string;
                  console.log(
                    `Found story image in Elegance stories array: ${storyImage}`
                  );
                }
              } else if (typeof section.stories === "object") {
                console.log(
                  `Found stories object in section ${sectionId}:`,
                  section.stories
                );
                // Handle nested object structure (stored in UserTemplate)
                const storiesObj = section.stories as Record<
                  string,
                  { image?: string }
                >;
                const firstStory = storiesObj[0] || storiesObj["0"];
                if (firstStory && firstStory.image) {
                  storyImage = firstStory.image as string;
                  console.log(
                    `Found story image in Elegance stories object: ${storyImage}`
                  );
                }
              }
            }
          }

          // Check for any data in any section (fallback)
          if (!heroImage && section.heroImage) {
            heroImage = section.heroImage as string;
            console.log(`Found heroImage in section ${sectionId}:`, heroImage);
          }
          if (!storyImage && section.storyImage) {
            storyImage = section.storyImage as string;
            console.log(
              `Found storyImage in section ${sectionId}:`,
              storyImage
            );
          }

          // Check for story images in storyItems (Luxe template) - both array and object structures
          if (!storyImage && section.storyItems) {
            if (Array.isArray(section.storyItems)) {
              console.log(
                `Fallback: Found storyItems array in section ${sectionId}:`,
                section.storyItems
              );
              const firstStoryItem = section.storyItems[0];
              if (firstStoryItem && firstStoryItem.image) {
                storyImage = firstStoryItem.image as string;
                console.log(
                  `Fallback: Found story image in storyItems array in section ${sectionId}:`,
                  storyImage
                );
              }
            } else if (typeof section.storyItems === "object") {
              console.log(
                `Fallback: Found storyItems object in section ${sectionId}:`,
                section.storyItems
              );
              const storyItemsObj = section.storyItems as Record<
                string,
                { image?: string }
              >;
              const firstStoryItem = storyItemsObj[0] || storyItemsObj["0"];
              if (firstStoryItem && firstStoryItem.image) {
                storyImage = firstStoryItem.image as string;
                console.log(
                  `Fallback: Found story image in storyItems object in section ${sectionId}:`,
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
                  `Found story image in stories array in section ${sectionId}:`,
                  storyImage
                );
              }
            } else if (typeof section.stories === "object") {
              console.log(
                `Fallback: Found stories object in section ${sectionId}:`,
                section.stories
              );
              const storiesObj = section.stories as Record<
                string,
                { image?: string }
              >;
              const firstStory = storiesObj[0] || storiesObj["0"];
              if (firstStory && firstStory.image) {
                storyImage = firstStory.image as string;
                console.log(
                  `Found story image in stories object in section ${sectionId}:`,
                  storyImage
                );
              }
            }
          }
          if (!venue && section.venue) {
            venue = section.venue as string;
            console.log(`Found venue in section ${sectionId}:`, venue);
          }
          if (!welcomeMessage && section.welcomeMessage) {
            welcomeMessage = section.welcomeMessage as string;
            console.log(
              `Found welcomeMessage in section ${sectionId}:`,
              welcomeMessage
            );
          }

          // Check for logo data with multiple possible field names
          if (!logoUrl) {
            const possibleLogoUrl =
              section.logoUrl ||
              section.logo_url ||
              section.logoImage ||
              section.logo_image;
            const possibleLogoAlt =
              section.logoAlt ||
              section.logo_alt ||
              section.logoAltText ||
              section.logo_alt_text;

            if (possibleLogoUrl) {
              logoUrl = possibleLogoUrl as string;
              logoAlt = (possibleLogoAlt as string) || "Wedding Logo";
              console.log(`Found logo in section ${sectionId}:`, {
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
          console.log("Found logo at top level of userContent:", {
            logoUrl,
            logoAlt,
          });
        }
      }

      const extractedFields = {
        heroImage,
        storyImage,
        venue,
        welcomeMessage,
        logoUrl,
        logoAlt,
      };
      console.log("Final extracted fields:", extractedFields);

      // Additional logging for story image debugging
      if (!storyImage) {
        console.log("WARNING: No story image found!");
        console.log(
          "Available sections with story data:",
          Object.entries(content)
            .filter(([, section]) => {
              const s = section as Record<string, unknown>;
              return s.storyImage || s.storyItems || s.stories;
            })
            .map(([id, section]) => ({
              sectionId: id,
              hasStoryImage: !!(section as Record<string, unknown>).storyImage,
              hasStoryItems: !!(section as Record<string, unknown>).storyItems,
              hasStories: !!(section as Record<string, unknown>).stories,
            }))
        );
      }

      return extractedFields;
    };

    console.log(
      "Publish API - userTemplate.content structure:",
      JSON.stringify(userTemplate.content, null, 2)
    );
    console.log(
      "Publish API - userTemplate.content keys:",
      Object.keys(userTemplate.content || {})
    );

    const extractedFields = extractWeddingPageFields(
      userTemplate.content as Record<string, unknown>
    );

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
        return NextResponse.json(
          { error: "Slug is already taken" },
          { status: 400 }
        );
      }

      // Create new wedding page
      const weddingPageData = {
        userId: user.id,
        templateId,
        title:
          title ||
          `${user.groomName || "Groom"} & ${user.brideName || "Bride"} Wedding`,
        slug,
        ai_data: content || userTemplate.content,
        layout_data:
          userTemplate.content === null ? undefined : userTemplate.content,
        color_theme: JSON.stringify(colorScheme || userTemplate.colorScheme),
        // Extract and copy specific fields
        hero_image: extractedFields.heroImage,
        story_image: extractedFields.storyImage,
        venue: extractedFields.venue,
        welcomeMessage: extractedFields.welcomeMessage,
        logo_url: extractedFields.logoUrl,
        logo_alt: extractedFields.logoAlt,
        is_live: true,
      };

      console.log("Creating wedding page with data:", weddingPageData);
      console.log("Story image being saved:", {
        storyImage: extractedFields.storyImage,
        isNull: extractedFields.storyImage === null,
        isUndefined: extractedFields.storyImage === undefined,
        type: typeof extractedFields.storyImage,
      });

      const weddingPage = await prisma.weddingPage.create({
        data: weddingPageData,
        include: {
          template: true,
        },
      });

      console.log("Wedding page created successfully:", weddingPage);

      return NextResponse.json({
        success: true,
        weddingPage,
        isNewPublication: true,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
      });
    } else {
      // Update existing wedding page
      const updateData = {
        ai_data: content || userTemplate.content,
        layout_data:
          userTemplate.content === null ? undefined : userTemplate.content,
        color_theme: JSON.stringify(colorScheme || userTemplate.colorScheme),
        // Extract and update specific fields
        hero_image: extractedFields.heroImage,
        story_image: extractedFields.storyImage,
        venue: extractedFields.venue,
        welcomeMessage: extractedFields.welcomeMessage,
        logo_url: extractedFields.logoUrl,
        logo_alt: extractedFields.logoAlt,
      };

      console.log("Updating wedding page with data:", updateData);
      console.log("Story image being updated:", {
        storyImage: extractedFields.storyImage,
        isNull: extractedFields.storyImage === null,
        isUndefined: extractedFields.storyImage === undefined,
        type: typeof extractedFields.storyImage,
      });

      const updatedWeddingPage = await prisma.weddingPage.update({
        where: { id: existingWeddingPage.id },
        data: updateData,
        include: {
          template: true,
        },
      });

      console.log("Wedding page updated successfully:", updatedWeddingPage);

      return NextResponse.json({
        success: true,
        weddingPage: updatedWeddingPage,
        isNewPublication: false,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${updatedWeddingPage.slug}`,
      });
    }
  } catch (error) {
    console.error("Error publishing wedding page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
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
      return NextResponse.json(
        { error: "No published wedding page found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      weddingPage,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${weddingPage.slug}`,
    });
  } catch (error) {
    console.error("Error fetching wedding page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
