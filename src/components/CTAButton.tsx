"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const CTAButton = ({
  isScrolled,
  isMobile = false,
  setIsMobileMenuOpen,
}: {
  isScrolled: boolean;
  isMobile?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}) => {
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();

  if (isMobile) {
    return (
      <div className="pt-4 border-t border-slate-200/20">
        {user ? (
          <div className="space-y-2">
            <Link href={user.role === "admin" ? "/admin/AdminDashboard" : "/dashboard"}>
              <button
                onClick={() => setIsMobileMenuOpen?.(false)}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <User className="h-4 w-4" />
                {user.name}
              </button>
            </Link>
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen?.(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                isDarkMode
                  ? "text-slate-400 hover:bg-slate-800 hover:text-slate-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/login">
              <button
                onClick={() => setIsMobileMenuOpen?.(false)}
                className={`w-full px-4 py-2 rounded-xl font-medium transition-colors duration-200 cursor-pointer ${
                  isDarkMode
                    ? "text-slate-900 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Login
              </button>
            </Link>
            <Link href="/packages">
              <button
                onClick={() => setIsMobileMenuOpen?.(false)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium cursor-pointer"
              >
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-4">
      <ThemeToggle />

      {user ? (
        <div className="flex items-center gap-3">
          <Link href={user.role === "admin" ? "/admin/AdminDashboard" : "/dashboard"}>
            <motion.button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : isScrolled
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-white/90 hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="h-4 w-4" />
              {user.name}
            </motion.button>
          </Link>
          <motion.button
            onClick={logout}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isDarkMode
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                : isScrolled
                  ? "text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                  : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4" />
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link href="/login">
            <motion.button
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : isScrolled
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-slate-900 hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
          <Link href="/packages">
            <motion.button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CTAButton;
