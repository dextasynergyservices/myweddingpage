import { NextRequest, NextResponse } from "next/server";

/**
 * Consolidated daily wedding tasks cron job
 * Combines: wedding-date-reminders, wedding-congratulations, expiration-manager, and task-reminder
 * Runs daily at 8 AM UTC
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const results = [];

    // Execute all four automated tasks
    const cronJobs = [
      { name: "Task Reminder", path: "/api/cron/task-reminder" },
      {
        name: "Wedding Date Reminders",
        path: "/api/cron/wedding-date-reminders",
      },
      {
        name: "Wedding Congratulations",
        path: "/api/cron/wedding-congratulations",
      },
      { name: "Expiration Manager", path: "/api/cron/expiration-manager" },
    ];

    for (const job of cronJobs) {
      try {
        console.log(`Executing ${job.name}...`);

        const response = await fetch(`${baseUrl}${job.path}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cronSecret}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        results.push({
          job: job.name,
          status: response.ok ? "success" : "error",
          statusCode: response.status,
          data: data,
          timestamp: new Date().toISOString(),
        });

        console.log(`${job.name} completed:`, {
          status: response.status,
          success: response.ok,
        });
      } catch (error) {
        console.error(`Error executing ${job.name}:`, error);
        results.push({
          job: job.name,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Summary
    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    console.log(
      `Daily automated tasks completed: ${successCount} successful, ${errorCount} failed`
    );

    return NextResponse.json({
      message: "Daily automated tasks completed",
      summary: {
        total: cronJobs.length,
        successful: successCount,
        failed: errorCount,
      },
      results,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in daily automated tasks cron:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
