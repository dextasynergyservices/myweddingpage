"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";

const Team = () => {
  const { isDarkMode } = useTheme();

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image:
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Former wedding planner turned tech entrepreneur, passionate about making weddings magical.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image:
        "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Full-stack developer with 10+ years experience building scalable platforms.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Design",
      image:
        "https://images.pexels.com/photos/1024866/pexels-photo-1024866.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Award-winning designer specializing in user experience and visual storytelling.",
    },
    {
      name: "David Kim",
      role: "Customer Success",
      image:
        "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Dedicated to ensuring every couple has an amazing experience with our platform.",
    },
  ];

  return (
    <AnimatedSection>
      <div className="text-center mb-16">
        <h2 className={`text-4xl font-light mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Meet Our Team
        </h2>
        <p
          className={`text-lg font-light max-w-2xl mx-auto ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          The passionate people behind your perfect wedding platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {team.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className={`${
              isDarkMode ? "bg-slate-800/80" : "bg-white/80"
            } backdrop-blur-xl rounded-3xl shadow-xl border ${
              isDarkMode ? "border-slate-700/50" : "border-white/20"
            } p-8 text-center hover:shadow-2xl transition-all duration-300`}
          >
            <motion.img
              src={member.image}
              alt={member.name}
              className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
              whileHover={{ scale: 1.1 }}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {member.name}
            </h3>
            <p className="text-indigo-600 font-medium mb-4">{member.role}</p>
            <p
              className={`text-sm leading-relaxed font-light ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {member.bio}
            </p>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
};

export default Team;
