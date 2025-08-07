"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("reference");
  const planId = searchParams.get("planId");
  const whatsapp = searchParams.get("whatsapp");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference, planId, whatsapp }),
        });

        const data = await res.json();

        if (!data.success) {
          toast.error(data.error || "Verification failed");
          return;
        }

        toast.success("Subscription verified! Redirecting...");
        router.push(`/auth/register?email=${encodeURIComponent(email || "")}`);
      } catch (err) {
        console.error("Failed to redirect:", err);
        toast.error("An error occurred during verification");
      }
    };

    if (reference && planId && whatsapp && email) {
      verifyPayment();
    } else {
      toast.error("Missing payment parameters");
    }
  }, [reference, planId, whatsapp, email, router]);

  return null;
}
