"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Lock, Unlock, AlertCircle, Clock, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AccountLockout {
  id: string;
  userId: string | null;
  email: string;
  ipAddress: string;
  lockedAt: string;
  lockedUntil: string;
  unlocked: boolean;
  unlockedAt: string | null;
  unlockedBy: string | null;
  attemptCount: number;
  lockoutReason: string | null;
}

interface LockoutStats {
  totalLockouts: number;
  activeLockouts: number;
  unlockedLockouts: number;
  chartData: Array<{
    date: string;
    lockouts: number;
  }>;
}

export default function AccountLockoutsPage() {
  const { isDarkMode } = useTheme();
  const [lockouts, setLockouts] = useState<AccountLockout[]>([]);
  const [stats, setStats] = useState<LockoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "unlocked">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const lockoutsPerPage = 10;

  useEffect(() => {
    fetchLockouts();
  }, []);

  const fetchLockouts = async () => {
    try {
      const response = await fetch("/api/admin/lockouts");
      if (response.ok) {
        const data = await response.json();
        setLockouts(data.lockouts || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching lockouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (id: string, email: string) => {
    if (!confirm(`Unlock account for ${email}?`)) return;

    try {
      const response = await fetch(`/api/admin/lockouts/${id}/unlock`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Account unlocked successfully");
        fetchLockouts();
      } else {
        toast.error("Failed to unlock account");
      }
    } catch (error) {
      console.error("Error unlocking account:", error);
      toast.error("Failed to unlock account");
    }
  };

  const getTimeRemaining = (lockedUntil: string) => {
    const now = new Date().getTime();
    const until = new Date(lockedUntil).getTime();
    const diff = until - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const filteredLockouts = lockouts.filter((lockout) => {
    if (filter === "active") return !lockout.unlocked && new Date(lockout.lockedUntil) > new Date();
    if (filter === "unlocked") return lockout.unlocked;
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLockouts.length / lockoutsPerPage);
  const startIndex = (currentPage - 1) * lockoutsPerPage;
  const endIndex = startIndex + lockoutsPerPage;
  const currentLockouts = filteredLockouts.slice(startIndex, endIndex);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Account Lockouts
        </h1>
        <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Manage locked accounts and security incidents
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
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
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Total Lockouts
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.totalLockouts}
                </p>
              </div>
              <Lock className="h-8 w-8 text-[#ab862b]" />
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
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Active Lockouts
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.activeLockouts}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
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
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Unlocked
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stats.unlockedLockouts}
                </p>
              </div>
              <Unlock className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Chart */}
      {stats && stats.chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl border p-6 ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/50 backdrop-blur"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Lockout Trend
          </h3>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Account lockouts over the last 7 days
          </p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                <XAxis
                  dataKey="date"
                  stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke={isDarkMode ? "#9ca3af" : "#6b7280"} style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="lockouts"
                  fill="#ab862b"
                  radius={[8, 8, 0, 0]}
                  name="Account Lockouts"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-xl border p-4 ${
          isDarkMode
            ? "border-gray-800 bg-gray-900/50 backdrop-blur"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-[#ab862b] text-white"
                : isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({lockouts.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "active"
                ? "bg-[#ab862b] text-white"
                : isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active (
            {lockouts.filter((l) => !l.unlocked && new Date(l.lockedUntil) > new Date()).length})
          </button>
          <button
            onClick={() => setFilter("unlocked")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "unlocked"
                ? "bg-[#ab862b] text-white"
                : isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Unlocked ({lockouts.filter((l) => l.unlocked).length})
          </button>
        </div>
      </motion.div>

      {/* Lockouts Table - Desktop */}
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
                  Email
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
                  } hidden lg:table-cell`}
                >
                  Attempts
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } hidden md:table-cell`}
                >
                  Locked At
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Status
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
            <tbody className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
              {currentLockouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Lock
                      className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                    />
                    <p className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      No account lockouts found
                    </p>
                  </td>
                </tr>
              ) : (
                currentLockouts.map((lockout, index) => {
                  const isActive = !lockout.unlocked && new Date(lockout.lockedUntil) > new Date();

                  return (
                    <motion.tr
                      key={lockout.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`transition-colors ${
                        isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                      >
                        {lockout.email}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-mono hidden sm:table-cell ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {lockout.ipAddress}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span
                          className={`flex items-center gap-1 text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          <Shield className="h-4 w-4" />
                          {lockout.attemptCount}
                        </span>
                      </td>
                      <td
                        className={`whitespace-nowrap px-6 py-4 text-sm hidden md:table-cell ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {new Date(lockout.lockedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {lockout.unlocked ? (
                          <span
                            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isDarkMode
                                ? "bg-green-900/30 text-green-400 border border-green-800"
                                : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            <Unlock className="h-3 w-3" />
                            Unlocked
                          </span>
                        ) : isActive ? (
                          <span
                            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isDarkMode
                                ? "bg-red-900/30 text-red-400 border border-red-800"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            <Lock className="h-3 w-3" />
                            Locked ({getTimeRemaining(lockout.lockedUntil)})
                          </span>
                        ) : (
                          <span
                            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isDarkMode
                                ? "bg-gray-800 text-gray-400 border border-gray-700"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isActive && (
                          <button
                            onClick={() => handleUnlock(lockout.id, lockout.email)}
                            className={`rounded-lg p-2 transition-colors ${
                              isDarkMode
                                ? "hover:bg-gray-800 text-green-400"
                                : "hover:bg-green-100 text-green-600"
                            }`}
                            title="Unlock Account"
                          >
                            <Unlock className="h-4 w-4" />
                          </button>
                        )}
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
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLockouts.length)} of{" "}
              {filteredLockouts.length} lockouts
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
              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
        {currentLockouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-12 text-center ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <Lock
              className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
            />
            <p className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              No account lockouts found
            </p>
          </motion.div>
        ) : (
          currentLockouts.map((lockout, index) => {
            const isActive = !lockout.unlocked && new Date(lockout.lockedUntil) > new Date();

            return (
              <motion.div
                key={lockout.id}
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
                      className={`text-base font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {lockout.email}
                    </p>
                    <p
                      className={`text-sm font-mono ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {lockout.ipAddress}
                    </p>
                  </div>
                  {isActive && (
                    <button
                      onClick={() => handleUnlock(lockout.id, lockout.email)}
                      className={`rounded-lg p-2 transition-colors ${
                        isDarkMode
                          ? "bg-gray-800 text-green-400 hover:bg-gray-700"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      <Unlock className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      Status
                    </span>
                    {lockout.unlocked ? (
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isDarkMode
                            ? "bg-green-900/30 text-green-400 border border-green-800"
                            : "bg-green-100 text-green-800 border border-green-200"
                        }`}
                      >
                        <Unlock className="h-3 w-3" />
                        Unlocked
                      </span>
                    ) : isActive ? (
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isDarkMode
                            ? "bg-red-900/30 text-red-400 border border-red-800"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        <Lock className="h-3 w-3" />
                        Locked ({getTimeRemaining(lockout.lockedUntil)})
                      </span>
                    ) : (
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isDarkMode
                            ? "bg-gray-800 text-gray-400 border border-gray-700"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        Expired
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      Failed Attempts
                    </span>
                    <span
                      className={`flex items-center gap-1 text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      <Shield className="h-4 w-4" />
                      {lockout.attemptCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}">
                    <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      Locked At
                    </span>
                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {new Date(lockout.lockedAt).toLocaleString()}
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
            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
