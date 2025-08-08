import { resend } from "@/lib/resend";

export async function sendAdminReminderEmail({
  userEmail,
  weddingSlug,
  weddingDate,
}: {
  userEmail: string;
  weddingSlug: string;
  weddingDate: Date;
}) {
  const subject = `🎊 Wedding Today: ${userEmail}`;

  const html = `
    <p>There's a wedding happening today!</p>
    <p><strong>User:</strong> ${userEmail}</p>
    <p><strong>Page:</strong> ${weddingSlug}</p>
    <p><strong>Date:</strong> ${weddingDate.toDateString()}</p>
  `;

  await resend.emails.send({
    from: "MyWeddingPage <notifications@myweddingpage.com>",
    to: "admin@myweddingpage.com",
    subject,
    html,
  });
}
