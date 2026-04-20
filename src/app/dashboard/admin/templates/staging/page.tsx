"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Modal from "@/components/ui/Modal";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import PrPlannedSummary from "@/components/admin/PrPlannedSummary";

type StagingEntry = {
  id: string;
  createdAt: string;
  manifest: Record<string, unknown> | null;
  componentsValidation?: { hasComponents: boolean; files: string[] } | null;
  assets: string[];
};

type ComponentFile = {
  path?: string;
  hasDefaultExport?: boolean;
  namedExports?: string[];
  diagnostics?: string[];
  error?: string;
};

export default function StagingListPage() {
  const [entries, setEntries] = useState<StagingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmFor, setShowConfirmFor] = useState<string | null>(null);
  const [createPRFor, setCreatePRFor] = useState<string | null>(null);
  const [creatingPR, setCreatingPR] = useState(false);
  const [prSlug, setPrSlug] = useState("");
  const [prEmail, setPrEmail] = useState("");
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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Persist expanded state in localStorage so it survives navigation
  useEffect(() => {
    try {
      const raw = localStorage.getItem("staging.expandedRows");
      if (raw) setExpandedRows(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "staging.expandedRows",
        JSON.stringify(expandedRows)
      );
    } catch {
      // ignore
    }
  }, [expandedRows]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staging", { credentials: "include" });
      if (!res.ok) {
        toast.error(`Failed to load staging list: ${res.status}`);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setEntries(json.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staging list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // optimistic delete: remove immediately from UI, attempt server delete, rollback on failure
  const handleDelete = async (id: string) => {
    setShowConfirmFor(null);
    const previous = entries;
    setEntries((s) => s.filter((x) => x.id !== id));
    setDeletingId(id);
    try {
      // fetch CSRF token first
      const tokenRes = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      });
      let csrfToken: string | null = null;
      if (tokenRes.ok) {
        const j = await tokenRes.json();
        csrfToken = j.csrfToken;
      }

      const headers: Record<string, string> = {};
      if (csrfToken) headers["x-csrf-token"] = csrfToken;

      const res = await fetch(`/api/admin/staging/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
        headers,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        toast.error(`Delete failed: ${res.status} ${txt || ""}`);
        // rollback
        setEntries(previous);
        return;
      }
      toast.success("Deleted staging package");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
      setEntries(previous);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Staged Template Packages</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              // expand all currently visible rows (robust to malformed JSON entries)
              const next: Record<string, boolean> = {};
              const safePath = (fileEntry: string) => {
                try {
                  const parsed = JSON.parse(String(fileEntry)) as {
                    path?: string;
                  };
                  return parsed?.path ?? String(fileEntry);
                } catch {
                  return String(fileEntry);
                }
              };
              for (const item of entries) {
                if (item.componentsValidation?.files?.length) {
                  for (const f of item.componentsValidation.files) {
                    const fileStr = String(f);
                    const pathPart = safePath(fileStr);
                    const id = `${item.id}:${pathPart}`;
                    next[id] = true;
                  }
                }
              }
              setExpandedRows(next);
            }}
          >
            Expand all
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setExpandedRows({})}
          >
            Collapse all
          </button>
        </div>
      </div>
      {loading ? (
        <PageSkeleton />
      ) : entries.length === 0 ? (
        <p>No staged packages</p>
      ) : null}

      <div className="space-y-6">
        {entries.map((e) => (
          <div key={e.id} className="border rounded p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <div className="font-medium text-lg">
                    {(() => {
                      const manifestRecord = e.manifest as Record<
                        string,
                        unknown
                      > | null;
                      const name =
                        typeof manifestRecord?.name === "string"
                          ? manifestRecord.name
                          : undefined;
                      return String(name ?? e.id);
                    })()}
                  </div>
                  <div className="ml-3 text-xs text-gray-500">
                    ID: <span className="font-mono text-xs">{e.id}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(e.createdAt).toLocaleString()}
                  </div>
                </div>
                {e.manifest ? (
                  <div className="mt-2 text-sm text-slate-700">
                    <div>
                      <strong>Summary:</strong>{" "}
                      {(() => {
                        const manifestRecord = e.manifest as Record<
                          string,
                          unknown
                        > | null;
                        if (typeof manifestRecord?.description === "string")
                          return manifestRecord.description;
                        if (typeof manifestRecord?.summary === "string")
                          return manifestRecord.summary;
                        if (typeof manifestRecord?.title === "string")
                          return manifestRecord.title;
                        return "No summary";
                      })()}
                    </div>
                    <div className="mt-2">
                      <strong>Plans:</strong>{" "}
                      {(() => {
                        const manifestRecord = e.manifest as Record<
                          string,
                          unknown
                        > | null;
                        const planIdsRaw = manifestRecord?.planIds;
                        if (Array.isArray(planIdsRaw)) {
                          return planIdsRaw.slice(0, 3).map(String).join(", ");
                        }
                        return "—";
                      })()}
                    </div>
                  </div>
                ) : null}

                {e.componentsValidation && (
                  <div className="mt-3">
                    <div className="font-semibold">Components</div>
                    <div className="text-sm">
                      Has components:{" "}
                      {e.componentsValidation.hasComponents ? "Yes" : "No"}
                    </div>
                    {e.componentsValidation && (
                      <div className="mt-3">
                        <div className="font-semibold">Components</div>
                        <div className="text-sm">
                          Has components:{" "}
                          {e.componentsValidation.hasComponents ? "Yes" : "No"}
                        </div>
                        {e.componentsValidation.files?.length > 0 && (
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
                                {e.componentsValidation.files.map((f) => {
                                  let parsed: ComponentFile | null = null;
                                  try {
                                    parsed = JSON.parse(f) as ComponentFile;
                                  } catch {
                                    // older string entry: show raw
                                  }
                                  const named = Array.isArray(
                                    parsed?.namedExports
                                  )
                                    ? parsed!.namedExports
                                    : [];
                                  const diags = Array.isArray(
                                    parsed?.diagnostics
                                  )
                                    ? parsed!.diagnostics
                                    : [];
                                  return (
                                    <tr key={f} className="border-t">
                                      <td className="py-2 align-top">
                                        {parsed?.path || f}
                                      </td>
                                      <td className="py-2 align-top">
                                        {parsed?.hasDefaultExport
                                          ? "Yes"
                                          : "No"}
                                      </td>
                                      <td className="py-2 align-top">
                                        {named.length > 0
                                          ? named.join(", ")
                                          : "—"}
                                      </td>
                                      <td className="py-2 align-top">
                                        {diags.length > 0 ? (
                                          <div>
                                            {(() => {
                                              const key = `${e.id}:${parsed?.path ?? f}`;
                                              const isExpanded =
                                                !!expandedRows[key];
                                              const maxPreview = 3;
                                              const preview = isExpanded
                                                ? diags
                                                : diags.slice(0, maxPreview);
                                              return (
                                                <div>
                                                  <ul className="list-disc pl-4">
                                                    {preview.map(
                                                      (
                                                        d: string,
                                                        i: number
                                                      ) => (
                                                        <li
                                                          key={i}
                                                          className="text-xs text-red-600"
                                                        >
                                                          {d}
                                                        </li>
                                                      )
                                                    )}
                                                  </ul>
                                                  {diags.length >
                                                    maxPreview && (
                                                    <button
                                                      type="button"
                                                      className="text-xs text-blue-600 hover:underline mt-1"
                                                      onClick={() =>
                                                        setExpandedRows(
                                                          (s) => ({
                                                            ...s,
                                                            [key]: !s[key],
                                                          })
                                                        )
                                                      }
                                                    >
                                                      {isExpanded
                                                        ? `Show less (${diags.length})`
                                                        : `Show ${diags.length - maxPreview} more`}
                                                    </button>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                          </div>
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
                    {e.assets.slice(0, 3).map((url) => (
                      <div
                        key={url}
                        className="w-full h-20 relative rounded overflow-hidden"
                      >
                        <Image
                          src={url}
                          alt="asset"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-danger"
                      onClick={() => setShowConfirmFor(e.id)}
                      disabled={deletingId === e.id}
                    >
                      {deletingId === e.id ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setCreatePRFor(e.id);
                        try {
                          const name = (
                            e.manifest as Record<string, unknown> | null
                          )?.name;
                          setPrSlug(
                            name && typeof name === "string"
                              ? String(name)
                                  .toLowerCase()
                                  .trim()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/^-+|-+$/g, "")
                              : "template"
                          );
                        } catch {
                          setPrSlug("template");
                        }
                      }}
                    >
                      Create PR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create PR modal for staging list rows */}
      <Modal
        isOpen={!!createPRFor}
        onClose={() => setCreatePRFor(null)}
        title="Create Pull Request from staging"
        description="Confirm slug and your email to create a PR"
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
            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={prAutoOpen}
                onChange={(e) => setPrAutoOpen(e.target.checked)}
              />
              <span className="text-sm">Open PR in new tab after creation</span>
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
              onClick={async () => {
                if (!createPRFor) return;
                if (!prSlug) {
                  toast.error("Please provide slug");
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
                      stagingId: createPRFor,
                      slug: prSlug,
                      adminEmail: prEmail,
                      dryRun: prDryRun,
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok) {
                    const errMsg = json?.error || JSON.stringify(json);
                    // surface GitHub detail messages if available
                    if (json?.details) {
                      try {
                        const d = JSON.stringify(json.details, null, 2);
                        console.error("PR creation details:", d);
                        toast.error(
                          String(json?.error || "Failed to create PR")
                        );
                        // also attach details in a log for admins
                        // optionally show small preview
                        console.info("GitHub details:", json.details);
                      } catch {}
                    }
                    throw new Error(errMsg);
                  }
                  if (prDryRun) {
                    setPrPlanned(json?.planned ?? json);
                    return;
                  }
                  if (json?.success && json.pr?.html_url) {
                    toast.success("PR created");
                    // optionally open PR in a new tab
                    if (prAutoOpen && typeof window !== "undefined") {
                      try {
                        window.open(json.pr.html_url, "_blank");
                      } catch {}
                    }
                    // navigate to PR status page
                    window.location.href = `/dashboard/admin/templates/pr/status?prUrl=${encodeURIComponent(
                      json.pr.html_url
                    )}`;
                  } else {
                    toast.success("PR request completed");
                  }
                } catch (err: unknown) {
                  console.error(err);
                  toast.error(
                    (err as Error)?.message ||
                      String(err) ||
                      "Failed to create PR"
                  );
                } finally {
                  setCreatingPR(false);
                  if (!prDryRun) setCreatePRFor(null);
                }
              }}
              disabled={creatingPR}
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
                setCreatePRFor(null);
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

      <ConfirmDeleteModal
        isOpen={!!showConfirmFor}
        onClose={() => setShowConfirmFor(null)}
        onConfirm={async () => {
          if (showConfirmFor) await handleDelete(showConfirmFor);
        }}
        title="Delete Staged Package"
        message="Are you sure you want to delete this staged package? This cannot be undone."
      />
    </div>
  );
}
