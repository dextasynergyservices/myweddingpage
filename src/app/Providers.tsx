"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider>
          <ThemeWrapper>
            {children}
            <Toaster position="top-right" />
          </ThemeWrapper>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

function ThemeWrapper({ children }: { children: ReactNode }) {
  const { isDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      {children}
    </div>
  );
}
