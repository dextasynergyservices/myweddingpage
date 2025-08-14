import { NextResponse } from "next/server";
import { processRenewal } from "@/lib/renewal";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { reference, trxref, userId, planId, optionId, groomName, brideName, email } = body;

    console.log("[verify-renewal] body:", body);

    // ✅ Fallback: get userId from sessionStorage if missing (for frontend redirect cases)
    if (!userId && typeof window !== "undefined") {
      userId = window.sessionStorage.getItem("renewalUserId") || "";
    }

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
    let verifyData: any;
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

    // 2️⃣ Process renewal (no further Paystack calls inside processRenewal)
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
