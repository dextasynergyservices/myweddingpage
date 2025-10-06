import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import { forgotPasswordSchema } from "@/lib/validators";
import { sanitizeEmail } from "@/lib/sanitize";
import { verifyRecaptchaV3 } from "@/lib/recaptcha";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

// Apply strict rate limiting (3 requests per 15 minutes per IP)
const forgotPasswordRateLimit = rateLimit({
  ...rateLimitConfigs.auth,
  maxRequests: 3,
  windowMs: 15 * 60 * 1000,
  message: "Too many password reset attempts. Please try again later.",
});

export async function POST(req: Request) {
  try {
    // Apply rate limiting first
    const rateLimitResponse = await forgotPasswordRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await req.json();
    const { email: rawEmail, recaptchaToken } = body;

    // Verify reCAPTCHA v3 (minimum score: 0.6)
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaV3(recaptchaToken, "forgot_password", 0.6);
      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    // Sanitize and validate email
    const email = rawEmail ? sanitizeEmail(rawEmail) : "";

    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json(
        { error: "Invalid email address", details: errors },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found (security best practice)
      return NextResponse.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: `"MyWeddingPage" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Reset your password",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; background-color: #ffffff;">
          <div style="text-align: center;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="MyWeddingPage Logo" style="max-height: 60px; margin-bottom: 20px;" />
          </div>
    <p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 30 minutes.</p>

    <hr style="margin: 30px 0;" />

          <footer style="font-size: 12px; color: #999; text-align: center;">
            <p>Need help? Contact us at <a href="mailto:support@myweddingpage.com" style="color: #800000;">support@myweddingpage.com</a></p>
            <p>© ${new Date().getFullYear()} MyWeddingPage. All rights reserved.</p>
          </footer>
        </div>
    `,
    });

    // Return success message (generic for security)
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
