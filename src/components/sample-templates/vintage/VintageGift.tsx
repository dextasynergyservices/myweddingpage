"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import Image from "next/image";

interface GiftItem {
  id: string;
  item: string;
  price: string;
  image: string;
  purchased: boolean;
}

export default function VintageGift() {
  const { isDarkMode } = useTheme();
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/wedding-data");
        const data = await response.json();
        setGifts(data.giftRegistry || []);
      } catch (error) {
        console.error("Error fetching gift registry:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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
          Your presence is the only present we need, but if you'd like to give a gift, here are
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
                  alt={gift.item}
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
                <p
                  className={`mb-6 text-lg font-light ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {gift.price}
                </p>
                <button
                  disabled={gift.purchased}
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
    </div>
  );
}