import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { reference, planId, whatsapp } = await req.json();

    if (!reference || !planId || !whatsapp) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const existingSub = await prisma.subscription.findFirst({
      where: { paystackReference: reference },
    });

    if (existingSub) {
      return NextResponse.json({
        success: true,
        message: "Already verified",
        subscriptionId: existingSub.id,
      });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    const email = verifyData.data.customer.email;
    const amount = verifyData.data.amount / 100; // Convert from kobo

    // Fetch plan
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 404 });
    }

    // Create subscription
    const token = randomBytes(32).toString("hex");

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + plan.duration_days);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        subscription_start: now,
        subscription_end: expiresAt,
        planId,
        status: "PAID",
      },
    });

    const subscription = await prisma.subscription.create({
      data: {
        email,
        whatsapp,
        planId,
        token,
        expiresAt,
        amount,
        paystackReference: reference,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription created",
      subscriptionId: subscription.id,
      token: subscription.token,
      planName: plan.name,
      email,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
