// /api/auth/token-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { token },
    include: {
      user: {
        include: { plan: true },
      },
    },
  });

  if (!subscription || subscription.status !== "PAID") {
    return NextResponse.json({ error: "Invalid or unpaid token." }, { status: 401 });
  }

  return NextResponse.json({
    email: subscription.email,
    planId: subscription.planId,
    status: subscription.status,
    token: subscription.token,
    paystackReference: subscription.paystackReference,
  });
}
