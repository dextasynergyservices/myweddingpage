"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";

const ContactForm = () => {
  const { isDarkMode } = useTheme();

  // ✅ All hooks declared BEFORE any conditional logic
  const [hasMounted, setHasMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // ✅ Safer fallback for hydration, without violating hook rules
  if (!hasMounted) {
    return <div className="min-h-[300px]" />; // optional: keeps layout stable
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <AnimatedSection animation="fadeRight">
      <div
        className={`${
          isDarkMode ? "bg-slate-800/80" : "bg-white/80"
        } backdrop-blur-xl rounded-3xl shadow-2xl border ${
          isDarkMode ? "border-slate-700/50" : "border-white/20"
        } p-8`}
      >
        <h2 className={`text-3xl font-light mb-8 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Send us a Message
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-slate-700"
                    : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:bg-white"
                } focus:ring-2 focus:ring-indigo-500/20 focus:outline-none`}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-slate-700"
                    : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:bg-white"
                } focus:ring-2 focus:ring-indigo-500/20 focus:outline-none`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Subject
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                isDarkMode
                  ? "bg-slate-700/50 border-slate-600 text-white focus:border-indigo-500 focus:bg-slate-700"
                  : "bg-white/50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:bg-white"
              } focus:ring-2 focus:ring-indigo-500/20 focus:outline-none`}
            >
              <option value="">Select a subject</option>
              <option value="general">General Inquiry</option>
              <option value="support">Technical Support</option>
              <option value="billing">Billing Question</option>
              <option value="feature">Feature Request</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 resize-none ${
                isDarkMode
                  ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-slate-700"
                  : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:bg-white"
              } focus:ring-2 focus:ring-indigo-500/20 focus:outline-none`}
              placeholder="Tell us how we can help you..."
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending Message...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Message
              </>
            )}
          </motion.button>
        </form>
      </div>
    </AnimatedSection>
  );
};

export default ContactForm;
