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
    if (!body.name || (!body.giftId && !body.amount)) {
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
        userId: user.id,
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

    if (!gift.contactEmail) {
      return NextResponse.json({ error: "No contact Email available" }, { status: 400 });
    }

    if (!gift.contactPhone) {
      return NextResponse.json({ error: "No WhatsApp phone number available" }, { status: 400 });
    }

    // Send thank you email
    if (gift.contactEmail.includes("@")) {
      await resend.emails.send({
        from: "noreply@myweddingpage.online",
        to: gift.contactEmail,
        subject: "Thank you for your gift!",
        text: message,
      });
    }

    // Send WhatsApp message if phone number is detected
    if (/^\+?[\d\s-]+$/.test(gift.contactPhone)) {
      await WhatsAppService.sendMessage({
        to: gift.contactPhone,
        message: message,
      });
    }

    // Update thanked status
    const updatedGift = await prisma.receivedGift.update({
      where: { id, userId: user.id },
      data: {
        thanked: true,
        thankedAt: new Date(),
      },
    });

    return NextResponse.json(updatedGift);
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
