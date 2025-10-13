"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Shield,
  Users,
  Activity,
  Lock,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Heart,
  Monitor,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/ToastProvider";
import { ErrorBoundary } from "@/components/admin/ErrorBoundary";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    name: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    description: "System statistics and metrics",
  },
  {
    name: "Wedding Analytics",
    href: "/dashboard/admin/wedding-analytics",
    icon: Heart,
    description: "Wedding page performance data",
  },
  {
    name: "System Monitoring",
    href: "/dashboard/admin/system-monitoring",
    icon: Monitor,
    description: "Monitor system health and performance",
  },
  {
    name: "Business Intelligence",
    href: "/dashboard/admin/business-intelligence",
    icon: BarChart3,
    description: "Revenue tracking and growth analytics",
  },
  {
    name: "Security Logs",
    href: "/dashboard/admin/security-logs",
    icon: Shield,
    description: "View security events",
  },
  {
    name: "Raw IP Audit",
    href: "/dashboard/admin/audit/show-raw-ips",
    icon: Users,
    description: "Which admins can view raw IPs",
  },
  {
    name: "User Management",
    href: "/dashboard/admin/users",
    icon: Users,
    description: "Manage user accounts",
  },
  {
    name: "Rate Limits",
    href: "/dashboard/admin/rate-limits",
    icon: Activity,
    description: "Monitor rate limiting",
  },
  {
    name: "Account Lockouts",
    href: "/dashboard/admin/lockouts",
    icon: Lock,
    description: "Manage locked accounts",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-sidebar-collapsed", isSidebarCollapsed.toString());
    }
  }, [isSidebarCollapsed]);

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className={`mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#ab862b] border-t-transparent`}
          />
          <p className={`mt-4 text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Verifying admin access...
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-40 border-b ${
          isDarkMode
            ? "border-gray-800 bg-gray-900/95 backdrop-blur"
            : "border-gray-200 bg-white/95 backdrop-blur"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ab862b]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  System Management
                </p>
              </div>
            </div>

            {/* Desktop sidebar collapse button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:block rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ab862b] text-sm font-semibold text-white">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "A"}
              </div>
              <div className="hidden text-left sm:block">
                <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {session?.user?.name || "Admin"}
                </p>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {session?.user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-lg ${
                    isDarkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => router.push("/dashboard")}
                    className={`flex w-full items-center gap-2 px-4 py-3 text-left transition-colors ${
                      isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>User Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`flex w-full items-center gap-2 px-4 py-3 text-left text-red-600 transition-colors ${
                      isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
          className={`hidden lg:block border-r ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          } min-h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <nav className="p-4 space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <motion.button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                    isActive
                      ? "bg-[#ab862b] text-white shadow-lg"
                      : isDarkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                  } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
                  title={isSidebarCollapsed ? item.name : ""}
                >
                  <Icon className="h-5 w-5" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              />

              {/* Sidebar content */}
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 20 }}
                className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r ${
                  isDarkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
                } lg:hidden`}
              >
                <nav className="p-4 space-y-2">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <motion.button
                        key={item.href}
                        onClick={() => {
                          router.push(item.href);
                          setIsSidebarOpen(false);
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                          isActive
                            ? "bg-[#ab862b] text-white shadow-lg"
                            : isDarkMode
                              ? "text-gray-300 hover:bg-gray-800"
                              : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}>
                            {item.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </ErrorBoundary>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastProvider />
    </div>
  );
}
