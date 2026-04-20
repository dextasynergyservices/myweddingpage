import { motion, AnimatePresence } from "framer-motion";
import { Wedding, StatItem, QuickAction } from "@/types/dashboard";
import WeddingPageBuilder from "@/components/dashboard/WeddingPageBuilder";
import PageBuilder from "@/components/dashboard/PageBuilder";
import Gallery from "@/components/dashboard/Gallery";
import GuestManagement from "@/components/dashboard/GuestManagement";
import LiveStreaming from "@/components/dashboard/LiveStreaming";
import GiftRegistration from "@/components/dashboard/GiftRegistration";
import InteractiveChecklist from "@/components/dashboard/InteractiveChecklist";
import OverviewContent from "@/components/dashboard/OverviewContent";
import TwoFactorSettings from "@/components/TwoFactorSettings";

interface User {
  id: string;
  groomName?: string;
  brideName?: string;
  email: string;
  plan?: {
    name?: string;
    duration_days?: number;
  };
  subscription_start?: string;
  subscription_end?: string;
  // Add other user properties as needed
}

interface DashboardContentProps {
  activeTab: string;
  isDarkMode: boolean;
  user?: User | null;
  stats: StatItem[];
  quickActions: QuickAction[];
  userWeddings: Wedding[];
  handleCreateWedding: () => void;
  handleViewWedding: (weddingId: string) => void;
  setActiveTab: (tab: string) => void;
  tasksTotal?: number;
  tasksCompleted?: number;
  weddingPageDeleted?: boolean;
}

const DashboardContent = ({
  activeTab,
  isDarkMode,
  user,
  stats,
  quickActions,
  userWeddings,
  handleCreateWedding,
  handleViewWedding,
  setActiveTab,
  tasksTotal,
  tasksCompleted,
  weddingPageDeleted = false,
}: DashboardContentProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case "builder":
        return <WeddingPageBuilder />;
      case "page-builder":
        return <PageBuilder setActiveTab={setActiveTab} />;
      case "gallery":
        return <Gallery />;
      case "guests":
        return <GuestManagement />;
      case "streaming":
        return <LiveStreaming />;
      case "gift":
        return <GiftRegistration />;
      case "gift:comments":
        return <GiftRegistration initialSubTab="comments" />;
      case "checklist":
        return <InteractiveChecklist />;
      case "security":
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h1
                    className={`text-3xl font-bold ${
                      isDarkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    Security Settings
                  </h1>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Manage your account security and authentication methods
                  </p>
                </div>
              </div>
            </div>

            {/* Security Features Overview */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {/* Password Protection */}
              <div
                className={`rounded-lg border p-5 ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
                    Password Protection
                  </h3>
                </div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Your account is secured with a strong password. You can change
                  it anytime in your profile settings.
                </p>
              </div>

              {/* Session Management */}
              <div
                className={`rounded-lg border p-5 ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
                    Active Sessions
                  </h3>
                </div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  You can view and manage your active sessions. Sessions expire
                  automatically after 30 days of inactivity.
                </p>
              </div>
            </div>

            {/* Two-Factor Authentication Section */}
            <div
              className={`rounded-xl border shadow-sm ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`border-b p-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <h2
                  className={`text-xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                >
                  Two-Factor Authentication (2FA)
                </h2>
                <p
                  className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Add an extra layer of security to your account by requiring a
                  verification code in addition to your password.
                </p>
              </div>

              <div className="p-6">
                <TwoFactorSettings />
              </div>
            </div>

            {/* Security Tips */}
            <div
              className={`rounded-lg border p-5 ${
                isDarkMode
                  ? "border-yellow-800 bg-yellow-950"
                  : "border-yellow-200 bg-yellow-50"
              }`}
            >
              <h3
                className={`mb-3 font-semibold ${
                  isDarkMode ? "text-yellow-200" : "text-yellow-900"
                }`}
              >
                🔒 Security Tips
              </h3>
              <ul
                className={`space-y-2 text-sm ${
                  isDarkMode ? "text-yellow-300" : "text-yellow-800"
                }`}
              >
                <li className="flex gap-2">
                  <span className="font-medium">•</span>
                  <span>
                    Never share your password or 2FA codes with anyone
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">•</span>
                  <span>
                    Use a unique password that you don&apos;t use on other
                    websites
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">•</span>
                  <span>Save your backup codes in a secure location</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">•</span>
                  <span>Enable 2FA for maximum account protection</span>
                </li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <OverviewContent
            isDarkMode={isDarkMode}
            user={user || undefined}
            stats={stats}
            quickActions={quickActions}
            userWeddings={userWeddings}
            handleCreateWedding={handleCreateWedding}
            handleViewWedding={handleViewWedding}
            setActiveTab={setActiveTab}
            // pass task totals for card progress
            tasksTotal={tasksTotal}
            tasksCompleted={tasksCompleted}
            weddingPageDeleted={weddingPageDeleted}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardContent;
