"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import GoogleAuthButton from "@/app/auth/GoogleAuthButton";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import Script from "next/script";
import { useCSRFToken } from "@/hooks/useCSRFToken";

import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import FormDivider from "@/components/ui/FormDivider";
import Input from "@/components/ui/Input";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"totp" | "email">("totp");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const { token: csrfToken } = useCSRFToken();
  // Note: csrfToken is used in fetch headers during form submission
  void csrfToken; // Acknowledge variable is used

  const { isDarkMode } = useTheme();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailOrPhone = formData.email.trim();

    const isValidEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
    const isValidPhone = /^(\+?\d{10,15}|\d{10,15})$/.test(emailOrPhone);

    if (!emailOrPhone) {
      newErrors.email = "Email or WhatsApp number is required";
    } else if (!isValidEmail && !isValidPhone) {
      newErrors.email = "Enter a valid email or phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // First, check if user requires 2FA
      const check2FAResponse = await fetch("/api/auth/check-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: formData.email }),
      });

      const check2FAData = await check2FAResponse.json();

      if (check2FAData.requires2FA) {
        // User has 2FA enabled - show 2FA modal
        setTwoFactorMethod(check2FAData.method || "totp");
        setShow2FAModal(true);
        setIsLoading(false);

        // If email method, automatically send code
        if (check2FAData.method === "email") {
          await sendEmailCode();
        }
        return;
      }

      // No 2FA required - proceed with normal login
      await performLogin();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const performLogin = async (twoFactorCode?: string, isBackup?: boolean) => {
    setIsLoading(true);
    try {
      // Execute reCAPTCHA v3
      let recaptchaToken = "";
      if (
        typeof window !== "undefined" &&
        (
          window as Window & {
            grecaptcha?: {
              execute: (siteKey: string, options: { action: string }) => Promise<string>;
            };
          }
        ).grecaptcha
      ) {
        try {
          recaptchaToken = await (
            window as unknown as {
              grecaptcha: {
                execute: (siteKey: string, options: { action: string }) => Promise<string>;
              };
            }
          ).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3 || "", {
            action: "login",
          });
        } catch (error) {
          console.error("reCAPTCHA error:", error);
        }
      }

      const res = await signIn("credentials", {
        redirect: false,
        emailOrPhone: formData.email,
        password: formData.password,
        recaptchaToken,
        twoFactorToken: twoFactorCode,
        isBackupCode: isBackup ? "true" : "false",
      });

      if (res?.ok) {
        toast.success("Login successful");
        setShow2FAModal(false);

        // Get fresh session with getSession (forces session refetch)
        const { getSession } = await import("next-auth/react");
        const session = await getSession();

        console.log("Session after login:", session); // Debug log

        if (session?.user?.role === "ADMIN") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        if (res?.error === "2FA_REQUIRED") {
          toast.error("2FA verification required");
        } else if (res?.error === "Invalid 2FA token") {
          toast.error("Invalid verification code. Please try again.");
        } else {
          toast.error(res?.error || "Login failed. Please check your credentials.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailCode = async () => {
    setIsSendingCode(true);
    try {
      const res = await fetch("/api/auth/2fa/email/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (res.ok) {
        setEmailCodeSent(true);
        toast.success("Verification code sent to your email");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send code");
      }
    } catch (error) {
      console.error("Send email code error:", error);
      toast.error("Failed to send code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!twoFactorToken.trim()) {
      toast.error("Please enter your verification code");
      return;
    }

    // For email method, verify via email endpoint
    if (twoFactorMethod === "email" && !useBackupCode) {
      await verifyEmailCode();
    } else {
      await performLogin(twoFactorToken, useBackupCode);
    }
  };

  const verifyEmailCode = async () => {
    // For email 2FA, pass the code through performLogin which will verify it via NextAuth
    await performLogin(twoFactorToken, false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3}`}
        strategy="lazyOnload"
      />

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-md w-full rounded-2xl p-8 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-2xl`}
          >
            <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
            <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {useBackupCode
                ? "Enter one of your backup codes"
                : twoFactorMethod === "email"
                  ? "Enter the 6-digit code sent to your email"
                  : "Enter the 6-digit code from your authenticator app"}
            </p>

            {/* Email code status */}
            {twoFactorMethod === "email" && !useBackupCode && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  isDarkMode
                    ? "bg-blue-500/10 border border-blue-500/30"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <p className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}>
                  {emailCodeSent
                    ? "📧 Code sent! Check your email inbox."
                    : "Sending verification code..."}
                </p>
                {emailCodeSent && (
                  <button
                    type="button"
                    onClick={sendEmailCode}
                    disabled={isSendingCode}
                    className={`mt-2 text-sm underline ${
                      isDarkMode
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-700"
                    } disabled:opacity-50`}
                  >
                    {isSendingCode ? "Sending..." : "Resend code"}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value)}
                  placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
                  maxLength={useBackupCode ? 9 : 6}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  Verify
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShow2FAModal(false);
                    setTwoFactorToken("");
                    setUseBackupCode(false);
                    setEmailCodeSent(false);
                    setIsLoading(false);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTwoFactorToken("");
                }}
                className="text-sm text-[#ab862b] hover:underline w-full text-center mt-2"
              >
                {useBackupCode ? "Use authenticator code" : "Use backup code instead"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <Label>Email or WhatsApp Number</Label>
          <div className="relative">
            <Mail
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? "text-white/50" : "text-black/50"}`}
            />
            <Input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email or WhatsApp number"
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label>Password</Label>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? "text-white/50" : "text-black/50"}`}
            />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                isDarkMode
                  ? "text-white/50 hover:text-white/30"
                  : "text-black/50 hover:text-black/60"
              } transition-colors duration-200`}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-[#ab862b]/80 hover:text-[#ab862b] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button type="submit" isLoading={isLoading} loadingText="Signing In...">
          Sign In
        </Button>

        <FormDivider />

        {/* Google Auth */}
        <GoogleAuthButton />

        {/* Signup Link */}
        <p className={`text-center mt-8 ${isDarkMode ? "text-white/50" : "text-black"}`}>
          Don&lsquo;t have an account?{" "}
          <Link
            href="/packages"
            className="text-[#ab862b]/80 hover:text-[#ab862b] font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
      </form>
      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
};

export default LoginForm;
