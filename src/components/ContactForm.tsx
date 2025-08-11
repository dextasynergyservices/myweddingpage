"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";
import toast from "react-hot-toast";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

const ContactForm = () => {
  const { isDarkMode } = useTheme();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [hasMounted, setHasMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="min-h-[300px]" />;
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
    setErrors({}); // Clear old errors

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "", website: "" });
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        toast.error(data.error || "❌ Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
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
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
            <input
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                isDarkMode
                  ? "bg-slate-700/50 border-slate-600 text-white focus:border-indigo-500 focus:bg-slate-700"
                  : "bg-white/50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:bg-white"
              } focus:ring-2 focus:ring-indigo-500/20 focus:outline-none`}
            ></input>
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
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
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>

          <div>
            {/* Honeypot Field */}
            <div className="hidden">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                name="website"
                id="website"
                value={formData.website}
                onChange={handleInputChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
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
