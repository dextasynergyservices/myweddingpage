import { NextResponse } from "next/server";
import staging from "@/lib/staging";
import { requireAdmin } from "@/lib/middleware/admin";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

function getSubdirForFilename(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".zip")) return "components";
  if (lower.endsWith(".json") && filename.toLowerCase().includes("manifest")) return ".";
  return "assets";
}

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const url = new URL(req.url);
  const stagingId = url.searchParams.get("stagingId");
  if (!stagingId) return NextResponse.json({ error: "missing stagingId" }, { status: 400 });

  let formData: FormData;
  try {
    formData = await (req as unknown as Request).formData();
  } catch {
    return NextResponse.json({ error: "failed to parse form data" }, { status: 400 });
  }

  const fileEntry = formData.get("file");
  if (!fileEntry || !(fileEntry as File).name) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const file = fileEntry as File;
  const safeName = path.basename(file.name || "file");
  const subdir = getSubdirForFilename(safeName);
  const root = staging.STAGING_ROOT;
  const targetDir = path.join(root, stagingId, subdir === "." ? "" : subdir);
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const outPath = path.join(targetDir, safeName);
    fs.writeFileSync(outPath, buffer);
    return NextResponse.json({ success: true, path: outPath });
  } catch (err: unknown) {
    // Log the error for debugging and return the message (development only)
    let errMsg = "unexpected error";
    try {
      if (err && err instanceof Error) {
        console.error("staging upload error:", err);
        errMsg = err.message || String(err);
      }
    } catch (logErr) {
      console.error("failed to log upload error", logErr);
    }
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
