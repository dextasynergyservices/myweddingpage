import { NextRequest, NextResponse } from "next/server";

/**
 * YouTube Data API v3 Integration
 * Fetches real-time statistics for a YouTube video/live stream
 *
 * Note: Requires YOUTUBE_API_KEY in .env.local
 * Get your key from: https://console.cloud.google.com/apis/credentials
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  console.log("🎥 YouTube stats request for videoId:", videoId);

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    // If no API key, return mock data for development
    if (!apiKey) {
      console.warn("YouTube API key not configured. Returning mock data.");
      return NextResponse.json({
        viewerCount: Math.floor(Math.random() * 500) + 50,
        concurrentViewers: Math.floor(Math.random() * 500) + 50,
        likeCount: Math.floor(Math.random() * 100) + 10,
        isLive: true,
        status: "live",
        title: "Wedding Livestream",
        health: "good",
        mock: true,
      });
    }

    // Fetch from YouTube Data API v3
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,liveStreamingDetails&id=${videoId}&key=${apiKey}`,
      { next: { revalidate: 30 } } // Cache for 30 seconds
    );

    if (!response.ok) {
      // Get detailed error from YouTube API
      const errorData = await response.json().catch(() => null);
      console.error("❌ YouTube API error:", {
        status: response.status,
        statusText: response.statusText,
        videoId,
        error: errorData,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length,
      });

      throw new Error(
        `YouTube API error (${response.status}): ${errorData?.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const liveDetails = video.liveStreamingDetails;

    console.log("📊 Video data:", {
      title: snippet.title,
      hasLiveDetails: !!liveDetails,
      isLive: liveDetails?.actualStartTime && !liveDetails?.actualEndTime,
      concurrentViewers: liveDetails?.concurrentViewers,
    });

    // If video is not live or has no live details, return mock data
    if (
      !liveDetails ||
      !liveDetails.actualStartTime ||
      liveDetails.actualEndTime
    ) {
      console.warn("⚠️ Video is not currently live. Returning mock data.");
      return NextResponse.json({
        viewerCount: Math.floor(Math.random() * 500) + 50,
        concurrentViewers: Math.floor(Math.random() * 500) + 50,
        likeCount: parseInt(statistics.likeCount || "0"),
        isLive: false,
        status: "offline",
        title: snippet.title,
        health: "good",
        mock: true,
        message: "Video is not currently streaming live. Showing mock data.",
      });
    }

    // Determine stream health based on concurrent viewers
    let health = "good";
    const viewers = parseInt(liveDetails?.concurrentViewers || "0");
    if (viewers < 10) health = "fair";
    if (viewers < 5) health = "poor";

    return NextResponse.json({
      videoId,
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl:
        snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,

      // Live streaming details
      isLive: liveDetails?.actualStartTime && !liveDetails?.actualEndTime,
      scheduledStartTime: liveDetails?.scheduledStartTime,
      actualStartTime: liveDetails?.actualStartTime,
      actualEndTime: liveDetails?.actualEndTime,
      concurrentViewers: parseInt(liveDetails?.concurrentViewers || "0"),

      // Statistics
      viewCount: parseInt(statistics.viewCount || "0"),
      likeCount: parseInt(statistics.likeCount || "0"),
      commentCount: parseInt(statistics.commentCount || "0"),

      // Stream health indicator
      health,
      status:
        liveDetails?.actualStartTime && !liveDetails?.actualEndTime
          ? "live"
          : "offline",

      // Legacy field name for backward compatibility
      viewerCount: parseInt(liveDetails?.concurrentViewers || "0"),
    });
  } catch (error) {
    console.error("❌ Error fetching YouTube stats:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      videoId,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch stream statistics",
        details: error instanceof Error ? error.message : "Unknown error",
        videoId,
      },
      { status: 500 }
    );
  }
}
