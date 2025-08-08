import { Menu, X } from "lucide-react";
import { Heart } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface DashboardMobileHeaderProps {
  isDarkMode: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const DashboardMobileHeader = ({
  isDarkMode,
  mobileMenuOpen,
  setMobileMenuOpen,
}: DashboardMobileHeaderProps) => {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
          <Heart className="h-5 w-5 text-white" fill="currentColor" />
        </div>
        <div>
          <h1 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Wedding Dashboard
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default DashboardMobileHeader;
