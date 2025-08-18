import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmailNotification } from "@/lib/emails/taskReminderEmail";
import { sendWhatsAppNotification } from "@/lib/taskReminderWhatsApp";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        completed: false,
        dueDate: {
          gte: new Date(), // Only future due dates
        },
        OR: [
          { email: { not: null } }, // Has email
          { phone: { not: null } }, // OR has phone
        ],
      },
    });

    for (const task of tasks) {
      const dueDate = new Date(task.dueDate!);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if ([7, 3, 0].includes(diffDays)) {
        const assigneeName = task.assignedTo || "Team Member";
        const message = `⏰ Task Reminder: ${task.title}\n\nHello ${assigneeName},\n\nThis task is due ${
          diffDays === 0 ? "today" : `in ${diffDays} days`
        } (${dueDate.toLocaleDateString()})`;

        // Email reminder to assigned person (using task.email)
        if (task.email) {
          await sendEmailNotification({
            to: task.email,
            subject: `[Action Required] Task Deadline: ${task.title}`,
            html: `
              <p>Hello ${assigneeName},</p>
              <p>Your assigned task <strong>"${task.title}"</strong> is due ${
                diffDays === 0 ? "<strong>today</strong>" : `in <strong>${diffDays} days</strong>`
              }.</p>
              <p>Due date: ${dueDate.toLocaleDateString()}</p>
              ${task.userId ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}">View Task Details</a></p>` : ""}
              <p>Please complete it before the deadline.</p>
            `,
          });
        }

        // WhatsApp reminder to assigned person (using task.phone)
        if (task.phone) {
          await sendWhatsAppNotification({
            to: task.phone,
            body: message,
          });
        }
      }
    }

    return NextResponse.json({ success: true, tasksProcessed: tasks.length });
  } catch (error) {
    console.error("Error in reminders cron job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
