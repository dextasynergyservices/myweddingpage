"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";
import { Users, Calendar, Heart, Gift } from "lucide-react";

const stats = [
  {
    label: "Couples Served",
    number: "1,200+",
    icon: Users,
  },
  {
    label: "Weddings Planned",
    number: "950+",
    icon: Calendar,
  },
  {
    label: "Love Stories Told",
    number: "1,500+",
    icon: Heart,
  },
  {
    label: "Gifts Delivered",
    number: "3,000+",
    icon: Gift,
  },
];

export function AboutStats() {
  const { isDarkMode } = useTheme();

  return (
    <AnimatedSection className="mb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`text-center ${
              isDarkMode ? "bg-slate-800/50" : "bg-white/50"
            } backdrop-blur-sm rounded-3xl p-8 shadow-lg border ${
              isDarkMode ? "border-slate-700/50" : "border-white/20"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div
              className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {stat.number}
            </div>
            <div
              className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
}
