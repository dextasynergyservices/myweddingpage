"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getCSRFTokenFromCookie } from "@/hooks/useCSRFToken";
import { Activity, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface PageViewItem {
  id: string;
  weddingPageId: string | null;
  slug: string | null;
  title: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function PageViewsTable({ slug }: { slug?: string }) {
  const { isDarkMode } = useTheme();
  const [items, setItems] = useState<PageViewItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [anonymize, setAnonymize] = useState(true);
  const [serverAnonymize, setServerAnonymize] = useState<boolean | null>(null);
  const [isAdminSession, setIsAdminSession] = useState<boolean | null>(null);
  const [csrfRefreshing, setCsrfRefreshing] = useState(false);

  useEffect(() => {
    fetchFirstPage();
    // verify current session is admin (helps surface expired sessions)
    (async () => {
      try {
        const r = await fetch("/api/user/profile", { credentials: "include" });
        if (!r.ok) {
          setIsAdminSession(false);
          return;
        }
        const j = await r.json();
        setIsAdminSession(j?.role === "ADMIN");
      } catch {
        setIsAdminSession(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, anonymize]);

  const fetchFirstPage = async (anonymizeOverride?: boolean) => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (slug) q.set("slug", slug);
      q.set("limit", "25");
      const anon =
        typeof anonymizeOverride === "boolean" ? anonymizeOverride : anonymize;
      q.set("anonymize", String(anon));

      const res = await fetch(
        `/api/admin/analytics/pageviews?${q.toString()}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setItems(json.items || []);
      setNextCursor(json.nextCursor ?? null);
      // Keep the UI in sync with server-side anonymization policy - server returns `anonymize`
      if (typeof json.anonymize === "boolean") {
        setAnonymize(Boolean(json.anonymize));
        setServerAnonymize(Boolean(json.anonymize));
      }
    } catch (err) {
      console.error("Failed to load pageviews", err);
      toast.error("Failed to load recent page views");
    } finally {
      setLoading(false);
    }
  };

  const toggleShowRawIps = async (enable: boolean) => {
    try {
      // call the existing settings API to update the DB flag
      // include CSRF token if available
      const csrf = getCSRFTokenFromCookie();
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      if (csrf) headers["x-csrf-token"] = csrf;

      const res = await fetch("/api/user/settings/show-raw-ips", {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify({ showRawIps: enable }),
      });
      const json = await res.json();
      if (!res.ok) {
        const err = json?.error || "Failed to update setting";
        throw new Error(err);
      }
      const updated = Boolean(json.showRawIps);
      // updated === true means raw IPs allowed -> anonymize should be false
      setAnonymize(!updated);
      // reflect server policy immediately
      setServerAnonymize(!updated ? true : false);
      // refresh data so server anonymize policy is returned
      // pass the intended anonymize state to avoid race with React state updates
      await fetchFirstPage(!updated ? true : false);
      // show friendly message
      if (updated) {
        toast.success("Raw IPs enabled for your admin account");
      } else {
        toast.success("Raw IPs disabled for your admin account");
      }
    } catch (err) {
      console.error("Failed to update showRawIps:", err);
      toast.error((err as Error)?.message || "Failed to update setting");
    }
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    try {
      setLoadingMore(true);
      const q = new URLSearchParams();
      if (slug) q.set("slug", slug);
      q.set("limit", "25");
      q.set("afterId", nextCursor);
      q.set("anonymize", String(anonymize));

      const res = await fetch(
        `/api/admin/analytics/pageviews?${q.toString()}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setItems((prev) => [...prev, ...(json.items || [])]);
      setNextCursor(json.nextCursor ?? null);
      if (typeof json.anonymize === "boolean") {
        setAnonymize(Boolean(json.anonymize));
        setServerAnonymize(Boolean(json.anonymize));
      }
    } catch (err) {
      console.error("Failed to load more pageviews", err);
      toast.error("Failed to load more page views");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4
          className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Recent Page Views
        </h4>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!anonymize}
              onChange={async (e) => {
                const wantRaw = e.currentTarget.checked; // checked=true means show raw IPs
                await toggleShowRawIps(wantRaw);
              }}
              disabled={isAdminSession === false}
            />
            <span
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Show raw IPs
            </span>
          </label>
          <button
            onClick={async () => {
              try {
                setCsrfRefreshing(true);
                const r = await fetch("/api/csrf-token", {
                  credentials: "include",
                });
                if (!r.ok) throw new Error("Failed to refresh token");
                toast.success("CSRF token refreshed — try the toggle again");
              } catch (e) {
                console.error("Failed to refresh CSRF token:", e);
                toast.error("Failed to refresh CSRF token");
              } finally {
                setCsrfRefreshing(false);
              }
            }}
            disabled={csrfRefreshing}
            className={`text-xs px-2 py-1 rounded ${isDarkMode ? "bg-gray-800" : "bg-white border"}`}
          >
            {csrfRefreshing ? "Refreshing..." : "Refresh token"}
          </button>
          {serverAnonymize === true && (
            <div className="text-xs text-gray-500">
              Raw IPs are disabled by server policy for this session
            </div>
          )}
        </div>
      </div>

      <div
        className={`rounded-xl border overflow-hidden ${isDarkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white shadow-sm"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"} uppercase`}
            >
              <tr>
                <th className="px-4 py-2 text-left">When</th>
                <th className="px-4 py-2 text-left">Page</th>
                <th className="px-4 py-2 text-left hidden sm:table-cell">IP</th>
                <th className="px-4 py-2 text-left hidden md:table-cell">UA</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}
            >
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <Activity
                      className={`mx-auto h-8 w-8 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                    />
                    <p
                      className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Loading...
                    </p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No recent page views
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr
                    key={it.id}
                    className={`hover:bg-gray-50 ${isDarkMode ? "hover:bg-gray-800/40" : ""}`}
                  >
                    <td className="px-4 py-3 text-sm">
                      {new Date(it.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">
                        {it.title ?? it.slug ?? "(unknown)"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {it.slug ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell font-mono">
                      {it.ipAddress ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm hidden md:table-cell truncate max-w-[28rem]">
                      {it.userAgent ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Showing {items.length} items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setItems([]);
                setNextCursor(null);
                fetchFirstPage();
              }}
              className={`px-3 py-1 rounded-md text-sm ${isDarkMode ? "bg-gray-800 text-white" : "bg-white border"}`}
            >
              Refresh
            </button>
            <button
              onClick={loadMore}
              disabled={!nextCursor || loadingMore}
              className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white border"}`}
            >
              {loadingMore ? "Loading..." : "Load more"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
