import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validators";
import { sanitizeHTML, sanitizeEmail } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

// Apply rate limiting to contact form (10 requests per 15 minutes per IP)
const contactRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
  message: "Too many contact form submissions. Please try again later.",
});

export async function POST(req: Request) {
  try {
    // Apply rate limiting first
    const rateLimitResponse = await contactRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown IP";

    const body = await req.json();
    const {
      name: rawName,
      email: rawEmail,
      subject: rawSubject,
      message: rawMessage,
      website,
    } = body;

    // Sanitize inputs to prevent XSS attacks
    const name = rawName ? sanitizeHTML(rawName) : "";
    const email = rawEmail ? sanitizeEmail(rawEmail) : "";
    const subject = rawSubject ? sanitizeHTML(rawSubject) : "";
    const message = rawMessage ? sanitizeHTML(rawMessage) : "";

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

    // Validate with Zod schema
    const validationResult = contactSchema.safeParse({
      name,
      email,
      subject,
      message,
      website: website || "",
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.reduce(
        (acc, err) => {
          const field = err.path[0]?.toString() || "unknown";
          acc[field] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Use validated data from this point
    const validatedData = validationResult.data;

    await prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
      },
    });

    await resend.emails.send({
      from: "Myweddingpage <no-reply@myweddingpage.online>",
      to: "info@myweddingpage.online",
      subject: `New Contact Message: ${validatedData.subject}`,
      html: `
        <h2>New Message from ${validatedData.name}</h2>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Subject:</strong> ${validatedData.subject}</p>
        <p><strong>Message:</strong> ${validatedData.message}</p>
      `,
    });

    await resend.emails.send({
      from: "Myweddingpage <no-reply@myweddingpage.online>",
      to: validatedData.email,
      subject: "We Received Your Message",
      html: `
        <p>Hi ${validatedData.name},</p>
        <p>Thank you for reaching out. We have received your message, our team will get back to you soon.</p>
        <p>Best Regards,<br/>Myweddingpage Team.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
