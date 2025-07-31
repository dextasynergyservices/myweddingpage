"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Heart,
  Plus,
  Calendar,
  Users,
  Camera,
  // Gift,
  // MessageCircle,
  // Settings,
  BarChart3,
  Eye,
  Edit,
  // Trash2,
  // Star,
  Layout,
  DollarSign,
  Video,
  UserCheck,
  BookOpen,
  CheckSquare,
  Smartphone,
  Bot,
  // Palette,
  // MapPin,
  // Clock,
  // CreditCard,
  // FileText,
  // Zap,
  // Target,
  // TrendingUp,
  // Bell,
  // Home
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ui/ThemeToggle";

// Import feature components
import WeddingPageBuilder from "./dashboard/WeddingPageBuilder";
import AIPhotoCuration from "./dashboard/AIPhotoCuration";
import GuestManagement from "./dashboard/GuestManagement";
import TimelinePlanner from "./dashboard/TimelinePlanner";
import BudgetTracker from "./dashboard/BudgetTracker";
import LiveStreaming from "./dashboard/LiveStreaming";
import VendorPortal from "./dashboard/VendorPortal";
import MemoryBookGenerator from "./dashboard/MemoryBookGenerator";
import InteractiveChecklist from "./dashboard/InteractiveChecklist";
import MobileAppExtension from "./dashboard/MobileAppExtension";
// import AIAssistant from "./dashboard/AIAssistant";

// type Couple = {
//   id: string;
//   name: string;
// };

type DashboardProps = {
  onSelectCouple: (coupleId: string) => void;
};

