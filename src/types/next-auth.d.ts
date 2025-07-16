import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
    role?: string;
  }

  interface JWT {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  }
}

export type PageParams<T extends string> = {
  params: Record<T, string>;
};
