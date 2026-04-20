"use client";

import { useEffect, useState, useRef } from "react";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import { useTheme } from "@/contexts/ThemeContext";
import AdminUserAutocomplete from "@/components/admin/AdminUserAutocomplete";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/app/templates/elegance/hooks/use-toast";

type AuditEntry = {
  id: string;
  timestamp?: string;
  createdAt?: string;
  eventType?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  details?: Record<string, unknown>;
  userId?: string;
};

type AdminMeta = { email?: string; id?: string; role?: string };

function getAdminFromMeta(meta?: Record<string, unknown>): AdminMeta | undefined {
  if (!meta) return undefined;
  const admin = meta["admin"];
  if (admin && typeof admin === "object" && !Array.isArray(admin)) {
    const a = admin as Record<string, unknown>;
    const email = typeof a["email"] === "string" ? (a["email"] as string) : undefined;
    const id = typeof a["id"] === "string" ? (a["id"] as string) : undefined;
    const role = typeof a["role"] === "string" ? (a["role"] as string) : undefined;
    return { email, id, role };
  }
  return undefined;
}

function getPlanInfoFromMeta(meta?: Record<string, unknown>): {
  id?: string;
  name?: string;
} {
  if (!meta) return {};
  const planId = typeof meta["planId"] === "string" ? (meta["planId"] as string) : undefined;
  const plan_id = typeof meta["plan_id"] === "string" ? (meta["plan_id"] as string) : undefined;
  if (planId || plan_id) return { id: planId || plan_id };
  const plan = meta["plan"];
  if (plan && typeof plan === "object" && !Array.isArray(plan)) {
    const p = plan as Record<string, unknown>;
    const id = typeof p["id"] === "string" ? (p["id"] as string) : undefined;
    const name = typeof p["name"] === "string" ? (p["name"] as string) : undefined;
    return { id, name };
  }
  const name =
    typeof meta["planName"] === "string"
      ? (meta["planName"] as string)
      : typeof meta["name"] === "string"
        ? (meta["name"] as string)
        : undefined;
  return { id: undefined, name };
}

// Friendly labels for events/messages
function friendlyEventLabel(eventType?: string) {
  switch (String(eventType || "")) {
    case "ADMIN_ACTION":
      return "Admin action";
    case "LOGIN_SUCCESS":
      return "Login success";
    case "LOGIN_FAILURE":
      return "Login failure";
    default:
      return String(eventType || "Event");
  }
}

function Icon({ type }: { type: "create" | "update" | "delete" | "default" }) {
  if (type === "create") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline mr-1 text-green-600"
      >
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === "update") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline mr-1 text-blue-600"
      >
        <path
          d="M3 21v-4a4 4 0 0 1 4-4h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 7l7-3-3 7-7 3 3-7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === "delete") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline mr-1 text-red-600"
      >
        <path
          d="M3 6h18M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 11v6M14 11v6M9 6V4h6v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

function friendlyMessageLabel(msg: string | undefined) {
  if (!msg) return "-";
  // Map plan-related messages to readable text
  if (msg.startsWith("PLAN_CREATED")) return "Plan created";
  if (msg.startsWith("PLAN_UPDATED")) return "Plan updated";
  if (msg.startsWith("PLAN_DELETED")) return "Plan deleted";
  return msg;
}

function escapeHtml(input: string) {
  return input.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c
  );
}

