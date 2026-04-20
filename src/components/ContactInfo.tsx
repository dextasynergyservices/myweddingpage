"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Heart, Clock, MessageCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";
import Link from "next/link";
import ViewFaqButton from "@/components/ViewFaqButton";

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
              isDarkMode
                ? "bg-gradient-to-br from-[#ab862b]/5 via-black/10 to-[#ab862b]/5"
                : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-[#ab862b]/20" : "border-black/20"
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
                <p
                  className={`${isDarkMode ? "text-white/50" : "text-black"} mb-2`}
                >
                  Send us an email anytime
                </p>
                <a
                  href="mailto:hello@weddingplatform.com"
                  className="text-[#ab862b]/80 hover:text-[#ab862b] font-medium transition-colors duration-200"
                >
                  info@myweddingpage.online
                </a>
              </div>
            </div>
          </motion.div>

          {/* Phone Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className={`${
              isDarkMode
                ? "bg-gradient-to-br from-[#ab862b]/5 via-black/10 to-[#ab862b]/5"
                : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-[#ab862b]/20" : "border-black/20"
            } p-8`}
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl">
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
                <p
                  className={`${isDarkMode ? "text-white/50" : "text-black"} mb-2`}
                >
                  Mon-Fri from 10am to 6pm (WAT)
                </p>
                <a
                  href="tel:+2348103208297"
                  className="text-[#ab862b]/80 hover:text-[#ab862b] font-medium transition-colors duration-200"
                >
                  +234 810 320 8297
                </a>
              </div>
            </div>
          </motion.div>

          {/* WhatsApp Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className={`${
              isDarkMode
                ? "bg-gradient-to-br from-[#ab862b]/5 via-black/10 to-[#ab862b]/5"
                : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-[#ab862b]/20" : "border-black/20"
            } p-8`}
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  WhatsApp
                </h3>
                <Link
                  href="https://wa.me/2348103208297"
                  className="text-[#ab862b]/80 hover:text-[#ab862b] font-medium transition-colors duration-200"
                >
                  +234 810 320 8297
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Address Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className={`${
              isDarkMode
                ? "bg-gradient-to-br from-[#ab862b]/5 via-black/10 to-[#ab862b]/5"
                : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-[#ab862b]/20" : "border-black/20"
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
                  Office Address
                </h3>
                {/* <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} mb-2`}>
                  Come say hello at our office
                </p> */}
                <p className={`${isDarkMode ? "text-white/50" : "text-black"}`}>
                  147 NTA Road, Mgbuoba
                  <br />
                  Port Harcourt, Rivers State, Nigeria.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Business Hours */}
        <div
          className={`${
            isDarkMode
              ? "bg-gradient-to-br from-[#ab862b]/5 via-black/10 to-[#ab862b]/5"
              : "bg-white/80"
          } backdrop-blur-xl rounded-3xl shadow-xl border ${
            isDarkMode ? "border-[#ab862b]/20" : "border-black/20"
          } p-8`}
        >
          <div className="flex items-center gap-4 mb-6">
            <Clock className="h-6 w-6 text-[#ab862b]/80" />
            <h3
              className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Business Hours
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { day: "Monday - Friday", hours: "10:00 AM - 6:00 PM (WAT)" },
              { day: "Saturday", hours: "Closed" },
              { day: "Sunday", hours: "Closed" },
            ].map((schedule, index) => (
              <div key={index} className="flex justify-between items-center">
                <span
                  className={`${isDarkMode ? "text-white/50" : "text-black/50"}`}
                >
                  {schedule.day}
                </span>
                <span
                  className={`font-medium ${isDarkMode ? "text-white/50" : "text-black/50"}`}
                >
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
              ? "bg-gradient-to-br from-[#ab862b]/5 via-black/10 to-[#ab862b]/5"
              : "bg-white/80"
          } backdrop-blur-xl rounded-3xl shadow-xl border ${
            isDarkMode ? "border-[#ab862b]/20" : "border-black/20"
          } p-8 text-center`}
        >
          <Heart
            className="h-12 w-12 text-[#ab862b]/80 mx-auto mb-4"
            fill="currentColor"
          />
          <h3
            className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Need Quick Answers?
          </h3>
          <p
            className={`${isDarkMode ? "text-white/50" : "text-black/50"} mb-4`}
          >
            Check out our frequently asked questions for instant help.
          </p>
          <ViewFaqButton />
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

export default ContactInfo;
