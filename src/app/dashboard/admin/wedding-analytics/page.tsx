"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Heart,
  Search,
  Eye,
  TrendingUp,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";

interface WeddingPage {
  id: string;
  title: string;
  slug: string;
  views: number;
  is_live: boolean;
  created_at: string;
  couple_name: string;
  template_name: string;
  last_viewed_at: string | null;
  engagement_rate: number;
}

interface TemplateStats {
  template: string;
  count: number;
  total_views: number;
  average_views: number;
  live_count: number;
}

interface AnalyticsSummary {
  totalPages: number;
  livePages: number;
  totalViews: number;
  averageViewsPerPage: number;
  topPerformingPages: WeddingPage[];
  templateStats: TemplateStats[];
  recentPages: WeddingPage[];
  templatePagination?: {
    totalPages: number;
    [key: string]: unknown;
  };
}

export default function WeddingAnalyticsPage() {
  const { isDarkMode } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPages, setFilteredPages] = useState<WeddingPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"views" | "created_at" | "engagement_rate">("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pagesPerPage = 15;
  // Pagination for template performance table
  const templatesPerPage = 10;
  const [templateCursor, setTemplateCursor] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    filterAndSortPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, searchQuery, sortBy, sortOrder]);

  const fetchAnalytics = async (opts?: {
    templateCursor?: string | null;
    templatePerPage?: number;
  }) => {
    try {
      const qp = new URLSearchParams();
      if (opts?.templateCursor) qp.set("templateCursor", String(opts.templateCursor));
      if (opts?.templatePerPage) qp.set("templatePerPage", String(opts.templatePerPage));
      const url =
        "/api/admin/dashboard/wedding-analytics" + (qp.toString() ? `?${qp.toString()}` : "");

      const response = await fetch(url, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // API sometimes returns a wrapper { success: true, analytics: { ... } }
        // while the UI expects the analytics object directly. Accept both shapes.
        const payload = data?.analytics ?? data;
        setAnalytics(payload);
        // store next cursor if available
        const next = payload?.templatePagination?.nextCursor ?? null;
        setTemplateCursor(next);
      } else {
        toast.error("Failed to fetch wedding analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch wedding analytics");
    } finally {
      setLoading(false);
    }
  };

  const safeNumber = (v: unknown, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const filterAndSortPages = () => {
    if (!analytics) return;

    // Guard: topPerformingPages may be undefined/null when the API returns an unexpected shape.
    const topPages = Array.isArray(analytics.topPerformingPages)
      ? analytics.topPerformingPages
      : [];
    let pages = [...topPages];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      pages = pages.filter(
        (page) =>
          page.couple_name.toLowerCase().includes(query) ||
          page.template_name.toLowerCase().includes(query) ||
          page.title.toLowerCase().includes(query)
      );
    }

    // Sort pages robustly: coerce values and handle null/undefined
    pages.sort((a, b) => {
      const getValue = (p: WeddingPage) => {
        if (sortBy === "created_at") {
          return p.created_at ? new Date(p.created_at).getTime() : 0;
        }
        if (sortBy === "views") {
          return typeof p.views === "number" ? p.views : Number(p.views) || 0;
        }
        if (sortBy === "engagement_rate") {
          return typeof p.engagement_rate === "number"
            ? p.engagement_rate
            : Number(p.engagement_rate) || 0;
        }
        return 0;
      };

      const aValue = getValue(a);
      const bValue = getValue(b);

      if (sortOrder === "asc") return aValue - bValue;
      return bValue - aValue;
    });

    setFilteredPages(pages);
    setCurrentPage(1);
  };

  const handleSort = (field: "views" | "created_at" | "engagement_rate") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const exportData = () => {
    if (!analytics) return;

    const csvData = [
      ["Couple Name", "Template", "Views", "Status", "Created", "Last Viewed", "Engagement Rate"],
      ...filteredPages.map((page) => [
        page.couple_name,
        page.template_name,
        page.views.toString(),
        page.is_live ? "Live" : "Draft",
        new Date(page.created_at).toLocaleDateString(),
        page.last_viewed_at ? new Date(page.last_viewed_at).toLocaleDateString() : "Never",
        `${Number(page.engagement_rate ?? 0).toFixed(1)}%`,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <PageSkeleton />;
  }

  // Pagination calculations for top pages list
  const totalPages = Math.ceil(filteredPages.length / pagesPerPage);
  const startIndex = (currentPage - 1) * pagesPerPage;
  const endIndex = startIndex + pagesPerPage;
  const currentPages = filteredPages.slice(startIndex, endIndex);

  // Pagination for template performance table
  // With cursor pagination the API returns the current page in `templateStats`
  const visibleTemplates = analytics?.templateStats ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Wedding Analytics
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Comprehensive analytics for all wedding pages on your platform
          </p>
        </div>
        <button
          onClick={exportData}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
            isDarkMode
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
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
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Total Pages
              </p>
              <p
                className={`mt-1 text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {analytics?.totalPages || 0}
              </p>
            </div>
            <Heart className="h-8 w-8 text-pink-600" />
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
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Live Pages
              </p>
              <p
                className={`mt-1 text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {analytics?.livePages || 0}
              </p>
            </div>
            <Heart className="h-8 w-8 text-green-600" />
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
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Total Views
              </p>
              <p
                className={`mt-1 text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {analytics?.totalViews?.toLocaleString() || 0}
              </p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
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
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Avg Views/Page
              </p>
              <p
                className={`mt-1 text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {typeof analytics?.averageViewsPerPage === "number"
                  ? analytics!.averageViewsPerPage.toFixed(1)
                  : 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Template Stats */}
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
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Template Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <tr>
                <th
                  className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Template
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Pages Created
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Live Pages
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total Views
                </th>
                <th
                  className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Avg Views
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleTemplates.map((template) => (
                <tr
                  key={template.template}
                  className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                  <td className={`py-3 px-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {template.template}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {template.count}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {template.live_count}
                  </td>
                  <td
                    className={`py-3 px-4 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {safeNumber(template.total_views, 0).toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {Number(safeNumber(template.average_views, 0)).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Cursor-based pagination controls (Next / Reset) */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <div className="text-sm text-gray-500 mr-2">Templates</div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                // Fetch next page using current cursor
                if (!templateCursor) return;
                await fetchAnalytics({
                  templateCursor,
                  templatePerPage: templatesPerPage,
                });
              }}
              disabled={!templateCursor}
              className={`px-3 py-1 rounded ${
                !templateCursor
                  ? "text-gray-400 cursor-not-allowed"
                  : isDarkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-700 border"
              }`}
            >
              Next
            </button>
            <button
              onClick={async () => {
                // Reset to first page
                setTemplateCursor(null);
                await fetchAnalytics({
                  templateCursor: null,
                  templatePerPage: templatesPerPage,
                });
              }}
              className={`px-3 py-1 rounded ${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"}`}
            >
              Reset
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-xl border p-4 ${
          isDarkMode
            ? "border-gray-800 bg-gray-900/50 backdrop-blur"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search by couple name, template, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab862b] ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Sort by:
            </span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-") as [
                  typeof sortBy,
                  typeof sortOrder,
                ];
                setSortBy(field);
                setSortOrder(order);
              }}
              className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab862b] ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="views-desc">Views (High to Low)</option>
              <option value="views-asc">Views (Low to High)</option>
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="engagement_rate-desc">Engagement (High to Low)</option>
              <option value="engagement_rate-asc">Engagement (Low to High)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Pages Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`rounded-xl border ${
          isDarkMode
            ? "border-gray-800 bg-gray-900/50 backdrop-blur"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`border-b ${isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Couple
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Template
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    isDarkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleSort("views")}
                >
                  Views {sortBy === "views" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    isDarkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleSort("engagement_rate")}
                >
                  Engagement {sortBy === "engagement_rate" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    isDarkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleSort("created_at")}
                >
                  Created {sortBy === "created_at" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Last Viewed
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
              {currentPages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Heart
                      className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                    />
                    <p className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {searchQuery
                        ? "No wedding pages match your search"
                        : "No wedding pages found"}
                    </p>
                  </td>
                </tr>
              ) : (
                currentPages.map((page, index) => (
                  <motion.tr
                    key={page.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`transition-colors ${
                      isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {page.couple_name}
                        </p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {page.title}
                        </p>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {page.template_name}
                    </td>
                    <td
                      className={`px-6 py-4 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          page.is_live
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {page.is_live ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {Number(page.engagement_rate ?? 0).toFixed(1)}%
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {new Date(page.created_at).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {page.last_viewed_at
                        ? new Date(page.last_viewed_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => window.open(`/wedding/${page.slug}`, "_blank")}
                        className={`rounded-lg p-2 transition-colors ${
                          isDarkMode
                            ? "hover:bg-gray-800 text-gray-400"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                        title="View Wedding Page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className={`flex items-center justify-between border-t px-6 py-4 ${
              isDarkMode ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredPages.length)} of{" "}
              {filteredPages.length} wedding pages
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
    </div>
  );
}
