"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThankYouPage() {
  const { isDarkMode } = useTheme();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <h1
          className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}
        >
          Thank You!
        </h1>
        <p
          className={`text-lg ${isDarkMode ? "text-white" : "text-slate-800"}`}
        >
          Your response has been recorded. We appreciate you taking the time to
          RSVP.
        </p>
        <Button>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
