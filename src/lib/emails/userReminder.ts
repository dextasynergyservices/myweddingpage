import { resend } from "@/lib/resend";

export async function sendUserReminderEmail(
  email: string,
  {
    name,
    weddingDate,
    daysToWedding,
    plan,
  }: {
    name: string;
    weddingDate: Date;
    daysToWedding: number;
    plan: string;
  }
) {
  const subject =
    daysToWedding === 0
      ? "🎉 It's Your Wedding Day!"
      : `⏰ ${daysToWedding} day(s) to your wedding!`;

  const html = `
    <h2>Hello ${name},</h2>
    <p>Your wedding is just <strong>${daysToWedding} day(s)</strong> away!</p>
    <p>You're on the <strong>${plan}</strong> plan, and we’re here to help you make the most of it.</p>
    <p>💍 Date: ${weddingDate.toDateString()}</p>
    <p>— myweddingpage</p>
  `;

  await resend.emails.send({
    from: "MyWeddingPage <reminders@myweddingpage.com>",
    to: email,
    subject,
    html,
  });
}
