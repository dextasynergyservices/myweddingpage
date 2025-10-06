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
