"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Link from "next/link";

type Row = {
  id: string;
  publicId: string;
  resourceType: string | null;
  source: string | null;
  templateId: string | null;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
};

export default function RemoteMediaGCPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState<number>(1);
  const [take, setTake] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [qterm, setQterm] = useState<string>("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalText, setErrorModalText] = useState<string | null>(null);
  // counts summary
  const [countsLoading, setCountsLoading] = useState(false);
  const [counts, setCounts] = useState<{
    bySource: Array<{ source: string; count: number }>;
    byTemplate: Array<{
      templateId: string | null;
      label: string;
      count: number;
    }>;
  } | null>(null);

  const loadCounts = async () => {
    setCountsLoading(true);
    try {
      const res = await fetch(`/api/admin/remote-media-gc/counts`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("counts fetch failed");
      const json = await res.json();
      setCounts(json);
    } catch (err) {
      console.error("Failed to load counts", err);
    } finally {
      setCountsLoading(false);
    }
  };

  const load = useCallback(
    async (p: number = page, t: number = take) => {
      try {
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("take", String(t));
        if (statusFilter) params.set("status", statusFilter);
        if (qterm) params.set("q", qterm);

        const res = await fetch(
          `/api/admin/remote-media-gc?${params.toString()}`,
          {
            credentials: "include",
          }
        );
        const json = await res.json();
        setRows(json.rows || []);
        setTotal(json.total || 0);
        setPage(json.page || p);
        setTake(json.take || t);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load records");
      }
    },
    [statusFilter, qterm, page, take]
  );

  useEffect(() => {
    load();
    loadCounts();
  }, [load]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const retryIds = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      ids.forEach((id) => setLoadingIds((s) => ({ ...s, [id]: true })));
      const res = await fetch(`/api/admin/remote-media-gc`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (json.results) {
        const okCount = (json.results as Array<{ ok: boolean }>).filter(
          (r) => r.ok
        ).length;
        toast.success(`Retried ${okCount}/${ids.length}`);
      } else {
        toast.error("Retry failed");
      }
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Retry failed");
    } finally {
      ids.forEach((id) => setLoadingIds((s) => ({ ...s, [id]: false })));
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Remote Media GC</h1>
          <p className="text-sm text-gray-500 mt-1">
            Background GC and retry status for remote images
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            className="input"
            placeholder="Search publicId or source"
            value={qterm}
            onChange={(e) => setQterm(e.target.value)}
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">pending</option>
            <option value="failed">failed</option>
            <option value="success">success</option>
          </select>
          <button
            className="btn"
            onClick={() => {
              setPage(1);
              load(1, take);
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* counts summary */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border p-3">
          <div className="font-medium">By Source</div>
          {countsLoading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : (
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              {(counts?.bySource || []).map((s) => (
                <div key={s.source} className="flex justify-between">
                  <div className="truncate">{s.source}</div>
                  <div className="font-semibold">{s.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded border p-3 md:col-span-2">
          <div className="font-medium">Top Templates</div>
          {countsLoading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {(counts?.byTemplate || []).map((t) => (
                <div
                  key={String(t.templateId)}
                  className="flex justify-between"
                >
                  <div className="truncate pr-2">{t.label}</div>
                  <div className="font-semibold">{t.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mb-3 flex gap-2">
        <button
          className="btn"
          onClick={() =>
            retryIds(Object.keys(selected).filter((id) => selected[id]))
          }
          disabled={!Object.values(selected).some(Boolean)}
        >
          Retry selected
        </button>
        <button className="btn" onClick={() => retryIds(rows.map((r) => r.id))}>
          Retry all
        </button>
        <button className="btn" onClick={() => load(page, take)}>
          Refresh
        </button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">Select</th>
              <th className="p-2">PublicId</th>
              <th className="p-2">Source</th>
              <th className="p-2">Template</th>
              <th className="p-2">Status</th>
              <th className="p-2">Attempts</th>
              <th className="p-2">Last Error</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={() => toggle(r.id)}
                  />
                </td>
                <td className="p-2 monospace break-words max-w-xs">
                  {r.publicId}
                </td>
                <td className="p-2">{r.source || "-"}</td>
                <td className="p-2">
                  {r.templateId ? (
                    <Link
                      className="text-blue-600 underline"
                      href={`/dashboard/admin/templates/${r.templateId}`}
                    >
                      {r.templateId}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{r.attempts}</td>
                <td className="p-2 break-words max-w-sm">
                  {r.lastError ? (
                    <button
                      className="text-sm text-red-600 underline"
                      onClick={() => {
                        setErrorModalText(r.lastError);
                        setErrorModalOpen(true);
                      }}
                    >
                      View error
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="p-2">
                  <button
                    className="btn"
                    onClick={() => retryIds([r.id])}
                    disabled={!!loadingIds[r.id]}
                  >
                    {loadingIds[r.id] ? "Retrying..." : "Retry"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          <span className="text-sm text-gray-600">
            Showing {(page - 1) * take + 1} - {Math.min(page * take, total)} of{" "}
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn"
            onClick={() => {
              if (page > 1) {
                setPage(page - 1);
                load(page - 1, take);
              }
            }}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="btn"
            onClick={() => {
              if (page * take < total) {
                setPage(page + 1);
                load(page + 1, take);
              }
            }}
            disabled={page * take >= total}
          >
            Next
          </button>
          <select
            className="input"
            value={take}
            onChange={(e) => {
              const v = Number(e.target.value);
              setTake(v);
              setPage(1);
              load(1, v);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <Modal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Last error"
      >
        <pre className="whitespace-pre-wrap text-sm text-red-700">
          {errorModalText}
        </pre>
      </Modal>
    </div>
  );
}
