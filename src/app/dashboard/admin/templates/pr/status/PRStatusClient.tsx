"use client";

import React, { useEffect, useState } from "react";

type Check = {
  conclusion?: string | null;
  status?: string | null;
  app?: { name?: string } | null;
  name?: string | null;
  [key: string]: unknown;
};

type PRStatusInfo = {
  pr?: {
    merged?: boolean;
    merged_at?: string | null;
    state?: string;
    mergeable?: string | null;
    html_url?: string;
  };
  checks?: Check[];
  [key: string]: unknown;
};

function CheckRow({ c }: { c: Check }) {
  const conclusion = (c?.conclusion ?? c?.status ?? "unknown") as string;
  // mapping to color
  const mapColor = (s: string) => {
    const lower = String(s).toLowerCase();
    if (lower === "success" || lower === "completed" || lower === "passed")
      return "text-green-600";
    if (lower === "failure" || lower === "failed" || lower === "cancelled")
      return "text-red-600";
    if (lower === "in_progress" || lower === "pending" || lower === "queued")
      return "text-yellow-600";
    return "text-gray-500";
  };

  const colorClass = mapColor(conclusion);

  return (
    <div className="flex items-center justify-between border-b py-2 px-3">
      <div className="flex items-center gap-3">
        <div className={`${colorClass} w-3 h-3 rounded-full`} aria-hidden />
        <div>
          <div className="font-medium">
            {c?.app?.name || c?.name || "check"}
          </div>
          <div className="text-xs text-slate-500">
            Status: {String(c?.status)}
          </div>
        </div>
      </div>
      <div className={`text-sm ${colorClass}`}>{String(conclusion)}</div>
    </div>
  );
}

export default function PRStatusClient({ prUrl }: { prUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<PRStatusInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    if (!prUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/templates/pr/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || JSON.stringify(json));
      setInfo(json);
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error)?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!prUrl) return;
    fetchStatus();
    const iv = setInterval(fetchStatus, 10000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prUrl]);

  return (
    <div>
      {info?.pr &&
        (info.pr.merged ? (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border">
            This PR has been merged at {info.pr.merged_at}
          </div>
        ) : info.pr.state === "closed" ? (
          <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 border">
            This PR is closed (not merged)
          </div>
        ) : null)}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Summary</h2>
        <div className="flex items-center gap-2 mt-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => fetchStatus()}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          {info?.pr?.html_url && (
            <a
              className="btn btn-sm"
              href={info.pr.html_url}
              target="_blank"
              rel="noreferrer"
            >
              Open PR
            </a>
          )}
        </div>
        {loading && <div className="text-sm text-slate-500">Refreshing...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {info?.pr && (
          <div className="mt-2">
            <div>
              State: <strong>{String(info.pr.state)}</strong>
            </div>
            <div>
              Mergeable: <strong>{String(info.pr.mergeable)}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Checks</h2>
        {info?.checks?.length ? (
          <div className="mt-2 border rounded bg-white">
            {info.checks.map((c: Check, i: number) => (
              <CheckRow key={i} c={c} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 mt-2">
            No checks found yet.
          </div>
        )}
      </div>
    </div>
  );
}
