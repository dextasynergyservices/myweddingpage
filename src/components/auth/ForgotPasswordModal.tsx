"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("A reset link has been sent to your email");
        onClose();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // ✅ Overlay with click-outside to close
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()} // Prevent click from closing when inside modal
        className="bg-white p-6 rounded-lg w-full max-w-md relative"
      >
        {/* ✅ Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-slate-800">Reset Password</h2>

        {/* Form with no extra background */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-transparent">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white"
            required
          />
          <div className="space-y-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
