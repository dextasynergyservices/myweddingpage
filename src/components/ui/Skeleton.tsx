import React from "react";

function SkeletonBase({
  className = "",
  width,
  height,
  animation = "pulse",
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}) {
  const animationStyles = animation === "pulse" ? "animate-pulse" : "";
  return (
    <div
      className={`${animationStyles} bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

export default function Skeleton({
  className = "",
  lines = 1,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`animate-pulse ${className}`} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded my-2" />
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
