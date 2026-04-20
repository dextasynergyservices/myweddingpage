"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import PurchaseModal from "@/components/ui/PurchaseModal";
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

interface ModernGiftProps {
  gifts?: GiftItem[];
  giftRegistry?: GiftItem[]; // Legacy support
  userId?: string; // Wedding page owner's user ID
  bankDetails?: BankDetail[]; // Bank details for the wedding page owner
}

export default function ModernGift(props: ModernGiftProps) {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GiftItem | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Debug: Log props to see what's being passed
  console.log("ModernGift props:", props);

  // Extract gifts data from props (prioritize gifts over giftRegistry for consistency with API)
  const gifts = props.gifts || props.giftRegistry || [];

  const openPurchase = (gift: GiftItem) => {
    console.log("openPurchase called with gift:", gift);
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
    console.log("handlePurchase called with:", {
      selected,
      userId: props.userId,
      data,
    });

    if (!selected) {
      console.log("No selected gift, returning early");
      return;
    }

    if (!props.userId) {
      console.log("No userId provided, returning early");
      return;
    }

    try {
      const requestData = {
        name: data.name,
        contactEmail: data.email,
        contactPhone: data.phone,
        message: data.message,
        giftId: selected.id,
        amount: parsePriceToNumber(selected.price),
        userId: props.userId, // Use the wedding page owner's user ID
      };

      console.log("Sending request to API with data:", requestData);

      const response = await fetch("/api/public/received-gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("API error response:", errorText);
        throw new Error("Failed to submit purchase information");
      }

      const responseData = await response.json();
      console.log("API success response:", responseData);

      // Mark gift as purchased locally
      setSelected({ ...selected, purchased: true });
    } catch (error) {
      console.error("Purchase submission error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!open) return;
    // Use bank details passed from props instead of fetching from API
    setBankDetails(props.bankDetails || []);
    setLoadingBanks(false);
  }, [open, props.bankDetails]);

  return (
    <div
      className={`rounded-3xl p-12 shadow-lg border mb-16 ${
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
      }`}
    >
      <div className="text-center mb-12">
        <h2
          className={`text-4xl font-light mb-6 tracking-tight ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Gift Registry
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full mb-6"></div>
        <p
          className={`text-lg font-light max-w-2xl mx-auto ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Your presence is the only present we need, but if you&apos;d like to give a gift, here are
          some ideas.
        </p>
      </div>

      {gifts.length === 0 ? (
        <div className="text-center py-12">
          <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            No gift items found in the registry
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {gifts.map((gift) => (
            <div key={gift.id} className="group h-full">
              <div
                className={`rounded-3xl p-6 hover:shadow-lg transition-all duration-300 border ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 hover:border-slate-500"
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <Image
                  src={gift.image}
                  alt={gift.item || `Gift item ${gift.id}`}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover rounded-2xl mb-6"
                />
                <h3
                  className={`font-semibold mb-2 text-lg ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {gift.item}
                </h3>
                {gift.description && (
                  <p className={`mb-2 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {gift.description}
                  </p>
                )}

                <p
                  className={`mb-4 text-lg font-light ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {formatCurrency(gift.price)}
                </p>

                {gift.link && (
                  <a
                    href={gift.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline block mb-4"
                  >
                    View item link
                  </a>
                )}
                <button
                  disabled={gift.purchased}
                  onClick={() => openPurchase(gift)}
                  className={`w-full py-3 px-6 rounded-2xl font-medium transition-all duration-300 ${
                    gift.purchased
                      ? isDarkMode
                        ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {gift.purchased ? "Already Purchased" : "Purchase"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PurchaseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        gift={selected}
        bankDetails={bankDetails}
        loadingBanks={loadingBanks}
        onPurchase={handlePurchase}
      />
    </div>
  );
}
