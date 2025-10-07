/**
 * Send Two-Factor Authentication code via email using Resend
 *
 * @module email-services/send2FACode
 */

import { Resend } from "resend";
import {
  getTwoFactorCodeEmailHTML,
  getTwoFactorCodeEmailText,
} from "@/lib/email-templates/2fa-code";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Send2FACodeParams {
  email: string;
  userName: string;
  code: string;
  expiresInMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Send 2FA verification code via email
 *
 * @param params - Email parameters
 * @returns Success status and message ID
 */
export async function send2FACodeEmail({
  email,
  userName,
  code,
  expiresInMinutes = 10,
  ipAddress,
  userAgent,
}: Send2FACodeParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@myweddingpage.com",
      to: email,
      subject: "Your Two-Factor Authentication Code",
      html: getTwoFactorCodeEmailHTML({
        userName,
        code,
        expiresInMinutes,
        ipAddress,
        userAgent,
      }),
      text: getTwoFactorCodeEmailText({
        userName,
        code,
        expiresInMinutes,
        ipAddress,
        userAgent,
      }),
    });

    if (error) {
      console.error("Failed to send 2FA email:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Error sending 2FA email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
