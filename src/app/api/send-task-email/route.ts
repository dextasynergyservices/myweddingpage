import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    console.log("Send task email request:", { to, subject, hasHtml: !!html });

    if (!to || !subject || !html) {
      console.error("Missing required fields:", {
        to: !!to,
        subject: !!subject,
        html: !!html,
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    console.log("Attempting to send email via Resend...");

    const { data, error } = await resend.emails.send({
      from: `"MyWeddingPage Tasks" <${process.env.EMAIL_FROM || "no-reply@myweddingpage.online"}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Email sent successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
