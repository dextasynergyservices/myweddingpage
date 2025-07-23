import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, sendWhatsAppCode } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const { name, email, password, confirmPassword, whatsapp } = await req.json();

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { whatsapp }] },
  });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.create({
    data: {
      name,
      email,
      whatsapp,
      password: hashedPassword,
      role: "USER",
      status: "INACTIVE",
      verification_code: code,
    },
  });

  await sendVerificationEmail(email, code);
  await sendWhatsAppCode(whatsapp, code);

  return NextResponse.json({ message: "Verification code sent" });
}
