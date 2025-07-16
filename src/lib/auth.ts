import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return user;
}
