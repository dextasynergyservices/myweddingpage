import { resend } from "@/lib/emails/mail";

export async function sendVerificationEmail(
  to: string,
  code: string,
  token: string,
  brideName: string,
  groomName: string
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${token}`;

  try {
    const data = await resend.emails.send({
      from: `"MyWeddingPage" <${process.env.EMAIL_FROM}>`,
      to,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; background-color: #ffffff;">
          <div style="text-align: center;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="MyWeddingPage Logo" style="max-height: 60px; margin-bottom: 20px;" />
          </div>

          <p style="font-size: 16px;">Hello ${groomName} and ${brideName} 👋,</p>

          <p style="font-size: 16px;">Your verification code is:</p>

          <h2 style="font-size: 26px; color: #800000; text-align: center;">${code}</h2>

          <p style="font-size: 16px;">Or click the button below to verify your email:</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${verifyUrl}" style="background-color: #800000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Verify Email
            </a>
          </div>

          <p style="font-size: 14px; color: #555;">
            If you didn’t sign up, you can ignore this email.
          </p>

          <hr style="margin: 30px 0;" />

          <footer style="font-size: 12px; color: #999; text-align: center;">
            <p>Need help? Contact us at <a href="mailto:support@myweddingpage.com" style="color: #800000;">support@myweddingpage.com</a></p>
            <p>© ${new Date().getFullYear()} MyWeddingPage. All rights reserved.</p>
          </footer>
        </div>
      `,
      text: `Hello ${groomName} and ${brideName},

Your verification code is: ${code}

Or click this link to verify your email:
${verifyUrl}

If you didn’t sign up, you can ignore this email.

—
MyWeddingPage Support
support@myweddingpage.com
      `,
    });

    console.log("✅ Verification email sent:", data);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
  }
}
