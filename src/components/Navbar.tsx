"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import CTAButton from "./CTAButton";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Image from "next/image";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Packages", href: "/packages" },
  { label: "Wedding Pages", href: "/wedding-pages" },
  { label: "How To", href: "/how-to" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const { isDarkMode } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isDarkMode
            ? "backdrop-blur-md border-b border-slate-700/50"
            : "bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-lg"
          : "bg-transparent"
      }`}
      style={{
        backgroundColor: isScrolled && isDarkMode ? "rgb(34, 21, 2)" : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNavClick}
          >
            <Link href="/" passHref>
              <Image src="/logo.png" alt="my wedding page" width={300} height={100} />
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <Link key={item.label} href={item.href} passHref>
                <motion.button
                  onClick={handleNavClick}
                  className={`font-medium transition-colors duration-300 relative cursor-pointer ${
                    isDarkMode ? "text-slate-300" : isScrolled ? "text-slate-700" : "text-slate-900"
                  } ${pathname === item.href ? (isDarkMode ? "font-bold" : "font-bold") : ""}`}
                  style={{
                    color: isDarkMode && pathname === item.href ? "var(--foreground)" : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (isDarkMode) {
                      e.currentTarget.style.color = "var(--foreground)";
                    } else {
                      e.currentTarget.style.color = "var(--black)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isDarkMode) {
                      e.currentTarget.style.color =
                        pathname === item.href ? "var(--foreground)" : "#cbd5e1";
                    } else {
                      e.currentTarget.style.color = pathname === item.href ? "var(--black)" : "";
                    }
                  }}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <CTAButton isScrolled={isScrolled} />
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden relative left-4">
            <ThemeToggle />
          </div>
          <motion.button
            className="md:hidden p-2 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X
                className={`h-6 w-6 cursor-pointer ${
                  isScrolled ? "text-slate-900" : "text-indigo-600"
                }`}
              />
            ) : (
              <Menu
                className={`h-6 w-6 cursor-pointer ${
                  isDarkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : isScrolled
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-900 hover:bg-white/10"
                }`}
              />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMobileMenuOpen ? 1 : 0,
            height: isMobileMenuOpen ? "auto" : 0,
          }}
          className="md:hidden overflow-hidden bg-white/95 backdrop-blur-lg rounded-2xl mt-2 border border-slate-200/50"
        >
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} passHref>
                <button
                  onClick={handleNavClick}
                  className={`block w-full text-left px-4 py-2 rounded-xl transition-colors duration-300 cursor-pointer ${
                    pathname === item.href
                      ? isDarkMode
                        ? "font-bold bg-slate-100"
                        : "font-bold bg-slate-100"
                      : isDarkMode
                        ? "text-slate-300 hover:bg-slate-50"
                        : "text-slate-700 hover:bg-slate-50"
                  }`}
                  style={{
                    color: isDarkMode && pathname === item.href ? "var(--foreground)" : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (isDarkMode) {
                      e.currentTarget.style.color = "var(--foreground)";
                    } else {
                      e.currentTarget.style.color = "var(--black)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isDarkMode) {
                      e.currentTarget.style.color =
                        pathname === item.href ? "var(--foreground)" : "#cbd5e1";
                    } else {
                      e.currentTarget.style.color = pathname === item.href ? "var(--black)" : "";
                    }
                  }}
                >
                  {item.label}
                </button>
              </Link>
            ))}
            <CTAButton isScrolled={isScrolled} isMobile setIsMobileMenuOpen={setIsMobileMenuOpen} />
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
