"use client";

import React from "react";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/app/templates/elegance/hooks/use-toast";
import Modal from "@/components/ui/Modal";

export default function TemplatesAuditPage() {
  const { isDarkMode } = useTheme();
  type AuditEvent = {
    ts: string | number;
    action?: string;
    stagingId?: string;
    staging?: string;
    [k: string]: unknown;
  };
  const [events, setEvents] = React.useState<AuditEvent[] | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);
  const [total, setTotal] = React.useState(0);
  const [filterAction, setFilterAction] = React.useState<string | undefined>(
    undefined
  );
  const [filterActionsMulti, setFilterActionsMulti] = React.useState<string[]>(
    []
  );
  const [filterStaging, setFilterStaging] = React.useState<string | undefined>(
    undefined
  );
  const [dateFrom, setDateFrom] = React.useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<string | undefined>(undefined);
  const toasts = useToast();
  // store toast handle as unknown and narrow before use to avoid coupling to toast impl types
  const searchToastRef = React.useRef<unknown>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [lastApplied, setLastApplied] = React.useState({
    action: undefined as string | undefined,
    actions: undefined as string[] | undefined,
    staging: undefined as string | undefined,
    dateFrom: undefined as string | undefined,
    dateTo: undefined as string | undefined,
  });
  const [availableActions, setAvailableActions] = React.useState<
    Array<{ action: string; count: number }>
  >([]);
  const [selectedActionCounts, setSelectedActionCounts] = React.useState(0);
  const [savedFilters, setSavedFilters] = React.useState<
    Array<{
      name: string;
      action?: string;
      actions?: string[];
      staging?: string;
      dateFrom?: string;
      dateTo?: string;
    }>
  >([]);
  const [showActionsModal, setShowActionsModal] = React.useState(false);
  const [actionsModalSelection, setActionsModalSelection] = React.useState<
    string[]
  >([]);
  const actionsApplyRef = React.useRef<HTMLButtonElement | null>(null);
  const actionsToggleRef = React.useRef<HTMLButtonElement | null>(null);
  const [showSaveFilterModal, setShowSaveFilterModal] = React.useState(false);
  const [saveFilterName, setSaveFilterName] = React.useState("");
  const [exportFormat, setExportFormat] = React.useState<"json" | "csv">(
    "json"
  );
  const [showDeleteSavedFilterModal, setShowDeleteSavedFilterModal] =
    React.useState<{
      name: string;
    } | null>(null);
  const [selectedSavedFilterJson, setSelectedSavedFilterJson] =
    React.useState<string>("");
  type VisibleColumns = {
    time: boolean;
    action: boolean;
    staging: boolean;
    details: boolean;
  };
  const [visibleColumns, setVisibleColumns] = React.useState<VisibleColumns>(
    () => {
      try {
        const raw = localStorage.getItem("audit.visibleColumns");
        if (raw) return JSON.parse(raw) as VisibleColumns;
      } catch {}
      return { time: true, action: true, staging: true, details: true };
    }
  );

  React.useEffect(() => {
    try {
      localStorage.setItem(
        "audit.visibleColumns",
        JSON.stringify(visibleColumns)
      );
    } catch {}
  }, [visibleColumns]);

  // load available actions for dropdown
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/audit/actions");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setAvailableActions(json.actions || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // load saved filters from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("audit.savedFilters");
      if (raw) setSavedFilters(JSON.parse(raw));
    } catch {}
  }, []);

  // update selected action counts when availableActions or selected multi change
  React.useEffect(() => {
    const sel = new Set(
      filterActionsMulti.length
        ? filterActionsMulti
        : filterAction
          ? [filterAction]
          : []
    );
    const count = availableActions.reduce(
      (acc, a) => (sel.has(a.action) ? acc + (a.count || 0) : acc),
      0
    );
    setSelectedActionCounts(count);
  }, [availableActions, filterActionsMulti, filterAction]);

  // when the actions popover opens, focus the Apply button for keyboard users
  React.useEffect(() => {
    if (showActionsModal) {
      setTimeout(() => {
        try {
          actionsApplyRef.current?.focus();
        } catch {}
      }, 50);
    }
  }, [showActionsModal]);

  // initialize filters from URL (support comma-separated multi actions)
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const aRaw = url.searchParams.get("action") || undefined;
      const s = url.searchParams.get("stagingId") || undefined;
      const df = url.searchParams.get("dateFrom") || undefined;
      const dt = url.searchParams.get("dateTo") || undefined;
      const p = Number(url.searchParams.get("page") || "1");
      const ps = Number(url.searchParams.get("pageSize") || "50");
      if (aRaw) {
        if (aRaw.includes(",")) {
          const parts = aRaw
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
          setFilterActionsMulti(parts);
        } else {
          setFilterAction(aRaw);
        }
      }
      setFilterStaging(s);
      setDateFrom(df);
      setDateTo(dt);
      setPage(p);
      setPageSize(ps);
      setLastApplied({
        action: aRaw && !aRaw.includes(",") ? aRaw : undefined,
        actions:
          aRaw && aRaw.includes(",")
            ? aRaw
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            : undefined,
        staging: s,
        dateFrom: df,
        dateTo: dt,
      });
    } catch {
      // ignore
    }
  }, []);

  const load = React.useCallback(async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (filterActionsMulti.length)
        params.set("action", filterActionsMulti.join(","));
      else if (filterAction) params.set("action", filterAction);
      if (filterStaging) params.set("stagingId", filterStaging);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/admin/audit/recent?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setEvents([]);
        setTotal(0);
        setIsSearching(false);
        return;
      }
      const json = await res.json();
      setEvents(json.events || []);
      setTotal(Number(json.total || 0));
    } catch (e) {
      console.error(e);
      setEvents([]);
      setTotal(0);
    } finally {
      setIsSearching(false);
      if (searchToastRef.current) {
        try {
          const cur = searchToastRef.current as {
            id?: string;
            update?: (p: unknown) => void;
            dismiss?: () => void;
          } | null;
          if (cur && typeof cur.update === "function") {
            try {
              cur.update({ id: cur.id, title: "Search complete" });
            } catch {}
          }
          setTimeout(() => {
            try {
              if (cur && typeof cur.dismiss === "function") cur.dismiss();
            } catch {}
          }, 1000);
        } catch {}
        searchToastRef.current = null;
      }
    }
  }, [
    page,
    pageSize,
    filterAction,
    filterStaging,
    dateFrom,
    dateTo,
    filterActionsMulti,
  ]);

  // initial load
  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounced reload on filter/pagination change
  React.useEffect(() => {
    const t = setTimeout(() => {
      load();
      try {
        const params = new URLSearchParams();
        if (filterActionsMulti.length)
          params.set("action", filterActionsMulti.join(","));
        else if (filterAction) params.set("action", filterAction as string);
        if (filterStaging) params.set("stagingId", filterStaging as string);
        if (dateFrom) params.set("dateFrom", dateFrom as string);
        if (dateTo) params.set("dateTo", dateTo as string);
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        const url = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", url);
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [
    page,
    pageSize,
    filterAction,
    filterStaging,
    dateFrom,
    dateTo,
    filterActionsMulti,
    load,
  ]);

  if (events === null) return <PageSkeleton />;

  return (
    <>
      <div>
        <h1
          className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Templates Audit
        </h1>
        <p
          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Recent template import and audit events.
        </p>
      </div>

      <div
        className={`rounded-xl border p-4 ${isDarkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white"}`}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs">Action:</label>
            <div className="relative">
              <button
                ref={actionsToggleRef}
                type="button"
                className="rounded border px-2 py-1 text-sm"
                onClick={() => {
                  setActionsModalSelection(
                    filterActionsMulti.length
                      ? filterActionsMulti
                      : filterAction
                        ? [filterAction]
                        : []
                  );
                  setShowActionsModal((s) => !s);
                }}
                aria-expanded={showActionsModal}
                aria-haspopup="true"
              >
                {filterActionsMulti.length > 0
                  ? `${filterActionsMulti.length} selected`
                  : filterAction
                    ? filterAction
                    : "(any)"}
              </button>

              {showActionsModal && (
                <div className="absolute z-40 mt-2 right-0 w-80 p-3 rounded border bg-white shadow-lg dark:bg-gray-800">
                  <div className="text-sm mb-2">
                    Choose one or more actions to filter by. Counts are shown to
                    help guide selection.
                  </div>
                  {availableActions.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No actions available yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto">
                      {availableActions.map((a) => (
                        <label
                          key={a.action}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={actionsModalSelection.includes(a.action)}
                            onChange={(e) => {
                              setActionsModalSelection((s) => {
                                if (e.target.checked) return [...s, a.action];
                                return s.filter((x) => x !== a.action);
                              });
                            }}
                          />
                          <span className="text-sm">
                            {a.action}{" "}
                            <span className="text-xs text-gray-500">
                              ({a.count})
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      className="btn btn-outline"
                      onClick={() => setShowActionsModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      ref={actionsApplyRef}
                      className="btn btn-primary"
                      onClick={() => {
                        setFilterActionsMulti(actionsModalSelection);
                        setFilterAction(undefined);
                        setShowActionsModal(false);
                        // focus the toggle button again
                        try {
                          actionsToggleRef.current?.focus();
                        } catch {}
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {selectedActionCounts > 0 ? `${selectedActionCounts} events` : ""}
            </div>
          </div>
          <label className="text-xs">From</label>
          <input
            type="date"
            value={dateFrom || ""}
            onChange={(e) => setDateFrom(e.target.value || undefined)}
            className="rounded border px-2 py-1 text-sm"
          />
          <label className="text-xs">To</label>
          <input
            type="date"
            value={dateTo || ""}
            onChange={(e) => setDateTo(e.target.value || undefined)}
            className="rounded border px-2 py-1 text-sm"
          />
          <label className="text-xs">Staging ID:</label>
          <input
            className="rounded border px-2 py-1 text-sm"
            placeholder="partial or full staging id"
            value={filterStaging || ""}
            onChange={(e) => setFilterStaging(e.target.value || undefined)}
          />
          <div className="ml-2 flex items-center gap-2">
            <button
              className="rounded border px-2 py-1 text-sm"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                from.setDate(to.getDate() - 6);
                setDateFrom(from.toISOString().slice(0, 10));
                setDateTo(to.toISOString().slice(0, 10));
              }}
            >
              Last 7d
            </button>
            <button
              className="rounded border px-2 py-1 text-sm"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                from.setDate(to.getDate() - 29);
                setDateFrom(from.toISOString().slice(0, 10));
                setDateTo(to.toISOString().slice(0, 10));
              }}
            >
              Last 30d
            </button>
            <button
              className="rounded border px-2 py-1 text-sm"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                from.setDate(to.getDate() - 89);
                setDateFrom(from.toISOString().slice(0, 10));
                setDateTo(to.toISOString().slice(0, 10));
              }}
            >
              Last 90d
            </button>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <label className="text-xs">Columns:</label>
            {Object.keys(visibleColumns).map((k) => {
              const key = k as keyof VisibleColumns;
              return (
                <label
                  key={key as string}
                  className="text-xs flex items-center gap-1"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[key]}
                    onChange={(e) =>
                      setVisibleColumns((v) => ({
                        ...v,
                        [key]: e.target.checked,
                      }))
                    }
                  />{" "}
                  {key}
                </label>
              );
            })}
          </div>
          <div className="ml-2 flex items-center gap-2">
            <button
              disabled={
                lastApplied.action === filterAction &&
                JSON.stringify(lastApplied.actions || []) ===
                  JSON.stringify(filterActionsMulti || []) &&
                lastApplied.staging === filterStaging &&
                lastApplied.dateFrom === dateFrom &&
                lastApplied.dateTo === dateTo
              }
              className={`ml-2 rounded px-3 py-1 text-sm text-white ${
                lastApplied.action === filterAction &&
                lastApplied.staging === filterStaging &&
                lastApplied.dateFrom === dateFrom &&
                lastApplied.dateTo === dateTo
                  ? "bg-gray-400"
                  : "bg-[#ab862b]"
              }`}
              onClick={() => {
                setPage(1);
                setLastApplied({
                  action: filterAction,
                  actions: filterActionsMulti.length
                    ? filterActionsMulti
                    : undefined,
                  staging: filterStaging,
                  dateFrom,
                  dateTo,
                });
                // show searching toast
                searchToastRef.current = toasts.toast({
                  title: "Searching...",
                });
                load();
                // persist to URL
                try {
                  const params = new URLSearchParams();
                  if (filterAction)
                    params.set("action", filterAction as string);
                  if (filterStaging)
                    params.set("stagingId", filterStaging as string);
                  if (dateFrom) params.set("dateFrom", dateFrom as string);
                  if (dateTo) params.set("dateTo", dateTo as string);
                  params.set("page", "1");
                  params.set("pageSize", String(pageSize));
                  const url = `${window.location.pathname}?${params.toString()}`;
                  window.history.replaceState({}, "", url);
                } catch {}
              }}
            >
              {isSearching ? "Searching..." : "Apply"}
            </button>
            <div className="relative flex items-center gap-2">
              <select
                className="rounded border px-2 py-1 text-sm"
                value={exportFormat}
                onChange={(e) =>
                  setExportFormat(e.target.value as "json" | "csv")
                }
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <button
                className="ml-2 rounded border px-3 py-1 text-sm"
                onClick={async () => {
                  try {
                    const params = new URLSearchParams();
                    // prefer multi actions
                    if (filterActionsMulti.length)
                      params.set("action", filterActionsMulti.join(","));
                    else if (filterAction) params.set("action", filterAction);
                    if (filterStaging) params.set("stagingId", filterStaging);
                    if (dateFrom) params.set("dateFrom", dateFrom);
                    if (dateTo) params.set("dateTo", dateTo);
                    const res = await fetch(
                      `/api/admin/audit/recent?${params.toString()}&page=1&pageSize=10000`,
                      { credentials: "include" }
                    );
                    if (!res.ok) {
                      toasts.toast({ title: "Export failed" });
                      return;
                    }
                    const json = await res.json();
                    const eventsToExport = json.events || [];
                    if (exportFormat === "csv") {
                      // build CSV from visible columns
                      const cols: Array<{ key: string; header: string }> = [];
                      if (visibleColumns.time)
                        cols.push({ key: "ts", header: "Time" });
                      if (visibleColumns.action)
                        cols.push({ key: "action", header: "Action" });
                      if (visibleColumns.staging)
                        cols.push({ key: "stagingId", header: "Staging ID" });
                      if (visibleColumns.details)
                        cols.push({ key: "details", header: "Details" });
                      const rows = [
                        cols
                          .map((c) => `"${c.header.replace(/"/g, '""')}"`)
                          .join(","),
                      ];
                      for (const ev of eventsToExport as AuditEvent[]) {
                        const cells = cols.map((c) => {
                          if (c.key === "details")
                            return `"${JSON.stringify(ev).replace(/"/g, '""')}"`;
                          const v = (ev as Record<string, unknown>)[c.key];
                          return `"${String(v ?? "").replace(/"/g, '""')}"`;
                        });
                        rows.push(cells.join(","));
                      }
                      const blob = new Blob([rows.join("\n")], {
                        type: "text/csv",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `audit-export-${new Date().toISOString()}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    } else {
                      // JSON export: only include visible columns per event
                      const reduced = (eventsToExport as AuditEvent[]).map(
                        (ev) => {
                          const out: Record<string, unknown> = {};
                          if (visibleColumns.time) out.ts = ev.ts;
                          if (visibleColumns.action) out.action = ev.action;
                          if (visibleColumns.staging)
                            out.stagingId = ev.stagingId || ev.staging;
                          if (visibleColumns.details) out.details = ev;
                          return out;
                        }
                      );
                      const blob = new Blob(
                        [JSON.stringify(reduced, null, 2)],
                        {
                          type: "application/json",
                        }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `audit-export-${new Date().toISOString()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    }
                  } catch (err) {
                    console.error(err);
                    toasts.toast({ title: "Export failed" });
                  }
                }}
              >
                Export
              </button>
            </div>
          </div>
          {/* Saved filters UI */}
          <div className="ml-4 flex items-center gap-2">
            <button
              className="rounded border px-2 py-1 text-sm"
              onClick={() => {
                setSaveFilterName("");
                setShowSaveFilterModal(true);
              }}
            >
              Save filter
            </button>
            <div className="flex items-center gap-1">
              <label className="text-xs">Saved:</label>
              <select
                className="rounded border px-2 py-1 text-sm"
                value={selectedSavedFilterJson || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedSavedFilterJson(v);
                  if (!v) return;
                  try {
                    const obj = JSON.parse(v);
                    setFilterAction(obj.action);
                    setFilterActionsMulti(obj.actions || []);
                    setFilterStaging(obj.staging);
                    setDateFrom(obj.dateFrom);
                    setDateTo(obj.dateTo);
                  } catch {}
                }}
              >
                <option value="">(none)</option>
                {savedFilters.map((s, i) => (
                  <option key={i} value={JSON.stringify(s)}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                className="text-xs text-red-600 ml-2"
                onClick={() => {
                  if (!selectedSavedFilterJson) return;
                  try {
                    const obj = JSON.parse(selectedSavedFilterJson);
                    setShowDeleteSavedFilterModal({ name: String(obj.name) });
                  } catch {}
                }}
                disabled={!selectedSavedFilterJson}
                aria-disabled={!selectedSavedFilterJson}
              >
                Delete
              </button>
            </div>
          </div>

          {/* Actions picker modal */}
          <Modal
            isOpen={showActionsModal}
            onClose={() => setShowActionsModal(false)}
            title="Select actions"
            maxWidth="max-w-2xl"
          >
            <div className="space-y-3">
              <div className="text-sm">
                Choose one or more actions to filter by. Counts are shown to
                help guide selection.
              </div>
              {availableActions.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No actions available yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-auto">
                  {availableActions.map((a) => (
                    <label key={a.action} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={actionsModalSelection.includes(a.action)}
                        onChange={(e) => {
                          setActionsModalSelection((s) => {
                            if (e.target.checked) return [...s, a.action];
                            return s.filter((x) => x !== a.action);
                          });
                        }}
                      />
                      <span className="text-sm">
                        {a.action}{" "}
                        <span className="text-xs text-gray-500">
                          ({a.count})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowActionsModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setFilterActionsMulti(actionsModalSelection);
                    setFilterAction(undefined);
                    setShowActionsModal(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </Modal>

          {/* Save filter modal */}
          <Modal
            isOpen={showSaveFilterModal}
            onClose={() => setShowSaveFilterModal(false)}
            title="Save filter"
            maxWidth="max-w-md"
          >
            <div className="space-y-3">
              <div className="text-sm">
                Enter a name to save the current filter set.
              </div>
              <input
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                className="w-full rounded border px-2 py-1"
              />
              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowSaveFilterModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!saveFilterName) return;
                    const toSave = {
                      name: saveFilterName,
                      action: filterAction,
                      actions: filterActionsMulti.length
                        ? filterActionsMulti
                        : undefined,
                      staging: filterStaging,
                      dateFrom,
                      dateTo,
                    };
                    const next = [toSave, ...savedFilters].slice(0, 20);
                    setSavedFilters(next);
                    localStorage.setItem(
                      "audit.savedFilters",
                      JSON.stringify(next)
                    );
                    setShowSaveFilterModal(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </Modal>

          {/* Confirm delete saved filter modal */}
          <Modal
            isOpen={!!showDeleteSavedFilterModal}
            onClose={() => setShowDeleteSavedFilterModal(null)}
            title="Delete saved filter"
            maxWidth="max-w-md"
          >
            <div className="space-y-3">
              <div>
                Are you sure you want to delete the saved filter{" "}
                <strong>{showDeleteSavedFilterModal?.name}</strong>?
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowDeleteSavedFilterModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    try {
                      const name = showDeleteSavedFilterModal?.name;
                      if (!name) return setShowDeleteSavedFilterModal(null);
                      const next = savedFilters.filter((s) => s.name !== name);
                      setSavedFilters(next);
                      localStorage.setItem(
                        "audit.savedFilters",
                        JSON.stringify(next)
                      );
                      // clear selection if it was the deleted one
                      if (selectedSavedFilterJson) {
                        try {
                          const sel = JSON.parse(selectedSavedFilterJson);
                          if (sel.name === name) setSelectedSavedFilterJson("");
                        } catch {}
                      }
                    } catch {}
                    setShowDeleteSavedFilterModal(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
          {events.length === 0 ? (
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {filterAction || filterStaging ? (
                <>No events match those filters.</>
              ) : (
                <>No recent events.</>
              )}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {visibleColumns.time && (
                    <th className="text-left px-4 py-2">Time</th>
                  )}
                  {visibleColumns.action && (
                    <th className="text-left px-4 py-2">Action</th>
                  )}
                  {visibleColumns.staging && (
                    <th className="text-left px-4 py-2">Staging ID</th>
                  )}
                  {visibleColumns.details && (
                    <th className="text-left px-4 py-2">Details</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {events.map((ev: AuditEvent, idx: number) => (
                  <tr key={idx} className="border-t">
                    {visibleColumns.time && (
                      <td className="px-4 py-2">
                        {new Date(ev.ts).toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.action && (
                      <td className="px-4 py-2">{String(ev.action)}</td>
                    )}
                    {visibleColumns.staging && (
                      <td className="px-4 py-2">
                        {String(ev.stagingId || ev.staging)}
                      </td>
                    )}
                    {visibleColumns.details && (
                      <td className="px-4 py-2">
                        <pre className="text-xs">
                          {JSON.stringify(ev, null, 2)}
                        </pre>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="rounded border px-2 py-1 text-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <button
                className="rounded border px-2 py-1 text-sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= total}
              >
                Next
              </button>
              <span className="text-sm">Page {page}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Page size</label>
              <select
                value={String(pageSize)}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded border px-2 py-1 text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm">Total: {total}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
