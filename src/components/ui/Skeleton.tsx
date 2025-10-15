import React from "react";

function SkeletonBase({
  className = "",
  width,
  height,
  animation = "pulse",
  variant = "rectangular",
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  variant?: "rectangular" | "text" | "circular";
}) {
  const animationStyles = animation === "pulse" ? "animate-pulse" : "";
  const shapeClass =
    variant === "circular" ? "rounded-full" : variant === "text" ? "rounded" : "rounded-lg";

  return (
    <div
      className={`${animationStyles} bg-gray-200 dark:bg-gray-700 ${shapeClass} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

export function Skeleton({
  className = "",
  lines = 1,
  variant,
  width,
  height,
}: {
  className?: string;
  lines?: number;
  variant?: "rectangular" | "text" | "circular";
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div className={`animate-pulse ${className}`} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={i === lines - 1 ? "my-0" : "my-2"}
          width={width}
          height={height || (variant === "text" ? 16 : undefined)}
          variant={
            variant === "text" ? "text" : variant === "circular" ? "circular" : "rectangular"
          }
        />
      ))}
    </div>
  );
}

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBase
        key={i}
        className="rounded"
        width={i === lines - 1 ? "80%" : "100%"}
        height={16}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <SkeletonBase width="100%" height={160} className="mb-4 rounded-lg" />
    <SkeletonBase width="60%" height={16} className="mb-2 rounded" />
    <SkeletonText lines={2} />
  </div>
);

// Small helper components used as placeholders in the customization UI
export const SkeletonColorPicker: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <SkeletonBase width="100%" height={24} className="rounded" />
    <div className="flex space-x-2">
      <SkeletonBase width={40} height={40} className="rounded-full" />
      <SkeletonBase width={40} height={40} className="rounded-full" />
      <SkeletonBase width={40} height={40} className="rounded-full" />
    </div>
  </div>
);

export const SkeletonFontPicker: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <SkeletonBase width="100%" height={40} className="rounded" />
    <SkeletonText lines={2} />
  </div>
);
