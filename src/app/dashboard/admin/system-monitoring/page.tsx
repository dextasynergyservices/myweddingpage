"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Activity,
  Server,
  Cpu,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  Globe,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";

interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: number; // seconds
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    status: "connected" | "disconnected";
    responseTime: number; // ms
    connections: number;
  };
  services: {
    name: string;
    status: "up" | "down";
    responseTime?: number;
    lastChecked: string;
  }[];
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export default function SystemMonitoringPage() {
  const { isDarkMode } = useTheme();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setRefreshing(true);

      // Fetch system health
      const healthResponse = await fetch("/api/admin/system/health", {
        credentials: "include",
      });
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData);
      }

      // Fetch performance metrics
      const metricsResponse = await fetch("/api/admin/system/metrics", {
        credentials: "include",
      });
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setPerformanceMetrics(metricsData);
      }
    } catch (error) {
      console.error("Error fetching system data:", error);
      toast.error("Failed to fetch system data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "up":
      case "connected":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
      case "down":
      case "disconnected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "up":
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
      case "down":
      case "disconnected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            System Monitoring
          </h1>
          <p
            className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Monitor system health, performance, and infrastructure status
          </p>
        </div>
        <button
          onClick={fetchSystemData}
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

      {/* System Health Overview */}
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
                System Status
              </p>
              <p
                className={`mt-1 text-2xl font-bold capitalize ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {systemHealth?.status || "Unknown"}
              </p>
            </div>
            {systemHealth && getStatusIcon(systemHealth.status)}
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
                Uptime
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {systemHealth ? formatUptime(systemHealth.uptime) : "N/A"}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
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
                CPU Usage
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {systemHealth?.cpu?.usage != null
                  ? systemHealth.cpu.usage.toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <Cpu className="h-8 w-8 text-purple-600" />
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
                Memory Usage
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {systemHealth?.memory?.percentage != null
                  ? systemHealth.memory.percentage.toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <Server className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* System Resources */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Memory Usage */}
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
            Memory Usage
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Used:{" "}
                {systemHealth ? formatBytes(systemHealth.memory.used) : "N/A"}
              </span>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Total:{" "}
                {systemHealth ? formatBytes(systemHealth.memory.total) : "N/A"}
              </span>
            </div>
            <div
              className={`w-full bg-gray-200 rounded-full h-3 ${isDarkMode ? "bg-gray-700" : ""}`}
            >
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${systemHealth?.memory.percentage || 0}%`,
                }}
              />
            </div>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {systemHealth?.memory?.percentage != null
                ? systemHealth.memory.percentage.toFixed(1)
                : 0}
              % of total memory in use
            </p>
          </div>
        </motion.div>

        {/* Disk Usage */}
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
            Disk Usage
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Used:{" "}
                {systemHealth ? formatBytes(systemHealth.disk.used) : "N/A"}
              </span>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Total:{" "}
                {systemHealth ? formatBytes(systemHealth.disk.total) : "N/A"}
              </span>
            </div>
            <div
              className={`w-full bg-gray-200 rounded-full h-3 ${isDarkMode ? "bg-gray-700" : ""}`}
            >
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${systemHealth?.disk?.percentage ?? 0}%`,
                }}
              />
            </div>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {systemHealth?.disk?.percentage != null
                ? systemHealth.disk.percentage.toFixed(1)
                : 0}
              % of disk space used
            </p>
          </div>
        </motion.div>
      </div>

      {/* Services Status */}
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
        <h3
          className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Service Status
        </h3>
        <div className="space-y-4">
          {/* Database */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p
                  className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Database
                </p>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {systemHealth?.database.responseTime || 0}ms response time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {systemHealth ? (
                getStatusIcon(systemHealth.database.status)
              ) : (
                <Activity className="h-5 w-5 text-gray-600" />
              )}
              <span
                className={`text-sm font-medium capitalize ${getStatusColor(systemHealth?.database?.status ?? "unknown")}`}
              >
                {systemHealth?.database?.status ?? "Unknown"}
              </span>
            </div>
          </div>

          {/* Other Services */}
          {systemHealth?.services?.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-purple-600" />
                <div>
                  <p
                    className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {service.name}
                  </p>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Last checked:{" "}
                    {new Date(service.lastChecked).toLocaleString()}
                    {service.responseTime && ` • ${service.responseTime}ms`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(service.status)}
                <span
                  className={`text-sm font-medium capitalize ${getStatusColor(service.status)}`}
                >
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performance Metrics */}
      {performanceMetrics && (
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
          <h3
            className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Performance Metrics
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {performanceMetrics.responseTime}ms
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Avg Response Time
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {performanceMetrics.throughput}
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Requests/min
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {performanceMetrics.errorRate.toFixed(2)}%
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Error Rate
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {performanceMetrics.activeConnections}
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Active Connections
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