function buildPrintableHtml(opts: {
  entries: AuditEntry[];
  filters?: { startDate?: string; endDate?: string; admin?: string };
}) {
  const { entries, filters } = opts;
  // Group by admin email (fallback to userId)
  const groups: Record<string, AuditEntry[]> = {};
  entries.forEach((e) => {
    const adminEmail = (e.metadata?.admin as AdminMeta | undefined)?.email;
    const key = adminEmail || e.userId || "Unknown";
    groups[key] = groups[key] || [];
    groups[key].push(e);
  });

  const header = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><img src="/logo.png" alt="Logo" style="height:48px"/><div><h1 style="margin:0">Audit Report</h1><div>Generated: ${escapeHtml(new Date().toLocaleString())}</div><div>Filters: ${escapeHtml(JSON.stringify(filters || {}))}</div></div></div>`;

  const body = Object.keys(groups)
    .map((admin) => {
      const rows = groups[admin]
        .map((s) => {
          const planName = (s.metadata?.planName as string) || (s.metadata?.planId as string) || "";
          return `<tr><td>${escapeHtml(String(s.id))}</td><td>${escapeHtml(new Date(s.timestamp || s.createdAt || Date.now()).toLocaleString())}</td><td>${escapeHtml(String(s.eventType || ""))}</td><td>${escapeHtml(String(s.message || ""))}</td><td>${escapeHtml(planName)}</td><td><pre style="white-space:pre-wrap">${escapeHtml(JSON.stringify(s.metadata || s.details || {}, null, 2))}</pre></td></tr>`;
        })
        .join("");
      return `<section style="margin-bottom:18px"><h2>Admin: ${escapeHtml(admin)} (${groups[admin].length} entries)</h2><table style="width:100%;border-collapse:collapse"><thead><tr><th style="border:1px solid #ddd;padding:6px">ID</th><th style="border:1px solid #ddd;padding:6px">Time</th><th style="border:1px solid #ddd;padding:6px">Event</th><th style="border:1px solid #ddd;padding:6px">Message</th><th style="border:1px solid #ddd;padding:6px">Plan</th><th style="border:1px solid #ddd;padding:6px">Details</th></tr></thead><tbody>${rows}</tbody></table></section>`;
    })
    .join("");

  const footer = `<footer style="margin-top:18px;border-top:1px solid #eee;padding-top:8px;font-size:0.9em;color:#666">Report generated by MyWeddingPage</footer>`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>Audit Report</title><style>body{font-family:Inter,system-ui,Segoe UI,Roboto,-apple-system,'Helvetica Neue',Arial;padding:12px}table th{background:#f7f7f7}</style></head><body>${header}${body}${footer}</body></html>`;
}

function MessageCell({ message }: { message?: string }) {
  const label = friendlyMessageLabel(message);
  let type: "create" | "update" | "delete" | "default" = "default";
  if (String(message || "").startsWith("PLAN_CREATED")) type = "create";
  if (String(message || "").startsWith("PLAN_UPDATED")) type = "update";
  if (String(message || "").startsWith("PLAN_DELETED")) type = "delete";
  return (
    <span>
      <Icon type={type} />
      {label}
    </span>
  );
}

function ChangeList({ items }: { items: [string, unknown][] }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const showToggle = items.length > limit;
  const toShow = expanded ? items : items.slice(0, limit);

  return (
    <div>
      <ul className="list-disc list-inside text-sm">
        {toShow.map(([k, v]) => (
          <li key={k}>
            <span className="font-medium">{k}:</span> {String(v)}
          </li>
        ))}
      </ul>
      {showToggle && (
        <button className="text-sm text-blue-600 mt-1" onClick={() => setExpanded((s) => !s)}>
          {expanded ? "Show less" : `Show ${items.length - limit} more`}
        </button>
      )}
    </div>
  );
}

