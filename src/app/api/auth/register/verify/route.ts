import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { emailOrWhatsapp, code } = await req.json();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrWhatsapp }, { whatsapp: emailOrWhatsapp }],
    },
  });

  if (!user || user.verification_code !== code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: "ACTIVE",
      verification_code: null,
    },
  });

  return NextResponse.json({
    message: "Verification complete. You can now log in.",
  });
}
