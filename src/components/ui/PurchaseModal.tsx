"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Copy, Check } from "lucide-react";

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

interface BankDetail {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: GiftItem | null;
  bankDetails: BankDetail[];
  loadingBanks: boolean;
  onPurchase: (data: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  }) => Promise<void>;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  gift,
  bankDetails,
  loadingBanks,
  onPurchase,
}: PurchaseModalProps) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onPurchase(formData);
      toast.success("Purchase information submitted successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      onClose();
    } catch (error) {
      toast.error("Failed to submit purchase information");
      console.error("Purchase submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set(prev).add(itemId));
      toast.success("Copied to clipboard!");

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  if (!gift) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Purchase ${gift.item}`} size="lg">
      <div className="space-y-6">
        {/* Gift Information */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <Image
              src={gift.image}
              alt={gift.item || `Gift image ${gift.id}`}
              width={400}
              height={300}
              className="rounded-xl w-full h-48 object-cover"
            />
            <div className="mt-4">
              <h4 className="font-semibold text-lg">{gift.item}</h4>
              {gift.description && (
                <p className={`text-sm mt-2 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  {gift.description}
                </p>
              )}
              <p className="mt-2 font-medium text-lg">Price: {formatCurrency(gift.price)}</p>
              {gift.link && (
                <a
                  className="text-indigo-600 hover:underline mt-2 block"
                  href={gift.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Product Link
                </a>
              )}
            </div>
          </div>

          {/* Bank Details */}
          <div className="md:w-1/2">
            <h4 className="font-semibold mb-4 text-lg">Payment Information</h4>
            {loadingBanks ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : bankDetails.length === 0 ? (
              <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                No bank details available.
              </p>
            ) : (
              <div className="space-y-4">
                {bankDetails.map((bank) => (
                  <div
                    key={bank.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <p
                      className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {bank.bankName}
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm mt-1 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                      >
                        <span
                          className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                        >
                          Account Name:
                        </span>{" "}
                        <span
                          className={`font-mono ${isDarkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {bank.accountName}
                        </span>
                      </p>
                      <button
                        onClick={() => handleCopy(bank.accountName, `accountName-${bank.id}`)}
                        className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                          isDarkMode ? "hover:bg-white" : "hover:bg-slate-200"
                        }`}
                        title="Copy account name"
                      >
                        {copiedItems.has(`accountName-${bank.id}`) ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm mt-1 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                      >
                        <span
                          className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                        >
                          Account Number:
                        </span>{" "}
                        <span
                          className={`font-mono text-lg font-bold ${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          {bank.accountNumber}
                        </span>
                      </p>
                      <button
                        onClick={() => handleCopy(bank.accountNumber, `accountNumber-${bank.id}`)}
                        className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                          isDarkMode ? "hover:bg-white" : "hover:bg-slate-200"
                        }`}
                        title="Copy account number"
                      >
                        {copiedItems.has(`accountNumber-${bank.id}`) ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Purchase Form */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4 text-lg">Let us know you got us a Gift!</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                      : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                  } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                      : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                  } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                    : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                    : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                placeholder="Add a personal message (optional)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSubmitting
                    ? "bg-slate-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Purchase"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
