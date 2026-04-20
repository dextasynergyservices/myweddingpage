"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  {
    title: "Sign Up",
    desc: "Create a free account to get started with our platform.",
  },
  {
    title: "Customize",
    desc: "Personalize your profile and settings for a better experience.",
  },
  {
    title: "Explore",
    desc: "Discover tools, resources, and features available to you.",
  },
  { title: "Enjoy", desc: "Use the platform and enjoy seamless productivity." },
];

const HowToSteps = () => {
  const { isDarkMode } = useTheme();

  return (
    <AnimatedSection className={`py-16 px-6 ${isDarkMode ? "bg-[#ab862b]/10" : " bg-gray-50"}`}>
      <div className="max-w-5xl mx-auto text-center">
        <h2 className={`text-3xl font-bold mb-10 ${isDarkMode ? "text-white" : "text-black"}`}>
          Step-by-Step Guide
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`rounded-xl shadow-lg p-6 ${isDarkMode ? " bg-[#ab862b]/5 text-white" : "bg-white text-slate-900"}`}
            >
              <CheckCircle className="w-10 h-10 text-[#ab862b] mx-auto mb-4" />
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className={` mt-2 ${isDarkMode ? "text-gray-300" : " text-gray-900"}`}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default HowToSteps;
