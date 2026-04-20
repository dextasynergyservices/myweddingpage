import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = await params;

  try {
    const { status } = await request.json();
    if (!status || !["ATTENDING", "DECLINED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid RSVP status" },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.update({
      where: { invitationToken: token },
      data: { rsvpStatus: status },
      include: {
        user: true, // Include user to send notification
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // 🔔 Send push notification to wedding page owner
    if (guest.user) {
      try {
        const { sendNotificationToUser, createRSVPNotification } = await import(
          "@/lib/notifications/notificationService"
        );
        const notification = createRSVPNotification(
          guest.name,
          status as "ATTENDING" | "NOT_ATTENDING" | "MAYBE"
        );
        await sendNotificationToUser(guest.user.id, notification);
      } catch (notifyError) {
        console.error("Failed to send push notification:", notifyError);
        // Don't fail the RSVP update if notification fails
      }
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error("Failed to update RSVP:", error);
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    );
  }
}
