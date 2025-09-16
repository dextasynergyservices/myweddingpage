import { useScrollAnimation } from "./hooks/useScrollAnimation";
import { Button } from "./components/ui/button";
import { Gift, Heart, ExternalLink, Check } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import PurchaseModal from "@/components/ui/PurchaseModal";
import CashGiftModal from "@/components/ui/CashGiftModal";
import { formatCurrency, parsePriceToNumber } from "@/lib/utils";
import styles from "@/styles/templates/bloom.module.css";

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
  const { elementRef, isVisible } = useScrollAnimation(0.2);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GiftItem | null>(null);
  const [bankDetailsList, setBankDetailsList] = useState<BankDetail[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const [cashGiftOpen, setCashGiftOpen] = useState(false);

  const openPurchase = (gift: GiftItem) => {
    console.log("BloomGift openPurchase called with gift:", gift);
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
    console.log("BloomGift handlePurchase called with:", {
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
    console.log("BloomGift handleCashGift called with:", {
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
    <section
      className={`${styles.sectionPadding} ${styles.gradientSoft} py-16 relative overflow-hidden`}
    >
      {/* Background Elements */}
      <div className={`${styles.floatingElement} absolute top-20 left-16 opacity-10`}>
        <Gift className={`w-28 h-28 text-accent ${styles.animateRomanticFloat}`} />
      </div>
      <div className={`${styles.floatingElement} absolute bottom-32 right-20 opacity-10`}>
        <Heart
          className={`w-20 h-20 text-primary ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className={`${styles.containerBloom} mx-auto px-4`}>
        {/* Header */}
        <div
          ref={elementRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2
            className={`${styles.fontHeading} text-2xl md:text-5xl font-bold ${styles.textForeground} mb-6`}
          >
            {title}
          </h2>
          <div className={`${styles.bgGradientRose} w-24 h-1 mx-auto mb-8`}></div>
          <p className={`text-xl ${styles.textMuted} max-w-3xl mx-auto leading-relaxed`}>
            {description}
          </p>
        </div>

        {/* Gift Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {gifts.map((gift, index) => (
            <div
              key={gift.id}
              className={`transition-all duration-700 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div
                className={`${styles.bgCard} ${styles.roundedLg} overflow-hidden ${styles.shadowSoft} hover:${styles.shadowRomantic} ${styles.transitionRomantic} group`}
              >
                {/* Gift Image */}
                <div className="relative overflow-hidden">
                  <Image
                    src={getSafeImageUrl(gift.image)}
                    alt={gift.item || gift.name || `Gift item ${index + 1}`}
                    className={`${styles.giftImage} w-full h-40 sm:h-48 object-cover ${styles.transitionRomantic} group-hover:scale-105`}
                    width={400}
                    height={192}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {gift.purchased && (
                    <div
                      className={`${styles.giftPurchasedOverlay} absolute inset-0 bg-primary/80 flex items-center justify-center`}
                    >
                      <div
                        className={`${styles.giftPurchasedContent} text-center text-primary-foreground`}
                      >
                        <Check className={`${styles.giftPurchasedIcon} w-12 h-12 mx-auto mb-2`} />
                        <p className={`${styles.giftPurchasedText} font-semibold`}>Thank You!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gift Details */}
                <div className="p-4 sm:p-6">
                  <h3
                    className={`${styles.fontHeading} text-lg sm:text-xl font-semibold ${styles.textForeground} mb-2`}
                  >
                    {gift.item}
                  </h3>
                  <p className={`${styles.textMuted} mb-4 leading-relaxed text-sm sm:text-base`}>
                    {gift.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span
                      className={`${styles.giftPrice} font-semibold text-xl sm:text-2xl text-primary`}
                    >
                      {formatCurrency(gift.price)}
                    </span>

                    {gift.purchased ? (
                      <Button
                        variant="secondary"
                        disabled
                        className={`${styles.giftPurchasedButton} bg-[hsl(340,75%,55%)] text-white opacity-60 w-full sm:w-auto`}
                      >
                        <Check className={`${styles.giftButtonIcon} w-4 h-4 mr-2`} />
                        Already Purchased
                      </Button>
                    ) : (
                      <Button
                        variant="romantic"
                        onClick={() => openPurchase(gift)}
                        className={`${styles.giftPurchaseButton} bg-[hsl(340,75%,55%)] text-white group/btn w-full sm:w-auto`}
                      >
                        <span className="hidden sm:inline">Purchase Gift</span>
                        <span className="sm:hidden">Purchase</span>
                        <ExternalLink
                          className={`${styles.giftButtonIcon} w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1`}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div
            className={`${styles.bgCard} p-8 ${styles.roundedLg} ${styles.shadowSoft} max-w-2xl mx-auto`}
          >
            <Gift className={`${styles.giftInfoIcon} w-12 h-12 text-primary mx-auto mb-4`} />
            <h3
              className={`${styles.fontHeading} text-2xl font-semibold ${styles.textForeground} mb-4`}
            >
              Other Ways to Give
            </h3>
            <p className={`${styles.textMuted} mb-6 leading-relaxed`}>
              We&apos;re also registered at Target and Williams Sonoma. You can find our registries
              online or contribute to our honeymoon fund if you prefer.
            </p>
            <div
              className={`${styles.giftInfoButtons} flex flex-col sm:flex-row gap-4 justify-center`}
            >
              <Button
                variant="outline"
                onClick={() => setCashGiftOpen(true)}
                className={`${styles.giftInfoButton} bg-[hsl(340,75%,55%)] text-white group`}
              >
                Gift Cash
                <Heart className={`${styles.giftButtonIcon} w-4 h-4 ml-2 text-primary`} />
              </Button>
            </div>
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
