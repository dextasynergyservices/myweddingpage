"use client";

import React, { useEffect, useState } from "react";
import PrPlannedSummary from "@/components/admin/PrPlannedSummary";
import Image from "next/image";
import toast from "react-hot-toast";
// DynamicTemplateRenderer is not used in this client - preview is displayed via iframe or manifest
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

function suggestSlug(name?: unknown) {
  if (!name || typeof name !== "string") return "template";
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Preview = {
  stagingId: string;
  manifest: { name?: string; sections?: unknown[] };
  assets: string[];
  componentsValidation?: { hasComponents: boolean; files: string[] };
};

export default function StagingPreviewClient({ stagingId }: { stagingId: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"staging" | "full">("staging");
  const [iframeOpen, setIframeOpen] = useState(false);
  const router = useRouter();
  const [createPROpen, setCreatePROpen] = useState(false);
  const [prSlug, setPrSlug] = useState("");
  const [prEmail, setPrEmail] = useState("");
  const [creatingPR, setCreatingPR] = useState(false);
  const [prDryRun, setPrDryRun] = useState(false);
  type PlannedPR = {
    success?: boolean;
    pr?: { html_url?: string } | null;
    planned?: unknown;
    details?: unknown;
    [key: string]: unknown;
  } | null;
  const [prPlanned, setPrPlanned] = useState<PlannedPR>(null);
  const [prAutoOpen, setPrAutoOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/admin/templates/stage?stagingId=${encodeURIComponent(stagingId)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (!data || data.error) {
          toast.error(`Failed to load staging preview: ${data?.error || "unknown"}`);
          setLoading(false);
          return;
        }
        setPreview(data.preview || data);
      })
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load staging preview");
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [stagingId]);

  if (loading) return <div className="p-6">Loading preview...</div>;
  if (!preview) return <div className="p-6">No preview available</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Preview: {preview.manifest?.name ?? stagingId}</h1>
        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${mode === "staging" ? "btn-active" : ""}`}
            onClick={() => setMode("staging")}
          >
            Staging
          </button>
          <button
            className={`btn btn-sm ${mode === "full" ? "btn-active" : ""}`}
            onClick={() => {
              // open iframe modal for safer sandboxed preview
              setMode("full");
              setIframeOpen(true);
            }}
          >
            Full Preview
          </button>
          <button
            className="btn btn-sm"
            onClick={() => {
              setPrSlug(suggestSlug(preview.manifest?.name));
              setCreatePROpen(true);
            }}
          >
            Create PR
          </button>
        </div>
      </div>

      {mode === "staging" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Manifest</h2>
          <pre className="p-4 bg-gray-100 rounded">{JSON.stringify(preview.manifest, null, 2)}</pre>

          {preview.assets?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">Assets</h3>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {preview.assets.map((a) => (
                  <div
                    key={a}
                    className="w-full h-32 relative rounded overflow-hidden bg-gray-50"
                    style={{ position: "relative" }}
                  >
                    <Image src={a} alt="asset" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.componentsValidation && (
            <div className="mt-4">
              <h3 className="font-medium">Components validation</h3>
              <div>Has components: {preview.componentsValidation.hasComponents ? "Yes" : "No"}</div>
            </div>
          )}
        </div>
      )}

      {mode === "full" && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Full Preview</h2>
          <div className="border rounded p-4 bg-white">
            <div className="text-sm text-gray-600">
              The full preview will open in a sandboxed iframe.
            </div>
            <div className="mt-3">
              <button className="btn btn-primary btn-sm" onClick={() => setIframeOpen(true)}>
                Open Full Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iframe modal */}
      <Modal
        isOpen={iframeOpen}
        onClose={() => setIframeOpen(false)}
        title={`Full Preview: ${preview.manifest?.name ?? stagingId}`}
      >
        <div style={{ height: "80vh" }}>
          <iframe
            src={`/admin/templates/preview/${encodeURIComponent(stagingId)}`}
            title={`Preview ${stagingId}`}
            style={{ width: "100%", height: "100%", border: "none" }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </Modal>

      <Modal
        isOpen={createPROpen}
        onClose={() => setCreatePROpen(false)}
        title="Create Pull Request"
        description="Confirm slug and your email to create a PR from this staging package"
        descriptionId="create-pr-modal-desc"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-600">Slug</label>
            <input
              value={prSlug}
              onChange={(e) => setPrSlug(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Your email</label>
            <input
              value={prEmail}
              onChange={(e) => setPrEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border px-2 py-1"
              type="email"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prDryRun}
                onChange={(e) => setPrDryRun(e.target.checked)}
              />
              <span className="text-sm">Dry run (preview planned changes)</span>
            </label>
            {prPlanned && (
              <button
                type="button"
                className="btn btn-outline btn-sm ml-auto"
                onClick={() => setPrPlanned(null)}
              >
                Clear Preview
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prAutoOpen}
                onChange={(e) => setPrAutoOpen(e.target.checked)}
              />
              <span className="text-sm">Open PR in new tab after creation</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={async () => {
                if (!preview) return;
                const stagingIdLocal = stagingId;
                const slug = prSlug || suggestSlug(preview.manifest?.name);
                if (!slug) {
                  toast.error("Please provide a slug");
                  return;
                }
                if (!prEmail) {
                  toast.error("Please provide your email");
                  return;
                }
                setCreatingPR(true);
                try {
                  const res = await fetch(`/api/admin/templates/pr`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      stagingId: stagingIdLocal,
                      slug,
                      adminEmail: prEmail,
                      dryRun: prDryRun,
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok) {
                    const errMsg = json?.error || JSON.stringify(json);
                    if (json?.details) {
                      console.error("PR creation details:", json.details);
                      toast.error(String(json?.error || "Failed to create PR"));
                    }
                    throw new Error(errMsg);
                  }
                  if (prDryRun) {
                    setPrPlanned(json?.planned ?? json);
                    return;
                  }
                  if (json?.success && json.pr?.html_url) {
                    toast.success("PR created");
                    if (prAutoOpen && typeof window !== "undefined") {
                      try {
                        window.open(json.pr.html_url, "_blank");
                      } catch {}
                    }
                    router.push(
                      `/dashboard/admin/templates/pr/status?prUrl=${encodeURIComponent(json.pr.html_url)}`
                    );
                  } else {
                    toast.success("PR request completed");
                  }
                } catch (err: unknown) {
                  console.error(err);
                  toast.error((err as Error)?.message || String(err) || "Failed to create PR");
                } finally {
                  setCreatingPR(false);
                  if (!prDryRun) setCreatePROpen(false);
                }
              }}
              aria-label="Create pull request from staging"
              aria-describedby="create-pr-modal-desc"
            >
              {prDryRun
                ? creatingPR
                  ? "Inspecting..."
                  : "Preview planned changes"
                : creatingPR
                  ? "Creating..."
                  : "Create PR"}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setCreatePROpen(false);
                setPrPlanned(null);
              }}
              aria-label="Cancel create pull request"
              aria-describedby="create-pr-modal-desc"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      {prPlanned && (
        <div className="mt-3">
          <h3 className="font-medium">Planned changes (dry run)</h3>
          <PrPlannedSummary planned={prPlanned} />
        </div>
      )}
    </div>
  );
}
