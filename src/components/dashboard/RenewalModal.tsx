import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface RenewalOption {
  id: string;
  duration: number;
  price: number;
}

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  userId: string;
  groomName?: string;
  brideName?: string;
  email?: string;
}

export default function RenewalModal({
  isOpen,
  onClose,
  planId,
  userId,
  groomName,
  brideName,
  email,
}: RenewalModalProps) {
  const [options, setOptions] = useState<RenewalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/renewal-options?planId=${encodeURIComponent(planId)}`)
      .then((res) => res.json())
      .then((data) => setOptions(Array.isArray(data) ? data : []))
      .catch((err) => console.error("fetch renewal-options error:", err))
      .finally(() => setLoading(false));
  }, [isOpen, planId]);

  // Handle failed Paystack transactions
  useEffect(() => {
    if (!isOpen) return;
    const params = new URLSearchParams(window.location.search);
    const failedReference = params.get("renewalFailed");
    if (failedReference) {
      toast.error("Your previous transaction was not completed or failed. Please try again.");
      setInitializing(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("renewalFailed");
      window.history.replaceState({}, "", url.toString());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startPayment = async (optionId: string) => {
    try {
      if (initializing) return;
      setInitializing(optionId);

      sessionStorage.setItem("renewalOptionId", optionId);
      sessionStorage.setItem("renewalPlanId", planId);
      sessionStorage.setItem("renewalUserId", userId);

      const res = await fetch("/api/paystack/initiate-renewal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId,
          userId,
          planId,
          groomName,
          brideName,
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");

      window.location.href = data.authorization_url;
    } catch (e) {
      console.error(e);
      setInitializing(null);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-2 text-center text-slate-900 dark:text-white">
          Renew Your Plan
        </h2>
        {groomName && brideName && (
          <p className="text-center text-slate-500 dark:text-slate-300 mb-2">
            {groomName} & {brideName}, renew your plan below
          </p>
        )}
        <p className="text-center text-slate-500 dark:text-slate-300 mb-6">
          Select a duration and proceed to payment
        </p>

        {loading ? (
          <p className="text-center text-slate-500">Loading options...</p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {(options || []).map((opt) => (
              <div
                key={opt.id}
                className="flex flex-col items-center border rounded-2xl p-6 shadow hover:shadow-lg transition bg-slate-50 dark:bg-slate-700 w-56"
              >
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {opt.duration} Days
                </p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  ₦{Number(opt.price).toLocaleString()}
                </p>
                <Button
                  onClick={() => startPayment(opt.id)}
                  className="mt-4 w-full"
                  disabled={!!initializing}
                >
                  {initializing === opt.id ? "Redirecting..." : "Pay Now"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
