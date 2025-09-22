"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const ViewFaqButton = () => {
  const { isDarkMode } = useTheme();
  return (
    <Link href="/how-to#faq" scroll={false}>
      <button
        type="button"
        className={`px-6 py-3 rounded-xl transition cursor-pointer ${isDarkMode ? "bg-gradient-to-r from-black/50 to-[#ab862b] text-white" : "bg-black text-white"}`}
      >
        View FAQ
      </button>
    </Link>
  );
};

export default ViewFaqButton;
