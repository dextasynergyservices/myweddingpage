import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({ className, ...props }: LabelProps) => {
  const { isDarkMode } = useTheme();
  return (
    <label
      className={cn(
        "block text-sm font-medium mb-2",
        isDarkMode ? "text-slate-300" : "text-slate-700",
        className
      )}
      {...props}
    />
  );
};

export default Label;
