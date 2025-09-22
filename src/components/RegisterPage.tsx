"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import RegisterForm from "@/components/RegisterForm";

const RegisterPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 pt-24 ${
        isDarkMode
          ? "bg-gradient-to-br from-black via-[#ab862b]/10 to-[#ab862b]/5"
          : "bg-gradient-to-br from-white via-white to-white"
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Register Form Card */}
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
