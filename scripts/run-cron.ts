import { sendUpcomingWeddingReminders } from "@/cron/reminders";

sendUpcomingWeddingReminders()
  .then(() => console.log("✅ Reminders sent"))
  .catch(console.error);
