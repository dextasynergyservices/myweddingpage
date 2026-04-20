"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Calendar,
  MessageCircleIcon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import GoogleAuthButton from "@/app/auth/GoogleAuthButton";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import FormDivider from "@/components/ui/FormDivider";
import Button from "@/components/ui/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { enGB } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { useCSRFToken } from "@/hooks/useCSRFToken";

const RegisterForm = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { token: csrfToken } = useCSRFToken();

  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [dateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [] = dateRange;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    brideName: "",
    groomName: "",
    email: emailFromQuery,
    whatsapp: "",
    password: "",
    confirmPassword: "",
    image: null as File | null,
  });

  const [isEmailLocked, setIsEmailLocked] = useState(!!emailFromQuery);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    const fetchUserFromToken = async () => {
      try {
        const res = await fetch("/api/auth/token-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken || "",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch user.");

        setFormData((prev) => ({ ...prev, email: data.email }));
        setIsEmailLocked(true);
      } catch (error) {
        console.error("Token verification failed:", error);
        toast.error("Invalid or expired token.");
        router.push("/login");
      }
    };

    fetchUserFromToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    if (!formData.groomName) errors.groomName = "Groom's name is required.";
    if (!formData.brideName) errors.brideName = "Bride's name is required.";
    if (!formData.email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Invalid email address.";
    if (!formData.whatsapp) errors.whatsapp = "WhatsApp number is required.";
    if (!weddingDate) errors.weddingDate = "Wedding date is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    setIsLoading(true);

    try {
      // Execute reCAPTCHA v3
      let recaptchaToken = "";
      if (
        typeof window !== "undefined" &&
        (
          window as Window & {
            grecaptcha?: {
              execute: (
                siteKey: string,
                options: { action: string }
              ) => Promise<string>;
            };
          }
        ).grecaptcha
      ) {
        try {
          recaptchaToken = await (
            window as unknown as {
              grecaptcha: {
                execute: (
                  siteKey: string,
                  options: { action: string }
                ) => Promise<string>;
              };
            }
          ).grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3 || "",
            {
              action: "register",
            }
          );
        } catch (error) {
          console.error("reCAPTCHA error:", error);
        }
      }

      const form = new FormData();
      form.append("groomName", formData.groomName);
      form.append("brideName", formData.brideName);
      form.append("email", formData.email);
      form.append("whatsapp", formData.whatsapp);
      form.append("password", formData.password);
      form.append("recaptchaToken", recaptchaToken);

      if (weddingDate) {
        form.append("weddingDate", weddingDate.toISOString());
      }

      if (formData.image) {
        form.append("image", formData.image);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
        body: form,
      });

      const result = await res.json();

      if (!res.ok) {
        // Show specific error from backend
        if (result.details && result.details.length > 0) {
          // Check if details are objects (Zod validation errors) or strings (password validation)
          const isObjectArray = typeof result.details[0] === "object";

          if (isObjectArray) {
            // Zod validation errors: { field: "email", message: "Invalid email" }
            const errorMessage = result.details
              .map((err: { field: string; message: string }) => err.message)
              .join(". ");
            toast.error(errorMessage, { duration: 6000 });
          } else {
            // Password validation errors - array of strings
            const errorMessage = result.details.join(". ");
            const suggestionMessage =
              result.suggestions && result.suggestions.length > 0
                ? " Suggestions: " + result.suggestions.join(". ")
                : "";
            toast.error(errorMessage + suggestionMessage, { duration: 6000 });
          }
        } else {
          toast.error(
            result.error ||
              result.message ||
              "Registration failed. Please try again."
          );
        }
        return;
      }

      toast.success("Registration successful! Please check your email.");
      router.push(`/verify-code?email=${formData.email}`);
    } catch (error: unknown) {
      console.error("Registration Failed:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3}`}
        strategy="lazyOnload"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-md relative ${
          isDarkMode
            ? "bg-gradient-to-br from-black via-[#ab862b]/10 to-[#ab862b]/5"
            : "bg-white/80"
        } backdrop-blur-xl rounded-3xl shadow-2xl border ${
          isDarkMode ? "border-[#ab862b]/20" : "border-black/20"
        } p-8`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <Image
                src="/logoicon.png"
                alt="my wedding page"
                width={60}
                height={60}
              />
            </div>
          </motion.div>
          <h1
            className={`text-2xl font-thin mb-2 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            Continue to create your Wedding Page
          </h1>
          <p
            className={`${isDarkMode ? "text-white/50" : "text-black"} text-md font-light`}
          >
            Start your wedding journey today
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label>Groom&apos;s First Name</Label>
            <div className="relative">
              <User
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDarkMode ? "text-white/50" : "text-black/50"
                }`}
              />
              <Input
                name="groomName"
                placeholder="Enter groom’s first name"
                value={formData.groomName}
                onChange={handleChange}
                className="placeholder:text-sm"
              />
            </div>
            {formErrors.groomName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {formErrors.groomName}
              </motion.p>
            )}
          </div>

          <div>
            <Label>Bride&apos;s First Name</Label>
            <div className="relative">
              <User
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDarkMode ? "text-white/50" : "text-black/50"
                }`}
              />
              <Input
                name="brideName"
                placeholder="Enter bride’s name"
                value={formData.brideName}
                onChange={handleChange}
                className="placeholder:text-sm"
              />
            </div>
            {formErrors.brideName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {formErrors.brideName}
              </motion.p>
            )}
          </div>

          <div>
            <Label>Email Address</Label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDarkMode ? "text-white/50" : "text-black/50"
                }`}
              />
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                className="placeholder:text-sm"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                readOnly={isEmailLocked}
              />
            </div>
            {formErrors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {formErrors.email}
              </motion.p>
            )}
          </div>

          <div>
            <Label>WhatsApp Number</Label>
            <div className="relative">
              <MessageCircleIcon
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDarkMode ? "text-white/50" : "text-black/50"
                }`}
              />
              <Input
                name="whatsapp"
                placeholder="WhatsApp number with country code e.g +234"
                value={formData.whatsapp}
                onChange={handleChange}
                className="placeholder:text-sm"
              />
            </div>
            {formErrors.whatsapp && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {formErrors.whatsapp}
              </motion.p>
            )}
          </div>

          <div>
            <Label>Wedding Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <DatePicker
                selected={weddingDate}
                onChange={(date) => setWeddingDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={enGB}
                placeholderText="Select wedding date"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-all duration-300 placeholder:text-sm ${
                  isDarkMode
                    ? "bg-gradient-to-br from-black/50 to-[#ab862b] text-white placeholder-white focus:border-[#ab862b] focus:bg-[#ab862b]/10 focus:ring-[#ab862b]"
                    : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:bg-white"
                } focus:ring-2 focus:ring-indigo-500/20 focus:outline-none`}
              />
              {formErrors.weddingDate && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {formErrors.weddingDate}
                </motion.p>
              )}
            </div>
          </div>

          <div>
            <Label>Add an Image for your Website (Optional)</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0 file:text-sm file:font-semibold
               file:bg-black/50 file:text-[#ab862b] hover:file:bg-[#ab862b]/10"
            />
            {formData.image && (
              <div className="mt-2">
                <Image
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-full border"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 placeholder:text-sm"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            <p
              className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Password must be at least 8 characters with uppercase, lowercase,
              number, and special character (@, $, !, %, *, ?, &, #, etc.)
            </p>
            {formErrors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {formErrors.password}
              </motion.p>
            )}
          </div>

          <div>
            <Label>Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 pr-10 placeholder:text-sm"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-black"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {formErrors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {formErrors.confirmPassword}
              </motion.p>
            )}
          </div>

          <Button type="submit" isLoading={isLoading}>
            Continue
          </Button>
        </form>

        <FormDivider />

        <GoogleAuthButton />

        <p
          className={`text-center mt-8 ${isDarkMode ? "text-white/50" : "text-black"}`}
        >
          Already have an account?{" "}
          <span className="text-[#ab862b]/80 hover:text-[#ab862b] font-medium cursor-pointer transition-colors duration-200">
            Sign in
          </span>
        </p>
      </motion.div>
    </>
  );
};

export default RegisterForm;
