"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Heart, Clock } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";

const ContactInfo = () => {
  const { isDarkMode } = useTheme();

  return (
    <AnimatedSection animation="fadeLeft" delay={0.2}>
      <div className="space-y-8">
        {/* Contact Cards */}
        <div className="space-y-6">
          {/* Email Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className={`${
              isDarkMode ? "bg-slate-800/80" : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-slate-700/50" : "border-white/20"
            } p-8`}
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Email Us
                </h3>
                <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} mb-2`}>
                  Send us an email anytime
                </p>
                <a
                  href="mailto:hello@weddingplatform.com"
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                >
                  hello@weddingplatform.com
                </a>
              </div>
            </div>
          </motion.div>

          {/* Phone Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className={`${
              isDarkMode ? "bg-slate-800/80" : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-slate-700/50" : "border-white/20"
            } p-8`}
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Call Us
                </h3>
                <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} mb-2`}>
                  Mon-Fri from 8am to 5pm
                </p>
                <a
                  href="tel:+1-555-123-4567"
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                >
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </motion.div>

          {/* Address Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className={`${
              isDarkMode ? "bg-slate-800/80" : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-slate-700/50" : "border-white/20"
            } p-8`}
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Visit Us
                </h3>
                <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} mb-2`}>
                  Come say hello at our office
                </p>
                <p className={`${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  123 Wedding Street
                  <br />
                  San Francisco, CA 94102
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Business Hours */}
        <div
          className={`${
            isDarkMode ? "bg-slate-800/80" : "bg-white/80"
          } backdrop-blur-xl rounded-3xl shadow-xl border ${
            isDarkMode ? "border-slate-700/50" : "border-white/20"
          } p-8`}
        >
          <div className="flex items-center gap-4 mb-6">
            <Clock className="h-6 w-6 text-indigo-600" />
            <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Business Hours
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { day: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
              { day: "Saturday", hours: "9:00 AM - 4:00 PM" },
              { day: "Sunday", hours: "Closed" },
            ].map((schedule, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className={`${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  {schedule.day}
                </span>
                <span className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {schedule.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Link */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${
            isDarkMode
              ? "bg-gradient-to-r from-slate-800/80 to-slate-700/80"
              : "bg-gradient-to-r from-indigo-50/80 to-purple-50/80"
          } backdrop-blur-xl rounded-3xl shadow-xl border ${
            isDarkMode ? "border-slate-700/50" : "border-white/20"
          } p-8 text-center`}
        >
          <Heart className="h-12 w-12 text-indigo-600 mx-auto mb-4" fill="currentColor" />
          <h3
            className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Need Quick Answers?
          </h3>
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} mb-4`}>
            Check out our frequently asked questions for instant help.
          </p>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300">
            View FAQ
          </button>
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

export default ContactInfo;
