"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCSRFToken } from "@/hooks/useCSRFToken";
import {
  Activity,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RateLimit {
  identifier: string;
  count: number;
  limit: number;
  remaining: number;
  reset: number;
  backend: "redis" | "memory";
}

interface RateLimitStats {
  totalLimits: number;
  redisLimits: number;
  memoryLimits: number;
  totalBlocked: number;
  chartData: Array<{
    time: string;
    hits: number;
    blocked: number;
  }>;
}

export default function RateLimitsPage() {
  const { isDarkMode } = useTheme();
  const { token: csrfToken } = useCSRFToken();
  const [limits, setLimits] = useState<RateLimit[]>([]);
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limitsPerPage = 10;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRateLimits();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchRateLimits, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRateLimits = async () => {
    try {
      const response = await fetch("/api/admin/rate-limits", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setLimits(data.limits || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching rate limits:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRateLimits();
  };

  const handleClearLimit = async (identifier: string) => {
    if (!confirm(`Clear rate limit for ${identifier}?`)) return;

    try {
      const response = await fetch(
        `/api/admin/rate-limits/${encodeURIComponent(identifier)}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "x-csrf-token": csrfToken || "",
          },
        }
      );

      if (response.ok) {
        toast.success("Rate limit cleared successfully");
        fetchRateLimits();
      } else {
        toast.error("Failed to clear rate limit");
      }
    } catch (error) {
      console.error("Error clearing rate limit:", error);
      toast.error("Failed to clear rate limit");
    }
  };

  const getResetTime = (reset: number) => {
    const now = Date.now();
    const diff = reset - now;
    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getPercentage = (count: number, limit: number) => {
    return ((count / limit) * 100).toFixed(0);
  };

  // Pagination calculations
  const totalPages = Math.ceil(limits.length / limitsPerPage);
  const startIndex = (currentPage - 1) * limitsPerPage;
  const endIndex = startIndex + limitsPerPage;
  const currentLimits = limits.slice(startIndex, endIndex);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Informational banner: when Redis isn't available data may be mocked */}
      {stats && stats.redisLimits === 0 && (
        <div
          className={`rounded-lg p-3 ${isDarkMode ? "bg-yellow-900/20 border border-yellow-800 text-yellow-200" : "bg-yellow-50 border border-yellow-200 text-yellow-800"}`}
        >
          <p className="text-sm">
            Redis backend not detected — rate limit data may be mocked or
            estimated in this environment. For accurate live metrics enable
            Redis and restart the monitor.
          </p>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Rate Limit Monitor
          </h1>
          <p
            className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Monitor active rate limits and system protection
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isDarkMode
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Active Limits
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.totalLimits}
                </p>
              </div>
              <Activity className="h-8 w-8 text-[#ab862b]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl border p-4 ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Redis Limits
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.redisLimits}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl border p-4 ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Memory Limits
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.memoryLimits}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl border p-4 ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total Blocked
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.totalBlocked}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Chart */}
      {stats && stats.chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-xl border p-6 ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/50 backdrop-blur"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <h3
            className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Rate Limit Activity
          </h3>
          <p
            className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Recent rate limit hits and blocks
          </p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="time"
                  stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hits"
                  stroke="#ab862b"
                  strokeWidth={2}
                  name="Rate Limit Hits"
                />
                <Line
                  type="monotone"
                  dataKey="blocked"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Blocked Requests"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Active Limits Table - Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
                  Identifier
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } hidden sm:table-cell`}
                >
                  Backend
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Usage
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } hidden md:table-cell`}
                >
                  Remaining
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Reset In
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}
            >
              {currentLimits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Activity
                      className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                    />
                    <p
                      className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      No active rate limits
                    </p>
                  </td>
                </tr>
              ) : (
                currentLimits.map((limit, index) => {
                  const percentage = getPercentage(limit.count, limit.limit);
                  const isNearLimit = parseInt(percentage) >= 80;

                  return (
                    <motion.tr
                      key={limit.identifier}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`transition-colors ${
                        isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 text-sm font-mono ${
                          isDarkMode ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        {limit.identifier}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            limit.backend === "redis"
                              ? isDarkMode
                                ? "bg-green-900/30 text-green-400 border border-green-800"
                                : "bg-green-100 text-green-800 border border-green-200"
                              : isDarkMode
                                ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {limit.backend.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 flex-1 overflow-hidden rounded-full ${
                              isDarkMode ? "bg-gray-800" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`h-full transition-all ${
                                isNearLimit ? "bg-red-600" : "bg-[#ab862b]"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-300" : "text-gray-900"
                            }`}
                          >
                            {limit.count}/{limit.limit}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm hidden md:table-cell ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {limit.remaining}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {getResetTime(limit.reset)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleClearLimit(limit.identifier)}
                          className={`rounded-lg p-2 transition-colors ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-red-400"
                              : "hover:bg-red-100 text-red-600"
                          }`}
                          title="Clear Rate Limit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
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
              Showing {startIndex + 1} to {Math.min(endIndex, limits.length)} of{" "}
              {limits.length} rate limits
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === 1
                    ? isDarkMode
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 cursor-not-allowed"
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
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 cursor-not-allowed"
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
        {currentLimits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-12 text-center ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <Activity
              className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
            />
            <p
              className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              No active rate limits
            </p>
          </motion.div>
        ) : (
          currentLimits.map((limit, index) => {
            const percentage = getPercentage(limit.count, limit.limit);
            const isNearLimit = parseInt(percentage) >= 80;

            return (
              <motion.div
                key={limit.identifier}
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
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-mono truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {limit.identifier}
                    </p>
                    <span
                      className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        limit.backend === "redis"
                          ? isDarkMode
                            ? "bg-green-900/30 text-green-400 border border-green-800"
                            : "bg-green-100 text-green-800 border border-green-200"
                          : isDarkMode
                            ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {limit.backend.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleClearLimit(limit.identifier)}
                    className={`rounded-lg p-2 transition-colors ${
                      isDarkMode
                        ? "bg-gray-800 text-red-400 hover:bg-gray-700"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                      >
                        Usage
                      </span>
                      <span
                        className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {limit.count} / {limit.limit}
                      </span>
                    </div>
                    <div
                      className={`h-2 overflow-hidden rounded-full ${
                        isDarkMode ? "bg-gray-800" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-full transition-all ${
                          isNearLimit ? "bg-red-600" : "bg-[#ab862b]"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}">
                    <span
                      className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                    >
                      Remaining
                    </span>
                    <span
                      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {limit.remaining}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                    >
                      Reset In
                    </span>
                    <span
                      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {getResetTime(limit.reset)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
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
