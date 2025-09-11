import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const { token } = await params;

  try {
    const { status } = await request.json();
    if (!status || !["ATTENDING", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
    }

    const guest = await prisma.guest.update({
      where: { invitationToken: token },
      data: { rsvpStatus: status },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error("Failed to update RSVP:", error);
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}
