/**
 * Email template for Two-Factor Authentication codes
 *
 * @module email-templates/2fa-code
 */

interface TwoFactorCodeEmailProps {
  userName: string;
  code: string;
  expiresInMinutes: number;
  ipAddress?: string;
  userAgent?: string;
}

export function getTwoFactorCodeEmailHTML({
  userName,
  code,
  expiresInMinutes,
  ipAddress,
  userAgent,
}: TwoFactorCodeEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Two-Factor Authentication Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 90%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Security Verification</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello <strong>${userName}</strong>,
              </p>

              <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                You requested a verification code to sign in to your account. Use the code below to complete your login:
              </p>

              <!-- Verification Code Box -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                <p style="margin: 0 0 8px; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Your Verification Code
                </p>
                <div style="background-color: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 8px; padding: 16px; display: inline-block;">
                  <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${code}
                  </p>
                </div>
              </div>

              <!-- Expiry Warning -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  ⚠️ <strong>Important:</strong> This code expires in <strong>${expiresInMinutes} minutes</strong>. If you didn't request this code, please ignore this email and ensure your account is secure.
                </p>
              </div>

              ${
                ipAddress || userAgent
                  ? `
              <!-- Security Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #666666; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Request Details
                </p>
                ${
                  ipAddress
                    ? `
                <p style="margin: 4px 0; color: #666666; font-size: 14px;">
                  <strong>IP Address:</strong> ${ipAddress}
                </p>
                `
                    : ""
                }
                ${
                  userAgent
                    ? `
                <p style="margin: 4px 0; color: #666666; font-size: 14px;">
                  <strong>Device:</strong> ${userAgent}
                </p>
                `
                    : ""
                }
              </div>
              `
                  : ""
              }

              <!-- Help Text -->
              <p style="margin: 24px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                If you have any concerns about your account security, please contact our support team immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8f9fa; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 8px; color: #999999; font-size: 12px;">
                This is an automated security email from your wedding page platform.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} My Wedding Page. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getTwoFactorCodeEmailText({
  userName,
  code,
  expiresInMinutes,
  ipAddress,
  userAgent,
}: TwoFactorCodeEmailProps): string {
  let text = `Hello ${userName},

You requested a verification code to sign in to your account.

Your Verification Code: ${code}

This code expires in ${expiresInMinutes} minutes.

`;

  if (ipAddress || userAgent) {
    text += `Request Details:\n`;
    if (ipAddress) text += `IP Address: ${ipAddress}\n`;
    if (userAgent) text += `Device: ${userAgent}\n`;
    text += `\n`;
  }

  text += `If you didn't request this code, please ignore this email and ensure your account is secure.

If you have any concerns about your account security, please contact our support team immediately.

---
This is an automated security email from your wedding page platform.
© ${new Date().getFullYear()} My Wedding Page. All rights reserved.
`;

  return text;
}
