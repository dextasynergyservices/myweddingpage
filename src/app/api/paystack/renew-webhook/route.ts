import { NextResponse } from "next/server";
import crypto from "crypto";
import { processRenewal } from "@/lib/renewal";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    const incomingSignature = req.headers.get("x-paystack-signature") || "";
    if (signature !== incomingSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Only handle successful charges
    if (event.event === "charge.success") {
      const metadata = event.data.metadata || {};

      if (metadata.type === "renewal") {
        // ✅ Idempotency check
        const existingPayment = await prisma.payment.findUnique({
          where: { reference: event.data.reference },
        });

        if (!existingPayment) {
          await processRenewal({
            userId: metadata.userId,
            planId: metadata.planId,
            optionId: metadata.optionId,
            reference: event.data.reference,
            trxref: event.data.trxref || null,
            groomName: metadata.groomName,
            brideName: metadata.brideName,
            email: metadata.email,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook-renewal] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
