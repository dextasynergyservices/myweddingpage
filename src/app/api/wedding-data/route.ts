import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Merge data from several possible sources: user fields, wedding page ai/layout data,
    // and user template content. This gives the renderer many avenues to find bride/groom/date/etc.
    const wpAi = (weddingPage?.ai_data as any) ?? (weddingPage?.layout_data as any) ?? {};
    const utContent = (selectedUserTemplate?.content as any) ?? {};

    const userData = {
      // Prefer explicit user fields, then AI/page data, then userTemplate content, then sensible defaults
      brideName: user.brideName || wpAi?.brideName || wpAi?.bride_name || utContent?.brideName || utContent?.bride_name || "Bride",
      groomName: user.groomName || wpAi?.groomName || wpAi?.groom_name || utContent?.groomName || utContent?.groom_name || "Groom",
      weddingDate:
        (user.weddingDate && user.weddingDate.toISOString()) || wpAi?.weddingDate || wpAi?.wedding_date || utContent?.weddingDate || null,
      venue: weddingPage?.venue || wpAi?.venue || utContent?.venue || null,
      welcomeMessage: weddingPage?.welcomeMessage || wpAi?.welcomeMessage || utContent?.welcomeMessage || null,
      // expose raw objects for templates that expect different shapes
      _raw: {
        user: user,
        weddingPage: weddingPage,
        userTemplate: selectedUserTemplate,
        wpAi,
        utContent,
      },
    } as any;

    // safe-access previewData which can be Json
    const selectedPreviewData: any = (selectedTemplate as any)?.previewData ?? {};

    const ourStory = {
      content: userData.welcomeMessage || selectedPreviewData?.welcomeMessage || "Our story will appear here...",
      imageUrl:
        (weddingPage as any)?.story_image || selectedPreviewData?.story_image || (selectedTemplate as any)?.hero_image || "/default-story.jpg",
    };

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
