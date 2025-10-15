"use client";

import React, { useRef, useState } from "react";
import PrPlannedSummary from "@/components/admin/PrPlannedSummary";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SearchableMultiSelect from "@/components/ui/SearchableMultiSelect";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Modal from "@/components/ui/Modal";
import UploadProgress, { useUploadProgress } from "@/components/ui/UploadProgress";

type StagingPreview = {
  stagingId: string;
  manifest: Record<string, unknown>;
  assets: string[];
  componentsValidation?: { hasComponents: boolean; files: string[] };
};

type ComponentFile = {
  path?: string;
  hasDefaultExport?: boolean;
  namedExports?: string[];
  diagnostics?: string[];
  error?: string;
};

// --- Diff-related types (moved to module scope so helper functions can use them)
type TopLevelDiff = { added: string[]; removed: string[]; changed: string[] };
type SectionChange =
  | { index: number; action: "create"; newSection: Record<string, unknown> }
  | { index: number; action: "remove"; oldSection: Record<string, unknown> }
  | { index: number; action: "identical"; oldSection: Record<string, unknown> }
  | {
      index: number;
      action: "change";
      diff: TopLevelDiff;
      oldSection: Record<string, unknown>;
      newSection: Record<string, unknown>;
    };

type ManifestDiffResult = {
  topLevel: TopLevelDiff;
  sections: SectionChange[];
  assets: { existing: string[]; uploading: string[]; toReplace: string[]; toCreate: string[] };
  raw?: Record<string, unknown>;
};

