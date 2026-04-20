import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import staging from "@/lib/staging";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { stagingId: string; file: string[] } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { stagingId, file } = params;
  if (!stagingId || !file || file.length === 0) {
    return NextResponse.json({ error: "Invalid staging path" }, { status: 400 });
  }

  const relPath = path.join(...file);
  const root = staging.STAGING_ROOT;
  const full = path.join(root, stagingId, relPath);

  // Ensure file exists and is under staging root
  if (!fs.existsSync(full)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const nodeStream = fs.createReadStream(full);
  const stream = Readable.toWeb(nodeStream) as unknown as ReadableStream;
  const headers = new Headers();
  const ext = path.extname(full).toLowerCase();
  const contentType =
    ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".svg"
            ? "image/svg+xml"
            : "application/octet-stream";
  headers.set("Content-Type", contentType);

  return new NextResponse(stream, { status: 200, headers });
}
