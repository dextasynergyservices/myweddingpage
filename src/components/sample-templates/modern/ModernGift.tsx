"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";

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
}

export default function ModernGift(props: ModernGiftProps) {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GiftItem | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Extract gifts data from props (prioritize gifts over giftRegistry for consistency with API)
  const gifts = props.gifts || props.giftRegistry || [];

  const openPurchase = (gift: GiftItem) => {
    setSelected(gift);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    setLoadingBanks(true);
    fetch("/api/bank-details")
      .then((r) => r.json())
      .then((data) => setBankDetails(data || []))
      .catch((e) => console.error("Failed to load bank details", e))
      .finally(() => setLoadingBanks(false));
  }, [open]);

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
                  {gift.price}
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={selected ? selected.item : "Purchase"}
      >
        {!selected ? (
          <p>No gift selected</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Image
                src={selected.image}
                alt={(selected?.item ?? selected?.name) || `Gift image ${selected?.id ?? ""}`}
                width={800}
                height={600}
                className="rounded-xl w-full h-auto object-cover"
              />
              <h4 className="mt-4 font-semibold text-lg">{selected.item}</h4>
              {selected.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300">{selected.description}</p>
              )}
              <p className="mt-2 font-medium">Price: {selected.price}</p>
              {selected.link && (
                <a
                  className="text-indigo-600 hover:underline mt-2 block"
                  href={selected.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open product link
                </a>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Bank Details</h4>
              {loadingBanks ? (
                <p>Loading bank details...</p>
              ) : bankDetails.length === 0 ? (
                <p className="text-sm text-slate-500">No bank details available for this user.</p>
              ) : (
                <div className="space-y-4">
                  {bankDetails.map((b) => (
                    <div key={b.id} className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-700">
                      <p className="font-semibold">{b.bankName}</p>
                      <p className="text-sm">Account Name: {b.accountName}</p>
                      <p className="text-sm">Account Number: {b.accountNumber}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-2xl">
                  Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
