import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

// Strict rate limiting for payment renewal (5 requests per hour per IP)
const renewalRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many renewal requests. Please try again later.",
});

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

/**
 * POST /api/paystack/initiate-renewal
 * Body: { optionId: string, userId?: string, groomName?: string, brideName?: string, email?: string }
 * - Looks up the renewal option (duration/price)
 * - Finds the user's active/latest subscription to get email + ids
 * - Initializes Paystack transaction and returns authorization_url
 */
export async function POST(req: Request) {
  try {
    // Apply strict rate limiting first
    const rateLimitResponse = await renewalRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { optionId, userId, groomName, brideName, email } = await req.json();

    if (!optionId) {
      return NextResponse.json(
        { error: "optionId is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Load the renewal option
    const option = await prisma.planRenewalOption.findUnique({
      where: { id: optionId },
      include: { plan: true },
    });
    if (!option) {
      return NextResponse.json({ error: "Invalid optionId" }, { status: 404 });
    }

    // 2️⃣ Find user's subscription
    let subscription =
      userId &&
      (await prisma.subscription.findFirst({
        where: { userId, planId: option.planId },
        orderBy: { createdAt: "desc" },
      }));

    if (!subscription) {
      subscription = await prisma.subscription.findFirst({
        where: { planId: option.planId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found for this user/plan" },
        { status: 404 }
      );
    }

    // 3️⃣ Determine email to charge
    const chargeEmail = email || subscription.email;
    if (!chargeEmail || !chargeEmail.includes("@")) {
      return NextResponse.json(
        { error: "No valid email available for this renewal" },
        { status: 400 }
      );
    }

    // 4️⃣ Prepare amount in kobo
    const amountKobo = Math.round(Number(option.price) * 100);
    if (isNaN(amountKobo) || amountKobo <= 0) {
      return NextResponse.json(
        { error: "Invalid amount for this option" },
        { status: 400 }
      );
    }

    // 5️⃣ Determine callback URL dynamically with planId
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://myweddingpage.online";

    const FRONTEND_SUCCESS_URL = `${origin.replace(
      /\/$/,
      ""
    )}/dashboard?renewal=success&planId=${option.planId}&optionId=${option.id}`;

    // 6️⃣ Initialize Paystack transaction
    const initRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: chargeEmail,
          amount: amountKobo,
          callback_url: FRONTEND_SUCCESS_URL,
          metadata: {
            type: "renewal",
            userId: subscription.userId,
            subscriptionId: subscription.id,
            planId: option.planId,
            optionId: option.id,
            duration: option.duration,
            groomName: groomName || subscription.groomName,
            brideName: brideName || subscription.brideName,
          },
        }),
      }
    );

    const initJson = await initRes.json();

    if (!initRes.ok || !initJson.status) {
      console.error("[paystack initialize] failure:", initRes.status, initJson);
      return NextResponse.json(
        { error: initJson.message || "Failed to initialize payment" },
        { status: 500 }
      );
    }

    // 7️⃣ Return authorization URL and reference
    return NextResponse.json({
      authorization_url: initJson.data.authorization_url,
      reference: initJson.data.reference,
    });
  } catch (err) {
    console.error("[paystack initialize] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
