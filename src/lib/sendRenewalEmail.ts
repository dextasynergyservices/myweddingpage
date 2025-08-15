import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends renewal emails to user and admin
 */
interface SendRenewalEmailParams {
  user: {
    email?: string | null;
    groomName?: string | null;
    brideName?: string | null;
  };
  duration: number;
  expiresAt: Date;
  adminEmail: string;
}

export async function sendRenewalEmail({
  user,
  duration,
  expiresAt,
  adminEmail,
}: SendRenewalEmailParams) {
  const groomAndBride = [user.groomName, user.brideName].filter(Boolean).join(" and ") || "there";
  const userEmail = user.email;

  // Format expiry date nicely
  const formattedDate = expiresAt.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // 1️⃣ Send email to user
  if (userEmail) {
    try {
      await resend.emails.send({
        from: `MyWeddingPage <no-reply@myweddingpage.online>`,
        to: userEmail,
        subject: "Your Subscription Renewal is Successful",
        html: `
          <p>Hi ${groomAndBride},</p>
          <p>Your subscription has been renewed for <strong>${duration} day(s)</strong>.</p>
          <p>New expiry date: <strong>${formattedDate}</strong></p>
          <p>Thank you for staying with MyWeddingPage!</p>
        `,
      });
      console.log(`[sendRenewalEmail] User email sent to ${userEmail}`);
    } catch (err) {
      console.error("[sendRenewalEmail] Failed to send email to user:", err);
    }
  }

  // 2️⃣ Send email to admin
  try {
    await resend.emails.send({
      from: `MyWeddingPage <no-reply@myweddingpage.online>`,
      to: adminEmail,
      subject: "Subscription Renewed",
      html: `
        <h3>Renewal Completed</h3>
        <p>User: <strong>${groomAndBride}</strong></p>
        <p>Email: ${userEmail || "N/A"}</p>
        <p>Duration: ${duration} day(s)</p>
        <p>Expires At: ${formattedDate}</p>
      `,
    });
    console.log(`[sendRenewalEmail] Admin email sent to ${adminEmail}`);
  } catch (err) {
    console.error("[sendRenewalEmail] Failed to send email to admin:", err);
  }
}
