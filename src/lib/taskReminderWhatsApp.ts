import twilio from "twilio";

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient =
  twilioAccountSid && twilioAuthToken ? twilio(twilioAccountSid, twilioAuthToken) : null;

export async function sendWhatsAppNotification({ to, body }: { to: string; body: string }) {
  try {
    if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
      console.warn("Twilio not configured. WhatsApp notification skipped.");
      return;
    }

    await twilioClient.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
    });
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
  }
}
