"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Calendar,
  BarChart3,
  Activity,
  RefreshCw,
  Download,
  Target,
  Zap,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import PageViewsTable from "./components/PageViewsTable";

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  growthRate: number;
  monthOverMonth?: number;
  topTemplates: {
    name: string;
    revenue: number;
    percentage: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    users: number;
  }[];
}

interface EngagementMetrics {
  totalUsers: number;
  activeUsers: number;
  activeUsersSource?: string;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  userGrowth: number;
  engagementByDay: {
    date: string;
    users: number;
    pageViews: number;
    sessions: number;
  }[];
}

interface GrowthAnalytics {
  userAcquisition: {
    organic: number;
    referral: number;
    social: number;
    paid: number;
  };
  retentionRate: number;
  churnRate: number;
  lifetimeValue: number;
  growthMetrics: {
    period: string;
    newUsers: number;
    retainedUsers: number;
    revenue: number;
  }[];
}

export default function BusinessIntelligencePage() {
  const { isDarkMode } = useTheme();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [engagementMetrics, setEngagementMetrics] =
    useState<EngagementMetrics | null>(null);
  const [growthAnalytics, setGrowthAnalytics] =
    useState<GrowthAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "revenue" | "engagement" | "growth"
  >("revenue");

  const fetchBusinessData = useCallback(async () => {
    try {
      setRefreshing(true);
      // Fetch revenue data (existing)
      const revenueResponse = await fetch("/api/admin/business/revenue", {
        credentials: "include",
      });
      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueData(revenueData);
      }

      // Fetch engagement metrics from analytics endpoints backed by PageView
      const [totalsRes, dailyRes] = await Promise.all([
        fetch("/api/admin/analytics/totals", { credentials: "include" }),
        fetch("/api/admin/analytics/daily?days=30", { credentials: "include" }),
      ]);

      if (totalsRes.ok && dailyRes.ok) {
        const totals = await totalsRes.json();
        const daily = await dailyRes.json();

        // Map to existing EngagementMetrics shape using authoritative totals
        const engagementData: EngagementMetrics = {
          totalUsers: totals.totalUsers ?? 0,
          activeUsers: totals.activeUsers ?? 0,
          activeUsersSource: totals.activeUsersSource ?? "sessions",
          pageViews: totals.totalPageViews ?? 0,
          averageSessionDuration: 120,
          bounceRate: 50,
          conversionRate: 0,
          userGrowth: 0,
          engagementByDay: (daily.series || []).map(
            (d: { date: string; count: number }) => ({
              date: d.date,
              users: 0,
              pageViews: d.count,
              sessions: Math.round(d.count * 0.2),
            })
          ),
        };

        setEngagementMetrics(engagementData);
      }

      // Fetch growth analytics (existing)
      const growthResponse = await fetch("/api/admin/business/growth", {
        credentials: "include",
      });
      if (growthResponse.ok) {
        const growthData = await growthResponse.json();
        setGrowthAnalytics(growthData);
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
      toast.error("Failed to fetch business data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  // Helper: coerce to finite number
  const safeNumber = (v: unknown, fallback = 0) => {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
    return fallback;
  };

  // Format currency (Nigerian Naira)
  const formatCurrency = (amount: number | string | undefined | null) => {
    const n = safeNumber(amount, 0);
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n as number);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatPercentage = (value: number | undefined | null) => {
    const n = safeNumber(value, 0);
    return `${n.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const exportData = () => {
    const data = {
      revenue: revenueData,
      engagement: engagementMetrics,
      growth: growthAnalytics,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `business-intelligence-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Business data exported successfully");
  };

  if (loading) {
    return <PageSkeleton />;
  }

  // Derived safe arrays to avoid runtime errors when API returns null/undefined
  const revenueMonths = revenueData?.revenueByMonth ?? [];
  const revenueLastSix = revenueMonths.slice(-6);
  const maxRevenue = revenueMonths.length
    ? Math.max(...revenueMonths.map((m) => m.revenue))
    : 1;

  const tabs = [
    { id: "revenue", label: "Revenue Tracking", icon: DollarSign },
    { id: "engagement", label: "Engagement Metrics", icon: Activity },
    { id: "growth", label: "Growth Analytics", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Business Intelligence
          </h1>
          <p
            className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Revenue tracking, engagement metrics, and growth analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportData}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isDarkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
          <button
            onClick={fetchBusinessData}
            disabled={refreshing}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isDarkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300"
            } ${refreshing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "revenue" | "engagement" | "growth")
              }
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Revenue Tracking Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "revenue" && revenueData && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Revenue Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-6 ${
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
                      Total Revenue
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatCurrency(revenueData.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-xl border p-6 ${
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
                      Monthly Revenue
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatCurrency(
                        revenueData.monthlyRevenue ??
                          revenueLastSix[revenueLastSix.length - 1]?.revenue ??
                          0
                      )}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-xl border p-6 ${
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
                      Growth Rate
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${
                        revenueData.growthRate >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {revenueData.growthRate >= 0 ? "+" : ""}
                      {formatPercentage(safeNumber(revenueData.growthRate, 0))}
                    </p>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      MoM:{" "}
                      {formatPercentage(
                        safeNumber(revenueData.monthOverMonth, 0)
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </motion.div>

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
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Top Template Revenue
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatCurrency(
                        revenueData.topTemplates?.[0]?.revenue ?? 0
                      )}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </motion.div>
            </div>

            {/* Revenue Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Templates by Revenue */}
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
                  className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Top Templates by Revenue
                </h3>
                <div className="space-y-4">
                  {revenueData.topTemplates.map((template, index) => (
                    <div
                      key={template.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ab862b] text-white text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {template.name}
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {formatPercentage(
                              safeNumber(template.percentage, 0)
                            )}{" "}
                            of total revenue
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {formatCurrency(template.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Revenue Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-xl border p-6 ${
                  isDarkMode
                    ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Revenue Trend (Last 6 Months)
                </h3>
                <div className="space-y-4">
                  {revenueLastSix.map((month) => (
                    <div
                      key={month.month}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p
                          className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {month.month}
                        </p>
                        <p
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {formatNumber(month.users)} users
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {formatCurrency(month.revenue)}
                        </p>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1 dark:bg-gray-700">
                          <div
                            className="bg-[#ab862b] h-2 rounded-full"
                            style={{
                              width: `${(month.revenue / maxRevenue) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Engagement Metrics Tab */}
        {activeTab === "engagement" && engagementMetrics && (
          <motion.div
            key="engagement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Engagement Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-6 ${
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
                      Total Users
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatNumber(engagementMetrics.totalUsers)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-xl border p-6 ${
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
                      Active Users
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatNumber(engagementMetrics.activeUsers)}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Activity className="h-8 w-8 text-green-600" />
                    {engagementMetrics.activeUsersSource === "pageviews" && (
                      <span
                        className={`ml-1 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}
                      >
                        derived from pageviews
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-xl border p-6 ${
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
                      Page Views
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatNumber(engagementMetrics.pageViews)}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </motion.div>

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
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Avg Session
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatDuration(engagementMetrics.averageSessionDuration)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </motion.div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Key Metrics */}
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
                  className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Key Performance Indicators
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Bounce Rate
                    </span>
                    <span
                      className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatPercentage(
                        safeNumber(engagementMetrics.bounceRate, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Conversion Rate
                    </span>
                    <span
                      className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatPercentage(
                        safeNumber(engagementMetrics.conversionRate, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      User Growth
                    </span>
                    <span className={`font-semibold text-green-600`}>
                      +
                      {formatPercentage(
                        safeNumber(engagementMetrics.userGrowth, 0)
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Daily Engagement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-xl border p-6 ${
                  isDarkMode
                    ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Daily Engagement (Last 7 Days)
                </h3>
                <div className="space-y-3">
                  {engagementMetrics.engagementByDay
                    ?.slice(-7)
                    .map(
                      (day: (typeof engagementMetrics.engagementByDay)[0]) => (
                        <div
                          key={day.date}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p
                              className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {new Date(day.date).toLocaleDateString()}
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {formatNumber(day.sessions)} sessions
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {formatNumber(day.users)} users
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {formatNumber(day.pageViews)} views
                            </p>
                          </div>
                        </div>
                      )
                    )}
                </div>
              </motion.div>
            </div>

            {/* Event-level PageViews table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-xl border p-6 ${
                isDarkMode
                  ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                  : "border-gray-200 bg-white shadow-sm"
              }`}
            >
              <PageViewsTable />
            </motion.div>
          </motion.div>
        )}

        {/* Growth Analytics Tab */}
        {activeTab === "growth" && growthAnalytics && (
          <motion.div
            key="growth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Growth Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-6 ${
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
                      Retention Rate
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatPercentage(
                        safeNumber(growthAnalytics.retentionRate, 0)
                      )}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-xl border p-6 ${
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
                      Churn Rate
                    </p>
                    <p className={`mt-1 text-2xl font-bold text-red-600`}>
                      {formatPercentage(
                        safeNumber(growthAnalytics.churnRate, 0)
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-xl border p-6 ${
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
                      Lifetime Value
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {formatCurrency(growthAnalytics.lifetimeValue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </motion.div>

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
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Growth Rate
                    </p>
                    <p className={`mt-1 text-2xl font-bold text-green-600`}>
                      +{formatPercentage(safeNumber(15.7, 0))}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
              </motion.div>
            </div>

            {/* Growth Analytics */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* User Acquisition Channels */}
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
                  className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  User Acquisition Channels
                </h3>
                <div className="space-y-4">
                  {Object.entries(growthAnalytics.userAcquisition).map(
                    ([channel, count]) => (
                      <div
                        key={channel}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              channel === "organic"
                                ? "bg-green-500"
                                : channel === "referral"
                                  ? "bg-blue-500"
                                  : channel === "social"
                                    ? "bg-purple-500"
                                    : "bg-orange-500"
                            }`}
                          />
                          <span
                            className={`capitalize ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {channel}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {formatNumber(count)}
                          </span>
                          <span
                            className={`text-sm ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            (
                            {formatPercentage(
                              safeNumber(
                                (count /
                                  Object.values(
                                    growthAnalytics.userAcquisition
                                  ).reduce((a, b) => a + b, 0)) *
                                  100,
                                0
                              )
                            )}
                            )
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </motion.div>

              {/* Growth Metrics Over Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-xl border p-6 ${
                  isDarkMode
                    ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Growth Metrics (Last 6 Months)
                </h3>
                <div className="space-y-4">
                  {growthAnalytics.growthMetrics
                    .slice(-6)
                    .map((metric, idx) => (
                      <div
                        key={`${metric.period}-${metric.newUsers}-${idx}`}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {metric.period}
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {formatNumber(metric.retainedUsers)} retained
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {formatNumber(metric.newUsers)} new
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {formatCurrency(metric.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