export default function UploadClient({
  initialPlans,
  initialCategories,
}: {
  initialPlans: Array<{ id: string; name: string }>;
  initialCategories: Array<{ id: string; name: string }>;
}) {
  const [manifestFile, setManifestFile] = useState<File | null>(null);
  const [assets, setAssets] = useState<FileList | null>(null);
  const [components, setComponents] = useState<File | null>(null);
  const [preview, setPreview] = useState<StagingPreview | null>(null);
  const manifestInputRef = useRef<HTMLInputElement | null>(null);
  const assetsInputRef = useRef<HTMLInputElement | null>(null);
  const componentsInputRef = useRef<HTMLInputElement | null>(null);
  const [assetPreviews, setAssetPreviews] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [iframeOpen, setIframeOpen] = useState(false);
  const router = useRouter();
  const [createPROpen, setCreatePROpen] = useState(false);
  const [prSlug, setPrSlug] = useState<string>("");
  const [prEmail, setPrEmail] = useState<string>("");
  const [creatingPR, setCreatingPR] = useState(false);
  const [prDryRun, setPrDryRun] = useState(false);
  const [prAutoOpen] = useState(false);
  type PlannedPR = {
    success?: boolean;
    pr?: { html_url?: string } | null;
    planned?: unknown;
    details?: unknown;
    [key: string]: unknown;
  } | null;
  const [prPlanned, setPrPlanned] = useState<PlannedPR>(null);

  // upload progress handler (local minimal usage)
  const { uploads, addUpload, updateProgress, setUploadSuccess, setUploadError, removeUpload } =
    useUploadProgress();
  const plans = initialPlans || [];
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>(
    initialCategories || []
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const stagingIdRef = React.useRef<string | null>(null);
  const csrfRef = React.useRef<string | null>(null);
  const uploadMapRef = React.useRef<Map<string, { file: File; subdir?: string }>>(new Map());
  const [dryRunOpen, setDryRunOpen] = useState(false);
  const [dryRunManifest, setDryRunManifest] = useState<Record<string, unknown> | null>(null);
  const [dryRunInspect, setDryRunInspect] = useState<{
    missingLayouts: string[];
    sectionKeys: string[];
    name?: string;
    exists?: boolean;
    existingTemplate?: { id: string; name: string } | null;
  } | null>(null);
  const [existingManifest, setExistingManifest] = useState<Record<string, unknown> | null>(null);
  const [deepDiff, setDeepDiff] = useState<ManifestDiffResult | null>(null);
  const [dryRunLoading, setDryRunLoading] = useState(false);

  // no client-level full-page skeleton in this component

  const uploadSingle = (file: File, subdir?: string) =>
    new Promise<void>((resolve, reject) => {
      const stagingId = stagingIdRef.current;
      const csrfToken = csrfRef.current;
      if (!stagingId) return reject(new Error("no staging session"));
      const name = file.name || "file";
      const entryName = name;

      // store mapping for retry
      uploadMapRef.current.set(entryName, { file, subdir });

      // ensure a single upload entry
      addUpload(entryName, file.size || 0);
      const xhr = new XMLHttpRequest();
      const url = `/api/admin/templates/stage/upload?stagingId=${encodeURIComponent(
        stagingId
      )}${subdir ? `&subdir=${encodeURIComponent(subdir)}` : ""}`;
      xhr.open("POST", url, true);
      xhr.withCredentials = true;
      if (csrfToken) xhr.setRequestHeader("x-csrf-token", csrfToken);
      const fd = new FormData();
      fd.append("file", file, name);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) updateProgress(entryName, ev.loaded, undefined);
        else updateProgress(entryName, Math.min(file.size || 0, ev.loaded || 0), undefined);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            setUploadSuccess(entryName);
            resolve();
          } catch (e) {
            setUploadError(entryName, String(e));
            reject(e);
          }
        } else {
          let serverMessage = `${xhr.status}`;
          try {
            const parsed = JSON.parse(xhr.responseText || "{}");
            serverMessage = parsed?.error || parsed?.message || serverMessage;
          } catch {}
          setUploadError(entryName, serverMessage);
          reject(new Error(serverMessage));
        }
      };
      xhr.onerror = () => {
        setUploadError(entryName, "Network error");
        reject(new Error("Network error"));
      };
      xhr.send(fd);
    });

  const doSubmit = async () => {
    if (!manifestFile) {
      toast.error("Please select a manifest.json file");
      return;
    }

    if (selectedPlanIds.length === 0) {
      toast.error("Please select at least one Plan to link this template to");
      return;
    }

    if (selectedCategoryIds.length === 0) {
      toast.error("Please select at least one category for this template");
      return;
    }

    setLoading(true);
    try {
      // get CSRF token
      const tokenRes = await fetch("/api/csrf-token", { method: "GET", credentials: "include" });
      let csrfToken = null;
      if (tokenRes.ok) {
        const json = await tokenRes.json();
        csrfToken = json.csrfToken;
        csrfRef.current = csrfToken;
      }

      // 1) init staging
      const initRes = await fetch("/api/admin/templates/stage/init", {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
      });
      if (!initRes.ok) {
        const txt = await initRes.text();
        throw new Error(`init failed: ${initRes.status} ${txt}`);
      }
      const initJson = await initRes.json();
      const stagingId = initJson?.stagingId;
      if (!stagingId) throw new Error("failed to create staging session");
      stagingIdRef.current = stagingId;

      // construct patched manifest
      const manifestText = await manifestFile.text();
      let manifestObj: Record<string, unknown> = {};
      try {
        manifestObj = JSON.parse(manifestText) as Record<string, unknown>;
      } catch {
        throw new Error("manifest.json is not valid JSON");
      }
      manifestObj.planIds = selectedPlanIds;
      manifestObj.categoryIds = selectedCategoryIds;
      const patchedManifest = new File([JSON.stringify(manifestObj, null, 2)], "manifest.json", {
        type: "application/json",
      });

      // upload manifest
      await uploadSingle(patchedManifest, "");

      // upload components if present
      if (components) {
        await uploadSingle(components, "components");
      }

      // upload assets
      if (assets) {
        for (let i = 0; i < assets.length; i++) {
          const f = assets[i];
          // each asset goes to assets subdir
          await uploadSingle(f, "assets");
        }
      }

      // finalize
      const finRes = await fetch(
        `/api/admin/templates/stage/finalize?stagingId=${encodeURIComponent(stagingIdRef.current!)}`,
        {
          method: "POST",
          credentials: "include",
          headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
        }
      );
      if (!finRes.ok) {
        const txt = await finRes.text();
        throw new Error(`finalize failed: ${finRes.status} ${txt}`);
      }
      const finJson = await finRes.json();
      setPreview(finJson?.preview ?? null);
      toast.success("Staged successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Upload failed: ${msg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSubmit();
  };

  function suggestSlug(name?: unknown) {
    if (!name || typeof name !== "string") return "template";
    return String(name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function createPR() {
    if (!preview) return;
    const stagingId = preview.stagingId;
    const slug = prSlug || suggestSlug(preview.manifest?.name);
    const adminEmail = prEmail;
    if (!slug) {
      toast.error("Please provide a slug");
      return;
    }
    if (!adminEmail) {
      toast.error("Please provide your email");
      return;
    }
    setCreatingPR(true);
    try {
      type CreatePRBody = {
        stagingId: string;
        slug: string;
        adminEmail: string;
        dryRun?: boolean;
        [key: string]: unknown;
      };
      const body: CreatePRBody = { stagingId, slug, adminEmail, dryRun: prDryRun };
      const res = await fetch(`/api/admin/templates/pr`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
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
        // show planned changes
        setPrPlanned(json?.planned ?? json);
        return;
      }
      if (json?.success && json.pr && json.pr.html_url) {
        toast.success("PR created");
        if (prAutoOpen && typeof window !== "undefined") {
          try {
            window.open(json.pr.html_url, "_blank");
          } catch {}
        }
        const url = `/dashboard/admin/templates/pr/status?prUrl=${encodeURIComponent(
          json.pr.html_url
        )}`;
        router.push(url);
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
  }

  // create previews when assets change
  React.useEffect(() => {
    // cleanup old previews
    return () => {
      for (const url of assetPreviews) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssetsChange = (files: FileList | null) => {
    // revoke previous
    for (const url of assetPreviews) URL.revokeObjectURL(url);
    setAssetPreviews([]);
    setAssets(files);
    if (!files) return;
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const u = URL.createObjectURL(f);
        urls.push(u);
      } catch {
        // ignore
      }
    }
    setAssetPreviews(urls);
  };

  // keyboard shortcut: Ctrl+U to focus manifest file input
  React.useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "u") {
        ev.preventDefault();
        manifestInputRef.current?.focus();
        manifestInputRef.current?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // listen for category changes dispatched elsewhere (categories admin page)
  React.useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail;
        if (!detail || !detail.action) return;
        if (detail.action === "create" && detail.category) {
          setCategories((prev) => {
            if (prev.find((c) => c.id === detail.category.id)) return prev;
            return [...prev, { id: detail.category.id, name: detail.category.name }];
          });
        } else if (detail.action === "update" && detail.category) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === detail.category.id ? { ...c, name: detail.category.name } : c
            )
          );
        } else if (detail.action === "delete" && detail.id) {
          setCategories((prev) => prev.filter((c) => c.id !== detail.id));
          setSelectedCategoryIds((prev) => prev.filter((id) => id !== detail.id));
        }
      } catch {}
    };
    window.addEventListener("template-categories:changed", handler as EventListener);
    return () =>
      window.removeEventListener("template-categories:changed", handler as EventListener);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border shadow-sm">
        <div className="border-b p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m8 4H8"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Upload Template Package (Staging)</h1>
            <p className="text-sm text-gray-600">
              Upload a template manifest, optional components ZIP, and supporting assets to stage
              for review and publishing.
            </p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Select plans</label>
              <div className="mt-2">
                <SearchableMultiSelect
                  options={plans}
                  value={selectedPlanIds}
                  onChange={(ids) => setSelectedPlanIds(ids)}
                  placeholder="Select one or more plans"
                  ariaLabel="Select plans to link"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Categories</label>
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <SearchableMultiSelect
                      options={categories}
                      value={selectedCategoryIds}
                      onChange={(ids) => setSelectedCategoryIds(ids)}
                      placeholder="Select one or more categories"
                      ariaLabel="Select categories"
                    />
                  </div>
                  <div className="w-48">
                    {/* inline create category */}
                    <InlineCreateCategory
                      onCreated={(c) => {
                        // append to categories and select
                        const exists = categories.find((x) => x.id === c.id);
                        if (!exists) {
                          // mutate underlying array in place to preserve reference expected by SearchableMultiSelect
                          (categories as Array<{ id: string; name: string }>).push(c);
                        }
                        setSelectedCategoryIds((prev) => Array.from(new Set([...prev, c.id])));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>manifest.json</Label>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">
                  {manifestFile ? manifestFile.name : "No file chosen"}
                </div>
                <div className="ml-auto">
                  <input
                    ref={manifestInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => setManifestFile(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={() => manifestInputRef.current?.click()}
                    variant="outline"
                    className="w-auto px-4 py-2"
                    disabled={loading}
                  >
                    Choose file
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Assets (images/videos)</Label>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">
                  {assets
                    ? `${assets.length} file${assets.length > 1 ? "s" : ""}`
                    : "No files chosen"}
                </div>
                <div className="ml-auto">
                  <input
                    ref={assetsInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleAssetsChange(e.target.files)}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={() => assetsInputRef.current?.click()}
                    variant="outline"
                    className="w-auto px-4 py-2"
                    disabled={loading}
                  >
                    Choose files
                  </Button>
                </div>
              </div>
            </div>

            {assetPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {assetPreviews.map((src, idx) => (
                  <div key={src} className="w-full h-24 relative rounded overflow-hidden border">
                    <Image src={src} alt={`preview-${idx}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label>components.zip (optional)</Label>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">
                  {components ? components.name : "No file chosen"}
                </div>
                <div className="ml-auto">
                  <input
                    ref={componentsInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => setComponents(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={() => componentsInputRef.current?.click()}
                    variant="outline"
                    className="w-auto px-4 py-2"
                    disabled={loading}
                  >
                    Choose file
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Button
                type="submit"
                isLoading={loading}
                loadingText="Uploading..."
                disabled={loading}
              >
                Stage Package
              </Button>
              <Button
                type="button"
                variant="outline"
                className="ml-3"
                onClick={async () => {
                  // prepare patched manifest for dry-run preview and call inspect
                  if (!manifestFile) {
                    toast.error("Please choose a manifest first");
                    return;
                  }
                  try {
                    setDryRunLoading(true);
                    const text = await manifestFile.text();
                    const obj = JSON.parse(text);
                    obj.planIds = selectedPlanIds;
                    obj.categoryIds = selectedCategoryIds;
                    setDryRunManifest(obj);

                    // call inspect endpoint
                    const [inspectRes, existsRes] = await Promise.all([
                      fetch(`/api/admin/templates/inspect`, {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ manifest: obj }),
                      }),
                      fetch(`/api/admin/templates/check-exists`, {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ name: obj.name || null }),
                      }),
                    ]);
                    if (!inspectRes.ok) {
                      const txt = await inspectRes.text();
                      throw new Error(txt || "inspect failed");
                    }
                    if (!existsRes.ok) {
                      const txt = await existsRes.text();
                      throw new Error(txt || "exists check failed");
                    }
                    const json = await inspectRes.json();
                    const existsJson = await existsRes.json();
                    setDryRunInspect({
                      missingLayouts: json.missingLayouts || [],
                      sectionKeys: json.sectionKeys || [],
                      name: json.name,
                      exists: existsJson.exists === true,
                      existingTemplate: existsJson.template ?? null,
                    });
                    setDryRunOpen(true);
                    // if exists, fetch the stored manifest for deep diff
                    if (existsJson.exists && existsJson.template?.id) {
                      try {
                        const getRes = await fetch(`/api/admin/templates/get-by-name`, {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ id: existsJson.template.id }),
                        });
                        if (getRes.ok) {
                          const getJson = await getRes.json();
                          if (getJson.found && getJson.manifest) {
                            setExistingManifest(getJson.manifest as Record<string, unknown>);
                            // compute richer manifest diff (top-level, sections, assets)
                            const d = computeManifestDiff(
                              getJson.manifest as unknown,
                              obj as unknown,
                              Array.isArray(getJson.assets) ? (getJson.assets as string[]) : [],
                              assets
                            );
                            setDeepDiff(d);
                          }
                        }
                      } catch (e) {
                        console.error("failed to fetch existing manifest", e);
                      }
                    } else {
                      setExistingManifest(null);
                      setDeepDiff(null);
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Dry-run inspect failed");
                  } finally {
                    setDryRunLoading(false);
                  }
                }}
                disabled={loading}
              >
                Dry Run
              </Button>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIframeOpen(true)}
                aria-label="Open full preview in sandboxed iframe"
                disabled={loading}
              >
                Open Full Preview
              </Button>
            </div>
          </form>
        </div>
      </div>

      {preview && (
        <div className="rounded-lg border p-6 bg-white">
          <h2 className="text-xl font-semibold mb-2">Staging Preview</h2>
          <pre className="p-2 bg-gray-100 rounded">{JSON.stringify(preview.manifest, null, 2)}</pre>

          {preview.componentsValidation && (
            <div className="mt-4">
              <div className="font-semibold">Components validation</div>
              <div className="text-sm mt-2">
                Has components: {preview.componentsValidation.hasComponents ? "Yes" : "No"}
              </div>
              {preview.componentsValidation.files?.length > 0 && (
                <div className="mt-2">
                  <table className="w-full text-sm table-auto border-collapse">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-2">File</th>
                        <th className="pb-2">Default</th>
                        <th className="pb-2">Named exports</th>
                        <th className="pb-2">Diagnostics</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.componentsValidation.files.map((f) => {
                        let parsed: ComponentFile | null = null;
                        try {
                          parsed = JSON.parse(f) as ComponentFile;
                        } catch {
                          // fallback: raw string
                        }
                        return (
                          <tr key={f} className="border-t">
                            <td className="py-2 align-top">{parsed?.path || f}</td>
                            <td className="py-2 align-top">
                              {parsed?.hasDefaultExport ? "Yes" : "No"}
                            </td>
                            <td className="py-2 align-top">
                              {Array.isArray(parsed?.namedExports)
                                ? parsed!.namedExports!.join(", ")
                                : "—"}
                            </td>
                            <td className="py-2 align-top">
                              {Array.isArray(parsed?.diagnostics) &&
                              parsed!.diagnostics!.length > 0 ? (
                                <ul className="list-disc pl-4">
                                  {parsed!.diagnostics!.map((d: string, i: number) => (
                                    <li key={i} className="text-xs text-red-600">
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-4">
            {preview.assets?.map((url: string) => (
              <div key={url} className="w-full h-40 relative rounded overflow-hidden">
                <Image src={url} alt="asset" fill className="object-cover" />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              className="btn btn-primary"
              onClick={() => {
                setPrSlug(suggestSlug(preview.manifest?.name));
                setCreatePROpen(true);
              }}
            >
              Create PR
            </button>
          </div>
        </div>
      )}

      {/* Upload progress floating */}
      <UploadProgress
        uploads={uploads}
        onDismiss={(f) => removeUpload(f)}
        onRetry={async (fileName) => {
          const entry = uploadMapRef.current.get(fileName);
          if (!entry) {
            toast.error("Original file not available to retry");
            return;
          }
          try {
            // clear previous error state if any
            removeUpload(fileName);
            await uploadSingle(entry.file, entry.subdir);
          } catch (e) {
            console.error(e);
            toast.error("Retry failed");
          }
        }}
      />

      {/* Modal for staging preview */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Staging Preview">
        {preview ? (
          <div>
            <pre className="p-2 bg-gray-100 rounded">
              {JSON.stringify(preview.manifest, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="p-4">No preview available</div>
        )}
      </Modal>

      {/* iframe full preview modal and Create PR modal */}
      <>
        <Modal
          isOpen={iframeOpen}
          onClose={() => setIframeOpen(false)}
          title={preview ? String(preview.manifest?.name ?? "Preview") : "Full Preview"}
        >
          {preview ? (
            <div style={{ height: "80vh" }}>
              <iframe
                src={`/admin/templates/preview/${encodeURIComponent(preview.stagingId)}`}
                title={preview ? String(preview.manifest?.name ?? "Preview") : "Preview"}
                style={{ width: "100%", height: "100%", border: "none" }}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="p-4">No staged preview available yet. Please stage first.</div>
          )}
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
            <div className="flex items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => createPR()}
                disabled={creatingPR}
                aria-label="Create pull request"
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
      </>

      {/* Dry-run modal shows the patched manifest and assets that would be uploaded */}
      <Modal
        isOpen={dryRunOpen}
        onClose={() => setDryRunOpen(false)}
        title="Dry Run Preview"
        description="Summary of what will be uploaded and potential issues"
      >
        {dryRunManifest ? (
          <div>
            <div className="mb-3 text-sm text-gray-600">
              This is a preview of the patched manifest that would be uploaded.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Manifest (patched)</div>
                <pre className="p-2 bg-gray-100 rounded max-h-80 overflow-auto">
                  {JSON.stringify(dryRunManifest, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Inspection</div>
                {dryRunLoading ? (
                  <div className="text-sm text-slate-500">Inspecting...</div>
                ) : dryRunInspect ? (
                  <div className="text-sm">
                    <div className="mb-2">Sections found: {dryRunInspect.sectionKeys.length}</div>
                    {dryRunInspect.missingLayouts.length > 0 ? (
                      <div className="text-xs text-red-600">
                        Missing layouts: {dryRunInspect.missingLayouts.join(", ")}
                      </div>
                    ) : (
                      <div className="text-xs text-green-600">
                        All referenced layouts exist in the component registry.
                      </div>
                    )}

                    {/* existence info */}
                    <div className="mt-3">
                      {dryRunInspect.exists ? (
                        <div className="text-sm text-yellow-700">
                          A template with this name already exists and will be replaced:{" "}
                          <span className="font-medium">
                            {dryRunInspect.existingTemplate?.name || "(unknown)"}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-green-700">
                          This will create a new template.
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-sm font-medium">Assets</div>
                    {deepDiff ? (
                      <div className="text-xs">
                        <div className="mb-1">
                          Uploading: {deepDiff.assets.uploading.length} file(s)
                        </div>
                        <div className="mb-1 text-green-700">
                          To create:{" "}
                          {deepDiff.assets.toCreate.length
                            ? deepDiff.assets.toCreate.join(", ")
                            : "—"}
                        </div>
                        <div className="mb-1 text-yellow-700">
                          To replace:{" "}
                          {deepDiff.assets.toReplace.length
                            ? deepDiff.assets.toReplace.join(", ")
                            : "—"}
                        </div>
                        <div className="mb-2 text-slate-500">
                          Existing assets: {deepDiff.assets.existing.length}
                        </div>
                      </div>
                    ) : assets ? (
                      <div className="max-h-40 overflow-auto">
                        {Array.from(assets).map((f) => (
                          <div key={f.name} className="text-xs text-slate-700">
                            {f.name} — will be uploaded
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">No assets selected</div>
                    )}

                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2">Manifest diff</div>
                      {deepDiff ? (
                        <div>
                          <div className="mb-2 text-xs">Top-level changes:</div>
                          <ManifestDiff
                            oldManifest={existingManifest || undefined}
                            newManifest={dryRunManifest}
                          />
                          <div className="mt-3 text-sm font-medium">Sections</div>
                          <div className="space-y-2 mt-2">
                            {deepDiff.sections.map((s: SectionChange) => (
                              <SectionDiff key={s.index} s={s} />
                            ))}
                          </div>

                          <div className="mt-3 text-sm font-medium">Raw deep diff</div>
                          <div className="mt-2">
                            <DiffViewer
                              diff={
                                deepDiff && deepDiff.raw
                                  ? deepDiff.raw
                                  : computeDeepDiff(existingManifest, dryRunManifest)
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <ManifestDiff
                          oldManifest={existingManifest || undefined}
                          newManifest={dryRunManifest}
                        />
                      )}
                    </div>

                    <div className="mt-3">
                      <Button
                        onClick={async () => {
                          // proceed to actually stage (same as submit)
                          setDryRunOpen(false);
                          await doSubmit();
                        }}
                        data-primary
                      >
                        {dryRunInspect.exists ? "Replace Package" : "Stage Package"}
                      </Button>
                      <Button
                        variant="outline"
                        className="ml-3"
                        onClick={async () => {
                          setDryRunOpen(false);
                          await doSubmit();
                          // open iframe preview after staging
                          setIframeOpen(true);
                        }}
                      >
                        {dryRunInspect.exists ? "Replace + Preview" : "Stage + Preview"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No inspection data available</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">No manifest prepared for dry-run</div>
        )}
      </Modal>
    </div>
  );
}

// Deep diff utility (returns an object describing added/removed/changed at nested paths)
function computeDeepDiff(oldObj: unknown, newObj: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);

  function walk(a: unknown, b: unknown, pathParts: string[]) {
    if (a === b) return;
    if (typeof a !== typeof b) {
      result[pathParts.join(".")] = { from: a, to: b };
      return;
    }
    if (a == null && b != null) {
      result[pathParts.join(".")] = { from: a, to: b };
      return;
    }
    if (b == null && a != null) {
      result[pathParts.join(".")] = { from: a, to: b };
      return;
    }
    if (Array.isArray(a) || Array.isArray(b)) {
      try {
        if (JSON.stringify(a) !== JSON.stringify(b))
          result[pathParts.join(".")] = { from: a, to: b };
      } catch {
        result[pathParts.join(".")] = { from: a, to: b };
      }
      return;
    }
    if (isRecord(a) && isRecord(b)) {
      const aObj: Record<string, unknown> = a;
      const bObj: Record<string, unknown> = b;
      const keys = new Set<string>([...Object.keys(aObj), ...Object.keys(bObj)]);
      for (const k of keys) {
        walk(aObj[k], bObj[k], [...pathParts, k]);
      }
      return;
    }
    // primitive difference
    if (a !== b) result[pathParts.join(".")] = { from: a, to: b };
  }

  walk(oldObj, newObj, []);
  return result;
}

function DiffViewer({ diff }: { diff: Record<string, unknown> | null }) {
  if (!diff || Object.keys(diff).length === 0)
    return <div className="text-xs text-green-700">No differences found.</div>;

  return (
    <div className="max-h-64 overflow-auto text-xs border rounded p-2 bg-white">
      <ul className="list-none space-y-2">
        {Object.entries(diff).map(([path, change]) => (
          <li key={path} className="">
            <div className="font-mono text-xs text-slate-700">{path}</div>
            <div className="text-xs mt-1">
              <div>
                <strong className="text-red-600">from:</strong>{" "}
                <code className="font-mono text-xs">
                  {JSON.stringify((change as Record<string, unknown>).from)}
                </code>
              </div>
              <div>
                <strong className="text-green-600">to:</strong>{" "}
                <code className="font-mono text-xs">
                  {JSON.stringify((change as Record<string, unknown>).to)}
                </code>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Manifest diff component (client-local utility) ---
function shallowDiff(oldObj: Record<string, unknown> = {}, newObj: Record<string, unknown> = {}) {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  const oldKeys = new Set(Object.keys(oldObj));
  const newKeys = new Set(Object.keys(newObj));

  for (const k of newKeys) {
    if (!oldKeys.has(k)) {
      added.push(k);
    } else {
      const a = oldObj[k];
      const b = newObj[k];
      try {
        if (JSON.stringify(a) !== JSON.stringify(b)) changed.push(k);
      } catch {
        if (a !== b) changed.push(String(k));
      }
    }
  }
  for (const k of oldKeys) {
    if (!newKeys.has(k)) removed.push(k);
  }
  return { added, removed, changed };
}

function ManifestDiff({
  oldManifest,
  newManifest,
}: {
  oldManifest?: Record<string, unknown> | undefined;
  newManifest: Record<string, unknown> | null;
}) {
  if (!newManifest) return <div className="text-xs text-slate-500">No manifest</div>;
  // For now we only diff against empty/undefined oldManifest. If oldManifest is provided in future,
  // we can compute a true create/replace diff. Here we surface top-level changed keys.
  const diff = shallowDiff(oldManifest || {}, newManifest || {});

  return (
    <div className="border rounded p-2 bg-white max-h-56 overflow-auto text-xs">
      <div className="mb-2">
        <strong>Added:</strong> {diff.added.length ? diff.added.join(", ") : "—"}
      </div>
      <div className="mb-2">
        <strong>Removed:</strong> {diff.removed.length ? diff.removed.join(", ") : "—"}
      </div>
      <div>
        <strong>Changed:</strong> {diff.changed.length ? diff.changed.join(", ") : "—"}
      </div>
    </div>
  );
}

// Compute a richer manifest diff including top-level key diffs, section diffs, and asset actions
function computeManifestDiff(
  oldManifest: unknown,
  newManifest: unknown,
  existingAssets: string[],
  uploadedAssets: FileList | null
): ManifestDiffResult {
  const result: ManifestDiffResult = {
    topLevel: { added: [], removed: [], changed: [] },
    sections: [],
    assets: { existing: existingAssets || [], uploading: [], toReplace: [], toCreate: [] },
  };

  result.topLevel = shallowDiff(
    (oldManifest as Record<string, unknown>) || {},
    (newManifest as Record<string, unknown>) || {}
  );

  const getSections = (m: unknown): Array<Record<string, unknown>> => {
    if (!m || typeof m !== "object") return [];
    const maybe = (m as Record<string, unknown>)?.sections;
    return Array.isArray(maybe) ? (maybe as Array<Record<string, unknown>>) : [];
  };

  const oldSections = getSections(oldManifest);
  const newSections = getSections(newManifest);

  const max = Math.max(oldSections.length, newSections.length);
  for (let i = 0; i < max; i++) {
    const a = oldSections[i] as Record<string, unknown> | undefined;
    const b = newSections[i] as Record<string, unknown> | undefined;
    if (!a && b) {
      result.sections.push({ index: i, action: "create", newSection: b });
    } else if (a && !b) {
      result.sections.push({ index: i, action: "remove", oldSection: a });
    } else if (a && b) {
      const sectionDiff = shallowDiff(a || {}, b || {});
      if (sectionDiff.added.length || sectionDiff.removed.length || sectionDiff.changed.length) {
        result.sections.push({
          index: i,
          action: "change",
          diff: sectionDiff,
          oldSection: a,
          newSection: b,
        });
      } else {
        result.sections.push({ index: i, action: "identical", oldSection: a });
      }
    }
  }

  const uploading: string[] = [];
  if (uploadedAssets) {
    for (let i = 0; i < uploadedAssets.length; i++) uploading.push(uploadedAssets[i].name);
  }
  result.assets.uploading = uploading;

  result.assets.toReplace = result.assets.uploading.filter((u) =>
    result.assets.existing.some((e) => e.endsWith(u))
  );
  result.assets.toCreate = result.assets.uploading.filter(
    (u) => !result.assets.toReplace.includes(u)
  );

  // include a raw path-based deep diff for debugging/viewing
  result.raw = computeDeepDiff((oldManifest as unknown) || {}, (newManifest as unknown) || {});

  return result;
}

function SectionDiff({ s }: { s: SectionChange }) {
  if (!s) return null;
  if (s.action === "identical")
    return <div className="text-xs text-slate-500">Section {s.index}: identical</div>;
  if (s.action === "create")
    return (
      <div className="text-xs text-green-700">
        Section {s.index}: will be created (layout: {String(s.newSection?.layout)})
      </div>
    );
  if (s.action === "remove")
    return <div className="text-xs text-red-700">Section {s.index}: will be removed</div>;
  // change
  return (
    <div className="text-xs">
      <div className="font-medium">Section {s.index}: changes</div>
      <div className="ml-2 mt-1">
        <div>
          <strong>Added:</strong> {s.diff.added.length ? s.diff.added.join(", ") : "—"}
        </div>
        <div>
          <strong>Removed:</strong> {s.diff.removed.length ? s.diff.removed.join(", ") : "—"}
        </div>
        <div>
          <strong>Changed:</strong> {s.diff.changed.length ? s.diff.changed.join(", ") : "—"}
        </div>
      </div>
    </div>
  );
}

// Inline category creation component used by UploadClient so newly created categories
// are immediately selectable without a page refresh.
function InlineCreateCategory({
  onCreated,
}: {
  onCreated: (c: { id: string; name: string }) => void;
}) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!name || name.trim().length === 0) {
      toast.error("Please provide a category name");
      return;
    }
    setCreating(true);
    try {
      // obtain CSRF token (if available)
      let csrfToken: string | null = null;
      try {
        const tRes = await fetch("/api/csrf-token", { method: "GET", credentials: "include" });
        if (tRes.ok) {
          const j = await tRes.json();
          csrfToken = j?.csrfToken || null;
        }
      } catch {
        // ignore - endpoint not required in all deployments
      }

      const res = await fetch("/api/admin/template-categories", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({ name: name.trim(), description: "" }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `status ${res.status}`);
      }
      const json = await res.json();
      const created = json.category || json || null;
      if (!created || !created.id) throw new Error("Invalid response from server");
      toast.success(`Category '${created.name}' created`);
      // notify parent and other listeners
      onCreated({ id: created.id, name: created.name });
      try {
        window.dispatchEvent(
          new CustomEvent("template-categories:changed", {
            detail: { action: "create", category: created },
          })
        );
      } catch {}
      setName("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Failed to create category: ${msg}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        className="w-full rounded border px-2 py-1 text-sm"
        placeholder="New category"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            create();
          }
        }}
        aria-label="New category name"
      />
      <button
        type="button"
        className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
        onClick={create}
        disabled={creating}
      >
        {creating ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
