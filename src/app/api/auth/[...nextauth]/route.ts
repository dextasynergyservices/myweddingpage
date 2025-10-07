import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { checkLockoutStatus } from "@/lib/account-lockout";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrPhone: { label: "Email or WhatsApp Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.emailOrPhone || !credentials.password) {
          throw new Error("Missing fields");
        }

        // Get IP address from request
        type ReqWithHeaders = { headers?: { get?: (key: string) => string | null } };
        const reqHeaders = (req as ReqWithHeaders)?.headers;
        const forwardedFor = reqHeaders?.get?.("x-forwarded-for");
        const realIp = reqHeaders?.get?.("x-real-ip");
        const ip: string = forwardedFor?.split(",")[0] || realIp || "unknown";

        // Check if account is locked
        const lockoutStatus = await checkLockoutStatus(credentials.emailOrPhone, ip);
        if (lockoutStatus.isLocked) {
          throw new Error(
            `Account locked. Try again in ${Math.ceil(lockoutStatus.remainingTime! / 60000)} minutes`
          );
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: credentials.emailOrPhone }, { whatsapp: credentials.emailOrPhone }],
          },
        });

        if (!user) {
          // Track failed login attempt
          // Note: We can't use handleFailedLogin here as it requires NextRequest
          // Instead, directly track the attempt
          await prisma.loginAttempt.create({
            data: {
              email: credentials.emailOrPhone,
              ipAddress: ip,
              success: false,
              failureReason: "User not found",
            },
          });
          throw new Error("No user found");
        }

        if (!user.password) {
          await prisma.loginAttempt.create({
            data: {
              userId: user.id,
              email: credentials.emailOrPhone,
              ipAddress: ip,
              success: false,
              failureReason: "No password set",
            },
          });
          throw new Error("User has no password set");
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          // Track failed login attempt
          await prisma.loginAttempt.create({
            data: {
              userId: user.id,
              email: credentials.emailOrPhone,
              ipAddress: ip,
              success: false,
              failureReason: "Invalid password",
            },
          });

          // Apply lockout if needed
          const { applyLockoutIfNeeded } = await import("@/lib/account-lockout");
          await applyLockoutIfNeeded(credentials.emailOrPhone, ip);

          throw new Error("Invalid credentials");
        }

        // Check if user has 2FA enabled
        const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
          where: { userId: user.id },
        });

        const has2FA = twoFactorSecret?.enabled ?? false;

        // If 2FA is enabled, we need to verify it
        // NOTE: NextAuth doesn't support multi-step auth natively
        // So we'll handle 2FA verification in the JWT callback
        // The client must call /api/auth/2fa/verify before calling signIn

        if (has2FA) {
          // Check if 2FA token was provided in credentials
          const twoFactorToken = (credentials as Record<string, string>).twoFactorToken;
          const isBackupCode = (credentials as Record<string, string>).isBackupCode === "true";

          if (!twoFactorToken) {
            // 2FA required but not provided
            throw new Error("2FA_REQUIRED");
          }

          // Verify 2FA token
          const { verify2FAToken, verifyAndConsumeBackupCode } = await import("@/lib/two-factor");
          const { verifyEmailCode } = await import("@/lib/email-two-factor");

          let isVerified = false;
          let errorMessage = "";

          if (isBackupCode) {
            // Backup code verification (works for both TOTP and Email methods)
            const result = await verifyAndConsumeBackupCode(user.id, twoFactorToken);
            isVerified = result.success;
            errorMessage = result.error || "";
          } else {
            // Check user's preferred 2FA method
            const userMethod = user.twoFactorMethod || "totp";

            if (userMethod === "email") {
              // Verify email 2FA code
              const result = await verifyEmailCode(user.id, twoFactorToken);
              isVerified = result.valid;
              errorMessage = result.error || "";
            } else {
              // Verify TOTP token
              const result = await verify2FAToken(user.id, twoFactorToken);
              isVerified = result.success;
              errorMessage = result.error || "";
            }
          }

          if (!isVerified) {
            // Track failed 2FA attempt
            await prisma.loginAttempt.create({
              data: {
                userId: user.id,
                email: credentials.emailOrPhone,
                ipAddress: ip,
                success: false,
                failureReason: `Invalid 2FA token: ${errorMessage || "Unknown error"}`,
              },
            });

            throw new Error(errorMessage || "Invalid 2FA token");
          }
        }

        // Track successful login and clear lockouts
        await prisma.loginAttempt.create({
          data: {
            userId: user.id,
            email: credentials.emailOrPhone,
            ipAddress: ip,
            success: true,
          },
        });

        // Clear any existing lockouts
        const { clearLockout } = await import("@/lib/account-lockout");
        await clearLockout(credentials.emailOrPhone, ip);

        return {
          id: user.id,
          email: user.email,
          whatsapp: user.whatsapp,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If the URL is a sign in, check the user's role and redirect accordingly
      // This will be called after successful sign in

      // If url is a callback URL from the sign in page
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // If it's a relative URL
      else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Default to base URL
      return baseUrl;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email ?? null;
        session.user.name = token.name ?? null;
        session.user.whatsapp = token.whatsapp ?? null;
        session.user.role = token.role ?? null;

        // Note: Session security tracking (IP/user agent monitoring) should be
        // done in middleware or API routes where request headers are available.
        // NextAuth JWT callbacks don't have access to request context.
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.whatsapp = user.whatsapp ?? undefined;
        token.role = user.role ?? undefined;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
