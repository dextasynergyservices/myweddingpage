"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Star, Heart, Check } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import AnimatedSection from "./AnimatedSection";
import PackageModal from "./PackageModal";
import { useTheme } from "@/contexts/ThemeContext";

type Package = {
  name: string;
  price: string;
  duration: string;
  features: string[];
  gradient: string;
  popular: boolean;
};

const packages: Package[] = [
  {
    name: "Essential",
    price: "$99",
    duration: "1 month",
    features: ["Custom wedding page", "RSVP management", "Photo gallery"],
    gradient: "from-pink-500 to-red-500",
    popular: false,
  },
  {
    name: "Premium",
    price: "$199",
    duration: "6 months",
    features: ["Everything in Essential", "Custom domain", "Guest messaging", "Wedding timeline"],
    gradient: "from-indigo-600 to-purple-600",
    popular: true,
  },
  {
    name: "Elite",
    price: "$299",
    duration: "1 year",
    features: ["Everything in Premium", "Priority support", "Personal consultant"],
    gradient: "from-teal-500 to-emerald-500",
    popular: false,
  },
  {
    name: "Elite",
    price: "$299",
    duration: "1 year",
    features: ["Everything in Premium", "Priority support", "Personal consultant"],
    gradient: "from-slate-600 to-slate-800",
    popular: false,
  },
];

const HomePackages = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  return (
    <>
      <section
        id="packages"
        className={`py-24 relative overflow-hidden ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800"
            : "bg-gradient-to-br from-slate-50 to-white"
        }`}
      >
        <ParallaxBackground speed={0.15}>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full blur-3xl"></div>
        </ParallaxBackground>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center mb-20">
            <h2
              className={`text-4xl md:text-5xl font-light mb-6 tracking-tight ${
                isDarkMode ? "text-slate-300" : "text-slate-900"
              }`}
            >
              Choose Your Package
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto font-light ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Flexible pricing designed to grow with your needs, from intimate ceremonies to grand
              celebrations.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {packages.map((pkg, index) => (
              <AnimatedSection
                key={index}
                animation="scale"
                delay={index * 0.2}
                className="relative group"
              >
                {pkg.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1 + index * 0.2 }}
                  >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-[10px] py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                      <Star className="h-4 w-4 fill-current" />
                      Most Popular
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className={`relative rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden ${
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                  } ${pkg.popular ? "ring-2 ring-indigo-500/20 scale-105" : ""}`}
                  whileHover={{ y: -5, scale: pkg.popular ? 1.08 : 1.03 }}
                >
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isDarkMode
                        ? "bg-gradient-to-br from-slate-700/30 to-slate-800"
                        : "bg-gradient-to-br from-slate-50/30 to-white"
                    }`}
                  ></div>

                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <motion.div
                        className={`inline-block p-4 rounded-2xl bg-gradient-to-r ${pkg.gradient} mb-6 shadow-lg`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <Heart className="h-8 w-8 text-white" fill="currentColor" />
                      </motion.div>
                      <h3
                        className={`text-2xl font-semibold mb-2 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {pkg.name}
                      </h3>
                      <motion.div
                        className={`text-5xl font-light mb-2 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                      >
                        {pkg.price}
                      </motion.div>
                      <div
                        className={`font-light ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {pkg.duration} access
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {pkg.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          className="flex items-start gap-3 text-sm"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.2 + featureIndex * 0.1 }}
                        >
                          <div className="flex-shrink-0 w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-white stroke-2" />
                          </div>
                          <span
                            className={`font-light ${
                              isDarkMode ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <motion.button
                        onClick={() => setSelectedPackage(pkg)}
                        className={`block text-center w-40 m-auto py-4 px-6 rounded-2xl font-medium transition-all cursor-pointer duration-300 ${
                          pkg.popular
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105"
                            : isDarkMode
                              ? "border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                              : "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        Get Started
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      <PackageModal isOpen={!!selectedPackage} onClose={() => setSelectedPackage(null)}>
        {selectedPackage && (
          <>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">
              {selectedPackage.name} Package
            </h3>
            <p className="text-slate-600 mb-4">{selectedPackage.duration} access</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
              {selectedPackage.features.map((feature: string, idx: number) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => {
                setSelectedPackage(null);
                router.push("/checkout");
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center font-medium hover:bg-indigo-700 transition cursor-pointer"
            >
              Continue
            </button>
          </>
        )}
      </PackageModal>
    </>
  );
};

export default HomePackages;
