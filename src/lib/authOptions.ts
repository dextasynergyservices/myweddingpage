import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        // 🔹 Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          // 🔸 Get all providers linked to this user
          const accounts = await prisma.account.findMany({
            where: { userId: existingUser.id },
          });

          const providersUsed = accounts.map((a) => a.provider);

          // 🔹 Block login if trying with Google but email linked to other providers
          if (providersUsed.length > 0 && !providersUsed.includes("google")) {
            throw new Error(
              `Email is already registered with a different provider: ${providersUsed.join(", ")}`
            );
          }
        }

        // ✅ Add user details to token
        token.id = user.id;
        token.email = user.email ?? "";
        token.name = user.name ?? "";
        token.role = user.role ?? "USER";
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async signIn({
      user: _user,
      account: _account,
      profile: _profile,
      email: _email,
      credentials: _credentials,
    }) {
      try {
        // If the jwt callback threw an error, signIn callback will catch it
        return true; // Allow sign in
      } catch (error: any) {
        // Return error message so NextAuth appends it to the URL
        return `/auth/login?error=${encodeURIComponent(error.message)}`;
      }
    },
  },
  // Optionally add a pages config to show error on your custom login page
  pages: {
    signIn: "/auth/login", // your custom login page route
    error: "/auth/login", // error page route, usually same as signIn
  },
};
