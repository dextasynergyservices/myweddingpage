"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide Navbar & Footer on dashboard routes
  const hideLayout = pathname.startsWith("/dashboard");

  return (
    <>
      {!hideLayout && <Navbar />}
      <Toaster richColors position="top-right" />
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
