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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate target dates (3 days, 1 day, and today)
    const threeDaysAhead = new Date(today);
    threeDaysAhead.setDate(today.getDate() + 3);

    const oneDayAhead = new Date(today);
    oneDayAhead.setDate(today.getDate() + 1);

    // Early exit optimization: Check if any users have weddings in the target dates
    const usersNeedingReminders = await prisma.user.count({
      where: {
        OR: [
          // Users with weddings in 3 days
          {
            weddingDate: {
              gte: threeDaysAhead,
              lt: new Date(threeDaysAhead.getTime() + 24 * 60 * 60 * 1000),
            },
            OR: [{ email: { not: null } }, { whatsapp: { not: null } }],
          },
          // Users with weddings in 1 day
          {
            weddingDate: {
              gte: oneDayAhead,
              lt: new Date(oneDayAhead.getTime() + 24 * 60 * 60 * 1000),
            },
            OR: [{ email: { not: null } }, { whatsapp: { not: null } }],
          },
          // Users with weddings today
          {
            weddingDate: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
            OR: [{ email: { not: null } }, { whatsapp: { not: null } }],
          },
        ],
      },
    });

    // If no users need reminders, return early
    if (usersNeedingReminders === 0) {
      return NextResponse.json({
        success: true,
        message: "No wedding date reminders needed today",
        skipped: true,
        results: {
          threeDayReminders: 0,
          oneDayReminders: 0,
          weddingDayReminders: 0,
          errors: [],
        },
      });
    }

    const results = {
      threeDayReminders: 0,
      oneDayReminders: 0,
      weddingDayAlerts: 0,
      errors: [] as string[],
    };

    // Find users with weddings in 3 days, 1 day, or today
    const upcomingWeddings = await prisma.user.findMany({
      where: {
        weddingDate: {
          in: [threeDaysAhead, oneDayAhead, today],
        },
        AND: [{ email: { not: null } }, { brideName: { not: null } }, { groomName: { not: null } }],
      },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        weddingDate: true,
        weddingPages: {
          select: {
            slug: true,
            title: true,
          },
          where: {
            deleted_at: null, // Only active wedding pages
          },
        },
      },
    });

    for (const user of upcomingWeddings) {
      try {
        if (!user.weddingDate) continue;

        const weddingDate = new Date(user.weddingDate);
        const weddingDateOnly = new Date(
          weddingDate.getFullYear(),
          weddingDate.getMonth(),
          weddingDate.getDate()
        );

        // Calculate days difference
        const timeDiff = weddingDateOnly.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        let reminderType = "";
        let subject = "";
        let message = "";

        if (daysDiff === 3) {
          reminderType = "3-day";
          subject = "🗓️ Wedding Alert: 3 Days Away";
          message = `Wedding in 3 days: ${user.groomName} & ${user.brideName} (${user.email})`;
          results.threeDayReminders++;
        } else if (daysDiff === 1) {
          reminderType = "1-day";
          subject = "⏰ Wedding Alert: Tomorrow!";
          message = `Wedding tomorrow: ${user.groomName} & ${user.brideName} (${user.email})`;
          results.oneDayReminders++;
        } else if (daysDiff === 0) {
          reminderType = "wedding-day";
          subject = "🎉 Wedding Day: TODAY!";
          message = `Wedding happening today: ${user.groomName} & ${user.brideName} (${user.email})`;
          results.weddingDayAlerts++;
        } else {
          continue; // Skip if not matching our target days
        }

        const weddingPage = user.weddingPages[0];
        const pageInfo = weddingPage
          ? `Wedding Page: ${process.env.NEXT_PUBLIC_APP_URL}/${weddingPage.slug}`
          : "No wedding page found";

        // Send admin email notification
        await sendEmailNotification({
          to: process.env.EMAIL_FROM!,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">${subject}</h2>

              <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="color: #0369a1; margin-top: 0;">Wedding Details</h3>
                <p><strong>Couple:</strong> ${user.groomName} & ${user.brideName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Wedding Date:</strong> ${weddingDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
                <p><strong>Days Until Wedding:</strong> ${daysDiff === 0 ? "TODAY!" : `${daysDiff} day${daysDiff !== 1 ? "s" : ""}`}</p>
                <p><strong>Page:</strong> ${pageInfo}</p>
              </div>

              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h4 style="color: #92400e; margin-top: 0;">Admin Action Items:</h4>
                <ul style="color: #92400e;">
                  <li>Check if user needs any last-minute support</li>
                  <li>Verify wedding page is working correctly</li>
                  <li>Monitor for any issues or questions</li>
                  ${daysDiff === 0 ? "<li><strong>Send congratulations after the wedding!</strong></li>" : ""}
                </ul>
              </div>

              <p style="color: #666; font-size: 14px;">
                This is an automated ${reminderType} wedding reminder from MyWeddingPage system.
              </p>
            </div>
          `,
        });

        // Send admin WhatsApp notification
        await sendWhatsAppNotification({
          to: process.env.TWILIO_WHATSAPP_NUMBER!.replace("+", ""), // Remove + for WhatsApp format
          body: `🎊 ${subject}\n\n${message}\nDate: ${weddingDate.toLocaleDateString()}\n${pageInfo}\n\n- MyWeddingPage Admin Alert`,
        });

        console.log(
          `Sent ${reminderType} wedding reminder for ${user.groomName} & ${user.brideName}`
        );
      } catch (error) {
        console.error(`Error processing wedding reminder for user ${user.id}:`, error);
        results.errors.push(`Failed to process user ${user.id}: ${error}`);
      }
    }

    console.log("Wedding date reminders completed:", results);

    return NextResponse.json({
      success: true,
      message: "Wedding date reminders sent successfully",
      results,
    });
  } catch (error) {
    console.error("Error in wedding date reminders cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
