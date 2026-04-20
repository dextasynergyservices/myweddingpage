// app/api/cron/expire-subscriptions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "info@myweddingpage.online";
const LOG_RETENTION_DAYS = 90; // this deletes logs older than 90 days

/**
 * Runs via Vercel Cron (GET).
 * - Expires any ACTIVE/PAID subscriptions whose `expiresAt` <= now
 * - Expires corresponding users whose `subscription_end` <= now
 * - Logs each expiration in ExpirationLog (subscriptionEnd = user's subscription_end if present; otherwise subscription.expiresAt)
 * - Deletes expiration logs older than LOG_RETENTION_DAYS
 * - Sends per-user emails (to subscription.email)
 * - Sends an admin summary email (table)
 */
export async function GET() {
  try {
    const now = new Date();

    // This Finds subscriptions to expire
    const subscriptionsToExpire = await prisma.subscription.findMany({
      where: {
        status: { in: ["ACTIVE", "PAID"] },
        expiresAt: { lte: now },
      },
      include: {
        user: {
          select: {
            id: true,
            groomName: true,
            brideName: true,
            subscription_end: true,
          },
        },
      },
      orderBy: { expiresAt: "asc" },
    });

    if (subscriptionsToExpire.length === 0) {
      return NextResponse.json({ message: "No subscriptions to expire." });
    }

    const subscriptionIds = subscriptionsToExpire.map((s) => s.id);
    const userIds = subscriptionsToExpire
      .map((s) => s.userId)
      .filter((v): v is string => !!v);

    // This block Updates subscriptions as EXPIRED
    await prisma.subscription.updateMany({
      where: { id: { in: subscriptionIds } },
      data: { status: "EXPIRED" },
    });

    // Updates users as EXPIRED (only those whose subscription_end <= now)
    if (userIds.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: { in: userIds },
          subscription_end: { lte: now },
        },
        data: { status: "EXPIRED" },
      });
    }

    // Log expirations (use user.subscription_end if present; else subscription.expiresAt)
    const logData = subscriptionsToExpire
      .filter((s) => !!s.userId)
      .map((s) => ({
        subscriptionId: s.id,
        userId: s.userId as string,
        subscriptionEnd: s.user?.subscription_end ?? s.expiresAt,
      }));

    if (logData.length > 0) {
      await prisma.expirationLog.createMany({ data: logData });
    }

    // Delete old logs older than LOG_RETENTION_DAYS whis is = 90 days
    const deleteBefore = new Date();
    deleteBefore.setDate(deleteBefore.getDate() - LOG_RETENTION_DAYS);
    await prisma.expirationLog.deleteMany({
      where: { expiredAt: { lt: deleteBefore } },
    });

    // end per-user emails (to subscription.email), in parallel for faster sending
    const userEmailPromises = subscriptionsToExpire
      .filter((s) => !!s.email)
      .map((s) =>
        resend.emails.send({
          from: "Myweddingpage <no-reply@myweddingpage.online>",
          to: s.email!,
          subject: "Your Subscription Has Expired",
          html: `
            <p>Hi ${[s.user?.groomName, s.user?.brideName].filter(Boolean).join(" and ") || "there"},</p>
            <p>Your subscription expired on <strong>${new Date(s.expiresAt).toLocaleDateString()}</strong>.</p>
            <p>Please renew to continue enjoying Myweddingpage features.</p>
            <p><a href="https://myweddingpage.online/login">Login to your dashboard to renew your subscription</a></p>
            <hr />
            <small>If you believe this is a mistake, please contact our support team.</small>
          `,
        })
      );

    // Build admin table for email
    const adminTableRows = subscriptionsToExpire
      .map((s) => {
        const fullName =
          [s.user?.groomName, s.user?.brideName]
            .filter(Boolean)
            .join(" and ") || "N/A";
        const email = s.email || "N/A";
        const userId = s.userId || "N/A";
        const when = new Date(s.expiresAt).toLocaleString();
        return `
          <tr>
            <td style="padding:6px;border:1px solid #ddd;">${userId}</td>
            <td style="padding:6px;border:1px solid #ddd;">${fullName}</td>
            <td style="padding:6px;border:1px solid #ddd;">${email}</td>
            <td style="padding:6px;border:1px solid #ddd;">${s.id}</td>
            <td style="padding:6px;border:1px solid #ddd;">${when}</td>
          </tr>
        `;
      })
      .join("");

    const adminEmailPromise = resend.emails.send({
      from: "Myweddingpage <no-reply@myweddingpage.online>",
      to: EMAIL_FROM,
      subject: `Subscription Expiration Report — ${now.toLocaleDateString()}`,
      html: `
        <h2>Subscription Expiration Report</h2>
        <p>Total expired: <strong>${subscriptionsToExpire.length}</strong></p>
        <table style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
          <thead>
            <tr>
              <th style="padding:6px;border:1px solid #ccc;background:#f7f7f7;">User ID</th>
              <th style="padding:6px;border:1px solid #ccc;background:#f7f7f7;">GroomName and BrideName</th>
              <th style="padding:6px;border:1px solid #ccc;background:#f7f7f7;">Email</th>
              <th style="padding:6px;border:1px solid #ccc;background:#f7f7f7;">Subscription ID</th>
              <th style="padding:6px;border:1px solid #ccc;background:#f7f7f7;">Expires At</th>
            </tr>
          </thead>
          <tbody>
            ${adminTableRows}
          </tbody>
        </table>
        <hr />
        <small>This is an automated report.</small>
      `,
    });

    await Promise.all([adminEmailPromise, ...userEmailPromises]);

    return NextResponse.json({
      message: `Expired ${subscriptionsToExpire.length} subscription(s). Updated statuses, logged, cleaned old logs, and sent notifications.`,
    });
  } catch (error) {
    console.error("[Cron] expire-subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
