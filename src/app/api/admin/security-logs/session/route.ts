import { NextResponse } from "next/server";
import { getSession } from "@/lib/middleware/admin";

export async function GET() {
  try {
    const s = await getSession();
    return NextResponse.json({ session: s });
  } catch (e) {
    console.error("Failed to read session in debug endpoint", e);
    return NextResponse.json(
      { error: "Failed to read session" },
      { status: 500 }
    );
  }
}
