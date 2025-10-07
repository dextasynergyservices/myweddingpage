/**
 * 2FA Settings Component
 *
 * Allows users to:
 * - Enable 2FA with QR code
 * - Disable 2FA with password confirmation
 * - View and download backup codes
 * - Regenerate backup codes
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Download, RefreshCw, Key, Smartphone, AlertTriangle, Mail } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface TwoFactorSettingsProps {
  isDarkMode?: boolean;
}

export default function TwoFactorSettings({ isDarkMode = false }: TwoFactorSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState<"disable" | "regenerate" | null>(null);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"totp" | "email">("totp");
  const [isChangingMethod, setIsChangingMethod] = useState(false);
  const [showMethodSelector, setShowMethodSelector] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/auth/2fa/status");
      const data = await res.json();

      if (res.ok) {
        setIsEnabled(data.enabled);
        setRemainingBackupCodes(data.remainingBackupCodes);
        setTwoFactorMethod(data.method || "totp");
      }
    } catch (error) {
      console.error("Failed to check 2FA status:", error);
    }
  };

  const handleEnable2FA = async () => {
    // Show method selector first
    setShowMethodSelector(true);
  };

  const proceedWithSetup = async (method: "totp" | "email") => {
    setIsLoading(true);
    setShowMethodSelector(false);

    try {
      if (method === "totp") {
        // Setup TOTP with QR code
        const res = await fetch("/api/auth/2fa/setup", {
          method: "POST",
        });

        const data = await res.json();

        if (res.ok) {
          setQrCodeUrl(data.qrCode);
          setBackupCodes(data.backupCodes);
          setShowSetup(true);
          setIsEnabled(true);
          setTwoFactorMethod("totp");
          setRemainingBackupCodes(data.backupCodes.length);
          toast.success("2FA enabled successfully!");
        } else {
          toast.error(data.error || "Failed to enable 2FA");
        }
      } else {
        // Setup Email 2FA
        const res = await fetch("/api/auth/2fa/setup", {
          method: "POST",
        });

        const data = await res.json();

        if (res.ok) {
          setBackupCodes(data.backupCodes);
          setIsEnabled(true);
          setTwoFactorMethod("email");
          setRemainingBackupCodes(data.backupCodes.length);

          // Set method to email
          await fetch("/api/auth/2fa/set-method", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method: "email" }),
          });

          setShowSetup(true);
          toast.success("Email 2FA enabled successfully!");
        } else {
          toast.error(data.error || "Failed to enable 2FA");
        }
      }
    } catch (error) {
      console.error("Failed to enable 2FA:", error);
      toast.error("Failed to enable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsEnabled(false);
        setShowPasswordModal(null);
        setPassword("");
        toast.success("2FA disabled successfully");
        await checkStatus();
      } else {
        toast.error(data.error || "Failed to disable 2FA");
      }
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      toast.error("Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setBackupCodes(data.backupCodes);
        setShowSetup(true);
        setShowPasswordModal(null);
        setPassword("");
        toast.success("Backup codes regenerated!");
        await checkStatus();
      } else {
        toast.error(data.error || "Failed to regenerate backup codes");
      }
    } catch (error) {
      console.error("Failed to regenerate backup codes:", error);
      toast.error("Failed to regenerate backup codes");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const text = `MyWeddingPage - 2FA Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Keep these codes safe and secure!
Each code can only be used once.

${backupCodes.join("\n")}

If you lose access to your authenticator app, you can use these codes to log in.
`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Backup codes downloaded!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleChangeMethod = async (newMethod: "totp" | "email") => {
    if (newMethod === twoFactorMethod) return;

    setIsChangingMethod(true);
    try {
      const res = await fetch("/api/auth/2fa/set-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: newMethod }),
      });

      const data = await res.json();

      if (res.ok) {
        setTwoFactorMethod(newMethod);
        toast.success(
          `2FA method changed to ${newMethod === "totp" ? "Authenticator App" : "Email"}`
        );
      } else {
        toast.error(data.error || "Failed to change 2FA method");
      }
    } catch (error) {
      console.error("Failed to change 2FA method:", error);
      toast.error("Failed to change 2FA method");
    } finally {
      setIsChangingMethod(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isEnabled ? "bg-green-500/20" : "bg-gray-500/20"}`}>
              <Shield className={`h-6 w-6 ${isEnabled ? "text-green-500" : "text-gray-500"}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {isEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>

          {!isEnabled ? (
            <button
              onClick={handleEnable2FA}
              disabled={isLoading}
              className="px-6 py-2 bg-[#ab862b] hover:bg-[#ab862b]/90 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? "Enabling..." : "Enable 2FA"}
            </button>
          ) : (
            <button
              onClick={() => setShowPasswordModal("disable")}
              disabled={isLoading}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              Disable 2FA
            </button>
          )}
        </div>

        {isEnabled && (
          <div
            className={`mt-6 pt-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-gray-500" />
                <span className="text-sm">
                  {remainingBackupCodes} backup code{remainingBackupCodes !== 1 ? "s" : ""}{" "}
                  remaining
                </span>
              </div>
              <button
                onClick={() => setShowPasswordModal("regenerate")}
                className="flex items-center gap-2 text-[#ab862b] hover:text-[#ab862b]/80 text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
            </div>

            {remainingBackupCodes < 3 && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-500">Low backup codes!</p>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    You have {remainingBackupCodes} backup code
                    {remainingBackupCodes !== 1 ? "s" : ""} left. Consider regenerating them.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* 2FA Method Selector - Only show when 2FA is enabled */}
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Verification Method</h3>
          <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Choose how you want to receive your verification codes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TOTP Method */}
            <button
              onClick={() => handleChangeMethod("totp")}
              disabled={isChangingMethod}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                twoFactorMethod === "totp"
                  ? isDarkMode
                    ? "border-[#ab862b] bg-[#ab862b]/10"
                    : "border-[#ab862b] bg-[#ab862b]/5"
                  : isDarkMode
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-200 hover:border-gray-300"
              } disabled:opacity-50`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    twoFactorMethod === "totp"
                      ? "bg-[#ab862b] text-white"
                      : isDarkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                  }`}
                >
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Authenticator App</h4>
                    {twoFactorMethod === "totp" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#ab862b] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Use Google Authenticator, Authy, or similar apps. More secure.
                  </p>
                </div>
              </div>
            </button>

            {/* Email Method */}
            <button
              onClick={() => handleChangeMethod("email")}
              disabled={isChangingMethod}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                twoFactorMethod === "email"
                  ? isDarkMode
                    ? "border-[#ab862b] bg-[#ab862b]/10"
                    : "border-[#ab862b] bg-[#ab862b]/5"
                  : isDarkMode
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-200 hover:border-gray-300"
              } disabled:opacity-50`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    twoFactorMethod === "email"
                      ? "bg-[#ab862b] text-white"
                      : isDarkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                  }`}
                >
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Email Code</h4>
                    {twoFactorMethod === "email" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#ab862b] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Receive verification codes via email. Easier to use.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Info Box */}
          <div
            className={`mt-4 p-4 rounded-lg ${
              isDarkMode
                ? "bg-blue-500/10 border border-blue-500/30"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <p className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}>
              💡 <strong>Tip:</strong> Authenticator apps are more secure because they work offline
              and aren&apos;t vulnerable to email interception. However, email codes are easier if
              you don&apos;t want to install an app.
            </p>
          </div>
        </motion.div>
      )}

      {/* Method Selector Modal - Shows before setup */}
      {showMethodSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="min-h-screen w-full flex items-center justify-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-lg w-full rounded-2xl p-6 md:p-8 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-2xl my-auto`}
            >
              <h2 className="text-2xl font-bold mb-2">Choose Your 2FA Method</h2>
              <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Select how you want to receive verification codes when logging in
              </p>

              <div className="space-y-3">
                {/* TOTP Option */}
                <button
                  onClick={() => {
                    proceedWithSetup("totp");
                  }}
                  disabled={isLoading}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left hover:border-[#ab862b] ${
                    isDarkMode
                      ? "border-gray-700 hover:bg-gray-700/50"
                      : "border-gray-200 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#ab862b]/10">
                      <Smartphone className="h-6 w-6 text-[#ab862b]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">Authenticator App</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">
                          Recommended
                        </span>
                      </div>
                      <p
                        className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Use Google Authenticator, Authy, or similar apps
                      </p>
                      <div className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                        ✅ More secure (offline) <br />
                        ✅ Works without internet <br />✅ Industry standard
                      </div>
                    </div>
                  </div>
                </button>

                {/* Email Option */}
                <button
                  onClick={() => {
                    proceedWithSetup("email");
                  }}
                  disabled={isLoading}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left hover:border-[#ab862b] ${
                    isDarkMode
                      ? "border-gray-700 hover:bg-gray-700/50"
                      : "border-gray-200 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <Mail className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Email Code</h3>
                      <p
                        className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Receive codes via email during login
                      </p>
                      <div className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                        ✅ No app installation needed <br />
                        ✅ Easier for non-tech users <br />
                        ⚠️ Requires email access
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Info Box */}
              <div
                className={`mt-6 p-4 rounded-lg ${
                  isDarkMode
                    ? "bg-blue-500/10 border border-blue-500/30"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <p className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}>
                  💡 <strong>Note:</strong> You can change this method later in your security
                  settings. Backup codes will work with both methods.
                </p>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => setShowMethodSelector(false)}
                disabled={isLoading}
                className={`mt-4 w-full px-6 py-3 rounded-lg font-medium transition-all ${
                  isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                } disabled:opacity-50`}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Setup/Backup Codes Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="min-h-screen w-full flex items-center justify-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-2xl w-full rounded-2xl p-6 md:p-8 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-2xl my-auto max-h-[85vh] overflow-y-auto`}
            >
              <h2 className="text-2xl font-bold mb-6">
                {qrCodeUrl
                  ? "Setup Two-Factor Authentication"
                  : twoFactorMethod === "email"
                    ? "Email 2FA Enabled"
                    : "Your New Backup Codes"}
              </h2>

              {qrCodeUrl && (
                <div className="mb-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 p-3 bg-blue-500/10 rounded-full">
                      <Smartphone className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Open your authenticator app (Google Authenticator, Authy, etc.) and scan
                        this QR code:
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center my-6">
                    <div className="p-4 bg-white rounded-xl">
                      <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
                    </div>
                  </div>
                </div>
              )}

              {/* Email 2FA Confirmation */}
              {!qrCodeUrl && twoFactorMethod === "email" && (
                <div className="mb-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 p-3 bg-green-500/10 rounded-full">
                      <Mail className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Email 2FA Activated</h3>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        You will receive a 6-digit verification code via email each time you log in.
                        The code will be valid for 10 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 p-3 bg-yellow-500/10 rounded-full">
                    <Key className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {qrCodeUrl
                        ? "Step 2: Save Backup Codes"
                        : twoFactorMethod === "email"
                          ? "Save Your Backup Codes"
                          : "Save These Codes"}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Save these backup codes in a secure location. You can use them to log in if
                      you
                      {twoFactorMethod === "email"
                        ? " lose access to your email or if email delivery fails."
                        : " lose access to your authenticator app."}
                    </p>
                  </div>
                </div>

                <div
                  className={`grid grid-cols-2 gap-3 p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-900" : "bg-gray-50"
                  }`}
                >
                  {backupCodes.map((code, index) => (
                    <button
                      key={index}
                      onClick={() => copyToClipboard(code)}
                      className={`p-3 rounded font-mono text-sm text-center transition-all ${
                        isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadBackupCodes}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#ab862b] hover:bg-[#ab862b]/90 text-white rounded-lg font-medium transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download Codes
                </button>
                <button
                  onClick={() => {
                    setShowSetup(false);
                    setQrCodeUrl("");
                    setBackupCodes([]);
                  }}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="min-h-screen w-full flex items-center justify-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full rounded-2xl p-6 md:p-8 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-2xl my-auto`}
            >
              <h2 className="text-2xl font-bold mb-4">
                {showPasswordModal === "disable" ? "Disable 2FA" : "Regenerate Backup Codes"}
              </h2>
              <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Enter your password to continue
              </p>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-[#ab862b] mb-4`}
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={
                    showPasswordModal === "disable" ? handleDisable2FA : handleRegenerateBackupCodes
                  }
                  disabled={isLoading || !password}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 ${
                    showPasswordModal === "disable"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-[#ab862b] hover:bg-[#ab862b]/90 text-white"
                  }`}
                >
                  {isLoading ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(null);
                    setPassword("");
                  }}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
