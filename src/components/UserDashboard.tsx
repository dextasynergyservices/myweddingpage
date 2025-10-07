"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layout,
  BarChart3,
  Users,
  Video,
  Camera,
  Gift,
  CheckSquare,
  Eye,
  Calendar,
  Shield,
  // (DollarSign was removed as it was unused)
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { NavigationItem, StatItem, QuickAction, Wedding, DashboardProps } from "@/types/dashboard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMobileHeader from "@/components/dashboard/DashboardMobileHeader";
import DashboardMobileSidebar from "@/components/dashboard/DashboardMobileSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardAIAssistant from "@/components/dashboard/DashboardAIAssistant";

const Dashboard = ({ onSelectCouple }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [, setHasTemplate] = useState<boolean>(false);
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  // ✅ FETCH USER PLAN
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch("/api/user/plans");
        const data = await res.json();
        if (res.ok) {
          setPlanName(data.planName);
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
      }
    };

    fetchPlan();
  }, []);

  // ✅ DEFAULT NAVIGATION ITEMS
  const baseItems = useMemo(
    (): NavigationItem[] => [
      { id: "overview", label: "Overview", icon: BarChart3, description: "Dashboard overview" },
      { id: "gallery", label: "Gallery", icon: Camera, description: "Photos" },
      {
        id: "gift",
        label: "Gifts/Wishes",
        icon: Gift,
        description: "Share what you'd love to receive",
      },
      {
        id: "security",
        label: "Security",
        icon: Shield,
        description: "Two-factor authentication & account security",
      },
    ],
    []
  );

  const extraItems = useMemo(
    (): NavigationItem[] => [
      { id: "guests", label: "Guests", icon: Users, description: "Guest management & seating" },
      { id: "streaming", label: "Live Stream", icon: Video, description: "Live streaming setup" },
      {
        id: "checklist",
        label: "Task/Checklist",
        icon: CheckSquare,
        description: "Interactive planning checklist",
      },
    ],
    []
  );

  const navigationItems = useMemo(() => {
    let items: NavigationItem[] = [...baseItems];

    if (planName === "Dazzle") {
      items = [...items, ...extraItems.slice(2)]; // add checklist only
    }

    if (planName === "Dynasty Royale") {
      items = [...items, ...extraItems]; // add all
    }

    return items;
  }, [planName, baseItems, extraItems]);

  const [userWeddings, setUserWeddings] = useState<Wedding[]>([]);
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [tasksTotal, setTasksTotal] = useState<number>(0);
  const [tasksCompleted, setTasksCompleted] = useState<number>(0);
  const [guestsTotal, setGuestsTotal] = useState<number>(0);
  const [guestsResponded, setGuestsResponded] = useState<number>(0);
  const [weddingPageDeleted, setWeddingPageDeleted] = useState<boolean>(false);

  // Fetch tasks to compute checklist totals
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasksTotal(data.length);
          // Narrow items that have a completed property
          const hasCompleted = (x: unknown): x is { completed?: boolean } =>
            typeof x === "object" && x !== null && "completed" in x;
          setTasksCompleted(data.filter(hasCompleted).filter((t) => !!t.completed).length);
        }
      } catch (error) {
        console.error("Failed to fetch tasks for dashboard stats:", error);
      }
    };

    fetchTasks();
  }, []);

  // Fetch user's wedding / template data and create a dashboard-friendly Wedding[]
  useEffect(() => {
    let mounted = true;

    const fetchWeddingOverview = async () => {
      try {
        const res = await fetch("/api/wedding-data", { credentials: "same-origin" });
        if (!res.ok) {
          if (mounted) setUserWeddings([]);
          return;
        }
        const data = await res.json();

        const wp = data?.weddingPage ?? null;
        const u = data?.userData ?? {};
        const guests = Array.isArray(data?.guests) ? data.guests : [];
        const gifts = Array.isArray(data?.gifts) ? data.gifts : [];
        const gallery = Array.isArray(data?.gallery) ? data.gallery : [];

        const guestCount = guests.length;
        const hasRsvpStatus = (x: unknown): x is { rsvpStatus?: string } =>
          typeof x === "object" && x !== null && "rsvpStatus" in x;
        const rsvpCount = guests.filter(
          (g: unknown) => hasRsvpStatus(g) && !!g.rsvpStatus && g.rsvpStatus !== "PENDING"
        ).length;

        const hasPurchased = (x: unknown): x is { purchased?: boolean } =>
          typeof x === "object" && x !== null && "purchased" in x;
        const giftsReceived =
          gifts.filter(hasPurchased).filter((g: { purchased?: boolean }) => !!g.purchased).length ||
          gifts.length ||
          0;

        const messages =
          (data?.userData?.guestMessages?.length as number) ||
          (wp?.comments?.length as number) ||
          0;

        const photos = gallery.length;

        const title = `${u.groomName || "Groom"} & ${u.brideName || "Bride"}`;

        const isoDate = u.weddingDate
          ? new Date(u.weddingDate).toISOString().split("T")[0]
          : wp?.wedding_date
            ? new Date(wp.wedding_date).toISOString().split("T")[0]
            : "";

        const status = wp?.is_live ? "published" : data?.userTemplate ? "customizing" : "draft";

        // Set template status for navigation
        setHasTemplate(!!data?.userTemplate);

        // Check if wedding page is soft deleted
        setWeddingPageDeleted(!!wp?.deleted_at);

        const weddingObj: Wedding = {
          id: wp?.id ?? u.id ?? "",
          title,
          date: isoDate,
          status,
          views: wp?.views ?? data?.views ?? 0,
          messages: messages ?? 0,
          photos: photos,
          gifts: giftsReceived,
          budget: 0,
          spent: 0,
          guestCount,
          rsvpCount,
        };

        if (mounted) setUserWeddings([weddingObj]);
      } catch (err) {
        console.error("Failed to fetch dashboard wedding data:", err);
        if (mounted) setUserWeddings([]);
      }
    };

    fetchWeddingOverview();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch guests to compute RSVP totals
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await fetch("/api/guests", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setGuestsTotal(data.length);
          const hasRsvpStatus = (x: unknown): x is { rsvpStatus?: string } =>
            typeof x === "object" && x !== null && "rsvpStatus" in x;
          setGuestsResponded(
            data.filter((g) => hasRsvpStatus(g) && !!g.rsvpStatus && g.rsvpStatus !== "PENDING")
              .length
          );
        }
      } catch (error) {
        console.error("Failed to fetch guests for dashboard stats:", error);
      }
    };

    fetchGuests();
  }, []);

  // Fetch lightweight endpoint that returns only views (authenticated)
  useEffect(() => {
    let mounted = true;
    const fetchWeddingViews = async () => {
      try {
        const res = await fetch("/api/wedding-views", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && typeof data?.views === "number") {
          setTotalViews(data.views);
          // Also update the per-wedding displayed views so OverviewContent reflects
          // the same refreshed value as the Total Views stat.
          setUserWeddings((prev) => {
            if (!prev || prev.length === 0) return prev;
            return prev.map((w, idx) => {
              // If the polled response included a weddingPage id, try to match by id;
              // otherwise, apply the views to the first (primary) wedding object.
              const polledId = data?.weddingPage?.id;
              if (polledId && w.id === polledId) {
                return { ...w, views: data.views };
              }
              if (!polledId && idx === 0) {
                return { ...w, views: data.views };
              }
              return w;
            });
          });
        }
      } catch (err) {
        console.error("Failed to fetch wedding views:", err);
      }
    };

    fetchWeddingViews();

    // Poll every 30 seconds
    const id = setInterval(fetchWeddingViews, 30 * 1000);

    // Refresh when window regains focus
    const onFocus = () => fetchWeddingViews();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Create navigation items with conditional page-builder disabling
  const finalNavigationItems = useMemo(() => {
    const pageBuilderItem: NavigationItem = {
      id: "page-builder",
      label: "Page Builder",
      icon: Layout,
      description: weddingPageDeleted ? "Page deleted - renew to restore" : "Wedding page builder",
      disabled: weddingPageDeleted,
      disabledReason: weddingPageDeleted
        ? "Wedding page has been deleted. Please renew your subscription to restore access."
        : undefined,
    };

    return [...navigationItems.slice(0, 1), pageBuilderItem, ...navigationItems.slice(1)];
  }, [navigationItems, weddingPageDeleted]);

  const baseStats: StatItem[] = [
    {
      title: "Total Views",
      value: totalViews != null ? totalViews.toLocaleString() : "—",
      change: "+12%",
      icon: Eye,
      color: "from-blue-500 to-indigo-600",
      allowedPlans: ["Delight", "Darling", "Dazzle", "Dynasty Royale"],
    },
  ];

  const extraStats: StatItem[] = [
    {
      title: "Check List",
      value: `${tasksCompleted}/${tasksTotal}`,
      change: tasksTotal > 0 ? `+${Math.round((tasksCompleted / tasksTotal) * 100)}%` : "+0%",
      icon: CheckSquare,
      color: "from-purple-500 to-pink-500",
      allowedPlans: ["Dazzle", "Dynasty Royale"],
    },

    {
      title: "RSVP Responses",
      value: `${guestsResponded}/${guestsTotal}`,
      change: "+5",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      allowedPlans: ["Dynasty Royale"],
    },
  ];

  let stats: StatItem[] = [...baseStats];

  if (planName === "Dazzle") {
    stats = [...stats, extraStats[0]]; // Add Check List
  }

  if (planName === "Dynasty Royale") {
    stats = [...stats, ...extraStats]; // add all extra stats for Dynasty Royale
  }

  // Filter stats based on current plan
  stats = stats.filter((stat) => stat.allowedPlans.includes(planName || ""));

  const baseQuickActions: QuickAction[] = [
    {
      title: "Build Wedding Page",
      description: "Wedding Page Builder",
      icon: Layout,
      color: "from-indigo-600 to-purple-600",
      action: () => setActiveTab("page-builder"),
      allowedPlans: ["Delight", "Darling", "Dazzle", "Dynasty Royale"],
    },
    {
      title: "Gallery",
      description: "View, Add Photos & Videos",
      icon: Camera,
      color: "from-pink-500 to-purple-500",
      action: () => setActiveTab("gallery"),
      allowedPlans: ["Delight", "Darling", "Dazzle", "Dynasty Royale"],
    },
    {
      title: "Gifts & Wishes",
      description: "share what you love to receive",
      icon: Gift,
      color: "from-teal-600 to-emerald-500",
      action: () => setActiveTab("gift"),
      allowedPlans: ["Delight", "Darling", "Dazzle", "Dynasty Royale"],
    },
  ];

  const extraQuickActions: QuickAction[] = [
    {
      title: "Manage Guests",
      description: "Seating & RSVP tracking",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      action: () => setActiveTab("guests"),
      allowedPlans: ["Dynasty Royale"],
    },
    {
      title: "Check List",
      description: "Hour-by-hour schedule",
      icon: Calendar,
      color: "from-amber-500 to-orange-600",
      action: () => setActiveTab("checklist"),
      allowedPlans: ["Dazzle", "Dynasty Royale"],
    },
    {
      title: "Live Stream",
      description: "Livesteam your wedding",
      icon: Calendar,
      color: "from-red-800 to-red-500",
      action: () => setActiveTab("streaming"),
      allowedPlans: ["Dynasty Royale"],
    },
  ];

  let quickActions: QuickAction[] = [...baseQuickActions];

  if (planName === "Dazzle") {
    quickActions = [...quickActions, extraQuickActions[1]]; // add checklist only
  }

  if (planName === "Dynasty Royale") {
    quickActions = [...quickActions, ...extraQuickActions]; // add all
  }

  const handleCreateWedding = () => {
    setActiveTab?.("page-builder");
  };

  const handleViewWedding = (weddingId: string) => {
    onSelectCouple(weddingId);
    router.push(`/wedding/${weddingId}`);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      <DashboardMobileHeader
        isDarkMode={isDarkMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex flex-col md:flex-row">
        <DashboardMobileSidebar
          isDarkMode={isDarkMode}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          navigationItems={finalNavigationItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showAIAssistant={showAIAssistant}
          setShowAIAssistant={setShowAIAssistant}
          logout={logout}
        />

        <DashboardSidebar
          isDarkMode={isDarkMode}
          navigationItems={finalNavigationItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showAIAssistant={showAIAssistant}
          setShowAIAssistant={setShowAIAssistant}
          logout={logout}
        />

        <div className="flex-1 flex">
          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">
              <DashboardContent
                activeTab={activeTab}
                isDarkMode={isDarkMode}
                user={user || undefined}
                stats={stats}
                quickActions={quickActions}
                userWeddings={userWeddings}
                handleCreateWedding={handleCreateWedding}
                handleViewWedding={handleViewWedding}
                setActiveTab={setActiveTab}
                tasksTotal={tasksTotal}
                tasksCompleted={tasksCompleted}
                weddingPageDeleted={weddingPageDeleted}
              />
            </div>
          </div>

          {/* ✅ AI Assistant is shown only for Dynasty Royale */}
          {planName === "Dynasty Royale" && (
            <DashboardAIAssistant showAIAssistant={showAIAssistant} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
