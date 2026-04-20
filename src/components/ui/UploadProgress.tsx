"use client";

import React from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle, XCircle, Clock, Zap } from "lucide-react";

export interface UploadProgressData {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
  fileName: string;
  status: "uploading" | "success" | "error" | "pending";
  error?: string;
}

interface UploadProgressProps {
  uploads: UploadProgressData[];
  onCancel?: (fileName: string) => void;
  onRetry?: (fileName: string) => void;
  onDismiss?: (fileName: string) => void;
  className?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};

const formatSpeed = (bytesPerSecond: number): string => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

export const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onCancel,
  onRetry,
  onDismiss,
  className = "",
}) => {
  if (!uploads.length) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 space-y-2 max-w-sm ${className}`}
    >
      {uploads.map((upload) => (
        <motion.div
          key={upload.fileName}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-80"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {upload.status === "uploading" && (
                <Upload className="w-4 h-4 text-blue-500 animate-pulse" />
              )}
              {upload.status === "success" && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {upload.status === "error" && (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              {upload.status === "pending" && (
                <Clock className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-white truncate max-w-48">
                {upload.fileName}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {upload.status === "uploading" && onCancel && (
                <button
                  onClick={() => onCancel(upload.fileName)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  title="Cancel upload"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              {upload.status === "error" && onRetry && (
                <button
                  onClick={() => onRetry(upload.fileName)}
                  className="text-blue-500 hover:text-blue-600 p-1"
                  title="Retry upload"
                >
                  <Upload className="w-4 h-4" />
                </button>
              )}
              {(upload.status === "success" || upload.status === "error") &&
                onDismiss && (
                  <button
                    onClick={() => onDismiss(upload.fileName)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    title="Dismiss"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
            </div>
          </div>

          {/* Progress Bar */}
          {upload.status === "uploading" && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${upload.percentage}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>

              {/* Progress Details */}
              <div className="flex justify-between text-xs text-white">
                <span>{upload.percentage.toFixed(1)}%</span>
                <span>
                  {formatBytes(upload.loaded)} / {formatBytes(upload.total)}
                </span>
              </div>

              {/* Speed and Time Remaining */}
              {(upload.speed || upload.timeRemaining) && (
                <div className="flex justify-between text-xs text-white">
                  {upload.speed && (
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{formatSpeed(upload.speed)}</span>
                    </div>
                  )}
                  {upload.timeRemaining && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(upload.timeRemaining)} left</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {upload.status === "success" && (
            <div className="text-sm text-green-300">
              Upload completed successfully
            </div>
          )}

          {/* Error Message */}
          {upload.status === "error" && (
            <div className="text-sm text-red-300">
              {upload.error || "Upload failed"}
            </div>
          )}

          {/* Pending Message */}
          {upload.status === "pending" && (
            <div className="text-sm text-white">Waiting to upload...</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Custom hook for managing upload progress
export const useUploadProgress = () => {
  const [uploads, setUploads] = React.useState<UploadProgressData[]>([]);

  const addUpload = (fileName: string, total: number) => {
    const newUpload: UploadProgressData = {
      fileName,
      total,
      loaded: 0,
      percentage: 0,
      status: "pending",
    };
    setUploads((prev) => [...prev, newUpload]);
  };

  const updateProgress = (fileName: string, loaded: number, speed?: number) => {
    setUploads((prev) =>
      prev.map((upload) => {
        if (upload.fileName === fileName) {
          const percentage = (loaded / upload.total) * 100;
          const timeRemaining =
            speed && speed > 0 ? (upload.total - loaded) / speed : undefined;

          return {
            ...upload,
            loaded,
            percentage,
            speed,
            timeRemaining,
            status: "uploading" as const,
          };
        }
        return upload;
      })
    );
  };

  const setUploadSuccess = (fileName: string) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.fileName === fileName
          ? { ...upload, status: "success" as const, percentage: 100 }
          : upload
      )
    );
  };

  const setUploadError = (fileName: string, error: string) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.fileName === fileName
          ? { ...upload, status: "error" as const, error }
          : upload
      )
    );
  };

  const removeUpload = (fileName: string) => {
    setUploads((prev) => prev.filter((upload) => upload.fileName !== fileName));
  };

  const clearCompleted = () => {
    setUploads((prev) =>
      prev.filter(
        (upload) => upload.status !== "success" && upload.status !== "error"
      )
    );
  };

  return {
    uploads,
    addUpload,
    updateProgress,
    setUploadSuccess,
    setUploadError,
    removeUpload,
    clearCompleted,
  };
};

export default UploadProgress;
