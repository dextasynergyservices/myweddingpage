import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

type WhatsAppVerificationOptions = {
  phoneNumber: string;
  code: string;
  token: string;
};

export async function sendWhatsAppVerification({
  phoneNumber,
  code,
  token,
}: WhatsAppVerificationOptions) {
  const from = process.env.TWILIO_WHATSAPP_NUMBER!;
  const to = `whatsapp:${phoneNumber}`;
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${token}`;

  const message = `🕊️ MyWeddingPage Verification

🔐 Your verification code: *${code}*
🔗 Or click to verify: ${verifyUrl}

If you didn’t request this, please ignore.`;

  try {
    const res = await client.messages.create({
      body: message,
      from,
      to,
    });

    return { success: true, sid: res.sid };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Twilio WhatsApp Error:", error.message);
      return { success: false, error: error.message };
    }

    // fallback for non-Error objects
    console.error("Twilio WhatsApp Error:", error);
    return { success: false, error: "An unknown error occurred." };
  }
}
