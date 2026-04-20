import prisma from "@/lib/prisma";
import { sendRenewalEmail } from "./sendRenewalEmail";

interface ProcessRenewalParams {
  userId: string;
  planId: string;
  optionId: string;
  reference?: string; // Paystack reference
  trxref?: string; // optional transaction ref
  groomName?: string;
  brideName?: string;
  email?: string;
}

export async function processRenewal({
  userId,
  planId,
  optionId,
  reference,
  trxref,
}: ProcessRenewalParams) {
  try {
    console.log("[processRenewal] Starting process for:", {
      userId,
      planId,
      optionId,
      reference,
      trxref,
    });

    // 1️⃣ Get renewal option
    const option = await prisma.planRenewalOption.findUnique({
      where: { id: optionId },
    });
    if (!option) throw new Error("Invalid renewal option");
    console.log("[processRenewal] Renewal option found:", option);

    // 2️⃣ Find current subscription for the user & plan
    const subscription = await prisma.subscription.findFirst({
      where: { userId, planId },
      orderBy: { createdAt: "desc" },
    });
    if (!subscription)
      throw new Error("No subscription found for this user and plan");
    console.log("[processRenewal] Subscription found:", subscription);

    const now = new Date();
    const currentExpiry = subscription.expiresAt ?? now;

    // Extend from current expiry if still active, otherwise from now
    const startDate = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(
      startDate.getTime() + option.duration * 24 * 60 * 60 * 1000
    );

    // 3️⃣ Update subscription, user, and record payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          createdAt: now,
          expiresAt: newExpiry,
          paystackReference: reference || subscription.paystackReference,
        },
      });
      console.log("[processRenewal] Subscription updated");

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          subscription_start: now,
          subscription_end: newExpiry,
          status: "ACTIVE",
        },
      });
      console.log("[processRenewal] User updated");

      let paymentRecord = null;
      if (reference) {
        paymentRecord = await tx.payment.create({
          data: {
            userId,
            planId,
            amount: option.price,
            payment_provider: "PAYSTACK",
            status: "SUCCESS",
            paid_at: now,
            reference,
            trxref,
          },
        });
        console.log("[processRenewal] Payment recorded:", paymentRecord);
      }

      return { updatedUser, updatedSubscription, paymentRecord };
    });

    // 4️⃣ Send renewal emails (log errors but don't fail transaction)
    try {
      await sendRenewalEmail({
        user: result.updatedUser,
        duration: option.duration,
        expiresAt: newExpiry,
        adminEmail: process.env.EMAIL_FROM!,
      });
      console.log("[processRenewal] Renewal emails sent");
    } catch (err) {
      console.error("[processRenewal] sendRenewalEmail failed:", err);
    }

    return {
      user: result.updatedUser,
      newExpiry,
      paymentRecord: result.paymentRecord,
    };
  } catch (err) {
    console.error("[processRenewal] Error:", err);
    throw err;
  }
}
