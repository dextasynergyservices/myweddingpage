import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { checkLockoutStatus } from "@/lib/account-lockout";
import { logSecurityEvent } from "@/lib/security-logger";
import { SecurityEventType, SecuritySeverity } from "@/generated/prisma";

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
        type ReqWithHeaders = {
          headers?: { get?: (key: string) => string | null };
        };
        const reqHeaders = (req as ReqWithHeaders)?.headers;
        const forwardedFor = reqHeaders?.get?.("x-forwarded-for");
        const realIp = reqHeaders?.get?.("x-real-ip");
        const ip: string = forwardedFor?.split(",")[0] || realIp || "unknown";

        // Check if account is locked
        const lockoutStatus = await checkLockoutStatus(
          credentials.emailOrPhone,
          ip
        );
        if (lockoutStatus.isLocked) {
          throw new Error(
            `Account locked. Try again in ${Math.ceil(lockoutStatus.remainingTime! / 60000)} minutes`
          );
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.emailOrPhone },
              { whatsapp: credentials.emailOrPhone },
            ],
          },
        });

        if (!user) {
          // Track failed login attempt
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

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

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
          const { applyLockoutIfNeeded } = await import(
            "@/lib/account-lockout"
          );
          await applyLockoutIfNeeded(credentials.emailOrPhone, ip);

          throw new Error("Invalid credentials");
        }

        // Check if user has 2FA enabled
        const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
          where: { userId: user.id },
        });

        const has2FA = twoFactorSecret?.enabled ?? false;

        if (has2FA) {
          const twoFactorToken = (credentials as Record<string, string>)
            .twoFactorToken;
          const isBackupCode =
            (credentials as Record<string, string>).isBackupCode === "true";

          if (!twoFactorToken) {
            throw new Error("2FA_REQUIRED");
          }

          const { verify2FAToken, verifyAndConsumeBackupCode } = await import(
            "@/lib/two-factor"
          );
          const { verifyEmailCode } = await import("@/lib/email-two-factor");

          let isVerified = false;
          let errorMessage = "";

          if (isBackupCode) {
            const result = await verifyAndConsumeBackupCode(
              user.id,
              twoFactorToken
            );
            isVerified = result.success;
            errorMessage = result.error || "";
          } else {
            const userMethod = user.twoFactorMethod || "totp";

            if (userMethod === "email") {
              const result = await verifyEmailCode(user.id, twoFactorToken);
              isVerified = result.valid;
              errorMessage = result.error || "";
            } else {
              const result = await verify2FAToken(user.id, twoFactorToken);
              isVerified = result.success;
              errorMessage = result.error || "";
            }
          }

          if (!isVerified) {
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

        await prisma.loginAttempt.create({
          data: {
            userId: user.id,
            email: credentials.emailOrPhone,
            ipAddress: ip,
            success: true,
          },
        });

        try {
          const userAgent = reqHeaders?.get?.("user-agent") || "unknown";
          // Log security event (non-blocking)
          void logSecurityEvent({
            eventType: SecurityEventType.LOGIN_SUCCESS,
            severity: SecuritySeverity.LOW,
            userId: user.id,
            ipAddress: ip || "unknown",
            userAgent,
            endpoint: "/api/auth/credentials",
            method: "POST",
            statusCode: 200,
            message: `Successful credentials login for ${user.email}`,
            metadata: { provider: "credentials" },
          }).catch(() => {});

          // Note: we persist login events to SecurityLog; the User model currently does not
          // include a `lastLoginAt` column so we avoid updating the user record here.
          // Admin UI derives lastLoginAt from SecurityLog entries.
        } catch {
          // non-fatal
        }

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
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "2592000", 10),
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      } else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email ?? null;
        session.user.name = token.name ?? null;
        session.user.whatsapp = token.whatsapp ?? null;
        session.user.role = token.role ?? null;
        // @ts-expect-error - token may include custom properties added at runtime
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.showRawIps = Boolean((token as any)?.showRawIps);
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
      if (!token.exp) {
        const maxAge = parseInt(process.env.SESSION_MAX_AGE || "2592000", 10);
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    // Allow `any` here because NextAuth provides provider-specific shapes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn(params: { user: any; account: any; profile?: any }) {
      const { user, account } = params;
      try {
        // Log security event (best-effort)
        void logSecurityEvent({
          eventType: SecurityEventType.LOGIN_SUCCESS,
          severity: SecuritySeverity.LOW,
          userId: user?.id,
          ipAddress: "unknown",
          userAgent: "unknown",
          endpoint: account?.provider ? `/auth/${account.provider}` : "/auth",
          method: "POST",
          statusCode: 200,
          message: `Successful sign in via ${account?.provider ?? "provider"}`,
          metadata: {
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
          },
        }).catch(() => {});

        // Note: the User model doesn't currently have `lastLoginAt`. We rely on SecurityLog
        // entries for last-login information, so avoid updating the user record here.
      } catch {
        // ignore logging failures
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
