// AboutCTA.tsx

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";

const AboutCTA = () => {
  const { isDarkMode } = useTheme();

  return (
    <AnimatedSection className="text-center mt-20">
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-slate-800/80 to-slate-700/80"
            : "bg-gradient-to-r from-indigo-50/80 to-purple-50/80"
        } backdrop-blur-xl rounded-3xl shadow-2xl border ${
          isDarkMode ? "border-slate-700/50" : "border-white/20"
        } p-16`}
      >
        <Sparkles className="h-16 w-16 text-indigo-600 mx-auto mb-8" />
        <h2 className={`text-4xl font-light mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Ready to Start Your Journey?
        </h2>
        <p
          className={`text-lg font-light mb-8 max-w-2xl mx-auto ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Join thousands of couples who have created their perfect wedding experience with us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 inline-block"
          >
            Get Started Today
          </Link>
          <Link
            href="/contact"
            className={`border-2 px-8 py-4 rounded-2xl font-medium transition-all duration-300 inline-block ${
              isDarkMode
                ? "border-slate-600 text-white hover:border-slate-500 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default AboutCTA;
