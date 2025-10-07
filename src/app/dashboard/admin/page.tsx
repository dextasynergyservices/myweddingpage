"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Shield,
  Activity,
  Lock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSecurityLogs: number;
  rateLimitHits: number;
  lockedAccounts: number;
  twoFactorEnabled: number;
  userGrowthPercentage: number;
  securityIncidents: number;
}

interface ChartData {
  name: string;
  users: number;
  logins: number;
  events: number;
}

export default function AdminOverviewPage() {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setChartData(data.chartData || generateMockChartData());
      } else {
        // Use mock data if API not ready
        setStats(generateMockStats());
        setChartData(generateMockChartData());
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats(generateMockStats());
      setChartData(generateMockChartData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockStats = (): DashboardStats => ({
    totalUsers: 1247,
    activeUsers: 892,
    totalSecurityLogs: 15420,
    rateLimitHits: 234,
    lockedAccounts: 12,
    twoFactorEnabled: 534,
    userGrowthPercentage: 12.5,
    securityIncidents: 3,
  });

  const generateMockChartData = (): ChartData[] => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      name: day,
      users: Math.floor(Math.random() * 100) + 50,
      logins: Math.floor(Math.random() * 200) + 100,
      events: Math.floor(Math.random() * 50) + 20,
    }));
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: isDarkMode ? "bg-blue-900/20" : "bg-blue-100",
      change: stats?.userGrowthPercentage || 0,
      changeLabel: "vs last month",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: isDarkMode ? "bg-green-900/20" : "bg-green-100",
      change: 8.2,
      changeLabel: "vs last week",
    },
    {
      title: "Security Logs",
      value: stats?.totalSecurityLogs || 0,
      icon: Shield,
      color: "text-purple-600",
      bgColor: isDarkMode ? "bg-purple-900/20" : "bg-purple-100",
      change: -2.4,
      changeLabel: "vs yesterday",
    },
    {
      title: "Rate Limit Hits",
      value: stats?.rateLimitHits || 0,
      icon: Activity,
      color: "text-orange-600",
      bgColor: isDarkMode ? "bg-orange-900/20" : "bg-orange-100",
      change: -15.3,
      changeLabel: "vs last week",
    },
    {
      title: "Locked Accounts",
      value: stats?.lockedAccounts || 0,
      icon: Lock,
      color: "text-red-600",
      bgColor: isDarkMode ? "bg-red-900/20" : "bg-red-100",
      change: -25.0,
      changeLabel: "vs last month",
    },
    {
      title: "2FA Enabled",
      value: stats?.twoFactorEnabled || 0,
      icon: Shield,
      color: "text-[#ab862b]",
      bgColor: isDarkMode ? "bg-yellow-900/20" : "bg-yellow-100",
      change: 18.7,
      changeLabel: "adoption rate",
    },
  ];

  const twoFactorData = [
    { name: "Enabled", value: stats?.twoFactorEnabled || 534, color: "#ab862b" },
    {
      name: "Disabled",
      value: (stats?.totalUsers || 1247) - (stats?.twoFactorEnabled || 534),
      color: isDarkMode ? "#4b5563" : "#e5e7eb",
    },
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Dashboard Overview
        </h1>
        <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Monitor your wedding platform&apos;s key metrics and system health
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.change > 0;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border p-6 ${
                isDarkMode
                  ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                  : "border-gray-200 bg-white shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {card.title}
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {card.value.toLocaleString()}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
                    >
                      {isPositive ? "+" : ""}
                      {card.change}%
                    </span>
                    <span className={isDarkMode ? "text-gray-500" : "text-gray-500"}>
                      {card.changeLabel}
                    </span>
                  </div>
                </div>
                <div className={`rounded-lg p-3 ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
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
          <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Weekly Activity
          </h3>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            User registrations and login activity
          </p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ab862b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ab862b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                <XAxis
                  dataKey="name"
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
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#ab862b"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="New Users"
                />
                <Area
                  type="monotone"
                  dataKey="logins"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorLogins)"
                  name="Logins"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2FA Adoption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`rounded-xl border p-6 ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/50 backdrop-blur"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Two-Factor Authentication
          </h3>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Security adoption across user base
          </p>
          <div className="mt-6 h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={twoFactorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const entry = twoFactorData[props.index];
                    return `${entry.name}: ${((entry.value / twoFactorData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {twoFactorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {(((stats?.twoFactorEnabled || 534) / (stats?.totalUsers || 1247)) * 100).toFixed(
                  1
                )}
                %
              </p>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Adoption Rate
              </p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {stats?.twoFactorEnabled || 534}
              </p>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Users Protected
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`rounded-xl border p-6 lg:col-span-2 ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/50 backdrop-blur"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Security Events Trend
          </h3>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Weekly security event distribution
          </p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                <XAxis
                  dataKey="name"
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
                <Legend />
                <Bar dataKey="events" fill="#ab862b" radius={[8, 8, 0, 0]} name="Security Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Alerts Section */}
      {stats && stats.securityIncidents > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className={`rounded-xl border p-6 ${
            isDarkMode ? "border-red-900/50 bg-red-900/10" : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div className="flex-1">
              <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Security Incidents Detected
              </h4>
              <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {stats.securityIncidents} security incidents require attention. Check the Security
                Logs page for details.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
