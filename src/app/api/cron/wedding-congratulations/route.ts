import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendWeddingCongratulationsEmail } from "@/lib/emails/weddingCongratulations";
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

    // Calculate tomorrow for pre-wedding congratulations
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Early exit optimization: Check if any users have weddings today or tomorrow
    const usersNeedingCongratulations = await prisma.user.count({
      where: {
        OR: [
          // Users with weddings tomorrow (pre-wedding congratulations)
          {
            weddingDate: {
              gte: tomorrow,
              lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
            },
            OR: [{ email: { not: null } }, { whatsapp: { not: null } }],
          },
          // Users with weddings today (wedding day congratulations)
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

    // If no users need congratulations, return early
    if (usersNeedingCongratulations === 0) {
      return NextResponse.json({
        success: true,
        message: "No wedding congratulations needed today",
        skipped: true,
        results: {
          preWeddingMessages: 0,
          weddingDayMessages: 0,
          errors: [],
        },
      });
    }

    const results = {
      preWeddingMessages: 0,
      weddingDayMessages: 0,
      errors: [] as string[],
    };

    // Find users with weddings tomorrow or today
    const upcomingWeddings = await prisma.user.findMany({
      where: {
        weddingDate: {
          in: [tomorrow, today],
        },
        AND: [{ email: { not: null } }, { brideName: { not: null } }, { groomName: { not: null } }],
      },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        weddingDate: true,
        whatsapp: true,
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
        if (!user.weddingDate || !user.email) continue;

        const weddingDate = new Date(user.weddingDate);
        const weddingDateOnly = new Date(
          weddingDate.getFullYear(),
          weddingDate.getMonth(),
          weddingDate.getDate()
        );

        // Calculate days difference
        const timeDiff = weddingDateOnly.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        const isWeddingDay = daysDiff === 0;
        const isPreWeddingDay = daysDiff === 1;

        if (!isWeddingDay && !isPreWeddingDay) {
          continue; // Skip if not matching our target days
        }

        const weddingPage = user.weddingPages[0];
        const weddingPageSlug = weddingPage?.slug;

        // Send congratulations email
        const emailResult = await sendWeddingCongratulationsEmail({
          to: user.email,
          groomName: user.groomName || "Groom",
          brideName: user.brideName || "Bride",
          weddingDate,
          isWeddingDay,
          weddingPageSlug,
        });

        if (!emailResult.success) {
          throw new Error(`Email failed: ${emailResult.error}`);
        }

        // Send WhatsApp message if user has WhatsApp number
        if (user.whatsapp) {
          const whatsappMessage = isWeddingDay
            ? `🎉 Congratulations ${user.groomName} & ${user.brideName}! 🎉\n\nToday is your special day! 💍✨\n\nMay your wedding day be filled with love, joy, and unforgettable moments. As you begin this beautiful journey together as husband and wife, know that you have our warmest blessings.\n\nEnjoy every moment of your magical day!\n\n💕 With love and best wishes,\nThe MyWeddingPage Team`
            : `💕 Tomorrow is Your Big Day! 💕\n\nDear ${user.groomName} & ${user.brideName},\n\nYour wedding day is tomorrow - how exciting! 🌟\n\nTake tonight to relax and soak in the anticipation. Tomorrow, you'll begin your beautiful journey as a married couple, and we couldn't be more thrilled for you both!\n\nRemember to enjoy every moment and create memories that will last a lifetime.\n\n✨ With all our love,\nThe MyWeddingPage Team`;

          await sendWhatsAppNotification({
            to: user.whatsapp,
            body: whatsappMessage,
          });
        }

        if (isWeddingDay) {
          results.weddingDayMessages++;
          console.log(`Sent wedding day congratulations to ${user.groomName} & ${user.brideName}`);
        } else {
          results.preWeddingMessages++;
          console.log(`Sent pre-wedding message to ${user.groomName} & ${user.brideName}`);
        }
      } catch (error) {
        console.error(`Error processing wedding congratulations for user ${user.id}:`, error);
        results.errors.push(`Failed to process user ${user.id}: ${error}`);
      }
    }

    console.log("Wedding congratulations completed:", results);

    return NextResponse.json({
      success: true,
      message: "Wedding congratulations sent successfully",
      results,
    });
  } catch (error) {
    console.error("Error in wedding congratulations cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
