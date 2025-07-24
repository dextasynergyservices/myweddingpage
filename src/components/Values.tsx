// components/ValuesSection.tsx

"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";
import { Heart, Users, Award, Sparkles } from "lucide-react";

const Values = () => {
  const values = [
    {
      icon: Heart,
      title: "Love First",
      description:
        "Every decision we make is guided by our commitment to celebrating love in all its beautiful forms.",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description:
        "We constantly push the boundaries of technology to create magical wedding experiences.",
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building connections between couples, families, and friends to create lasting memories.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We strive for perfection in every detail, because your special day deserves nothing less.",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const { isDarkMode } = useTheme();

  return (
    <AnimatedSection className="mb-20">
      <div className="text-center mb-16">
        <h2 className={`text-4xl font-light mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Our Values
        </h2>
        <p
          className={`text-lg font-light max-w-2xl mx-auto ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          The principles that guide everything we do
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {values.map((value, index) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`${
              isDarkMode ? "bg-slate-800/80" : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-slate-700/50" : "border-white/20"
            } p-8 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 bg-gradient-to-r ${value.color} rounded-2xl flex-shrink-0`}>
                <value.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3
                  className={`text-xl font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {value.title}
                </h3>
                <p
                  className={`leading-relaxed font-light ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {value.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
};

export default Values;
