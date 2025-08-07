"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, User, Eye, EyeOff, Calendar, MessageCircleIcon } from "lucide-react";
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

const RegisterForm = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();

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
          headers: { "Content-Type": "application/json" },
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
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email address.";
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
      const form = new FormData();
      form.append("groomName", formData.groomName);
      form.append("brideName", formData.brideName);
      form.append("email", formData.email);
      form.append("whatsapp", formData.whatsapp);
      form.append("password", formData.password);

      if (weddingDate) {
        form.append("weddingDate", weddingDate.toISOString());
      }

      if (formData.image) {
        form.append("image", formData.image);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: form,
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Registration failed.");
        return;
      }

      toast.success("Registration successful!");
      toast.success("Registration successful!");
      router.push(`/verify-code?email=${formData.email}`);
    } catch (error: unknown) {
      console.error("Registration Failed:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`w-full max-w-md relative ${
        isDarkMode ? "bg-slate-800/80" : "bg-white/80"
      } backdrop-blur-xl rounded-3xl shadow-2xl border ${
        isDarkMode ? "border-slate-700/50" : "border-white/20"
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
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
            <Heart className="h-8 w-8 text-white" fill="currentColor" />
          </div>
        </motion.div>
        <h1 className={`text-2xl font-thin mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Continue to create your Wedding Page
        </h1>
        <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} text-md font-light`}>
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
                isDarkMode ? "text-slate-400" : "text-slate-400"
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
                isDarkMode ? "text-slate-400" : "text-slate-400"
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
                isDarkMode ? "text-slate-400" : "text-slate-400"
              }`}
            />
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              className="placeholder:text-sm"
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
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
                isDarkMode ? "text-slate-400" : "text-slate-400"
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
                  ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-slate-700"
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
               file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
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
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pl-10 pr-10 placeholder:text-sm"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
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

      <p className={`text-center mt-8 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
        Already have an account?{" "}
        <span className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer transition-colors duration-200">
          Sign in
        </span>
      </p>
    </motion.div>
  );
};

export default RegisterForm;