const Dashboard = ({ onSelectCouple }: DashboardProps) => {
  // const [couples] = useState<Couple[]>([
  //   { id: "1", name: "Sarah & John" },
  //   { id: "2", name: "Jane & Mike" },
  // ]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter(); // Next.js router instead of useNavigate

  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3, description: "Dashboard overview" },
    {
      id: "builder",
      label: "Page Builder",
      icon: Layout,
      description: "Drag & drop wedding page builder",
    },
    { id: "photos", label: "AI Photos", icon: Camera, description: "AI-powered photo curation" },
    { id: "guests", label: "Guests", icon: Users, description: "Guest management & seating" },
    { id: "timeline", label: "Timeline", icon: Calendar, description: "Wedding day planner" },
    { id: "budget", label: "Budget", icon: DollarSign, description: "Expense tracking" },
    { id: "streaming", label: "Live Stream", icon: Video, description: "Live streaming setup" },
    { id: "vendors", label: "Vendors", icon: UserCheck, description: "Vendor management" },
    { id: "memory", label: "Memory Book", icon: BookOpen, description: "Automated memory book" },
    {
      id: "checklist",
      label: "Checklist",
      icon: CheckSquare,
      description: "Interactive planning checklist",
    },
    { id: "mobile", label: "Mobile", icon: Smartphone, description: "Mobile app management" },
  ];

  const userWeddings = [
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

  const stats = [
    {
      title: "Total Views",
      value: "1,247",
      change: "+12%",
      icon: Eye,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "RSVP Responses",
      value: "127/150",
      change: "+5",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Budget Used",
      value: "74%",
      change: "+8%",
      icon: DollarSign,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Tasks Complete",
      value: "68/95",
      change: "+12",
      icon: CheckSquare,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const quickActions = [
    {
      title: "Build Wedding Page",
      description: "Use drag & drop builder",
      icon: Layout,
      color: "from-indigo-600 to-purple-600",
      action: () => setActiveTab("builder"),
    },
    {
      title: "Manage Guests",
      description: "Seating & RSVP tracking",
      icon: Users,
      color: "from-emerald-600 to-teal-600",
      action: () => setActiveTab("guests"),
    },
    {
      title: "Plan Timeline",
      description: "Hour-by-hour schedule",
      icon: Calendar,
      color: "from-purple-600 to-pink-600",
      action: () => setActiveTab("timeline"),
    },
    {
      title: "Track Budget",
      description: "Monitor expenses",
      icon: DollarSign,
      color: "from-amber-600 to-orange-600",
      action: () => setActiveTab("budget"),
    },
  ];

  const handleCreateWedding = () => {
    router.push("/wedding/new");
  };

  const handleViewWedding = (weddingId: string) => {
    onSelectCouple(weddingId);
    router.push(`/wedding/${weddingId}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "builder":
        return <WeddingPageBuilder />;
      case "photos":
        return <AIPhotoCuration />;
      case "guests":
        return <GuestManagement />;
      case "timeline":
        return <TimelinePlanner />;
      case "budget":
        return <BudgetTracker />;
      case "streaming":
        return <LiveStreaming />;
      case "vendors":
        return <VendorPortal />;
      case "memory":
        return <MemoryBookGenerator />;
      case "checklist":
        return <InteractiveChecklist />;
      case "mobile":
        return <MobileAppExtension />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div
        className={`rounded-3xl p-8 ${
          isDarkMode
            ? "bg-gradient-to-r from-slate-800 to-slate-700"
            : "bg-gradient-to-r from-indigo-50 to-purple-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Welcome back, {user?.name}
            </h1>
            <p className={`text-lg ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Your wedding planning dashboard is ready to help make your day perfect.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
            <Heart className="h-12 w-12 text-white" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } rounded-3xl p-6 shadow-lg border ${
              isDarkMode ? "border-slate-700" : "border-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-3xl font-light mt-1 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-medium mt-1 text-emerald-600">
                  {stat.change} this month
                </p>
              </div>
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-3xl p-8 shadow-lg border ${
          isDarkMode ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <h2 className={`text-2xl font-light mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              onClick={action.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col items-center gap-4 p-6 bg-gradient-to-r ${action.color} text-white rounded-2xl hover:shadow-lg transition-all duration-300`}
            >
              <action.icon className="h-8 w-8" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* My Weddings */}
      <div
        className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-3xl p-8 shadow-lg border ${
          isDarkMode ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            My Wedding Pages
          </h2>
          <button
            onClick={handleCreateWedding}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New
          </button>
        </div>

        {userWeddings.length > 0 ? (
          <div className="space-y-6">
            {userWeddings.map((wedding) => (
              <motion.div
                key={wedding.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                  isDarkMode
                    ? "bg-slate-700/50 border-slate-600 hover:border-slate-500"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl">
                      <Heart className="h-8 w-8 text-white" fill="currentColor" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-semibold mb-2 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {wedding.title}
                      </h3>
                      <div className="flex items-center gap-6 text-sm">
                        <div
                          className={`flex items-center gap-2 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          <Calendar className="h-4 w-4" />
                          {wedding.date}
                        </div>
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {wedding.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div>
                        <p
                          className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {wedding.views}
                        </p>
                        <p
                          className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                        >
                          Views
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {wedding.rsvpCount}/{wedding.guestCount}
                        </p>
                        <p
                          className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                        >
                          RSVPs
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewWedding(wedding.id)}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setActiveTab("builder")}
                        className="p-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Budget Progress
                      </span>
                      <span
                        className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        ${wedding.spent.toLocaleString()}/${wedding.budget.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full ${
                        isDarkMode ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className="h-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                        style={{ width: `${(wedding.spent / wedding.budget) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        RSVP Progress
                      </span>
                      <span
                        className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {Math.round((wedding.rsvpCount / wedding.guestCount) * 100)}%
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full ${
                        isDarkMode ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                        style={{ width: `${(wedding.rsvpCount / wedding.guestCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Tasks Complete
                      </span>
                      <span
                        className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        68/95
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full ${
                        isDarkMode ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className="h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                        style={{ width: `${(68 / 95) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div
              className={`p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center ${
                isDarkMode ? "bg-slate-700" : "bg-slate-100"
              }`}
            >
              <Heart className={`h-8 w-8 ${isDarkMode ? "text-slate-400" : "text-slate-400"}`} />
            </div>
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              No wedding pages yet
            </h3>
            <p className={`font-light mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Create your first wedding page to get started.
            </p>
            <button
              onClick={handleCreateWedding}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Create Wedding Page
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      <div className="flex">
        {/* Sidebar Navigation */}
        <div
          className={`w-80 min-h-screen border-r ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                <Heart className="h-6 w-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h1
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Wedding Dashboard
                </h1>
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Plan your perfect day
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <button
                onClick={logout}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700 text-white hover:bg-slate-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : isDarkMode
                      ? "text-slate-300 hover:bg-slate-700 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div
                    className={`text-xs ${
                      activeTab === item.id
                        ? "text-white/80"
                        : isDarkMode
                          ? "text-slate-500"
                          : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </nav>

          {/* AI Assistant Toggle */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                showAIAssistant
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                  : isDarkMode
                    ? "text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-300"
              }`}
            >
              <Bot className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">AI Assistant</div>
                <div
                  className={`text-xs ${
                    showAIAssistant
                      ? "text-white/80"
                      : isDarkMode
                        ? "text-slate-500"
                        : "text-slate-500"
                  }`}
                >
                  Get planning help
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <AnimatePresence>
            {showAIAssistant && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`border-l overflow-hidden ${
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                }`}
              ></motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
