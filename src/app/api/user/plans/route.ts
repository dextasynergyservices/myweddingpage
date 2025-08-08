import { getAuthUser } from "@/lib/auth";

export async function GET() {
  // 1. Auth check
  const user = await getAuthUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // 2. Now TypeScript knows `user` exists
  // Your route logic here...
}
