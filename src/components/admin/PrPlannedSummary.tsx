"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

type Planned = {
  branchName?: string;
  refName?: string;
  registryPath?: string;
  updatedRegistryContent?: string;
  plannedTreeEntries?: Array<{ path: string; mode?: string; type?: string }>;
  commitMessage?: string;
  prTitle?: string;
  prBody?: string;
  [key: string]: unknown;
};
type TreeEntry = { path: string; mode?: string; type?: string };

export default function PrPlannedSummary({ planned }: { planned: Planned | null | undefined }) {
  const [showFullRegistry, setShowFullRegistry] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const rawRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (showRaw) {
      // focus the raw JSON region for keyboard users and announce to screen readers
      setTimeout(() => {
        try {
          rawRef.current?.focus();
        } catch {}
      }, 0);
    }
  }, [showRaw]);

  if (!planned) return null;

  const entries: TreeEntry[] = Array.isArray(planned.plannedTreeEntries)
    ? (planned.plannedTreeEntries as TreeEntry[])
    : [];
  const changedFiles = entries.map((e) => String(e.path));

  async function copyToClipboard(text: string, label = "copied") {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success(`${label} to clipboard`);
    } catch (e) {
      console.error("copy failed", e);
      toast.error("Copy failed");
    }
  }

  return (
    <div className="p-3 bg-white border rounded max-h-96 overflow-auto text-sm space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-700">Planned branch</div>
          <div className="font-mono text-xs text-slate-900">
            {planned.branchName || planned.refName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-700">Files</div>
          <div className="font-medium">{changedFiles.length}</div>
        </div>
      </div>

      {planned.prTitle && (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-700">PR title</div>
              <div className="font-medium">{planned.prTitle}</div>
            </div>
            <div>
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline ml-4"
                onClick={() => copyToClipboard(String(planned.prTitle || ""), "PR title")}
                aria-label="Copy PR title to clipboard"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {planned.commitMessage && (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-700">Commit message</div>
              <div className="text-xs font-mono text-slate-800">{planned.commitMessage}</div>
            </div>
            <div>
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline ml-4"
                onClick={() =>
                  copyToClipboard(String(planned.commitMessage || ""), "Commit message")
                }
                aria-label="Copy commit message to clipboard"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {planned.registryPath && (
        <div>
          <div className="text-sm text-slate-700">Registry file</div>
          <div className="font-mono text-xs">{planned.registryPath}</div>
          {planned.updatedRegistryContent && (
            <div className="mt-2">
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                onClick={() => setShowFullRegistry((s) => !s)}
              >
                {showFullRegistry ? "Hide registry patch" : "Show registry patch"}
              </button>
              <button
                type="button"
                className="text-xs text-slate-500 ml-3"
                onClick={() => setShowRaw((s) => !s)}
                aria-label={showRaw ? "Hide raw planned JSON" : "Show raw planned JSON"}
              >
                {showRaw ? "Hide raw JSON" : "Show raw JSON"}
              </button>
              <button
                type="button"
                className="text-xs text-slate-600 ml-3"
                onClick={() => {
                  try {
                    const dataStr = JSON.stringify(planned, null, 2);
                    const blob = new Blob([dataStr], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${String(planned.branchName || "planned").replace(/[^a-z0-9-_]/gi, "_")}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    console.error("download failed", e);
                    toast.error("Download failed");
                  }
                }}
                aria-label="Download raw planned JSON"
              >
                Download JSON
              </button>
              {showFullRegistry ? (
                <pre className="mt-2 p-2 bg-gray-50 border rounded text-xs overflow-auto whitespace-pre-wrap">
                  {planned.updatedRegistryContent}
                </pre>
              ) : (
                <div className="mt-2 text-xs text-slate-600">
                  {String(planned.updatedRegistryContent || "").slice(0, 300)}
                  {String(planned.updatedRegistryContent || "").length > 300 ? "..." : ""}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="text-sm text-slate-700">Planned tree entries</div>
        {changedFiles.length === 0 ? (
          <div className="text-xs text-green-700">No file-level changes planned</div>
        ) : (
          <ul className="mt-2 list-disc pl-5 text-xs">
            {changedFiles.map((p: string) => (
              <li key={p} className="break-all">
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {planned.prBody && (
        <div>
          <div className="text-sm text-slate-700">PR body</div>
          <div className="text-xs whitespace-pre-wrap mt-1 text-slate-800">{planned.prBody}</div>
        </div>
      )}

      {showRaw && (
        <div
          className="mt-3 p-2 bg-gray-100 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          role="region"
          aria-live="polite"
          aria-label="Raw planned JSON"
          tabIndex={-1}
          ref={rawRef}
        >
          <div className="font-medium mb-1">Raw planned JSON</div>
          <pre className="whitespace-pre-wrap max-h-64 overflow-auto">
            {JSON.stringify(planned, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
