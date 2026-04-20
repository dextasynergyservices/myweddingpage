"use client";

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

const Header = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="relative z-10 flex items-center justify-between p-6">
      <Link
        to="/"
        className={`flex items-center gap-2 transition-colors duration-300 ${
          isDarkMode ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"
        } bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border ${
          isDarkMode ? "border-white/20" : "border-black/10"
        }`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <ThemeToggle />
    </div>
  );
};

export default Header;
