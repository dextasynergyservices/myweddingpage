import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown IP";

    const { name, email, subject, message, website } = await req.json();

    // Honeypot check — reject if filled (likely spam bot)
    if (website && website.trim() !== "") {
      // Log spam attempt
      console.warn(`[Spam detected] Honeypot triggered from IP: ${ip} | Data:`, {
        name,
        email,
        subject,
        message,
        website,
        time: new Date().toISOString(),
      });

      return NextResponse.json({ success: false, error: "Bot detected" }, { status: 400 });
    }

    let errors: Record<string, string> = {};

    if (!name?.trim()) errors.name = "Name is required";
    if (!email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email address";
    }
    if (!subject?.trim()) errors.subject = "Subject is required";
    if (!message?.trim()) errors.message = "Message is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    await resend.emails.send({
      from: "Myweddingpage <no-reply@myweddingpage.online>",
      to: "info@myweddingpage.online",
      subject: `New Contact Message: ${subject}`,
      html: `
        <h2>New Message from ${name}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    await resend.emails.send({
      from: "Myweddingpage <no-reply@myweddingpage.online>",
      to: email,
      subject: "We Received Your Message",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out. We have received your message, our team will get back to you soon.</p>
        <p>Best Regards,<br/>Myweddingpage Team.</p>
      `,
    });

    return NextResponse.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
