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
            ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-slate-700"
            : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:bg-white",
          "focus:ring-2 focus:ring-indigo-500/20 focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
