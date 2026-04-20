import { NavigationItem } from "@/types/dashboard";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Bot, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

interface DashboardSidebarProps {
  isDarkMode: boolean;
  navigationItems: NavigationItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;
  logout: () => void;
  planName?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DashboardSidebar = ({
  isDarkMode,
  navigationItems,
  activeTab,
  setActiveTab,
  showAIAssistant,
  setShowAIAssistant,
  collapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`hidden md:block min-h-screen border-r relative ${
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      } ${collapsed ? "overflow-hidden" : ""}`}
    >
      {/* Collapse/Expand Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={`absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
            isDarkMode
              ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}

      <div
        className={`border-b border-slate-200 dark:border-slate-700 ${collapsed ? "p-3" : "p-6"}`}
      >
        {collapsed ? (
          // Collapsed header - just show back arrow
          <div className="flex flex-col items-center gap-3">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Back to home"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        ) : (
          // Expanded header - full content
          <>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Link href="/">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-1 rounded-md transition-colors ${
                        isDarkMode
                          ? "text-slate-400 hover:text-white hover:bg-slate-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </motion.button>
                  </Link>
                  <h1
                    className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Wedding Dashboard
                  </h1>
                </div>
                <p
                  className={`text-sm text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Plan your perfect day
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </>
        )}
      </div>

      <nav className={`space-y-2 ${collapsed ? "p-2" : "p-4"}`}>
        {navigationItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => {
              if (item.disabled) {
                alert(item.disabledReason || "This feature is currently disabled.");
                return;
              }
              setActiveTab(item.id);
            }}
            whileHover={{ scale: item.disabled ? 1 : 1.02 }}
            whileTap={{ scale: item.disabled ? 1 : 0.98 }}
            disabled={item.disabled}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center rounded-2xl transition-all duration-300 ${
              collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            } ${
              item.disabled
                ? "opacity-50 cursor-not-allowed text-gray-400"
                : activeTab === item.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : isDarkMode
                    ? "text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
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
            )}
          </motion.button>
        ))}
      </nav>

      <div
        className={`border-t border-slate-200 dark:border-slate-700 ${collapsed ? "p-2" : "p-4"}`}
      >
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          title={collapsed ? "AI Assistant" : undefined}
          className={`w-full flex items-center rounded-2xl transition-all duration-300 ${
            collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
          } ${
            showAIAssistant
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
              : isDarkMode
                ? "text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-300"
          }`}
        >
          <Bot className="h-5 w-5" />
          {!collapsed && (
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
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default DashboardSidebar;
