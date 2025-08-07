import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

// Get the authenticated user
export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

// Middleware to require admin privileges
export async function requireAdmin() {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  if (user.role !== "ADMIN") {
    throw new Error("Admin privileges required");
  }

  return user;
}

// Optional: Add a function to require any authenticated user
export async function requireUser() {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
