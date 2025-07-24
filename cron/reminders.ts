import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";
import { sendUserReminderEmail } from "@/lib/emails/userReminder";
import { sendAdminReminderEmail } from "@/lib/emails/adminReminder";

const REMINDER_SCHEDULE = [14, 7, 6, 5, 4, 3, 2, 1, 0];

export async function runWeddingReminderCron() {
  const weddingPages = await prisma.weddingPage.findMany({
    where: {
      is_live: true,
      weddingDate: {
        not: null,
      },
    },
    include: {
      user: {
        include: {
          plan: true,
        },
      },
    },
  });

  // No need to cast Prisma types manually unless necessary
  for (const page of weddingPages) {
    const weddingDate = page.weddingDate;
    if (!weddingDate) continue;

    const daysToWedding = differenceInDays(weddingDate, new Date());

    if (REMINDER_SCHEDULE.includes(daysToWedding)) {
      await sendUserReminderEmail(page.user.email, {
        name: page.user.name,
        weddingDate,
        daysToWedding,
        plan: page.user.plan?.name ?? "Unknown",
      });
    }

    if (daysToWedding === 7) {
      await sendAdminReminderEmail({
        userEmail: page.user.email,
        weddingSlug: page.slug,
        weddingDate,
      });
    }
  }
}
