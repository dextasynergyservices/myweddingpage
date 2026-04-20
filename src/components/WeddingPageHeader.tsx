"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Heart,
  Home,
  Camera,
  Gift,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

interface WeddingPageHeaderProps {
  brideName?: string;
  groomName?: string;
  logoUrl?: string;
  logoAlt?: string;
  sections?: Array<{
    id: string;
    type: string;
    title: string;
  }>;
}

export default function WeddingPageHeader({
  brideName = "Bride",
  groomName = "Groom",
  logoUrl,
  logoAlt,
  sections = [],
}: WeddingPageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // Handle scroll effect and active section detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Find the currently visible section
      const headerHeight = 80;
      const scrollPosition = window.scrollY + headerHeight + 50;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Get section icon based on type
  const getSectionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "hero":
        return <Home className="h-4 w-4" />;
      case "story":
        return <Heart className="h-4 w-4" />;
      case "gallery":
        return <Camera className="h-4 w-4" />;
      case "registry":
      case "gift":
        return <Gift className="h-4 w-4" />;
      case "wishes":
      case "guest":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  // Get section title based on type
  const getSectionTitle = (type: string) => {
    switch (type.toLowerCase()) {
      case "hero":
        return "Home";
      case "story":
        return "Our Story";
      case "gallery":
        return "Gallery";
      case "registry":
      case "gift":
        return "Gift Registry";
      case "wishes":
      case "guest":
        return "Guest Wishes";
      default:
        return type;
    }
  };

  // Scroll to section with sweet animation
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Set active section immediately for visual feedback
      setActiveSection(sectionId);

      // Get the current scroll position
      const currentScrollY = window.scrollY;

      // Get the target position (accounting for fixed header height)
      const headerHeight = 80; // Approximate header height
      const targetScrollY = element.offsetTop - headerHeight;

      // Calculate the distance to scroll
      const distance = targetScrollY - currentScrollY;

      // Create smooth scroll animation with easing
      const duration = Math.min(Math.abs(distance) * 0.5, 1000); // Max 1 second
      const startTime = performance.now();

      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => {
        return t < 0.5
          ? 4 * t * t * t
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        window.scrollTo(0, currentScrollY + distance * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/Couple Names */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => scrollToSection("hero")}
          >
            {/* Custom Logo or Default Heart Icon */}
            {logoUrl ? (
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src={logoUrl}
                  alt={logoAlt || "Wedding Logo"}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <Heart className="h-5 w-5 text-pink-500" />
            )}

            {/* Couple Names */}
            <div className="flex items-center space-x-1">
              <span className="text-lg md:text-xl font-bold text-gray-800">
                {brideName} & {groomName}
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === section.id
                    ? "text-pink-600 bg-pink-50 shadow-sm"
                    : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                }`}
              >
                {getSectionIcon(section.type)}
                <span>{getSectionTitle(section.type)}</span>
              </motion.button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
        >
          <div className="py-4 space-y-2">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center space-x-3 w-full px-4 py-3 text-left transition-all duration-300 ${
                  activeSection === section.id
                    ? "text-pink-600 bg-pink-50 border-l-4 border-pink-500"
                    : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                }`}
              >
                {getSectionIcon(section.type)}
                <span className="font-medium">
                  {getSectionTitle(section.type)}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
