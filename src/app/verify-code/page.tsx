"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";

export default function ManualVerificationPage() {
  const { isDarkMode } = useTheme();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pendingEmail") || "";
    }
    return "";
  });
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  // Restore cooldown from localStorage
  useEffect(() => {
    const storedCooldownUntil = localStorage.getItem("resendCooldownUntil");
    if (storedCooldownUntil) {
      const remaining = Math.floor((+storedCooldownUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem("resendCooldownUntil");
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = showEmailInput ? { email, code } : { code };

    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("✅ Verified successfully!");
      localStorage.removeItem("pendingEmail");

      // ✅ Clear states after success
      setCode("");
      setEmail("");
      setShowEmailInput(false);
      setError("");

      router.push("/login");
    } else {
      if (data?.error?.toLowerCase().includes("expired")) {
        setError("⏰ Code expired. Please request a new one.");
      } else if (data?.error?.toLowerCase().includes("invalid")) {
        setError("❌ Invalid code. Please try again.");
      } else {
        setError(data.error || "Verification failed.");
      }

      setShowEmailInput(true);
      toast.error(data.error || "❌ Verification failed.");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email to resend the code.");
      return;
    }

    const res = await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      toast.success("📧 Code resent to your email.");
      const cooldownSeconds = 60;
      setCooldown(cooldownSeconds);
      localStorage.setItem("resendCooldownUntil", (Date.now() + cooldownSeconds * 1000).toString());
      localStorage.setItem("pendingEmail", email);
    } else {
      toast.error("⚠️ Could not resend. Try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-white p-6 rounded shadow"
      >
        <h2
          className={`text-xl font-bold text-center ${
            isDarkMode ? "text-slate-900" : "text-slate-900"
          }`}
        >
          Verify with Code
        </h2>
        <p className="text-slate-900 text-center">Check your email for verification code</p>

        <Input
          type="text"
          maxLength={6}
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="bg-white"
        />

        {showEmailInput && (
          <>
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                localStorage.setItem("pendingEmail", e.target.value);
              }}
            />

            <Button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className={`underline text-sm text-white ${
                cooldown > 0 ? "text-gray-500" : "text-blue-600"
              }`}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Code"}
            </Button>
          </>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  );
}
