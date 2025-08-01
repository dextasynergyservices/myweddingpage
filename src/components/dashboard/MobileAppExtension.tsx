"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Download,
  // Bell,
  FolderSync as Sync,
  Wifi,
  WifiOff,
  // Settings,
  QrCode,
  Share2,
  // Eye,
  Users,
  Calendar,
  Camera,
  MessageSquare,
  CheckCircle,
  // Clock,
  // BarChart3,
  // Zap,
  // Shield,
  Globe,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
interface MobileFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  usage: number;
}

interface NotificationSetting {
  id: string;
  type: string;
  label: string;
  description: string;
  enabled: boolean;
}

const MobileAppExtension = () => {
  const { isDarkMode } = useTheme();
  const [isOnline] = useState(true);
  const [lastSync, setLastSync] = useState("2 minutes ago");
  const [appInstalled, setAppInstalled] = useState(false);

  const [mobileFeatures, setMobileFeatures] = useState<MobileFeature[]>([
    {
      id: "1",
      name: "Guest Check-in",
      description: "Allow guests to check in using their mobile devices",
      icon: Users,
      enabled: true,
      usage: 85,
    },
    {
      id: "2",
      name: "Live Photo Sharing",
      description: "Guests can instantly share photos from the wedding",
      icon: Camera,
      enabled: true,
      usage: 92,
    },
    {
      id: "3",
      name: "Real-time Messages",
      description: "Live guestbook messages and well wishes",
      icon: MessageSquare,
      enabled: true,
      usage: 78,
    },
    {
      id: "4",
      name: "Event Timeline",
      description: "Keep guests informed about the schedule",
      icon: Calendar,
      enabled: true,
      usage: 67,
    },
    {
      id: "5",
      name: "Offline Mode",
      description: "Access key features without internet connection",
      icon: WifiOff,
      enabled: true,
      usage: 45,
    },
  ]);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "1",
      type: "rsvp",
      label: "RSVP Updates",
      description: "Get notified when guests respond to invitations",
      enabled: true,
    },
    {
      id: "2",
      type: "photos",
      label: "New Photos",
      description: "Alert when guests upload new photos",
      enabled: true,
    },
    {
      id: "3",
      type: "messages",
      label: "Guest Messages",
      description: "Notification for new guestbook messages",
      enabled: true,
    },
    {
      id: "4",
      type: "timeline",
      label: "Timeline Reminders",
      description: "Reminders for upcoming wedding events",
      enabled: false,
    },
  ]);

  const toggleFeature = (id: string) => {
    setMobileFeatures((features) =>
      features.map((feature) =>
        feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
      )
    );
  };

  const toggleNotification = (id: string) => {
    setNotifications((notifications) =>
      notifications.map((notification) =>
        notification.id === id ? { ...notification, enabled: !notification.enabled } : notification
      )
    );
  };

  const syncData = async () => {
    setLastSync("Syncing...");
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastSync("Just now");
  };

  const generateQRCode = () => {
    // Generate QR code for app download
    alert("QR code generated for app download!");
  };

  const installApp = () => {
    setAppInstalled(true);
    // Simulate app installation
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">

        <div>
          <h1
            className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Mobile App Extension
          </h1>
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Manage your mobile wedding app and guest experience
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateQRCode}
            className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-2xl hover:bg-slate-700 transition-all duration-300"
          >
            <QrCode className="h-5 w-5" />
            QR Code
          </button>
          {!appInstalled ? (
            <button
              onClick={installApp}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300"
            >
              <Download className="h-5 w-5" />
              Install App
            </button>
          ) : (
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl">
              <CheckCircle className="h-5 w-5" />
              App Installed
            </button>
          )}
        </div>
      </div>

      {/* App Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "App Status",
            value: appInstalled ? "Installed" : "Not Installed",
            icon: Smartphone,
            color: appInstalled ? "from-emerald-500 to-teal-600" : "from-slate-500 to-slate-600",
          },
          {
            title: "Connection",
            value: isOnline ? "Online" : "Offline",
            icon: isOnline ? Wifi : WifiOff,
            color: isOnline ? "from-blue-500 to-indigo-600" : "from-red-500 to-pink-600",
          },
          {
            title: "Last Sync",
            value: lastSync,
            icon: Sync,
            color: "from-purple-500 to-pink-600",
          },
          {
            title: "Active Users",
            value: "23",
            icon: Users,
            color: "from-amber-500 to-orange-600",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-3xl p-6 shadow-lg border ${
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-2xl font-light mt-1 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Features */}
      <div
        className={`rounded-3xl p-8 shadow-lg border ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Mobile Features
          </h2>
          <button
            onClick={syncData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Sync className="h-4 w-4" />
            Sync Now
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mobileFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                feature.enabled
                  ? isDarkMode
                    ? "bg-slate-700 border-slate-600"
                    : "bg-white border-slate-200"
                  : isDarkMode
                    ? "bg-slate-700/50 border-slate-600 opacity-60"
                    : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      feature.enabled
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                        : "bg-slate-400"
                    }`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {feature.name}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFeature(feature.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    feature.enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      feature.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {feature.enabled && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      Usage
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {feature.usage}%
                    </span>
                  </div>
                  <div
                    className={`w-full h-2 rounded-full ${
                      isDarkMode ? "bg-slate-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${feature.usage}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          className={`rounded-3xl p-6 shadow-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Push Notifications
          </h2>

          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {notification.label}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {notification.description}
                  </p>
                </div>
                <button
                  onClick={() => toggleNotification(notification.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notification.enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notification.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* App Analytics */}
        <div
          className={`rounded-3xl p-6 shadow-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            App Analytics
          </h2>

          <div className="space-y-6">
            {[
              { label: "Daily Active Users", value: "23", change: "+12%", icon: Users },
              { label: "Photos Shared", value: "156", change: "+45%", icon: Camera },
              { label: "Messages Sent", value: "89", change: "+23%", icon: MessageSquare },
              { label: "Check-ins", value: "67", change: "+8%", icon: CheckCircle },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {metric.label}
                    </p>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {metric.value} ({metric.change})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* App Download & Sharing */}
      <div
        className={`rounded-3xl p-6 shadow-lg border ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Share Your Wedding App
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-2xl border text-center ${
              isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"
            }`}
          >
            <QrCode
              className={`h-16 w-16 mx-auto mb-4 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              QR Code
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Let guests scan to download
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
              Generate QR
            </button>
          </div>

          <div
            className={`p-6 rounded-2xl border text-center ${
              isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"
            }`}
          >
            <Share2
              className={`h-16 w-16 mx-auto mb-4 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Share Link
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Send direct download link
            </p>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
              Copy Link
            </button>
          </div>

          <div
            className={`p-6 rounded-2xl border text-center ${
              isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"
            }`}
          >
            <Globe
              className={`h-16 w-16 mx-auto mb-4 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Web App
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Access via web browser
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
              Open Web App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppExtension;
