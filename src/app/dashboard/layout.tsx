"use client";

import "../globals.css";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SessionProvider>{children}</SessionProvider>
    </div>
  );
}
