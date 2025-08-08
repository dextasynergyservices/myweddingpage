"use client";

import { signOut } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";

export default function LogoutButton() {
  const { isDarkMode } = useTheme();
  const logout = () => {
    signOut({
      callbackUrl: "/",
    });
  };

  return (
    <div className="p-4">
      <button
        onClick={logout}
        className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
          isDarkMode
            ? "bg-slate-700 text-white hover:bg-slate-600"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        Logout
      </button>
    </div>
  );
}
