"use client";

import React, { useEffect, useRef, useState } from "react";
import { Gift, Check } from "lucide-react";
import Image from "next/image";
import PurchaseModal from "@/components/ui/PurchaseModal";
import CashGiftModal from "@/components/ui/CashGiftModal";
import { formatCurrency, parsePriceToNumber } from "@/lib/utils";
import styles from "@/styles/templates/elegance.module.css";

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

const GiftRegistry: React.FC<GiftRegistryProps> = (props) => {
  // Extract data from props with fallbacks
  const title = props.title || "Gift Registry";
  const description =
    props.description || "Help us build our home together with these thoughtfully chosen items";

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
  const [purchasedItems] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GiftItem | null>(null);
  const [bankDetailsList, setBankDetailsList] = useState<BankDetail[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const [cashGiftOpen, setCashGiftOpen] = useState(false);

  const openPurchase = (gift: GiftItem) => {
    console.log("EleganceGift openPurchase called with gift:", gift);
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
    console.log("EleganceGift handlePurchase called with:", {
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
    console.log("EleganceGift handleCashGift called with:", {
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="registry" className={`${styles.py24} ${styles.bgGradientSection}`}>
      <div className={`${styles.container} ${styles.mxAuto} ${styles.px4}`}>
        <div
          ref={sectionRef}
          className={`${styles.textCenter} ${styles.mb16} ${styles.transitionAll} ${styles.duration800} ${
            isVisible ? styles.animateFadeInUp : `${styles.opacity0} ${styles.translateY8}`
          }`}
        >
          <Gift
            className={`${styles.w12} ${styles.h12} ${styles.mxAuto} ${styles.mb6} ${styles.textPrimary} ${styles.animateFloat}`}
          />
          <h2
            className={`${styles.fontDisplay} md:text-5xl text-2xl ${styles.fontBold} ${styles.textForeground} ${styles.mb6}`}
          >
            {title}
          </h2>
          <p
            className={`${styles.fontBody} ${styles.textXl} ${styles.textMutedForeground} ${styles.maxW3xl} ${styles.mxAuto}`}
          >
            {description}
          </p>
        </div>

        {/* Category Filter */}
        {/* <div className={`${styles.flex} ${styles.flexWrap} ${styles.justifyCenter} ${styles.gap3} ${styles.mb12}`}>
          <button className={`${styles.border2} ${styles.borderPrimary} ${styles.textPrimary} ${styles.hoverBgPrimary} ${styles.hoverTextPrimaryForeground} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}>
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.hoverBgPrimary10} ${styles.hoverTextPrimary} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}
            >
              {category}
            </button>
          ))}
        </div> */}

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto`}>
          {gifts.map((item, index) => {
            const isPurchased = purchasedItems.has(item.id);

            return (
              <div
                key={item.id}
                className={`${styles.overflowHidden} ${styles.bgGradientCard} ${styles.shadowElevated} ${styles.hoverShadowGlow} ${styles.transitionAll} ${styles.duration500} ${
                  isVisible ? styles.animateScaleIn : `${styles.opacity0} ${styles.scale75}`
                } ${isPurchased ? styles.opacity60 : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles.p6}>
                  <div className={`${styles.textCenter} ${styles.mb4}`}>
                    <Image
                      src={getSafeImageUrl(item.image)}
                      alt={item.item || `Gift item ${item.id}`}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />
                  </div>

                  <h3
                    className={`${styles.fontDisplay} ${styles.textXl} ${styles.fontSemibold} ${styles.textForeground} ${styles.mb2}`}
                  >
                    {item.item}
                  </h3>

                  <p
                    className={`${styles.fontBody} ${styles.textMutedForeground} ${styles.textSm} ${styles.mb4} ${styles.leadingRelaxed}`}
                  >
                    {item.description}
                  </p>

                  <div
                    className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween} ${styles.mb6}`}
                  >
                    <span
                      className={`${styles.fontDisplay} ${styles.text2xl} ${styles.fontBold} ${styles.textPrimary}`}
                    >
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  <div className={styles.spaceY3}>
                    {isPurchased ? (
                      <button
                        disabled
                        className={`${styles.wFull} ${styles.bgSecondary} ${styles.textSecondaryForeground} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}
                      >
                        <Check className={`${styles.w4} ${styles.h4} ${styles.mr2}`} />
                        Already Purchased
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => openPurchase(item)}
                          className={`${styles.wFull} ${styles.border2} ${styles.borderPrimary} ${styles.textPrimary} ${styles.hoverBgPrimary} ${styles.hoverTextPrimaryForeground} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}
                        >
                          Purchase Gift
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`${styles.textCenter} ${styles.mt12}`}>
          <p className={`${styles.fontBody} ${styles.textMutedForeground} ${styles.mb4}`}>
            Can&apos;t find the perfect gift?
          </p>
          <div
            className={`${styles.flex} ${styles.flexWrap} ${styles.justifyCenter} ${styles.gap4}`}
          >
            <button
              onClick={() => setCashGiftOpen(true)}
              className={`${styles.border2} ${styles.borderPrimary} ${styles.textPrimary} ${styles.hoverBgPrimary} ${styles.hoverTextPrimaryForeground} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}
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
};

export default GiftRegistry;
