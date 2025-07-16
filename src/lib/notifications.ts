import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_PROVIDER_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  await resend.emails.send({
    from: "noreply@yourdomain.com",
    to: email,
    subject: "Your Verification Code",
    html: `<p>Your code is <strong>${code}</strong></p>`,
  });
}

// For WhatsApp/SMS, use Twilio or other provider
export async function sendWhatsAppCode(whatsapp: string, code: string) {
  console.log(
    `Pretend we're sending WhatsApp to ${whatsapp} with code ${code}`
  );
}
