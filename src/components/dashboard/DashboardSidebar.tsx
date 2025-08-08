import { NavigationItem } from "@/types/dashboard";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Heart, Bot } from "lucide-react";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";

interface DashboardSidebarProps {
  isDarkMode: boolean;
  navigationItems: NavigationItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;
  logout: () => void;
  planName?: string;
}

const DashboardSidebar = ({
  isDarkMode,
  navigationItems,
  activeTab,
  setActiveTab,
  showAIAssistant,
  setShowAIAssistant,
}: DashboardSidebarProps) => {
  return (
    <div
      className={`hidden md:block w-72 min-h-screen border-r ${
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      }`}
    >
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
            <Heart className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Wedding Dashboard
            </h1>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Plan your perfect day
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

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
                showAIAssistant ? "text-white/80" : isDarkMode ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Get planning help
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
