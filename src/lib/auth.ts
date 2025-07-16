import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }
  const { id, email, name, role } = session.user as {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  return { id, email, name, role };
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return user;
}
