import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { Resend } from "resend";
import twilio from "twilio";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Lazy initialization: only create client when actually needed
function getTwilioClient() {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

  if (!twilioAccountSid || !twilioAuthToken) {
    return null;
  }

  try {
    return twilio(twilioAccountSid, twilioAuthToken);
  } catch (error) {
    console.error("Failed to initialize Twilio client:", error);
    return null;
  }
}

const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Helper function to check if string looks like an ID
function isId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

// ========== GET ==========
export async function GET(request: Request, { params }: { params: { token: string } }) {
  const { token } = await params;

  try {
    let task = await prisma.task.findUnique({
      where: { token: token },
      include: { TaskCategory: true, TaskPriority: true },
    });

    if (!task && isId(token)) {
      task = await prisma.task.findUnique({
        where: { id: token },
        include: { TaskCategory: true, TaskPriority: true },
      });
    }

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error(`GET /api/tasks/${token} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ========== PUT ==========
export async function PUT(request: Request, { params }: { params: { token: string } }) {
  const { token } = await params;

  try {
    const body = await request.json();

    // 🔹 Case 1: Mark as complete via token (NO session required)

    // eslint-disable-next-line prefer-const
    let taskByToken = await prisma.task.findUnique({
      where: { token: token },
      include: { TaskCategory: true, TaskPriority: true, user: true },
    });

    if (taskByToken) {
      const updatedTask = await prisma.task.update({
        where: { id: taskByToken.id },
        data: {
          completed: body.completed ?? taskByToken.completed,
          completedAt: body.completed ? new Date() : null,
        },
        include: { TaskCategory: true, TaskPriority: true, user: true },
      });

      // 🔔 Notify the task owner (User) via Email + WhatsApp + Push Notification
      if (updatedTask.user) {
        try {
          // Send Push Notification (instant)
          const { sendNotificationToUser, createTaskNotification } = await import(
            "@/lib/notifications/notificationService"
          );
          const notification = createTaskNotification(updatedTask.title);
          await sendNotificationToUser(updatedTask.user.id, notification);

          // Send Email via Resend
          if (updatedTask.user.email) {
            await resend.emails.send({
              from: "Tasks <info@myweddingpage.online>",
              to: updatedTask.user.email,
              subject: `Task "${updatedTask.title}" Completed`,
              html: `<p>Hello ${updatedTask.user.groomName || "User"},</p>
                     <p>The task <b>${updatedTask.title}</b> has just been marked as completed.</p>
                     <p>Category: ${updatedTask.TaskCategory?.name || "N/A"}</p>
                     <p>Priority: ${updatedTask.TaskPriority?.name || "N/A"}</p>
                     <p>Completed at: ${new Date().toLocaleString()}</p>`,
            });
          }

          // Send WhatsApp via Twilio
          const twilioClient = getTwilioClient();
          if (updatedTask.user.whatsapp && twilioClient && twilioPhoneNumber) {
            await twilioClient.messages.create({
              from: `whatsapp:${twilioPhoneNumber}`,
              to: `whatsapp:${updatedTask.user.whatsapp}`,
              body: `✅ Task "${updatedTask.title}" has been marked as completed.`,
            });
          }
        } catch (notifyError) {
          console.error("Notification error:", notifyError);
        }
      }

      return NextResponse.json(updatedTask);
    }

    // 🔹 Case 2: Normal update by authenticated user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line prefer-const
    let existingTask = await prisma.task.findUnique({
      where: { id: token },
    });

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: existingTask.id },
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        completedAt: body.completed ? new Date() : undefined,
      },
      include: { TaskCategory: true, TaskPriority: true },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`PUT /api/tasks/${token} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ========== DELETE ==========
export async function DELETE(request: Request, { params }: { params: { token: string } }) {
  const { token } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First try to find by token

    let existingTask = await prisma.task.findUnique({
      where: { token: token },
    });

    // If not found and looks like ID, try as ID
    if (!existingTask && isId(token)) {
      existingTask = await prisma.task.findUnique({
        where: { id: token },
      });
    }

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: existingTask.id }, // Always use the ID for delete
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/tasks/${token} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
