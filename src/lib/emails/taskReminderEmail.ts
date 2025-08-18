import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await resend.emails.send({
      from: "Task Manager <info@myweddingpage.online>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}
