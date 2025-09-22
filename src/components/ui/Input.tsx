import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const { isDarkMode } = useTheme();

    return (
      <input
        ref={ref}
        className={cn(
          "w-full pl-12 pr-4 py-3 rounded-2xl border transition-all duration-300",
          isDarkMode
            ? "bg-[#ab862b]/10 border-[#ab862b] text-white placeholder-white focus:border-[#ab862b] focus:bg-[#ab862b]/10 focus:ring-[#ab862b]"
            : "bg-white/50 border-black text-slate-900 placeholder-slate-500 focus:border-black focus:bg-white focus:ring-black",
          "focus:ring-2 focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
