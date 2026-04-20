"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const faqs = [
  {
    q: "Is the platform free to use?",
    a: "Yes! We offer a free plan with plenty of features to get started.",
  },
  {
    q: "Can I upgrade my account later?",
    a: "Absolutely! You can upgrade anytime to unlock more features.",
  },
  {
    q: "Is my data secure?",
    a: "We take security seriously, using encryption and secure servers.",
  },
];

const HowToFAQ = () => {
  const { isDarkMode } = useTheme();

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className={`py-16 px-6 ${isDarkMode ? "bg-[#000000]/5" : " bg-white"}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className={`text-3xl font-bold mb-10 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-lg shadow-lg ${isDarkMode ? "bg-[#ab862b]/10 text-white" : "bg-white text-slate-800"}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center px-4 py-3 text-left"
              >
                <span className="font-medium">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className={`px-4 pb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToFAQ;
