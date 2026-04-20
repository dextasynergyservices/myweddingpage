"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";

interface SecurityLog {
  id: string;
  action?: string;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string;
  userAgent: string | null;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
}

type SeverityFilter = "ALL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type ActionFilter =
  | "ALL"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "RATE_LIMIT_EXCEEDED"
  | "ACCOUNT_LOCKED"
  | "PLAN_CREATED"
  | "PLAN_UPDATED"
  | "PLAN_DELETED";

export default function SecurityLogsPage() {
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const logsPerPage = 20;

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  useEffect(() => {
    filterLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, searchQuery, severityFilter, actionFilter]);

  const fetchSecurityLogs = async () => {
    try {
      const response = await fetch("/api/admin/security-logs", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching security logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Server now provides a top-level `action` on logs (or in metadata). Use it when available.

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          (log.message || "").toLowerCase().includes(query) ||
          log.userEmail?.toLowerCase().includes(query) ||
          (log.ipAddress || "").toLowerCase().includes(query) ||
          (log.action || "").toLowerCase().includes(query)
      );
    }

    // Severity filter
    if (severityFilter !== "ALL") {
      filtered = filtered.filter((log) => log.severity === severityFilter);
    }

    // Action filter: prefer server-provided action; fallback to message checks
    if (actionFilter !== "ALL") {
      filtered = filtered.filter((log) => {
        const act = (log.action || "").toUpperCase();
        if (act) return act === actionFilter;
        // fallback: inspect message start
        const m = (log.message || "").toUpperCase();
        if (actionFilter === "PLAN_CREATED")
          return m.startsWith("PLAN_CREATED");
        if (actionFilter === "PLAN_UPDATED")
          return m.startsWith("PLAN_UPDATED");
        if (actionFilter === "PLAN_DELETED")
          return m.startsWith("PLAN_DELETED");
        if (actionFilter === "LOGIN_FAILED")
          return (
            m.includes("LOGIN") && (m.includes("FAIL") || m.includes("FAILURE"))
          );
        if (actionFilter === "LOGIN_SUCCESS")
          return (
            m.includes("LOGIN") &&
            (m.includes("SUCCESS") || m.includes("SUCCEED"))
          );
        if (actionFilter === "RATE_LIMIT_EXCEEDED")
          return m.includes("RATE") && m.includes("LIMIT");
        if (actionFilter === "ACCOUNT_LOCKED")
          return (
            (m.includes("ACCOUNT") && m.includes("LOCK")) ||
            m.includes("LOCKOUT") ||
            m.includes("LOCKED")
          );
        return false;
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const exportToCSV = () => {
    const headers = [
      "Timestamp",
      "Severity",
      "Action",
      "User Email",
      "IP Address",
      "Message",
    ];
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.severity,
      log.action,
      log.userEmail || "N/A",
      log.ipAddress,
      log.message,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "HIGH":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "MEDIUM":
        return <Info className="h-5 w-5 text-yellow-600" />;
      case "LOW":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return isDarkMode
          ? "bg-red-900/30 text-red-400 border-red-800"
          : "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return isDarkMode
          ? "bg-orange-900/30 text-orange-400 border-orange-800"
          : "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return isDarkMode
          ? "bg-yellow-900/30 text-yellow-400 border-yellow-800"
          : "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return isDarkMode
          ? "bg-green-900/30 text-green-400 border-green-800"
          : "bg-green-100 text-green-800 border-green-200";
      default:
        return isDarkMode
          ? "bg-gray-800 text-gray-400 border-gray-700"
          : "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatAction = (action?: string | null) => {
    if (!action) return "-";
    try {
      return String(action).replace(/_/g, " ");
    } catch {
      return String(action);
    }
  };

  const friendlyMessage = (msg?: string | null) => {
    if (!msg) return "-";
    const s = String(msg);
    if (s.startsWith("PLAN_CREATED")) return "Plan created";
    if (s.startsWith("PLAN_UPDATED")) return "Plan updated";
    if (s.startsWith("PLAN_DELETED")) return "Plan deleted";
    if (s.startsWith("USER_LOCKED")) return "User locked";
    if (s.startsWith("LOGIN_SUCCESS")) return "Login succeeded";
    if (s.startsWith("LOGIN_FAILURE") || s.startsWith("LOGIN_FAILED"))
      return "Login failed";
    // Fallback: make underscore-separated tokens nicer
    try {
      return s.replace(/_/g, " ");
    } catch {
      return s;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Security Logs
          </h1>
          <p
            className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Monitor system security events and user activity
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isDarkMode
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-4 ${
          isDarkMode
            ? "border-gray-800 bg-gray-900/50 backdrop-blur"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search logs by message, email, IP, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab862b] ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {(severityFilter !== "ALL" || actionFilter !== "ALL") && (
              <span
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {filteredLogs.length} of {logs.length} logs
              </span>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <div className="flex-1">
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) =>
                    setSeverityFilter(e.target.value as SeverityFilter)
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab862b] ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="ALL">All Severities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex-1">
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Action Type
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) =>
                    setActionFilter(e.target.value as ActionFilter)
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab862b] ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="ALL">All Actions</option>
                  <option value="LOGIN_SUCCESS">Login Success</option>
                  <option value="LOGIN_FAILED">Login Failed</option>
                  <option value="RATE_LIMIT_EXCEEDED">
                    Rate Limit Exceeded
                  </option>
                  <option value="ACCOUNT_LOCKED">Account lockouts</option>
                  <option value="PLAN_CREATED">Plan created</option>
                  <option value="PLAN_UPDATED">Plan updated</option>
                  <option value="PLAN_DELETED">Plan deleted</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Logs Table - Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`hidden md:block rounded-xl border ${
          isDarkMode
            ? "border-gray-800 bg-gray-900/50 backdrop-blur"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`border-b ${isDarkMode ? "border-gray-800 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Timestamp
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Severity
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Action
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } hidden md:table-cell`}
                >
                  User
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } hidden sm:table-cell`}
                >
                  IP Address
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Message
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}
            >
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Shield
                      className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                    />
                    <p
                      className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      No security logs found
                    </p>
                  </td>
                </tr>
              ) : (
                currentLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`transition-colors ${
                      isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td
                      className={`whitespace-nowrap px-6 py-4 text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(log.severity)}
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(
                            log.severity
                          )}`}
                        >
                          {log.severity}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`whitespace-nowrap px-6 py-4 text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {formatAction(log.action)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-6 py-4 text-sm hidden md:table-cell ${
                        isDarkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {log.userEmail || "N/A"}
                    </td>
                    <td
                      className={`whitespace-nowrap px-6 py-4 text-sm font-mono hidden sm:table-cell ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {log.ipAddress}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {friendlyMessage(log.message)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        {totalPages > 1 && (
          <div
            className={`flex items-center justify-between border-t px-6 py-4 ${
              isDarkMode ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length}{" "}
              logs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === 1
                    ? isDarkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span
                className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === totalPages
                    ? isDarkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {currentLogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-12 text-center ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <Shield
              className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
            />
            <p
              className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              No security logs found
            </p>
          </motion.div>
        ) : (
          currentLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`rounded-xl border p-4 ${
                isDarkMode
                  ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                  : "border-gray-200 bg-white shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  {getSeverityIcon(log.severity)}
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(
                      log.severity
                    )}`}
                  >
                    {log.severity}
                  </span>
                </div>
                <span
                  className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"} mb-1`}
                  >
                    Action
                  </p>
                  <p
                    className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {formatAction(log.action)}
                  </p>
                </div>

                <div>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"} mb-1`}
                  >
                    Message
                  </p>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {friendlyMessage(log.message)}
                  </p>
                </div>

                {log.userEmail && (
                  <div className="flex items-center justify-between pt-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}">
                    <span
                      className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                    >
                      User
                    </span>
                    <span
                      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {log.userEmail}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                  >
                    IP Address
                  </span>
                  <span
                    className={`text-sm font-mono ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {log.ipAddress}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <span
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === 1
                    ? isDarkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === totalPages
                    ? isDarkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
