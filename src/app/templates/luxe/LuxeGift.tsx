"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Gift, Check } from "lucide-react";
import Image from "next/image";
import PurchaseModal from "@/components/ui/PurchaseModal";
import CashGiftModal from "@/components/ui/CashGiftModal";
import { formatCurrency, parsePriceToNumber } from "@/lib/utils";

interface BankDetail {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface GiftItem {
  id: string;
  item: string;
  name?: string;
  description?: string;
  link?: string;
  price: string;
  image: string;
  purchased: boolean;
}

interface GiftRegistryProps {
  title?: string;
  description?: string;
  gifts?: GiftItem[];
  giftRegistry?: GiftItem[]; // Legacy support
  userId?: string; // Wedding page owner's user ID
  bankDetails?: BankDetail[]; // Bank details for the wedding page owner
  // Additional user data props for full integration
  gallery?: string[];
  guests?: Record<string, unknown>[];
  storyImage?: string;
  heroImage?: string;
}

export default function GiftRegistry(props: GiftRegistryProps) {
  // Extract data from props with fallbacks
  const title = props.title || "Gift Registry";
  const description =
    props.description ||
    "Your presence at our wedding is the greatest gift of all. If you'd like to help us start our new life together, here are some items we'd love to have in our home.";
  // Extract gifts data from props (prioritize gifts over giftRegistry for consistency with API)
  const gifts = props.gifts || props.giftRegistry || [];

  // Helper function to get safe image URL
  const getSafeImageUrl = (imageUrl: string) => {
    // Check if it's a valid URL (starts with http/https) or a valid path (starts with /)
    if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/"))) {
      return imageUrl;
    }
    // If it's an emoji or invalid URL, return a default gift image
    return "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800";
  };
  // const _bankDetails = props.bankDetails || {
  //   bankName: "Access Bank",
  //   accountNumber: "1234567890",
  //   accountName: "John & Jane Doe",
  // };
  const [isVisible, setIsVisible] = useState(false);
  const [purchasedItems] = useState<number[]>([]);
  const [imageScales, setImageScales] = useState<{ [key: number]: number }>({});
  const sectionRef = useRef<HTMLElement>(null);
  const imageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GiftItem | null>(null);
  const [bankDetailsList, setBankDetailsList] = useState<BankDetail[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const [cashGiftOpen, setCashGiftOpen] = useState(false);

  const openPurchase = (gift: GiftItem) => {
    console.log("LuxeGift openPurchase called with gift:", gift);
    console.log("Current props.userId:", props.userId);
    setSelected(gift);
    setOpen(true);
  };

  const handlePurchase = async (data: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  }) => {
    console.log("LuxeGift handlePurchase called with:", {
      selected,
      userId: props.userId,
      data,
    });

    if (!selected || !props.userId) {
      console.error("Missing selected gift or userId");
      return;
    }

    try {
      const response = await fetch("/api/public/received-gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          contactEmail: data.email,
          contactPhone: data.phone,
          message: data.message,
          giftId: selected.id,
          amount: parsePriceToNumber(selected.price),
          userId: props.userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit purchase");
      }

      const result = await response.json();
      console.log("Purchase submitted successfully:", result);

      // Mark gift as purchased locally
      setSelected({ ...selected, purchased: true });
    } catch (error) {
      console.error("Purchase submission error:", error);
      throw error;
    }
  };

  const handleCashGift = async (data: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  }) => {
    console.log("LuxeGift handleCashGift called with:", {
      userId: props.userId,
      data,
    });

    if (!props.userId) {
      console.error("Missing userId");
      return;
    }

    try {
      const response = await fetch("/api/public/received-gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          contactEmail: data.email,
          contactPhone: data.phone,
          message: data.message,
          giftId: null, // No specific gift for cash
          amount: 0, // No specific amount for cash
          userId: props.userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit cash gift");
      }

      const result = await response.json();
      console.log("Cash gift submitted successfully:", result);
    } catch (error) {
      console.error("Cash gift submission error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!open) return;
    // Use bank details passed from props instead of fetching from API
    setBankDetailsList(props.bankDetails || []);
    setLoadingBanks(false);
  }, [open, props.bankDetails]);

  useEffect(() => {
    if (!cashGiftOpen) return;
    // Use bank details passed from props instead of fetching from API
    setBankDetailsList(props.bankDetails || []);
    setLoadingBanks(false);
  }, [cashGiftOpen, props.bankDetails]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    Object.keys(imageRefs.current).forEach((key) => {
      const index = parseInt(key);
      const imageRef = imageRefs.current[index];
      if (imageRef) {
        const rect = imageRef.getBoundingClientRect();
        const scrollProgress = Math.max(
          0,
          Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
        );
        const scale = 1 + scrollProgress * 0.1;
        setImageScales((prev) => ({ ...prev, [index]: scale }));
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-32 left-16 w-44 h-44 rounded-full bg-orange-300 blur-2xl"></div>
        <div className="absolute bottom-40 right-24 w-52 h-52 rounded-full bg-amber-300 blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
        >
          <h2 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">{description}</p>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Gift className="w-5 h-5" />
            <span>
              Your presence is the greatest gift, but if you&apos;d like to give something
              special...
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gifts.map((gift, index) => (
            <div
              key={index}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 overflow-hidden ${
                isVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-12 opacity-0 scale-90"
              } ${purchasedItems.includes(index) ? "ring-2 ring-green-500" : ""}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative">
                <div
                  ref={(el) => {
                    imageRefs.current[index] = el;
                  }}
                >
                  <Image
                    src={getSafeImageUrl(gift.image)}
                    alt={gift.item || gift.name || `Gift item ${index + 1}`}
                    className="w-full h-48 object-cover transition-transform duration-300"
                    style={{ transform: `scale(${imageScales[index] || 1})` }}
                    width={600}
                    height={400}
                  />
                </div>
                {purchasedItems.includes(index) && (
                  <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{gift.item}</h3>
                <p className="text-gray-600 mb-4 text-sm">{gift.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(gift.price)}
                  </span>
                </div>

                <button
                  disabled={gift.purchased}
                  onClick={() => openPurchase(gift)}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    gift.purchased
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-900"
                  }`}
                >
                  {gift.purchased ? "Already Purchased" : "Purchase Gift"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-16 transition-all duration-1000 delay-300 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Prefer to Give Cash?</h3>
            <button
              onClick={() => setCashGiftOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
            >
              Gift Cash
            </button>
          </div>
        </div>
      </div>

      <PurchaseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        gift={selected}
        bankDetails={bankDetailsList}
        loadingBanks={loadingBanks}
        onPurchase={handlePurchase}
      />

      <CashGiftModal
        isOpen={cashGiftOpen}
        onClose={() => setCashGiftOpen(false)}
        bankDetails={bankDetailsList}
        loadingBanks={loadingBanks}
        onPurchase={handleCashGift}
      />
    </section>
  );
}
