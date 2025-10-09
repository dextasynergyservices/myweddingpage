import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "text",
  width,
  height,
  animation = "pulse",
}) => {
  const baseStyles = "bg-gray-200 dark:bg-gray-700";

  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]",
    none: "",
  };

  const defaultSizes = {
    text: { width: "100%", height: "1rem" },
    circular: { width: "3rem", height: "3rem" },
    rectangular: { width: "100%", height: "10rem" },
  };

  const finalWidth = width || defaultSizes[variant].width;
  const finalHeight = height || defaultSizes[variant].height;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={{
        width: typeof finalWidth === "number" ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === "number" ? `${finalHeight}px` : finalHeight,
      }}
    />
  );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} variant="text" width={i === lines - 1 ? "80%" : "100%"} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <Skeleton variant="rectangular" height="10rem" className="mb-4" />
    <Skeleton variant="text" width="60%" className="mb-2" />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonColorPicker: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    <Skeleton variant="text" width="40%" height="1.25rem" />
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="circular" width="2.5rem" height="2.5rem" />
      ))}
    </div>
  </div>
);

export const SkeletonFontPicker: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    <Skeleton variant="text" width="40%" height="1.25rem" />
    <Skeleton variant="rectangular" height="3rem" />
  </div>
);
