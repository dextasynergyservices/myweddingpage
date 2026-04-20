import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Resend } from "resend";
import { WhatsAppService } from "@/lib/giftWhatsApp";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const guests = await prisma.guest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error("Failed to fetch guests:", error);
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || (!body.email && !body.phone)) {
      return NextResponse.json(
        { error: "Name and at least one contact method are required" },
        { status: 400 }
      );
    }

    // Check for duplicate table assignment
    if (body.tableAssignment) {
      const tableTaken = await prisma.guest.findFirst({
        where: {
          tableAssignment: body.tableAssignment,
          userId: user.id,
        },
      });

      if (tableTaken) {
        return NextResponse.json(
          { error: "This table number is already assigned" },
          { status: 400 }
        );
      }
    }

    const invitationToken = uuidv4();
    const guest = await prisma.guest.create({
      data: {
        ...body,
        invitationCard: body.invitationCard,
        invitationToken,
        userId: user.id,
        rsvpStatus: "PENDING",
      },
    });

    // Send invitations
    const notificationResults = {
      email: { sent: false, error: null as string | null },
      whatsapp: { sent: false, error: null as string | null },
    };

    const rsvpLink = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${invitationToken}`;
    const customMessage = body.customMessage || "You're invited to our wedding!";

    if (guest.email) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4a5568;">You're Invited!</h1>
            <p>Dear ${guest.name},</p>
            <p>${customMessage}</p>

            ${
              guest.invitationCard
                ? `
              <div style="margin: 20px 0;">
                <img
                  src="${guest.invitationCard}"
                  alt="Wedding Invitation"
                  style="max-width: 100%; border-radius: 8px;"
                />
              </div>
            `
                : ""
            }

            <p>Please RSVP by clicking the link below:</p>
            <a href="${rsvpLink}" style="/* ... existing styles ... */">
              RSVP Now
            </a>

            <p>We look forward to celebrating with you!</p>
            <p>With love,<br>${user.name}</p>
          </div>
        `;

        await resend.emails.send({
          from: "noreply@myweddingpage.online",
          to: guest.email,
          subject: `${user.name}'s Wedding Invitation`,
          html: emailHtml,
        });
        notificationResults.email.sent = true;
      } catch (error) {
        console.error("Failed to send email:", error);
        notificationResults.email.error = "Failed to send email";
      }
    }

    if (guest.phone) {
      try {
        await WhatsAppService.sendMessage({
          to: guest.phone,
          message: `Dear ${guest.name}, ${customMessage} RSVP here: <a href="${rsvpLink}" style="/* ... existing styles ... */">
              RSVP Now
            </a>

            ${
              guest.invitationCard
                ? `
              <div style="margin: 20px 0;">
                <img
                  src="${guest.invitationCard}"
                  alt="Wedding Invitation"
                  style="max-width: 100%; border-radius: 8px;"
                />
              </div>
            `
                : ""
            }
            `,
        });
        notificationResults.whatsapp.sent = true;
      } catch (error) {
        console.error("Failed to send WhatsApp message error:", error);
        notificationResults.whatsapp.error = "Failed to send WhatsApp message";
      }
    }

    return NextResponse.json({ guest, notifications: notificationResults }, { status: 201 });
  } catch (error) {
    console.error("Failed to create guest:", error);
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }
}
