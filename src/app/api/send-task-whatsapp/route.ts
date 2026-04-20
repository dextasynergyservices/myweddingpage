import { NextResponse } from "next/server";
import twilio from "twilio";

interface TwilioError extends Error {
  code?: number;
  moreInfo?: string;
  status?: number;
}

export async function POST(request: Request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  console.log("WhatsApp request - Twilio config check:", {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasPhoneNumber: !!twilioPhoneNumber,
  });

  // Prevent build-time crash — only check at request time
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error("Twilio credentials missing:", {
      accountSid: !!accountSid,
      authToken: !!authToken,
      twilioPhoneNumber: !!twilioPhoneNumber,
    });
    return NextResponse.json(
      { error: "Twilio credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const { to, body } = await request.json();

    console.log("WhatsApp send request:", { to, hasBody: !!body });

    if (!to || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to and body are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(to)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    console.log("Attempting to connect to Twilio API...");

    const client = twilio(accountSid, authToken);

    console.log("Sending WhatsApp message...");

    // Add timeout to prevent hanging on network issues
    const messagePromise = client.messages.create({
      body,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to}`,
    });

    // Race between message sending and timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error("Twilio request timeout - network connectivity issue")
          ),
        10000
      );
    });

    const message = await Promise.race([messagePromise, timeoutPromise]);

    console.log("WhatsApp message sent successfully:", message.sid);

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
      status: message.status,
    });
  } catch (error: unknown) {
    console.error("WhatsApp API error:", error);

    if (error instanceof Error) {
      const twilioError = error as TwilioError;

      // Handle specific network/DNS errors
      if (
        error.message.includes("EAI_AGAIN") ||
        error.message.includes("getaddrinfo")
      ) {
        return NextResponse.json(
          {
            error:
              "Network connectivity issue with Twilio. WhatsApp service temporarily unavailable.",
            code: "network_error",
            details: "DNS resolution failed for api.twilio.com",
          },
          { status: 503 } // Service Unavailable
        );
      }

      // Handle timeout errors
      if (
        error.message.includes("timeout") ||
        error.message.includes("Twilio request timeout")
      ) {
        return NextResponse.json(
          {
            error:
              "Twilio request timed out. WhatsApp service temporarily unavailable.",
            code: "timeout_error",
            details: "Request to Twilio API exceeded 10 second timeout",
          },
          { status: 503 } // Service Unavailable
        );
      }

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
