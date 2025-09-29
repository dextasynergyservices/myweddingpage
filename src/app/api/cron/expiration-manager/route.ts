import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmailNotification } from "@/lib/emails/taskReminderEmail";
import { sendWhatsAppNotification } from "@/lib/taskReminderWhatsApp";

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token || token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Valid cron secret required." },
        { status: 401 }
      );
    }
    const now = new Date();
    const results = {
      sevenDayWarnings: 0,
      newExpirations: 0,
      gracePeriodReminders: 0,
      deletionsProcessed: 0,
      errors: [] as string[],
    };

    // 0. Find users with subscriptions expiring in 7 days - send warning
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const sevenDayWarningUsers = await prisma.user.findMany({
      where: {
        subscription_end: {
          gte: new Date(sevenDaysFromNow.getTime() - 12 * 60 * 60 * 1000), // 12 hours buffer
          lte: new Date(sevenDaysFromNow.getTime() + 12 * 60 * 60 * 1000), // 12 hours buffer
        },
        isInGracePeriod: false,
      },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        whatsapp: true,
        subscription_end: true,
        plan: {
          select: { name: true },
        },
      },
    });

    // Send 7-day expiration warnings
    for (const user of sevenDayWarningUsers) {
      try {
        const expirationDate = new Date(user.subscription_end!);

        // Send email warning
        if (user.email) {
          await sendEmailNotification({
            to: user.email,
            subject: "⏰ Your Wedding Plan Expires in 7 Days",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">Plan Renewal Reminder</h2>
                <p>Dear ${user.groomName || "User"} & ${user.brideName || "Partner"},</p>
                <p>This is a friendly reminder that your <strong>${user.plan?.name || "wedding"}</strong> plan will expire in 7 days.</p>

                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h3 style="color: #92400e; margin-top: 0;">📅 Important Dates</h3>
                  <p style="margin-bottom: 0;"><strong>Expiration Date:</strong> ${expirationDate.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</p>
                </div>

                <p>To avoid any interruption to your wedding page and services, please renew your plan before the expiration date.</p>

                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                     style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Renew Your Plan Now
                  </a>
                </p>

                <p style="color: #666; font-size: 14px;">
                  If you have any questions, please contact our support team.
                </p>
              </div>
            `,
          });
        }

        // Send WhatsApp warning
        if (user.whatsapp) {
          await sendWhatsAppNotification({
            to: user.whatsapp,
            body: `⏰ Wedding Plan Renewal Reminder\n\nHi ${user.groomName || "User"} & ${user.brideName || "Partner"}!\n\nYour ${user.plan?.name || "wedding"} plan expires in 7 days (${expirationDate.toLocaleDateString()}).\n\nRenew now to keep your wedding page active: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\n- MyWeddingPage Team`,
          });
        }

        // Send admin notification
        await sendEmailNotification({
          to: process.env.EMAIL_FROM!,
          subject: "📊 User Plan Expiring Soon - 7 Days",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Plan Expiration Alert - 7 Days</h2>
              <p><strong>User:</strong> ${user.groomName || "User"} & ${user.brideName || "Partner"}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Plan:</strong> ${user.plan?.name || "Unknown"}</p>
              <p><strong>Expires:</strong> ${expirationDate.toLocaleDateString()}</p>
              <p>Consider reaching out to help with renewal if needed.</p>
            </div>
          `,
        });

        results.sevenDayWarnings++;
      } catch (error) {
        console.error(`Error processing 7-day warning for user ${user.id}:`, error);
        results.errors.push(`Failed to process 7-day warning for user ${user.id}: ${error}`);
      }
    }

    // 1. Find newly expired subscriptions (expired today, grace period not yet started)
    const newlyExpiredUsers = await prisma.user.findMany({
      where: {
        subscription_end: {
          lte: now,
        },
        isInGracePeriod: false,
      },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        whatsapp: true,
        subscription_end: true,
        plan: {
          select: { name: true },
        },
      },
    });

    // Activate grace period for newly expired users
    for (const user of newlyExpiredUsers) {
      try {
        const gracePeriodStart = now;
        const gracePeriodEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isInGracePeriod: true,
            gracePeriodStart,
            gracePeriodEnd,
          },
        });

        // Log the expiration
        await prisma.expirationLog.create({
          data: {
            userId: user.id,
            expiredAt: gracePeriodStart,
            subscriptionEnd: user.subscription_end!,
          },
        });

        // Send expiration notification email
        if (user.email) {
          await sendEmailNotification({
            to: user.email,
            subject: "⚠️ Wedding Plan Expired - 3 Days Grace Period",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Your Wedding Plan Has Expired</h2>
                <p>Dear ${user.groomName || "User"} & ${user.brideName || "Partner"},</p>
                <p>Your <strong>${user.plan?.name || "wedding"}</strong> plan expired today. Don't worry - we've activated a <strong>3-day grace period</strong> to give you time to renew.</p>

                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h3 style="color: #dc2626; margin-top: 0;">⏰ Important: Only 3 Days Left</h3>
                  <p style="margin-bottom: 0;">Your wedding page will be <strong>permanently deleted</strong> in 3 days if you don't renew your plan.</p>
                </div>

                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                     style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Renew Your Plan Now
                  </a>
                </p>

                <p style="color: #666; font-size: 14px;">
                  If you have any questions, please contact our support team.
                </p>
              </div>
            `,
          });
        }

        // Send WhatsApp notification
        if (user.whatsapp) {
          await sendWhatsAppNotification({
            to: user.whatsapp,
            body: `⚠️ URGENT: Wedding Plan Expired\n\nHi ${user.groomName || "User"} & ${user.brideName || "Partner"},\n\nYour ${user.plan?.name || "wedding"} plan expired today!\n\n🛡️ GOOD NEWS: We've activated a 3-day grace period.\n\n⏰ IMPORTANT: Your wedding page will be permanently deleted in 3 days if you don't renew.\n\nRenew now: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\n- MyWeddingPage Team`,
          });
        }

        // Send admin notification about expiration
        await sendEmailNotification({
          to: process.env.EMAIL_FROM!,
          subject: "🚨 User Plan Expired - Grace Period Activated",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Plan Expired - Grace Period Activated</h2>
              <p><strong>User:</strong> ${user.groomName || "User"} & ${user.brideName || "Partner"}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Plan:</strong> ${user.plan?.name || "Unknown"}</p>
              <p><strong>Expired:</strong> ${new Date(user.subscription_end!).toLocaleDateString()}</p>
              <p><strong>Grace Period:</strong> 3 days (until deletion)</p>
              <p>Monitor for potential renewal or offer assistance.</p>
            </div>
          `,
        });

        results.newExpirations++;
      } catch (error) {
        console.error(`Error processing newly expired user ${user.id}:`, error);
        results.errors.push(`Failed to process user ${user.id}: ${error}`);
      }
    }

    // 2. Find users in grace period for reminder emails
    const gracePeriodUsers = await prisma.user.findMany({
      where: {
        isInGracePeriod: true,
        gracePeriodEnd: {
          gte: now, // Grace period hasn't ended yet
        },
      },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        whatsapp: true,
        gracePeriodEnd: true,
        plan: {
          select: { name: true },
        },
      },
    });

    // Send grace period reminder emails
    for (const user of gracePeriodUsers) {
      try {
        const gracePeriodEnd = new Date(user.gracePeriodEnd!);
        const daysLeft = Math.ceil(
          (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send reminder on days 2, 1, and 0 (final day)
        if ([2, 1, 0].includes(daysLeft)) {
          const urgencyLevel = daysLeft === 0 ? "FINAL" : daysLeft === 1 ? "URGENT" : "REMINDER";

          // Send email reminder
          if (user.email) {
            await sendEmailNotification({
              to: user.email,
              subject: `🚨 ${urgencyLevel}: Wedding Page Deletion in ${daysLeft || "Less Than 1"} Day${daysLeft !== 1 ? "s" : ""}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #dc2626;">${urgencyLevel} Notice: Plan Renewal Required</h2>
                  <p>Dear ${user.groomName || "User"} & ${user.brideName || "Partner"},</p>

                  <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #dc2626; margin-top: 0; font-size: 24px;">
                      ${daysLeft > 0 ? `${daysLeft} DAY${daysLeft !== 1 ? "S" : ""} LEFT` : "FINAL HOURS"}
                    </h3>
                    <p style="font-size: 18px; margin-bottom: 0;">
                      Your wedding page will be permanently deleted ${daysLeft > 0 ? `in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}` : "today"}.
                    </p>
                  </div>

                  <p>This is your ${daysLeft === 0 ? "final" : daysLeft === 1 ? "last" : ""} chance to save your wedding page and all your memories.</p>

                  <p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                       style="background-color: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 18px;">
                      ${daysLeft === 0 ? "RENEW NOW - FINAL CHANCE" : "Renew Your Plan"}
                    </a>
                  </p>

                  <p style="color: #666; font-size: 14px;">
                    Once deleted, your wedding page and all associated data cannot be recovered.
                  </p>
                </div>
              `,
            });
          }

          // Send WhatsApp reminder
          if (user.whatsapp) {
            const whatsappMessage =
              daysLeft === 0
                ? `🚨 FINAL HOURS: Wedding Page Deletion TODAY!\n\nHi ${user.groomName || "User"} & ${user.brideName || "Partner"},\n\nThis is your FINAL CHANCE! Your wedding page will be permanently deleted TODAY.\n\n⚠️ Once deleted, all your data cannot be recovered.\n\nRENEW NOW: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\n- MyWeddingPage Team`
                : `🚨 ${urgencyLevel} ALERT: ${daysLeft} Day${daysLeft !== 1 ? "s" : ""} Left!\n\nHi ${user.groomName || "User"} & ${user.brideName || "Partner"},\n\nYour wedding page will be permanently deleted in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}!\n\nThis is your ${daysLeft === 1 ? "last" : ""} chance to save your wedding page and memories.\n\nRenew now: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\n- MyWeddingPage Team`;

            await sendWhatsAppNotification({
              to: user.whatsapp,
              body: whatsappMessage,
            });
          }

          // Send admin notification for grace period reminders
          await sendEmailNotification({
            to: process.env.EMAIL_FROM!,
            subject: `⚠️ Grace Period Alert - ${daysLeft} Day${daysLeft !== 1 ? "s" : ""} Left`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Grace Period Alert - ${urgencyLevel}</h2>
                <p><strong>User:</strong> ${user.groomName || "User"} & ${user.brideName || "Partner"}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Plan:</strong> ${user.plan?.name || "Unknown"}</p>
                <p><strong>Days Left:</strong> ${daysLeft} day${daysLeft !== 1 ? "s" : ""}</p>
                <p><strong>Grace Period Ends:</strong> ${new Date(user.gracePeriodEnd!).toLocaleDateString()}</p>
                <p>${daysLeft === 0 ? "User's wedding page will be deleted today if not renewed!" : "Consider urgent outreach for renewal assistance."}</p>
              </div>
            `,
          });

          results.gracePeriodReminders++;
        }
      } catch (error) {
        console.error(`Error sending grace period reminder to user ${user.id}:`, error);
        results.errors.push(`Failed to send reminder to user ${user.id}: ${error}`);
      }
    }

    // 3. Find users whose grace period has ended - delete their wedding pages
    const usersForDeletion = await prisma.user.findMany({
      where: {
        isInGracePeriod: true,
        gracePeriodEnd: {
          lte: now, // Grace period has ended
        },
      },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        whatsapp: true,
        weddingPages: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    // Process deletions
    for (const user of usersForDeletion) {
      try {
        // Soft delete wedding pages and set them as not live
        const deleteResult = await prisma.weddingPage.updateMany({
          where: {
            userId: user.id,
            deleted_at: null, // Only delete pages not already deleted
          },
          data: {
            is_live: false, // Mark as not live for badge display
            deleted_at: now,
            deletion_reason: "subscription_expired",
          },
        });

        // Reset grace period flags
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isInGracePeriod: false,
            gracePeriodStart: null,
            gracePeriodEnd: null,
          },
        });

        // Send final deletion notification
        if (user.email && deleteResult.count > 0) {
          await sendEmailNotification({
            to: user.email,
            subject: "Wedding Page Deleted - Recovery Options Available",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Wedding Page Deleted</h2>
                <p>Dear ${user.groomName || "User"} & ${user.brideName || "Partner"},</p>
                <p>Your wedding page has been deleted due to plan expiration. We're sorry to see you go!</p>

                <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h3 style="color: #374151; margin-top: 0;">Recovery Option</h3>
                  <p>Your account remains active for 30 days. You can still:</p>
                  <ul>
                    <li>Renew your plan to create a new wedding page</li>
                    <li>Contact support for data recovery assistance</li>
                  </ul>
                </div>

                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                     style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Renew Plan & Start Fresh
                  </a>
                </p>

                <p style="color: #666; font-size: 14px;">
                  Thank you for using our service. We hope to see you again soon!
                </p>
              </div>
            `,
          });
        }

        // Send WhatsApp notification about deletion
        if (user.whatsapp && deleteResult.count > 0) {
          await sendWhatsAppNotification({
            to: user.whatsapp,
            body: `📋 Wedding Page Deleted\n\nHi ${user.groomName || "User"} & ${user.brideName || "Partner"},\n\nYour wedding page has been deleted due to plan expiration.\n\n💡 GOOD NEWS: Your account is still active for 30 days!\n\nYou can:\n• Renew your plan to create a new page\n• Contact support for data recovery\n\nStart fresh: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\nThank you for using MyWeddingPage!\n\n- The MyWeddingPage Team`,
          });
        }

        // Send admin notification about deletion
        if (deleteResult.count > 0) {
          await sendEmailNotification({
            to: process.env.EMAIL_FROM!,
            subject: "🗑️ Wedding Page Deleted - Grace Period Expired",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Wedding Page Deleted - Grace Period Expired</h2>
                <p><strong>User:</strong> ${user.groomName || "User"} & ${user.brideName || "Partner"}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Wedding Pages Deleted:</strong> ${deleteResult.count}</p>
                <p><strong>Deletion Date:</strong> ${now.toLocaleDateString()}</p>
                <p><strong>Reason:</strong> Grace period expired without renewal</p>

                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h4 style="color: #92400e; margin-top: 0;">Follow-up Options:</h4>
                  <ul style="color: #92400e; margin-bottom: 0;">
                    <li>User account remains active for 30 days</li>
                    <li>Data recovery may be possible if user renews</li>
                    <li>Consider outreach for customer retention</li>
                  </ul>
                </div>
              </div>
            `,
          });
        }

        results.deletionsProcessed++;
      } catch (error) {
        console.error(`Error processing deletion for user ${user.id}:`, error);
        results.errors.push(`Failed to delete wedding page for user ${user.id}: ${error}`);
      }
    }

    console.log("Expiration management completed:", results);

    return NextResponse.json({
      success: true,
      message: "Expiration management completed",
      results,
    });
  } catch (error) {
    console.error("Error in expiration management cron job:", error);
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 });
  }
}
