import { NextResponse } from "next/server";
import twilio from "twilio";

interface TwilioError extends Error {
  code?: number;
  moreInfo?: string;
  status?: number;
}

export async function POST(request: Request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  // Prevent build-time crash — only check at request time
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    return NextResponse.json({ error: "Twilio credentials not configured" }, { status: 500 });
  }

  try {
    const { to, body } = await request.json();

    if (!to || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to and body are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(to)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to}`,
    });

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
      status: message.status,
    });
  } catch (error: unknown) {
    console.error("WhatsApp API error:", error);

    if (error instanceof Error) {
      const twilioError = error as TwilioError;
      return NextResponse.json(
        {
          error: twilioError.message,
          code: twilioError.code,
          moreInfo: twilioError.moreInfo,
          status: twilioError.status,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send WhatsApp message", code: "internal_error" },
      { status: 500 }
    );
  }
}
