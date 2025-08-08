"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Star, Heart, Check } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import AnimatedSection from "./AnimatedSection";
import PackageModal from "./PackageModal";
import { useTheme } from "@/contexts/ThemeContext";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";

type Plan = {
  id: string;
  name: string;
  price: string;
  duration_days: number;
  max_photos: number;
  max_videos: number;
  max_tabs: number;
  gradient?: string;
  popular?: boolean;
  features?: string[];
};

const defaultGradients = [
  "from-indigo-600 to-purple-600",
  "from-pink-500 to-yellow-500",
  "from-green-500 to-emerald-600",
  "from-red-500 to-pink-600",
];

// const currencyFlags = {
//   NGN: "/flags/ng.svg",
//   USD: "/flags/us.svg",
//   GBP: "/flags/gb.svg",
// };

const HomePackages = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Plan | null>(null);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  // const [exchangeRates, setExchangeRates] = useState({ USD: 0, GBP: 0 });
  // const [selectedCurrency, setSelectedCurrency] = useState("NGN");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        const data = await res.json();

        const enriched = data.map((plan: Plan, idx: number) => ({
          ...plan,
          gradient: defaultGradients[idx % defaultGradients.length],
          popular: plan.name === "Dazzle",
          features: [
            "Custom wedding page",
            "RSVP management",
            `${plan.max_photos}+ photos`,
            `${plan.max_videos}+ videos`,
            `${plan.max_tabs}+ custom sections`,
          ],
        }));

        setPlans(enriched);
      } catch (error) {
        console.error("Failed to load plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) return <div className="text-center py-20">Loading plans...</div>;

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
            {plans.map((plan, index) => (
              <AnimatedSection
                key={plan.id}
                animation="scale"
                delay={index * 0.2}
                className="relative group"
              >
                {plan.popular && (
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
                  } ${plan.popular ? "ring-2 ring-indigo-500/20 scale-105" : ""}`}
                  whileHover={{ y: -5, scale: plan.popular ? 1.08 : 1.03 }}
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
                        className={`inline-block p-4 rounded-2xl bg-gradient-to-r ${plan.gradient} mb-6 shadow-lg`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <Heart className="h-8 w-8 text-white" fill="currentColor" />
                      </motion.div>
                      <h3
                        className={`text-xl font-semibold mb-2 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <motion.div
                        className={`text-3xl font-light mb-2 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                      >
                        ₦{plan.price}
                      </motion.div>
                      <div
                        className={`font-light ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {plan.duration_days} days access
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features?.map((feature, featureIndex) => (
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
                        onClick={() => setSelectedPackage(plan)}
                        className={`block text-center w-40 m-auto py-4 px-6 rounded-2xl font-medium transition-all cursor-pointer duration-300 ${
                          plan.popular
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
            <p className="text-slate-600 mb-4">{selectedPackage.duration_days} access</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
              {selectedPackage.features?.map((feature: string, idx: number) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>

            {/* FORM FIELDS */}
            <div className="mb-6 space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-900">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="placeholder:text-md bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-slate-900">
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="placeholder:text-md bg-white"
                  placeholder="WhatsApp number with country code e.g +234"
                  required
                />
              </div>
            </div>

            <button
              disabled={loadingPayment || !email || !whatsapp}
              onClick={async () => {
                if (!email || !whatsapp) {
                  alert("Please fill in both Email and WhatsApp number.");
                  return;
                }

                setLoadingPayment(true);
                try {
                  const res = await fetch("/api/paystack/initiate", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email,
                      whatsapp,
                      planId: selectedPackage.id,
                      amount: selectedPackage.price,
                    }),
                  });

                  const result = await res.json();

                  if (res.ok && result.authorization_url) {
                    setSelectedPackage(null);
                    router.push(result.authorization_url);
                  } else {
                    alert(result.error || "Failed to initiate payment.");
                  }
                } catch (error) {
                  console.error("Payment error:", error);
                  alert("An error occurred while initiating payment.");
                } finally {
                  setLoadingPayment(false);
                }
              }}
              className={`w-full py-3 px-4 rounded-xl text-center font-medium transition cursor-pointer ${
                loadingPayment
                  ? "bg-indigo-400 text-white cursor-wait"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:bg-indigo-700"
              }`}
            >
              {loadingPayment ? "Processing..." : "Pay Now"}
            </button>
          </>
        )}
      </PackageModal>
    </>
  );
};

export default HomePackages;
