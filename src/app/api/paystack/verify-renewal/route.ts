import { NextResponse } from "next/server";
import { processRenewal } from "@/lib/renewal";
import { prisma } from "@/lib/prisma";

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    metadata?: Record<string, unknown>;
    customer?: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
    };
    [key: string]: unknown;
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { reference, trxref, userId, planId, optionId, groomName, brideName, email } = body;

    console.log("[verify-renewal] body:", body);

    if (!reference || !userId || !planId || !optionId) {
      return NextResponse.json(
        { error: "Missing parameters for payment verification" },
        { status: 400 }
      );
    }

    // ✅ Idempotency check
    const existingPayment = await prisma.payment.findUnique({
      where: { reference },
    });
    if (existingPayment) {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        newExpiry: existingPayment.paid_at,
      });
    }

    // 1️⃣ Verify payment with Paystack
    let verifyData: PaystackVerifyResponse;
    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });
      verifyData = await verifyRes.json();
    } catch (err) {
      console.error("[verify-renewal] Paystack verification error:", err);
      return NextResponse.json(
        { error: "Payment verification failed: could not reach Paystack" },
        { status: 500 }
      );
    }

    if (!verifyData?.status || verifyData?.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed: unsuccessful transaction" },
        { status: 400 }
      );
    }

    // 2️⃣ Process renewal
    const result = await processRenewal({
      userId,
      planId,
      optionId,
      reference,
      trxref,
      groomName,
      brideName,
      email,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan renewed successfully ✅",
      newExpiry: result.newExpiry,
      user: result.user,
    });
  } catch (err) {
    console.error("[verify-renewal] unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
