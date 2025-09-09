import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Resend } from "resend";
import { WhatsAppService } from "@/lib/giftWhatsApp";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const receivedGifts = await prisma.receivedGift.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(receivedGifts);
  } catch (error) {
    console.error("Failed to fetch received gifts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch received gifts",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || (!body.giftId && !body.amount) || !body.userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const receivedGift = await prisma.receivedGift.create({
      data: {
        name: body.name,
        giftId: body.giftId || null,
        amount: body.amount ? parseFloat(body.amount) : null,
        message: body.message || null,
        date: new Date(body.date || new Date()),
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        userId: body.userId, // Use the provided userId (wedding page owner)
      },
    });

    return NextResponse.json(receivedGift, { status: 201 });
  } catch (error) {
    console.error("Failed to create received gift:", error);
    return NextResponse.json(
      {
        error: "Failed to create received gift",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing received gift ID" }, { status: 400 });
    }

    const existingGift = await prisma.receivedGift.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingGift) {
      return NextResponse.json({ error: "Received gift not found" }, { status: 404 });
    }

    const updatedGift = await prisma.receivedGift.update({
      where: { id, userId: user.id },
      data: {
        thanked: data.thanked,
        thankedAt: data.thanked ? new Date() : null,
      },
    });

    return NextResponse.json(updatedGift);
  } catch (error) {
    console.error("Failed to update received gift:", error);
    return NextResponse.json(
      {
        error: "Failed to update received gift",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing received gift ID" }, { status: 400 });
    }

    await prisma.receivedGift.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete received gift:", error);
    return NextResponse.json(
      {
        error: "Failed to delete received gift",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id, message } = await request.json();
    if (!id || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const gift = await prisma.receivedGift.findUnique({
      where: { id, userId: user.id },
    });

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    interface NotificationResult {
      sent: boolean;
      error: string | null;
    }

    const notificationResults = {
      email: { sent: false, error: null } as NotificationResult,
      whatsapp: { sent: false, error: null } as NotificationResult,
    };

    // Send email if contact email exists
    if (gift.contactEmail && gift.contactEmail.includes("@")) {
      console.log("Attempting to send email to:", gift.contactEmail);
      console.log("Email message:", message);
      try {
        const emailResult = await resend.emails.send({
          from: "noreply@myweddingpage.online",
          to: gift.contactEmail,
          subject: "Thank you for your gift!",
          text: message,
        });
        console.log("Email sent successfully:", emailResult);
        notificationResults.email.sent = true;
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        notificationResults.email.error =
          emailError instanceof Error ? emailError.message : "Failed to send email";
      }
    } else {
      console.log("No valid email address found:", gift.contactEmail);
    }

    // Send WhatsApp message if contact phone exists
    if (gift.contactPhone) {
      console.log("Attempting to send WhatsApp to:", gift.contactPhone);
      console.log("WhatsApp message:", message);
      try {
        const whatsappResult = await WhatsAppService.sendMessage({
          to: gift.contactPhone,
          message: message,
        });
        console.log("WhatsApp sent successfully:", whatsappResult);
        notificationResults.whatsapp.sent = true;
      } catch (whatsappError) {
        console.error("WhatsApp sending failed:", whatsappError);
        notificationResults.whatsapp.error =
          whatsappError instanceof Error
            ? whatsappError.message
            : "Failed to send WhatsApp message";
      }
    } else {
      console.log("No phone number found:", gift.contactPhone);
    }

    // Update thanked status regardless of notification success
    const updatedGift = await prisma.receivedGift.update({
      where: { id, userId: user.id },
      data: {
        thanked: true,
        thankedAt: new Date(),
      },
    });

    console.log("Final notification results:", notificationResults);

    return NextResponse.json({
      ...updatedGift,
      notifications: notificationResults,
    });
  } catch (error) {
    console.error("Failed to send thank you:", error);
    return NextResponse.json(
      {
        error: "Failed to send thank you",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
