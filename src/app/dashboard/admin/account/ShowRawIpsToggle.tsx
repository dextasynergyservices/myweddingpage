"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCSRFToken } from "@/hooks/useCSRFToken";

export default function ShowRawIpsToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt to read current session setting from /api/user/profile if available
    (async () => {
      try {
        const r = await fetch("/api/user/profile", { credentials: "include" });
        if (!r.ok) return;
        const json = await r.json();
        // Only allow admins to see this control
        if (json?.role !== "ADMIN") return;
        // profile API may include showRawIps on session.user
        if (json?.showRawIps !== undefined)
          setEnabled(Boolean(json.showRawIps));
      } catch (e) {
        console.error("Failed to fetch user profile:", e);
      }
    })();
  }, []);

  const { token: csrfToken, loading: csrfLoading } = useCSRFToken();

  const toggle = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      if (csrfToken) headers["x-csrf-token"] = csrfToken;

      const res = await fetch("/api/user/settings/show-raw-ips", {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ showRawIps: !enabled }),
      });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setEnabled(Boolean(json.showRawIps));
      toast.success(`Raw IPs ${json.showRawIps ? "enabled" : "disabled"}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update setting");
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/csrf-token", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to refresh token");
      toast.success("CSRF token refreshed. You can try toggling again.");
    } catch (e) {
      console.error("Failed to refresh CSRF token:", e);
      toast.error("Failed to refresh CSRF token");
    } finally {
      setLoading(false);
    }
  };

  if (enabled === null) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={toggle}
            disabled={loading || csrfLoading}
          />
          <span className="text-sm">
            Allow viewing raw IPs in admin analytics
          </span>
        </label>
        <button
          onClick={refreshToken}
          disabled={loading || csrfLoading}
          className="text-xs px-2 py-1 rounded bg-white border"
        >
          Refresh token
        </button>
      </div>
    </div>
  );
}
