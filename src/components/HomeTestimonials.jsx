"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import AnimatedSection from "./AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";

const HomeTestimonials = () => {
  const { isDarkMode } = useTheme();

  return (
    <section
      id="testimonials"
      className={`py-24 relative overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
    >
      <ParallaxBackground speed={0.1}>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-rose-100/30 to-pink-100/30 rounded-full blur-3xl"></div>
      </ParallaxBackground>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center mb-20">
          <h2
            className={`text-4xl md:text-5xl font-light mb-6 tracking-tight ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Loved by Couples
          </h2>
          <p
            className={`text-xl max-w-2xl mx-auto font-light ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Join thousands of couples who've created their perfect wedding experience.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah & Michael",
              text: "The platform exceeded our expectations. The design is stunning and our guests loved the interactive features. Managing everything was effortless.",
              rating: 5,
              image:
                "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
            {
              name: "Emily & David",
              text: "Incredible attention to detail and user experience. The dashboard made planning so much easier, and the final result was absolutely beautiful.",
              rating: 5,
              image:
                "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
            {
              name: "Jessica & Ryan",
              text: "Modern, elegant, and functional. Our families could easily navigate everything, and we received so many compliments on our wedding page.",
              rating: 5,
              image:
                "https://images.pexels.com/photos/1024866/pexels-photo-1024866.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          ].map((testimonial, index) => (
            <AnimatedSection
              key={index}
              animation="fadeUp"
              delay={index * 0.3}
              className="group h-full"
            >
              <motion.div
                className={`rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border h-full flex flex-col justify-between ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 hover:border-slate-500"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className="flex mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.3 }}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1.2 + index * 0.3 + i * 0.1 }}
                    >
                      <Star className="h-5 w-5 text-amber-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>
                <p
                  className={`mb-8 leading-relaxed font-light text-lg ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <motion.img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    whileHover={{ scale: 1.1 }}
                  />
                  <div className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {testimonial.name}
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonials;
