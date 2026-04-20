"use client";

import { useState } from "react";
import { X, Gift, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface BankDetail {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface CashGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankDetails: BankDetail[];
  loadingBanks: boolean;
  userId: string; // Wedding page owner's user ID
}

export default function CashGiftModal({
  isOpen,
  onClose,
  bankDetails,
  loadingBanks,
  userId,
}: CashGiftModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.amount
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (!userId) {
      setError("Wedding page owner ID is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the new cash gifts API endpoint directly
      const response = await fetch("/api/cash-gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          amount: formData.amount,
          message: formData.message,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit cash gift");
      }

      const result = await response.json();
      console.log("Cash gift submitted successfully:", result);

      // Show success message
      toast.success("Cash gift submitted successfully!");

      // Reset form and close modal
      setFormData({ name: "", email: "", phone: "", message: "", amount: "" });
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit cash gift. Please try again.";
      setError(errorMessage);
      console.error("Cash gift submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cash Gift</h2>
              <p className="text-sm text-gray-500">
                Let us know you sent us a Cash Gift!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bank Details */}
          {loadingBanks ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading bank details...</p>
            </div>
          ) : bankDetails.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bank Account Details
              </h3>
              <div className="space-y-3">
                {bankDetails.map((bank, index) => (
                  <div
                    key={bank.id || index}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-500 text-sm">
                            Bank Name:
                          </span>
                          <p className="font-medium text-gray-900">
                            {bank.bankName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-500 text-sm">
                            Account Number:
                          </span>
                          <p className="font-medium text-gray-900 font-mono text-lg">
                            {bank.accountNumber}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleCopy(
                              bank.accountNumber,
                              `accountNumber-${bank.id || index}`
                            )
                          }
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="Copy account number"
                        >
                          {copiedItems.has(
                            `accountNumber-${bank.id || index}`
                          ) ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-500 text-sm">
                            Account Name:
                          </span>
                          <p className="font-medium text-gray-900">
                            {bank.accountName}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleCopy(
                              bank.accountName,
                              `accountName-${bank.id || index}`
                            )
                          }
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="Copy account name"
                        >
                          {copiedItems.has(
                            `accountName-${bank.id || index}`
                          ) ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 text-sm">
                No bank details available. Please contact the couple directly.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter amount sent"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Leave a message for the couple..."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Cash Gift"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
