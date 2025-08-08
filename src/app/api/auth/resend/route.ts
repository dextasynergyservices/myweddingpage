import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: "Email already verified" }, { status: 200 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = nanoid();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verification_code: code,
      verification_token: token,
    },
  });

  await sendVerificationEmail(email, code, token, user.brideName ?? "", user.groomName ?? "");

  return NextResponse.json({ message: "Verification email resent" });
}
