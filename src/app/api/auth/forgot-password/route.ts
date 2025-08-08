import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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

  return NextResponse.json({ message: "Reset link sent" });
}
