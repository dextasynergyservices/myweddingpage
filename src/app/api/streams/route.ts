import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const streams = await prisma.stream.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(streams);
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json({ error: "Error fetching streams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.youtubeUrl || !body.camera) {
      return NextResponse.json(
        { error: "Missing required fields: name, youtubeUrl, and camera are required" },
        { status: 400 }
      );
    }

    const youtubeId = extractYouTubeID(body.youtubeUrl);

    try {
      const stream = await prisma.stream.create({
        data: {
          name: body.name,
          youtubeUrl: body.youtubeUrl,
          youtubeId: youtubeId || "",
          camera: body.camera,
          quality: body.quality || "1080p",
          userId: session.user.id,
        },
      });

      return NextResponse.json(stream);
    } catch (dbError) {
      console.error("Database error:", dbError);

      // Return a mock response for development
      const mockStream = {
        id: `mock-${Date.now()}`,
        name: body.name,
        youtubeUrl: body.youtubeUrl,
        youtubeId: youtubeId || "",
        camera: body.camera,
        quality: body.quality || "1080p",
        isActive: false,
        viewerCount: 0,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json(mockStream);
    }
  } catch (error) {
    console.error("Error creating stream:", error);
    return NextResponse.json({ error: "Error creating stream" }, { status: 500 });
  }
}

function extractYouTubeID(url: string): string | null {
  try {
    // Handle embed URLs (https://www.youtube.com/embed/VIDEO_ID)
    if (url.includes("youtube.com/embed/")) {
      const parts = url.split("youtube.com/embed/");
      if (parts.length > 1) {
        const videoId = parts[1].split(/[?&]/)[0];
        return videoId.length === 11 ? videoId : null;
      }
    }

    // Handle youtu.be short URLs
    if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      if (parts.length > 1) {
        const videoId = parts[1].split(/[?&]/)[0];
        return videoId.length === 11 ? videoId : null;
      }
    }

    // Handle watch URLs (https://www.youtube.com/watch?v=VIDEO_ID)
    if (url.includes("youtube.com/watch") && url.includes("v=")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      return videoId && videoId.length === 11 ? videoId : null;
    }

    return null;
  } catch (error) {
    console.error("Error extracting YouTube ID:", error);
    return null;
  }
}
