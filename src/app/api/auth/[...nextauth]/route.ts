import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

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
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials.password) {
          throw new Error("Missing fields");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: credentials.emailOrPhone }, { whatsapp: credentials.emailOrPhone }],
          },
        });

        if (!user) throw new Error("No user found");
        if (!user.password) throw new Error("User has no password set");

        const isValid = await verifyPassword(credentials.password, user.password as string);

        if (!isValid) throw new Error("Invalid credentials");

        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.whatsapp = (token as any).whatsapp; // 👈 include whatsapp
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.whatsapp = (user as any).whatsapp ?? undefined; // 👈 include whatsapp
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
