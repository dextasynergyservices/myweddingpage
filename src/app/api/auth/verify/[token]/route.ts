import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { verification_token: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verification_token: null,
        verification_code: null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ user: { id: user.id, status: "ACTIVE", email: user.email } });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
