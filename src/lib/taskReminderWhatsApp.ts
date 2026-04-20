import twilio from "twilio";

// Lazy initialization: only create client when actually needed
function getTwilioClient() {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

  if (!twilioAccountSid || !twilioAuthToken) {
    return null;
  }

  try {
    return twilio(twilioAccountSid, twilioAuthToken);
  } catch (error) {
    console.error("Failed to initialize Twilio client:", error);
    return null;
  }
}

export async function sendWhatsAppNotification({ to, body }: { to: string; body: string }) {
  try {
    const twilioClient = getTwilioClient();

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
