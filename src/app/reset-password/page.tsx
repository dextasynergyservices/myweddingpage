"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const { isDarkMode } = useTheme();
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const newErrors: Record<string, string> = {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successfully");
        router.push("/login");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`max-w-md mx-auto mt-28 p-6 rounded-lg ${isDarkMode ? "dark:bg-gray-800" : "bg-white text-slate-800 border-1"}`}
    >
      <h2 className="text-2xl font-semibold mb-4">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isDarkMode ? "text-slate-400" : "text-slate-400"
              }`}
            />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                isDarkMode
                  ? "text-slate-400 hover:text-slate-300"
                  : "text-slate-400 hover:text-slate-600"
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

        <div>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isDarkMode ? "text-slate-400" : "text-slate-400"
              }`}
            />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                isDarkMode
                  ? "text-slate-400 hover:text-slate-300"
                  : "text-slate-400 hover:text-slate-600"
              } transition-colors duration-200`}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}
