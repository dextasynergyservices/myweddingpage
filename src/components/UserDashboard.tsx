"use client";

import { useEffect, useState } from "react";
import {
  Layout,
  BarChart3,
  Users,
  Video,
  Camera,
  Gift,
  CheckSquare,
  Eye,
  DollarSign,
  Calendar,
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
  const baseItems: NavigationItem[] = [
    { id: "overview", label: "Overview", icon: BarChart3, description: "Dashboard overview" },
    {
      id: "builder",
      label: "Page Builder",
      icon: Layout,
      description: "Drag & drop wedding page builder",
    },
    { id: "gallery", label: "Gallery", icon: Camera, description: "Photos" },
    {
      id: "gift",
      label: "Gifts/Wishes",
      icon: Gift,
      description: "Share what you'd love to receive",
    },
  ];

  const extraItems: NavigationItem[] = [
    { id: "guests", label: "Guests", icon: Users, description: "Guest management & seating" },
    { id: "streaming", label: "Live Stream", icon: Video, description: "Live streaming setup" },
    {
      id: "checklist",
      label: "Checklist",
      icon: CheckSquare,
      description: "Interactive planning checklist",
    },
  ];

  let navigationItems: NavigationItem[] = [...baseItems];

  if (planName === "Dazzle") {
    navigationItems = [...navigationItems, ...extraItems.slice(2)]; // add checklist only
  }

  if (planName === "Dynasty Royale") {
    navigationItems = [...navigationItems, ...extraItems]; // add all
  }

  const userWeddings: Wedding[] = [
    {
      id: "my-wedding-1",
      title: "Our Dream Wedding",
      date: "2024-08-15",
      status: "published",
      views: 1247,
      messages: 23,
      photos: 45,
      gifts: 12,
      budget: 25000,
      spent: 18500,
      guestCount: 150,
      rsvpCount: 127,
    },
  ];

  const baseStats: StatItem[] = [
    {
      title: "Total Views",
      value: "1,247",
      change: "+12%",
      icon: Eye,
      color: "from-blue-500 to-indigo-600",
      allowedPlans: ["Delight", "Darling", "Dazzle", "Dynasty Royale"],
    },
  ];

  const extraStats: StatItem[] = [
    {
      title: "Budget Used",
      value: "74%",
      change: "+8%",
      icon: DollarSign,
      color: "from-amber-500 to-orange-600",
      allowedPlans: ["Dazzle", "Dynasty Royale"],
    },
    {
      title: "Check List",
      value: "68/95",
      change: "+12",
      icon: CheckSquare,
      color: "from-purple-500 to-pink-500",
      allowedPlans: ["Dazzle", "Dynasty Royale"],
    },

    {
      title: "RSVP Responses",
      value: "127/150",
      change: "+5",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      allowedPlans: ["Dynasty Royale"],
    },
  ];

  let stats: StatItem[] = [...baseStats];

  if (planName === "Dazzle") {
    stats = [...stats, extraStats[1]]; // Add Check List
  }

  if (planName === "Dynasty Royale") {
    stats = [...stats, ...extraStats]; // add all extra stats for Dynasty Royale
  }

  // Filter stats based on current plan
  stats = stats.filter((stat) => stat.allowedPlans.includes(planName || ""));

  const baseQuickActions: QuickAction[] = [
    {
      title: "Build Wedding Page",
      description: "Use drag & drop builder",
      icon: Layout,
      color: "from-indigo-600 to-purple-600",
      action: () => setActiveTab("builder"),
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
      action: () => setActiveTab("checklists"),
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
    router.push("/wedding/new");
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
          navigationItems={navigationItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showAIAssistant={showAIAssistant}
          setShowAIAssistant={setShowAIAssistant}
          logout={logout}
        />

        <DashboardSidebar
          isDarkMode={isDarkMode}
          navigationItems={navigationItems}
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
