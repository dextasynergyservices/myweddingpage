import { runWeddingReminderCron } from "../../../../../cron/reminders";

export async function GET() {
  await runWeddingReminderCron();
  return new Response("Wedding cron executed", { status: 200 });
}
