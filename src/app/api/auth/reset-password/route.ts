import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { validatePassword } from "@/lib/passwordValidator";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";

// Apply strict rate limiting (5 requests per 15 minutes per IP)
const resetPasswordRateLimit = rateLimit({
  ...rateLimitConfigs.auth,
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many password reset attempts. Please try again later.",
});

export async function POST(req: Request) {
  try {
    // Apply rate limiting first
    const rateLimitResponse = await resetPasswordRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate with Zod schema
    const validationResult = resetPasswordSchema.safeParse({ token, password });
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet security requirements",
          details: passwordValidation.errors,
          suggestions: passwordValidation.suggestions,
        },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
