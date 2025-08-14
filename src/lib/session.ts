import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import type { Session } from "next-auth";

/**
 * Gets the current authenticated user's session (server-side).
 * Returns null if no session exists.
 */
export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/**
 * Gets the current authenticated user (server-side).
 * Returns null if no user is logged in.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}
