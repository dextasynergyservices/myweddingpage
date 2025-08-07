import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  let user;

  if (email) {
    user = await prisma.user.findFirst({
      where: {
        email,
        verification_code: code,
      },
    });
  } else {
    user = await prisma.user.findFirst({
      where: {
        verification_code: code,
      },
    });
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
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

  return NextResponse.json({ success: true });
}
