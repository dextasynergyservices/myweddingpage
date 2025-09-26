"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes where we should hide the layout
  const hideLayoutRoutes = ["/dashboard", "/api", "/auth"];

  const shouldHideLayout = hideLayoutRoutes.some((route) => pathname.startsWith(route));

  // Check if it's a wedding page (single segment path that's not in hideLayoutRoutes)
  // or a preview page (preview/[slug])
  const pathSegments = pathname.split("/").filter(Boolean);
  const isWeddingPage = pathSegments.length === 1 && !shouldHideLayout;
  const isPreviewPage = pathSegments.length === 2 && pathSegments[0] === "preview";

  return (
    <>
      {!shouldHideLayout && !isWeddingPage && !isPreviewPage && <Navbar />}
      <Toaster richColors position="top-right" />
      {children}
      {!shouldHideLayout && !isWeddingPage && !isPreviewPage && <Footer />}
    </>
  );
}
