import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: string | null;
      whatsapp?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    role?: string | null;
    whatsapp?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    whatsapp?: string | null;
  }
}
