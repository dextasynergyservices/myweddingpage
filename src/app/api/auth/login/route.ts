import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
  const { emailOrWhatsapp, password } = await req.json();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrWhatsapp }, { whatsapp: emailOrWhatsapp }],
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "User not active or does not exist" },
      { status: 401 }
    );
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const res = NextResponse.json({ message: "Login successful", token });
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res;
}
