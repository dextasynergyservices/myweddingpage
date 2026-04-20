import fs from "fs";
import path from "path";
import staging from "@/lib/staging";
import PreviewHost from "./PreviewHost";

export const runtime = "nodejs";

export default async function PreviewPage({
  params,
}: {
  params: { stagingId: string };
}) {
  const { stagingId } = params;
  const dir = path.join(staging.STAGING_ROOT, stagingId);
  const manifestPath = path.join(dir, "manifest.json");

  let manifest = null;
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    manifest = JSON.parse(raw);
  } catch {
    manifest = { name: "Invalid manifest", sections: [] };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">
          Staged Preview: {manifest?.name || stagingId}
        </h1>
        <PreviewHost manifest={manifest} stagingId={stagingId} />
      </div>
    </div>
  );
}
