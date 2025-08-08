"use client";

import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import LoginForm from "@/components/LoginForm";
import { useTheme } from "@/contexts/ThemeContext";

const LoginPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 pt-24 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-md relative ${
          isDarkMode ? "bg-slate-800/80" : "bg-white/80"
        } backdrop-blur-xl rounded-3xl shadow-2xl border ${
          isDarkMode ? "border-slate-700/50" : "border-white/20"
        } p-8`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
              <Heart className="h-8 w-8 text-white" fill="currentColor" />
            </div>
          </motion.div>
          <h1
            className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Welcome Back
          </h1>
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} font-light`}>
            Sign in to your wedding dashboard
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </motion.div>
    </div>
  );
};

export default LoginPage;
