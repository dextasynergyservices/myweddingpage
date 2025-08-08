import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Bot } from "lucide-react";
import { NavigationItem } from "@/types/dashboard";
import LogoutButton from "@/components/LogoutButton";

interface DashboardMobileSidebarProps {
  isDarkMode: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navigationItems: NavigationItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;
  logout: () => void;
}

const DashboardMobileSidebar = ({
  isDarkMode,
  mobileMenuOpen,
  setMobileMenuOpen,
  navigationItems,
  activeTab,
  setActiveTab,
  showAIAssistant,
  setShowAIAssistant,
}: DashboardMobileSidebarProps) => {
  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed inset-y-0 left-0 z-50 w-72 h-screen border-r md:hidden ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                  <Heart className="h-5 w-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <h1
                    className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Wedding Dashboard
                  </h1>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Plan your perfect day
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <LogoutButton />

          <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
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

            <button
              onClick={() => {
                setShowAIAssistant(!showAIAssistant);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 mt-4 ${
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
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardMobileSidebar;
