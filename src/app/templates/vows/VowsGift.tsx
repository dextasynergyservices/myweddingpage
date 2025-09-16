"use client";

import { useScrollAnimation } from "@/app/templates/vows/hooks/useScrollAnimation";
import { Card, CardContent } from "@/app/templates/vows/components/ui/card";
import { Button } from "@/app/templates/vows/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
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

const GiftRegistry = (props: GiftRegistryProps) => {
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
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GiftItem | null>(null);
  const [bankDetailsList, setBankDetailsList] = useState<BankDetail[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const [cashGiftOpen, setCashGiftOpen] = useState(false);

  const openPurchase = (gift: GiftItem) => {
    console.log("VowsGift openPurchase called with gift:", gift);
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
    console.log("VowsGift handlePurchase called with:", {
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
          userId: props.userId, // Use the wedding page owner's user ID
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
    console.log("VowsGift handleCashGift called with:", {
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

  return (
    <section className="py-32 bg-background">
      <div className="container-wedding">
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl text-black mb-6">{title}</h2>
          <div className="w-24 h-px bg-accent mx-auto mb-8" />
          <p className="font-body text-lg md:text-xl text-black/80 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-16 py-4 md:gap-8">
          {gifts.map((item, index) => (
            <div
              key={item.id}
              className={`transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${400 + index * 100}ms` }}
            >
              <Card
                className={`h-full border-l-4 hover:shadow-soft transition-all duration-300 group`}
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Image
                      src={getSafeImageUrl(item.image)}
                      alt={item.item || `Gift item ${item.id}`}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-lg font-semibold text-black/80">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-heading text-xl text-black/80 mb-2">{item.item}</h3>

                  <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={item.purchased}
                      onClick={() => openPurchase(item)}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                    >
                      {item.purchased ? "Already Purchased" : "Purchase"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center bg-black/80 rounded-lg shadow-soft w-5/6 mx-auto py-16">
          <div className="elegant-card p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl text-white/70 mb-4">Cash Gifts</h3>
            <p className="font-body text-white/70 mb-6 leading-relaxed">
              If you prefer to give a cash gift, we&apos;ve set up a secure online fund to help us
              with our honeymoon and future home expenses.
            </p>
            <Button
              onClick={() => setCashGiftOpen(true)}
              className="bg-white text-black transition-colors duration-300 rounded-full px-8 py-4 font-xl lg:font-2xl"
            >
              Gift Cash
            </Button>
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
};

export const GiftRegistrySection = GiftRegistry;
