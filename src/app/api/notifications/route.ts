import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import twilio from "twilio";

// Send notification (Email or WhatsApp)
export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID || "",
    process.env.TWILIO_AUTH_TOKEN || ""
  );
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guestName, guestEmail, guestPhone, message, notificationType, scheduledFor } = body;

    // Validation
    if (!guestName || !message || !notificationType) {
      return NextResponse.json(
        { error: "Guest name, message, and notification type are required" },
        { status: 400 }
      );
    }

    if (notificationType === "email" && !guestEmail) {
      return NextResponse.json(
        { error: "Email address is required for email notifications" },
        { status: 400 }
      );
    }

    if (notificationType === "whatsapp" && !guestPhone) {
      return NextResponse.json(
        { error: "Phone number is required for WhatsApp notifications" },
        { status: 400 }
      );
    }

    // Create notification record
    const notification = await prisma.guestNotification.create({
      data: {
        userId: session.user.id,
        guestName,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        message,
        notificationType,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        deliveryStatus: scheduledFor ? "pending" : "sending",
      },
    });

    // If not scheduled, send immediately
    if (!scheduledFor) {
      try {
        if (notificationType === "email" && guestEmail) {
          // Send email via Resend
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "info@myweddingpage.online",
            to: guestEmail,
            subject: `Wedding Live Stream Notification 💒`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Hello ${guestName}! 👋</h2>
                <div style="padding: 20px; background-color: #F9FAFB; border-radius: 8px; margin: 20px 0;">
                  ${message}
                </div>
                <p style="color: #6B7280; font-size: 14px;">
                  We can't wait to celebrate with you! ❤️
                </p>
              </div>
            `,
          });

          await prisma.guestNotification.update({
            where: { id: notification.id },
            data: {
              deliveryStatus: "sent",
              sentAt: new Date(),
            },
          });
        } else if (notificationType === "whatsapp" && guestPhone) {
          // Send WhatsApp message via Twilio
          await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${guestPhone}`,
            body: `Hello ${guestName}! 👋\n\n${message}\n\nWe can't wait to celebrate with you! ❤️`,
          });

          await prisma.guestNotification.update({
            where: { id: notification.id },
            data: {
              deliveryStatus: "sent",
              sentAt: new Date(),
            },
          });
        }
      } catch (sendError) {
        console.error("Error sending notification:", sendError);
        const errorMessage = sendError instanceof Error ? sendError.message : "Unknown error";
        await prisma.guestNotification.update({
          where: { id: notification.id },
          data: {
            deliveryStatus: "failed",
            errorMessage,
          },
        });
        return NextResponse.json(
          { error: "Failed to send notification", details: errorMessage },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

// Get all notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.guestNotification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.guestNotification.count({
        where: { userId: session.user.id },
      }),
    ]);

    // Get stats
    const stats = {
      total,
      sent: await prisma.guestNotification.count({
        where: { userId: session.user.id, deliveryStatus: "sent" },
      }),
      pending: await prisma.guestNotification.count({
        where: { userId: session.user.id, deliveryStatus: "pending" },
      }),
      failed: await prisma.guestNotification.count({
        where: { userId: session.user.id, deliveryStatus: "failed" },
      }),
    };

    return NextResponse.json({
      notifications,
      stats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
