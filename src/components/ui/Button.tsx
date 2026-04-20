"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import * as React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type MotionButtonProps = ComponentPropsWithoutRef<typeof motion.button>;

export type ButtonVariant = "default" | "outline" | "ghost" | "danger";

interface ButtonProps extends MotionButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-gradient-to-r from-black/50 to-[#ab862b] text-white hover:shadow-lg",
  outline:
    "bg-transparent border border-[#ab862b] text-[#ab862b] hover:bg-[#ab862b]/5 dark:hover:bg-slate-800",
  ghost: "bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      isLoading,
      loadingText = "Loading...",
      disabled,
      variant = "default",
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full py-3 px-6 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {loadingText}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
