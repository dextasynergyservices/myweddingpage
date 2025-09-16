import { NextRequest, NextResponse } from "next/server";
import canva from "@/lib/canva";

export async function GET(request: NextRequest) {
  try {
    // You'll need to authenticate first to get your access token
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("token");

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Access token required",
          message: "Please authenticate with Canva first",
          authUrl: "Go to /api/canva/auth to start authentication",
        },
        { status: 400 }
      );
    }

    // Get your brand templates
    const templates = await canva.getBrandTemplates(accessToken);

    return NextResponse.json({
      success: true,
      templates: templates.map(
        (template: { id: string; name: string; thumbnail?: { url: string }; tags?: string[] }) => ({
          id: template.id,
          name: template.name,
          thumbnail: template.thumbnail?.url,
          tags: template.tags || [],
        })
      ),
      total: templates.length,
      instructions: {
        usage: "Use these template IDs in your wedding design creation",
        example: {
          romantic: "Find the template with 'romantic' or 'pink' in the name",
          elegant: "Find the template with 'elegant' or 'classic' in the name",
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching brand templates:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch templates",
        details: error instanceof Error ? error.message : "Unknown error",
        tip: "Make sure you have created brand templates in your Canva account",
      },
      { status: 500 }
    );
  }
}
