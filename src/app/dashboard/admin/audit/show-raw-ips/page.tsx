"use client";

import { useEffect, useState } from "react";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import { useTheme } from "@/contexts/ThemeContext";

interface AdminRow {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  showRawIps: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function ShowRawIpsAuditPage() {
  const { isDarkMode } = useTheme();
  const [admins, setAdmins] = useState<AdminRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAdmins = async () => {
      try {
        const res = await fetch("/api/admin/audit/show-raw-ips", {
          credentials: "include",
        });
        if (!res.ok) {
          setAdmins([]);
          return;
        }
        const json = await res.json();
        if (mounted) setAdmins(json.admins || []);
      } catch (e) {
        console.error(e);
        if (mounted) setAdmins([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAdmins();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Admins with Raw IPs Enabled
        </h1>
        <p
          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          These admins have the ability to view raw IP addresses in analytics.
          Audit regularly.
        </p>
      </div>

      <div
        className={`rounded-xl border p-4 ${isDarkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white"}`}
      >
        {admins && admins.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Created</th>
                <th className="text-left px-4 py-2">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{a.name || "(no name)"}</td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">{a.role}</td>
                  <td className="px-4 py-2">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {a.lastLoginAt
                      ? new Date(a.lastLoginAt).toLocaleString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            No admins have raw IPs enabled.
          </p>
        )}
      </div>
    </div>
  );
}
