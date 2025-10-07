"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "@/contexts/ThemeContext";

export function ToastProvider() {
  const { isDarkMode } = useTheme();

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#f9fafb" : "#111827",
          border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
          borderRadius: "12px",
          padding: "16px",
          boxShadow: isDarkMode
            ? "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981",
            secondary: isDarkMode ? "#1f2937" : "#ffffff",
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#ef4444",
            secondary: isDarkMode ? "#1f2937" : "#ffffff",
          },
        },
        loading: {
          iconTheme: {
            primary: "#ab862b",
            secondary: isDarkMode ? "#1f2937" : "#ffffff",
          },
        },
      }}
    />
  );
}
