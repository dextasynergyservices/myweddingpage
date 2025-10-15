import { NextResponse, type NextRequest } from "next/server";
import staging from "@/lib/staging";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { stagingId: string } }) {
  try {
    const id = params.stagingId;
    if (!id) return NextResponse.json({ error: "stagingId required" }, { status: 400 });
    const root = staging.STAGING_ROOT;
    const dir = path.join(root, id);
    if (!fs.existsSync(dir)) return NextResponse.json({ error: "not found" }, { status: 404 });
    fs.rmSync(dir, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
