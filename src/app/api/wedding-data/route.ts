import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";
import { templateRegistry } from "@/lib/template-registry";

interface ComponentContent {
  title?: string;
  subtitle?: string;
  venue?: string;
  welcomeMessage?: string;
  story?: string;
  imageUrl?: string;
  images?: string[];
  giftContent?: string;
  guestContent?: string;
}

interface LayoutData {
  components: {
    type: string;
    content: ComponentContent;
    styles?: {
      backgroundColor?: string;
      textColor?: string;
    };
  }[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        groomName: true,
        brideName: true,
        weddingDate: true,
        plan: {
          select: {
            name: true
          }
        },
        weddingPages: {
          where: { is_live: true },
          orderBy: { created_at: "desc" },
          take: 1,
          select: {
            id: true,
            layout_data: true,
            color_theme: true,
            templateId: true,
            template: {
              select: {
                name: true,
                thumbnail_url: true
              }
            },
            mediaUploads: {
              where: { type: "PHOTO" },
              orderBy: { uploaded_at: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.weddingPages.length) {
      return NextResponse.json({
        error: "No active wedding page found",
        allowedTemplates: user.plan ? PLANS[user.plan.name as keyof typeof PLANS]?.allowedTemplates : ['classic']
      }, { status: 404 });
    }

    const activePage = user.weddingPages[0];
    const layoutData = activePage.layout_data as LayoutData | null;

    // Verify template access
    if (activePage.templateId && user.plan &&
        !PLANS[user.plan.name as keyof typeof PLANS]?.allowedTemplates.includes(activePage.templateId)) {
      return NextResponse.json({
        error: `Your current plan (${user.plan.name}) doesn't include this template. Please upgrade.`,
        requiredPlan: templateRegistry[activePage.templateId as keyof typeof templateRegistry]?.requiredPlan
      }, { status: 403 });
    }

    // Extract data from components
    const heroComponent = layoutData?.components?.find(c => c.type === "hero");
    const storyComponent = layoutData?.components?.find(c => c.type === "story");
    const galleryComponent = layoutData?.components?.find(c => c.type === "gallery");

    return NextResponse.json({
      groomName: user.groomName || "Groom",
      brideName: user.brideName || "Bride",
      weddingDate: user.weddingDate?.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }) || "Wedding Date",
      venue: heroComponent?.content.venue || "Venue",
      welcomeMessage: heroComponent?.content.welcomeMessage || "Welcome to our wedding",
      colorTheme: activePage.color_theme,
      ourStory: {
        story: storyComponent?.content.story || "It all started with a simple hello...",
        imageUrl: storyComponent?.content.imageUrl ||
                 activePage.mediaUploads[0]?.cloudinary_url ||
                 "/default-wedding-image.jpg"
      },
      galleryImages: galleryComponent?.content.images || [],
      templateInfo: {
        id: activePage.templateId,
        name: activePage.template?.name,
        thumbnail: activePage.template?.thumbnail_url
      },
      userPlan: user.plan?.name || 'DELIGHT' // Default to DELIGHT if no plan
    });

  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      templateId,
      layout_data,
      title,
      slug,
      color_theme,
      is_live = false
    } = await req.json();

    // Verify template access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        plan: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if template is restricted
    if (templateId) {
      const template = templateRegistry[templateId as keyof typeof templateRegistry];
      if (!template) {
        return NextResponse.json({ error: "Invalid template" }, { status: 400 });
      }

      if (!user.plan || !PLANS[user.plan.name as keyof typeof PLANS]?.allowedTemplates.includes(templateId)) {
        return NextResponse.json({
          error: `Your current plan (${user.plan?.name || 'Free'}) doesn't include this template.`,
          requiredPlan: template.requiredPlan,
          allowedTemplates: user.plan ? PLANS[user.plan.name as keyof typeof PLANS]?.allowedTemplates : ['classic']
        }, { status: 403 });
      }
    }

    // Create or update wedding page
    const existingPage = await prisma.weddingPage.findFirst({
      where: { userId: user.id }
    });

    const pageData = {
      title,
      slug,
      color_theme,
      layout_data,
      is_live,
      templateId: templateId || null, // Allow null for custom pages
      userId: user.id
    };

    const weddingPage = existingPage
      ? await prisma.weddingPage.update({
          where: { id: existingPage.id },
          data: pageData
        })
      : await prisma.weddingPage.create({ data: pageData });

    return NextResponse.json({
      ...weddingPage,
      userPlan: user.plan?.name
    });

  } catch (error) {
    console.error("Error saving wedding page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}