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
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/ToastProvider";
import { ErrorBoundary } from "@/components/admin/ErrorBoundary";
import React from "react";

function TemplateManagerGroup({
  collapsed,
  pathname,
  isDarkMode,
  items,
  routerPush,
}: {
  collapsed: boolean;
  pathname: string | null;
  isDarkMode: boolean;
  items: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description?: string;
    badgeCount?: number;
  }>;
  routerPush: (href: string) => void;
}) {
  // initialize open state from localStorage when available, or open if any child is active
  // find remote-media-gc badge count (if present) so we can render a compact badge when collapsed
  const remoteGcItem = items.find(
    (it) => it.href === "/dashboard/admin/remote-media-gc"
  );
  const remoteBadge =
    typeof remoteGcItem?.badgeCount === "number" ? remoteGcItem!.badgeCount : 0;
  const anyActive = items.some((it) => pathname === it.href);
  const [open, setOpen] = React.useState(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("admin-template-manager-open");
        if (stored !== null) return stored === "true";
      }
    } catch {
      // ignore
    }
    return anyActive;
  });

  // persist open state
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "admin-template-manager-open",
          open ? "true" : "false"
        );
      }
    } catch {
      // ignore
    }
  }, [open]);

  return (
    <div className="">
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          // support Enter and Space to toggle submenu for accessibility
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
          anyActive
            ? "bg-[#ab862b] text-white shadow-lg"
            : isDarkMode
              ? "text-gray-300 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
        } ${collapsed ? "justify-center px-2" : ""}`}
        aria-expanded={open}
        aria-controls="template-manager-submenu"
        title={collapsed ? "Template Manager" : "Template Manager"}
      >
        <Monitor className="h-5 w-5" />
        {collapsed && remoteBadge > 0 && (
          <div className="ml-1 flex items-center">
            <div
              className="h-4 w-6 rounded-full bg-red-600 px-1.5 py-0 text-[10px] font-semibold text-white flex items-center justify-center"
              role="status"
              aria-label={`Pending remote media deletions: ${remoteBadge}`}
              title={`Pending remote media deletions: ${remoteBadge}`}
            >
              <span className="sr-only">Pending remote media deletions:</span>
              {remoteBadge}
            </div>
          </div>
        )}
        {!collapsed && (
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">Template Manager</p>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </div>
            <p
              className={`text-xs ${anyActive ? "text-white/80" : "text-gray-500"}`}
            >
              Manage templates
            </p>
          </div>
        )}
      </button>

      {!collapsed && (
        <div
          id="template-manager-submenu"
          className={`mt-2 space-y-1 pl-8 pr-2 ${open ? "block" : "hidden"}`}
          role="group"
          aria-label="Template Manager"
        >
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = pathname === it.href;
            return (
              <button
                key={it.href}
                onClick={() => routerPush(it.href)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                  isActive
                    ? "bg-[#ab862b] text-white"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <div>{it.name}</div>
                  {typeof it.badgeCount === "number" && it.badgeCount > 0 && (
                    <div
                      className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white"
                      role="status"
                      aria-label={`Pending remote media deletions: ${it.badgeCount}`}
                      title={`Pending remote media deletions: ${it.badgeCount}`}
                    >
                      <span className="sr-only">
                        Pending remote media deletions:
                      </span>
                      {it.badgeCount}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlansManagerGroup({
  collapsed,
  pathname,
  isDarkMode,
  items,
  routerPush,
}: {
  collapsed: boolean;
  pathname: string | null;
  isDarkMode: boolean;
  items: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description?: string;
  }>;
  routerPush: (href: string) => void;
}) {
  const anyActive = items.some((it) => pathname === it.href);
  const [open, setOpen] = React.useState(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("admin-plans-open");
        if (stored !== null) return stored === "true";
      }
    } catch {}
    return anyActive;
  });

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("admin-plans-open", open ? "true" : "false");
      }
    } catch {}
  }, [open]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
          anyActive
            ? "bg-[#ab862b] text-white shadow-lg"
            : isDarkMode
              ? "text-gray-300 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
        } ${collapsed ? "justify-center px-2" : ""}`}
        aria-expanded={open}
        aria-controls="plans-manager-submenu"
      >
        <BarChart3 className="h-6 w-6" />
        {!collapsed && (
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">Plans Management</p>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </div>
            <p
              className={`text-xs ${anyActive ? "text-white/80" : "text-gray-500"}`}
            >
              Manage subscription plans
            </p>
          </div>
        )}
      </button>

      {!collapsed && (
        <div
          id="plans-manager-submenu"
          className={`mt-2 space-y-1 pl-8 pr-2 ${open ? "block" : "hidden"}`}
        >
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = pathname === it.href;
            return (
              <button
                key={it.href}
                onClick={() => routerPush(it.href)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                  isActive
                    ? "bg-[#ab862b] text-white"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <div>{it.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
    name: "Plans",
    href: "/dashboard/admin/plans",
    icon: BarChart3,
    description: "Manage subscription plans",
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
  // Template manager group will be rendered separately to allow a collapsible submenu
];

const templateManagerItems: Array<{
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  badgeCount?: number;
}> = [
  {
    name: "Upload Package",
    href: "/dashboard/admin/templates/upload",
    icon: LayoutDashboard,
    description: "Upload new template packages (staging)",
  },
  {
    name: "Staging",
    href: "/dashboard/admin/templates/staging",
    icon: Monitor,
    description: "View staged templates",
  },
  {
    name: "PR Status",
    href: "/dashboard/admin/templates/pr/status",
    icon: Activity,
    description: "Template PR and merge status",
  },
  {
    name: "Categories",
    href: "/dashboard/admin/templates/categories",
    icon: Users,
    description: "Manage template categories",
  },
  {
    name: "Thumbnails",
    href: "/dashboard/admin/templates/thumbnails",
    icon: LayoutDashboard,
    description: "Manage template thumbnails",
  },
  {
    name: "Audit",
    href: "/dashboard/admin/templates/audit",
    icon: Activity,
    description: "Template import audit events",
  },
  {
    name: "Remote Media GC",
    href: "/dashboard/admin/remote-media-gc",
    icon: Activity,
    description: "Manage remote media garbage collection",
  },
];

// Note: templateManagerItems is static; we create a render-time copy that injects the live badge count
// inside the component below so lint rules won't complain about unused vars.

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
      localStorage.setItem(
        "admin-sidebar-collapsed",
        isSidebarCollapsed.toString()
      );
    }
  }, [isSidebarCollapsed]);

  // Pending count for Remote Media GC badge
  const [pendingGCCount, setPendingGCCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function loadCount() {
      try {
        const res = await fetch(`/api/admin/remote-media-gc/pending-count`);
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setPendingGCCount(Number(json?.pending || 0));
        }
      } catch {
        // ignore; we'll retry on interval
      }
    }

    loadCount();
    const id = setInterval(loadCount, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // compute a render-time copy with badge injected
  const templateManagerItemsWithBadge = templateManagerItems.map((it) =>
    it.href === "/dashboard/admin/remote-media-gc"
      ? { ...it, badgeCount: pendingGCCount }
      : it
  );

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
          <p
            className={`mt-4 text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
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
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
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
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ab862b]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1
                  className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Admin Dashboard
                </h1>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
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
                {session?.user?.name?.charAt(0) ||
                  session?.user?.email?.charAt(0) ||
                  "A"}
              </div>
              <div className="hidden text-left sm:block">
                <p
                  className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {session?.user?.name || "Admin"}
                </p>
                <p
                  className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
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
                    isDarkMode
                      ? "border-gray-800 bg-gray-900"
                      : "border-gray-200 bg-white"
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
              // we render Plans via the PlansManagerGroup below to provide a nested submenu
              if (item.href === "/dashboard/admin/plans") return null;
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
                      <p
                        className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}
                      >
                        {item.description}
                      </p>
                    </div>
                  )}
                </motion.button>
              );
            })}

            {/* Plans Management collapsible group */}
            <div>
              <PlansManagerGroup
                collapsed={isSidebarCollapsed}
                pathname={pathname}
                isDarkMode={isDarkMode}
                items={[
                  {
                    name: "Manage Plans",
                    href: "/dashboard/admin/plans",
                    icon: BarChart3,
                  },
                  {
                    name: "Create plan",
                    href: "/dashboard/admin/plans/new",
                    icon: Plus,
                  },
                  {
                    name: "Audit",
                    href: "/dashboard/admin/plans/audit",
                    icon: Activity,
                  },
                ]}
                routerPush={(h: string) => router.push(h)}
              />
            </div>

            {/* Template Manager collapsible group */}
            <div>
              <TemplateManagerGroup
                collapsed={isSidebarCollapsed}
                pathname={pathname}
                isDarkMode={isDarkMode}
                items={templateManagerItemsWithBadge}
                routerPush={(h: string) => router.push(h)}
              />
            </div>
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
                  isDarkMode
                    ? "border-gray-800 bg-gray-900"
                    : "border-gray-200 bg-white"
                } lg:hidden`}
              >
                <nav className="p-4 space-y-2">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    // skip plans here; we'll render Plans group separately for mobile
                    if (item.href === "/dashboard/admin/plans") return null;

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
                          <p
                            className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}

                  {/* Plans group for mobile - simple flat list under nav */}
                  <div className="mt-2">
                    <div className="mt-2 text-xs font-medium text-gray-500 pl-1">
                      Plans Management
                    </div>
                    {[
                      {
                        name: "Manage Plans",
                        href: "/dashboard/admin/plans",
                        icon: BarChart3,
                      },
                      {
                        name: "Create plan",
                        href: "/dashboard/admin/plans/new",
                        icon: Plus,
                      },
                      {
                        name: "Audit",
                        href: "/dashboard/admin/plans/audit",
                        icon: Activity,
                      },
                    ].map((it) => {
                      const Icon = it.icon;
                      const isActive = pathname === it.href;
                      return (
                        <motion.button
                          key={it.href}
                          onClick={() => {
                            router.push(it.href);
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
                            <p className="font-medium">{it.name}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Template Manager group for mobile */}
                  <div>
                    <div className="mt-2 text-xs font-medium text-gray-500 pl-1">
                      Template Manager
                    </div>
                    {templateManagerItemsWithBadge.map((it) => {
                      const Icon = it.icon;
                      const isActive = pathname === it.href;
                      return (
                        <motion.button
                          key={it.href}
                          onClick={() => {
                            router.push(it.href);
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
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <div>
                              <p className="font-medium">{it.name}</p>
                              <p
                                className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}
                              >
                                {it.description}
                              </p>
                            </div>
                            {typeof it.badgeCount === "number" &&
                              it.badgeCount > 0 && (
                                <div
                                  className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white"
                                  role="status"
                                  aria-label={`Pending remote media deletions: ${it.badgeCount}`}
                                  title={`Pending remote media deletions: ${it.badgeCount}`}
                                >
                                  <span className="sr-only">
                                    Pending remote media deletions:
                                  </span>
                                  {it.badgeCount}
                                </div>
                              )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
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