function renderAuditDetails(metadata: Record<string, unknown> | undefined, logEntry: AuditEntry) {
  // Render admin info
  const admin = getAdminFromMeta(metadata);
  const planInfo = getPlanInfoFromMeta(metadata);
  const planId = planInfo.id;
  const planName = planInfo.name;
  const changes = metadata?.changes as Record<string, unknown> | undefined;

  return (
    <div>
      <div className="text-sm">
        <strong>Admin:</strong>{" "}
        {admin ? `${admin.email || admin.id} (${admin.role || "-"})` : logEntry.userId || "-"}
      </div>
      {planId && (
        <div className="text-sm">
          <strong>Plan:</strong> {planName ? `${planName} (${planId})` : planId}
        </div>
      )}

      {changes && typeof changes === "object" && (
        <div className="mt-2">
          <strong className="block">Changes:</strong>
          <ChangeList items={Object.entries(changes) as [string, unknown][]} />
        </div>
      )}

      {/* Raw JSON toggle */}
      <details className="mt-2">
        <summary className="text-sm text-muted-foreground">Show raw JSON</summary>
        <pre className="whitespace-pre-wrap text-xs mt-2 bg-gray-50 p-2 rounded">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function PlansAuditPage() {
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  // Persist selected entries across pages: map id -> entry
  const [selectedMap, setSelectedMap] = useState<Record<string, AuditEntry>>({});
  const [loading, setLoading] = useState(true);

  // Load persisted selection from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("audit:selectedMapPackage");
      if (raw) {
        const pkg = JSON.parse(raw) as {
          ts?: number;
          data?: Record<string, AuditEntry>;
          expiryMs?: number;
        };
        const { ts, data } = pkg || {};
        const now = Date.now();
        const expiryMs = pkg?.expiryMs || 7 * 24 * 60 * 60 * 1000; // default 7 days
        if (ts && now - ts < expiryMs) {
          setSelectedMap(data || {});
        } else {
          // expired
          localStorage.removeItem("audit:selectedMapPackage");
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist selection to localStorage whenever it changes
  useEffect(() => {
    try {
      const pkg = {
        ts: Date.now(),
        data: selectedMap,
        expiryMs: 7 * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem("audit:selectedMapPackage", JSON.stringify(pkg));
    } catch {
      // ignore quota errors
    }
  }, [selectedMap]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterUser, setFilterUser] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [, setPrevCursors] = useState<string[]>([]); // legacy stack (kept for compatibility)
  const [pageCursors, setPageCursors] = useState<Record<number, string | null>>({ 1: null });
  const pageCursorsRef = useRef<Record<number, string | null>>({ 1: null });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("eventType", "ADMIN_ACTION");
        params.set("messageContains", "PLAN_");
        params.set("limit", String(pageSize));
        // Use cursor stored for the current page if available (read from ref to avoid
        // triggering this effect when the cursors object identity changes)
        const cursorForPage = pageCursorsRef.current[page];
        if (cursorForPage) params.set("after", cursorForPage);
        if (filterUser) params.set("userId", filterUser);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const res = await fetch(`/api/admin/security-logs?${params.toString()}`, {
          credentials: "include",
        });
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          const items = j.logs || j.data || [];
          setLogs(items as AuditEntry[]);
          setTotalCount(j.totalCount || 0);
          setTotalPages(j.totalPages || 1);
          setNextCursor(j.nextCursor || null);

          // store cursor for the next page (so page+1 will use this cursor)
          setPageCursors((pc) => {
            const next = { ...pc, [page + 1]: j.nextCursor || null };
            pageCursorsRef.current = next;
            return next;
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
    // intentionally omit `pageCursors` to avoid re-running when its identity changes
  }, [page, pageSize, filterUser, startDate, endDate]);

  // keyboard navigation left/right for pages
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        if (page > 1) setPage((p) => p - 1);
      } else if (e.key === "ArrowRight") {
        if (page < totalPages && (pageCursors[page + 1] || nextCursor)) setPage((p) => p + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, totalPages, pageCursors, nextCursor]);

  // deep-link highlight: read ?highlight=<id>
  const searchParams = useSearchParams();
  const { toast } = useToast();
  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (!highlightId) return;
    // Wait for DOM update then scroll to element
    setTimeout(() => {
      const el = document.getElementById(`log-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring", "ring-2", "ring-blue-300");
        setTimeout(() => el.classList.remove("ring", "ring-2", "ring-blue-300"), 3000);
      }
    }, 250);
  }, [searchParams, logs]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5"
          onClick={() => {
            const selected = Object.values(selectedMap);
            if (selected.length === 0) {
              toast({
                title: "No selection",
                description: "Select some audit entries first",
              });
              return;
            }
            const html = buildPrintableHtml({
              entries: selected,
              filters: { startDate, endDate, admin: filterUser },
            });
            const win = window.open("", "_blank", "noopener,noreferrer");
            if (win) {
              win.document.write(html);
              win.document.close();
              win.focus();
            }
          }}
        >
          Print selected
        </button>

        <button
          className="btn btn-secondary bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 px-3 py-1 text-white border border-radius-md"
          onClick={() => {
            const selected = Object.values(selectedMap);
            if (selected.length === 0) {
              toast({
                title: "No selection",
                description: "Select some audit entries first",
              });
              return;
            }
            const dataStr = JSON.stringify(selected, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit-report-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
        >
          Download JSON
        </button>

        <button
          className="btn btn-secondary bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700 px-3 py-1 text-white border border-radius-md"
          onClick={() => {
            const selected = Object.values(selectedMap);
            if (selected.length === 0) {
              toast({
                title: "No selection",
                description: "Select some audit entries first",
              });
              return;
            }
            // Build CSV
            const header = [
              "id",
              "timestamp",
              "eventType",
              "message",
              "adminEmail",
              "planId",
              "planName",
              "detailsJson",
            ];
            const rows = (selected as AuditEntry[]).map((s) => [
              s.id,
              s.timestamp || s.createdAt || "",
              s.eventType || "",
              (s.message || "").replace(/\n/g, " "),
              (() => {
                const a = getAdminFromMeta(s.metadata as Record<string, unknown> | undefined);
                return a ? a.email || a.id || "" : "";
              })(),
              (s.metadata as Record<string, unknown> | undefined)?.planId ||
                (s.metadata as Record<string, unknown> | undefined)?.plan_id ||
                "",
              (s.metadata as Record<string, unknown> | undefined)?.planName ||
                (s.metadata as Record<string, unknown> | undefined)?.name ||
                "",
              JSON.stringify(s.metadata || s.details || {}),
            ]);
            const csv = [header, ...rows]
              .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
              .join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit-report-${new Date().toISOString()}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </button>
        <button
          className="btn btn-outline bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5"
          onClick={async () => {
            try {
              const res = await fetch("/api/admin/selection", {
                credentials: "include",
              });
              if (!res.ok) {
                toast({
                  title: "Load failed",
                  description: "Could not load server selection",
                });
                return;
              }
              const j = await res.json();
              const ids: string[] = j.ids || j.data || [];
              // Hydrate ids into selectedMap: use currently loaded logs when available to fill entries
              setSelectedMap((s) => {
                const next = { ...s };
                ids.forEach((id) => {
                  if (!next[id]) {
                    const found = logs.find((l) => l.id === id);
                    next[id] = found || { id };
                  }
                });
                return next;
              });
              toast({
                title: "Loaded",
                description: "Selection loaded from server",
              });
            } catch {
              toast({
                title: "Load failed",
                description: "Could not load server selection",
              });
            }
          }}
        >
          Load from server
        </button>
        <button
          className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5"
          onClick={async () => {
            try {
              const ids = Object.keys(selectedMap);
              const payload = { ids };
              const res = await fetch("/api/admin/selection", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (!res.ok) {
                toast({
                  title: "Save failed",
                  description: "Could not save selection to server",
                });
                return;
              }
              toast({
                title: "Saved",
                description: "Selection saved to server",
              });
            } catch {
              toast({
                title: "Save failed",
                description: "Could not save selection to server",
              });
            }
          }}
        >
          Save to server
        </button>
        <button
          className="btn btn-danger bg-red-600 hover:bg-red-700 text-white px-3 py-1.5"
          onClick={() => {
            setSelectedMap({});
            try {
              localStorage.removeItem("audit:selectedMapPackage");
            } catch {}
            toast({ title: "Selection cleared" });
          }}
        >
          Clear selection
        </button>
      </div>
      <div>
        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Plans Audit
        </h1>
        <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Administrative audit events for plan actions
        </p>
      </div>

      <div className="rounded border bg-white p-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Page size</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(1);
            }}
            className="input w-full"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Admin (filter)</label>
          <AdminUserAutocomplete value={filterUser} onChange={(v) => setFilterUser(v)} />
        </div>

        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Start</label>
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value || undefined)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End</label>
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => setEndDate(e.target.value || undefined)}
              className="input"
            />
          </div>
          <div className="self-end">
            <button
              className="btn"
              onClick={() => {
                setPage(1);
                setPrevCursors([]);
                setNextCursor(null);
                setPageCursors({ 1: null });
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 w-6">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      const next: Record<string, AuditEntry> = {
                        ...selectedMap,
                      };
                      logs.forEach((l) => (next[l.id] = l));
                      setSelectedMap(next);
                    } else {
                      // remove current page ids
                      const next: Record<string, AuditEntry> = {
                        ...selectedMap,
                      };
                      logs.forEach((l) => delete next[l.id]);
                      setSelectedMap(next);
                    }
                  }}
                />
              </th>
              <th className="text-left py-2">Event</th>
              <th className="text-left py-2">Message</th>
              <th className="text-left py-2">User</th>
              <th className="text-left py-2">Time</th>
              <th className="text-left py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5}>No plan audit events found.</td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr id={`log-${l.id}`} key={l.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 align-top">
                    <input
                      type="checkbox"
                      checked={!!selectedMap[l.id]}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedMap((s) => {
                          const next = { ...s };
                          if (checked) next[l.id] = l;
                          else delete next[l.id];
                          return next;
                        });
                      }}
                    />
                  </td>
                  <td className="py-2 align-top">{friendlyEventLabel(l.eventType)}</td>
                  <td className="py-2 align-top">
                    <MessageCell message={l.message} />
                  </td>
                  <td className="py-2 align-top">
                    {(() => {
                      const admin = (l.metadata as Record<string, unknown> | undefined)?.admin as
                        | AdminMeta
                        | undefined;
                      return (admin && (admin.email || admin.id)) || l.userId || "-";
                    })()}
                  </td>
                  <td className="py-2 align-top">
                    {new Date(l.timestamp || l.createdAt || Date.now()).toLocaleString()}
                  </td>
                  <td className="py-2 align-top">
                    <details>
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        Show details
                      </summary>
                      <div className="mt-2 space-y-2">
                        {renderAuditDetails(l.metadata || l.details || {}, l)}
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm"
                            onClick={async () => {
                              try {
                                const url = new URL(window.location.href);
                                url.searchParams.set("highlight", l.id);
                                await navigator.clipboard.writeText(url.toString());
                                toast({
                                  title: "Link copied",
                                  description: "Deep link copied to clipboard",
                                });
                              } catch {
                                toast({
                                  title: "Copy failed",
                                  description: "Could not copy link",
                                });
                              }
                            }}
                          >
                            Copy link
                          </button>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            if (page <= 1) return;
            const prevCursor = pageCursors[page - 1] || null;
            setNextCursor(prevCursor);
            setPage((p) => p - 1);
          }}
          disabled={page <= 1 || loading}
        >
          Previous
        </button>
        <button
          className="btn"
          onClick={() => {
            const curNext = pageCursors[page + 1] || nextCursor;
            if (!curNext) return;
            // ensure the cursor for page+1 is set (it was stored when page was loaded)
            setPage((p) => p + 1);
            setNextCursor(curNext);
          }}
          disabled={!(pageCursors[page + 1] || nextCursor) || loading}
        >
          Next
        </button>
        <div className="ml-4">
          Page {page} of {totalPages} ({totalCount} items)
        </div>
        <div className="ml-auto">
          <label className="text-sm mr-2">Go to (page)</label>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={page}
            onChange={(e) =>
              setPage(Math.min(Math.max(1, parseInt(e.target.value || "1", 10)), totalPages))
            }
            className="input w-20"
          />
        </div>
      </div>
    </div>
  );
}
