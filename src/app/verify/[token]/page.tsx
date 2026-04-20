"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function VerifyTokenPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";

  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "verified" | "failed">("loading");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (!token) return;

    console.log("Sending token:", token);
    console.log("Request body:", JSON.stringify({ token }));

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify/${token}`, {
          method: "POST",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user?.status === "ACTIVE") {
            setStatus("verified");
            setTimeout(() => router.push("/login"), 3000);
          } else {
            setStatus("failed");
          }
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    };

    verify();
  }, [token, router]);

  const handleResend = async () => {
    if (!token) return;

    setResendStatus("sending");
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      setResendStatus(res.ok ? "sent" : "error");
    } catch {
      setResendStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === "loading" && <p>Verifying your account...</p>}
        {status === "verified" && (
          <p className="text-green-600">Your account is now verified! Redirecting...</p>
        )}
        {status === "failed" && (
          <>
            <p className="text-red-600">
              Verification failed. Your token may be invalid or expired.
            </p>
            <button
              onClick={handleResend}
              disabled={resendStatus === "sending"}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {resendStatus === "sending"
                ? "Resending..."
                : resendStatus === "sent"
                  ? "Verification email sent!"
                  : resendStatus === "error"
                    ? "Error! Try again"
                    : "Resend Verification Email"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
