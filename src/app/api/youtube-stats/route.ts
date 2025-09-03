import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
  }

  try {
    // In a real implementation, you would use the YouTube Data API
    // This is a mock implementation since the YouTube API requires authentication
    // and has quota limitations

    // For demo purposes, we'll return a random viewer count
    const viewerCount = Math.floor(Math.random() * 100) + 10;

    return NextResponse.json({ viewerCount });
  } catch (error) {
    console.error("Error fetching YouTube stats:", error);
    return NextResponse.json({ error: "Error fetching YouTube stats" }, { status: 500 });
  }
}
