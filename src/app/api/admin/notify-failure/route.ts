import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sendEmailNotification } from "@/lib/emails/taskReminderEmail";

export async function POST(request: NextRequest) {
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

    const { message, timestamp } = await request.json();

    // Send failure notification to admin
    await sendEmailNotification({
      to: process.env.EMAIL_FROM!,
      subject: "🚨 MyWeddingPage Cron Job Failure Alert",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Cron Job Failure Alert</h2>

          <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">⚠️ System Alert</h3>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
            <p><strong>System:</strong> MyWeddingPage Automated Cron Jobs</p>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">Recommended Actions:</h4>
            <ul style="color: #92400e; margin-bottom: 0;">
              <li>Check application logs for detailed error information</li>
              <li>Verify all environment variables and secrets are set correctly</li>
              <li>Test cron job endpoints manually if needed</li>
              <li>Monitor for any subsequent failures</li>
            </ul>
          </div>

          <p style="color: #666; font-size: 14px;">
            This is an automated alert from the MyWeddingPage cron job monitoring system.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Failure notification sent to admin",
    });
  } catch (error) {
    console.error("Error sending failure notification:", error);
    return NextResponse.json(
      {
        error: "Failed to send notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
