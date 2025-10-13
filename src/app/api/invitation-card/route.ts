import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      streamId,
      template = "elegant",
      primaryColor = "#4F46E5",
      secondaryColor = "#EC4899",
      showQRCode = true,
    } = body;

    if (!streamId) {
      return NextResponse.json({ error: "Stream ID is required" }, { status: 400 });
    }

    // Get stream details
    const stream = await prisma.stream.findFirst({
      where: {
        id: streamId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            groomName: true,
            brideName: true,
            weddingDate: true,
          },
        },
      },
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Get wedding page for URL
    const weddingPage = await prisma.weddingPage.findFirst({
      where: { userId: session.user.id },
      select: { slug: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const streamUrl = weddingPage
      ? `${appUrl}/${weddingPage.slug}?stream=live`
      : `${appUrl}/stream/${streamId}`;

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(streamUrl)}`;

    // Format wedding date
    const weddingDateStr = stream.user.weddingDate
      ? new Date(stream.user.weddingDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Wedding Day";

    // Return card data (frontend will render this)
    const cardData = {
      template,
      streamName: stream.name,
      coupleName: `${stream.user.brideName || "Bride"} & ${stream.user.groomName || "Groom"}`,
      weddingDate: weddingDateStr,
      streamUrl,
      qrCodeUrl: showQRCode ? qrCodeUrl : null,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
      },
      message: `Join us live as we celebrate our special day! 💒✨`,
    };

    return NextResponse.json({
      success: true,
      cardData,
    });
  } catch (error) {
    console.error("Error generating invitation card:", error);
    return NextResponse.json({ error: "Failed to generate invitation card" }, { status: 500 });
  }
}
