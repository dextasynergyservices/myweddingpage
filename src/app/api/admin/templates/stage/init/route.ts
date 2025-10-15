import { NextResponse } from "next/server";
import staging from "@/lib/staging";
import path from "path";
import { requireAdmin } from "@/lib/middleware/admin";

export const runtime = "nodejs";

export async function POST() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const dir = staging.createStagingDir();
    // Use path.basename to be platform independent (Windows paths vs POSIX)
    const id = staging.STAGING_ROOT ? path.basename(dir) || dir : dir;
    // return staging id (basename)
    return NextResponse.json({ success: true, stagingId: id });
  } catch (err: unknown) {
    const msg = (err instanceof Error && err.message) || String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
