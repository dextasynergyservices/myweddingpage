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
      className="min-h-screen overflow-x-hidden transition-colors duration-300"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
      }}
    >
      {children}
    </div>
  );
}
