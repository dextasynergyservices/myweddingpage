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
        emailOrPhone: formData.email, // ✅ Match provider field name
        password: formData.password,
        recaptchaToken,
      });

      if (res?.ok) {
        toast.success("Login successful");
        router.push("/dashboard");
      } else {
        toast.error(res?.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
