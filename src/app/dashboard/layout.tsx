"use client";

import "../globals.css";
import { SessionProvider } from "next-auth/react";

export default function WeddingPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
