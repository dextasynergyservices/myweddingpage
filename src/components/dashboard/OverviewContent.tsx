import { motion } from "framer-motion";
import { StatItem, QuickAction, Wedding } from "@/types/dashboard";
import { Plus, Edit2, AccessibilityIcon, RotateCcw } from "lucide-react";
import WeddingCard from "@/components/dashboard/WeddingCard";
import NoWeddings from "@/components/dashboard/NoWeddings";
import Button from "@/components/ui/Button";
import { useEffect, useState, useCallback } from "react";
import RenewalModal from "@/components/dashboard/RenewalModal";
import ContactUpgradeModal from "@/components/dashboard/ContactUpgradeModal";
import TwoFactorPrompt from "@/components/TwoFactorPrompt";
import toast from "react-hot-toast";
import PWAStatus from "@/components/pwa/PWAStatus";
import { NotificationPermission } from "@/components/pwa";

interface UserData {
  id?: string;
  planId?: string;
  groomName?: string;
  brideName?: string;
  plan?: {
    name?: string;
  };
  subscription_end?: string;
  email?: string;
  // Grace period fields
  gracePeriodStart?: string;
  gracePeriodEnd?: string;
  isInGracePeriod?: boolean;
}

interface OverviewContentProps {
  isDarkMode: boolean;
  user?: UserData;
  stats: StatItem[];
  quickActions: QuickAction[];
  userWeddings: Wedding[];
  handleCreateWedding: () => void;
  handleViewWedding: (weddingId: string) => void;
  setActiveTab?: (tab: string) => void;
  tasksTotal?: number;
  tasksCompleted?: number;
  weddingPageDeleted?: boolean;
}

interface RemoteInfo {
  weddingPage?: { slug?: string; is_live?: boolean; deleted_at?: string | null };
  userTemplate?: unknown;
}

const OverviewContent = ({
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
}: OverviewContentProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isRenewalOpen, setRenewalOpen] = useState(false);
  const [isContactUpgradeOpen, setContactUpgradeOpen] = useState(false);
  const [remoteInfo, setRemoteInfo] = useState<RemoteInfo | null>(null);
  const [loadingRemoteInfo, setLoadingRemoteInfo] = useState(true);
  const [tasksByWedding] = useState<Record<string, { total: number; completed: number }>>({});
  const [polledViews, setPolledViews] = useState<number | null>(null);

  // ✅ Make fetchUserData reusable
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    // fetch wedding/template status for conditional buttons
    const fetchRemote = async () => {
      setLoadingRemoteInfo(true);
      try {
        const response = await fetch("/api/wedding-views", { credentials: "same-origin" });
        if (!response.ok) {
          setRemoteInfo(null);
          return;
        }
        const data = await response.json();
        setRemoteInfo(data);
      } catch (err) {
        console.error("Failed to fetch wedding/template info:", err);
        setRemoteInfo(null);
      } finally {
        setLoadingRemoteInfo(false);
      }
    };

    fetchRemote();
  }, [fetchUserData]);

  // Poll `/api/wedding-views` every 30s so the dashboard shows up-to-date values
  useEffect(() => {
    let mounted = true;

    const fetchPolledViews = async () => {
      try {
        const res = await fetch("/api/wedding-views", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && typeof data?.views === "number") setPolledViews(data.views);
      } catch (err) {
        console.error("Failed to fetch polled wedding views:", err);
      }
    };

    fetchPolledViews();
    const id = setInterval(fetchPolledViews, 30 * 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // 🔹 Paystack verification effect (updated to handle early undefined user)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    const trxref = params.get("trxref");
    const planIdParam = params.get("planId");
    const optionIdParam = params.get("optionId");

    const currentUserId = userData?.id || user?.id;

    if (reference && planIdParam && optionIdParam && currentUserId) {
      fetch("/api/paystack/verify-renewal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          trxref,
          planId: planIdParam,
          optionId: optionIdParam,
          userId: currentUserId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            toast.success("Subscription renewed successfully ✅");
            fetchUserData(); // ✅ Update immediately
          } else {
            toast.error(data.error || "Payment verification failed.");
          }
        })
        .catch(() => {
          toast.error("Something went wrong while verifying payment.");
        })
        .finally(() => {
          const url = new URL(window.location.href);
          ["reference", "trxref", "planId", "optionId", "renewal"].forEach((key) =>
            url.searchParams.delete(key)
          );
          window.history.replaceState({}, "", url.toString());
        });
    }
  }, [user?.id, userData?.id, fetchUserData]);

  const displayUser = userData || user;

  // Enhanced subscription status calculation with grace period support
  const getSubscriptionStatus = () => {
    if (!displayUser?.subscription_end) {
      return {
        remainingDays: 0,
        status: "no-plan",
        message: "No active plan",
        isExpired: false,
        graceDaysLeft: 0,
      };
    }

    const now = new Date();
    const subscriptionEnd = new Date(displayUser.subscription_end);
    const remainingDays = Math.ceil(
      (subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if wedding page is soft deleted first
    if (weddingPageDeleted) {
      return {
        remainingDays: 0,
        status: "deletion-pending",
        message: "EXPIRED",
        isExpired: true,
        graceDaysLeft: 0,
      };
    }

    // Plan is still active
    if (remainingDays > 0) {
      return {
        remainingDays,
        status: "active",
        message: `${remainingDays} days`,
        isExpired: false,
        graceDaysLeft: 0,
      };
    }

    // Plan has expired - check grace period
    if (displayUser.isInGracePeriod && displayUser.gracePeriodEnd) {
      const gracePeriodEnd = new Date(displayUser.gracePeriodEnd);
      const graceDaysLeft = Math.max(
        0,
        Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      if (graceDaysLeft > 0) {
        return {
          remainingDays: 0,
          status: "grace-period",
          message: "EXPIRED",
          isExpired: true,
          graceDaysLeft,
        };
      } else {
        // Grace period has ended - wedding page should be soft deleted
        return {
          remainingDays: 0,
          status: "deletion-pending",
          message: "EXPIRED",
          isExpired: true,
          graceDaysLeft: 0,
        };
      }
    }

    // Just expired, grace period not started yet
    return {
      remainingDays: 0,
      status: "just-expired",
      message: "EXPIRED",
      isExpired: true,
      graceDaysLeft: 3,
    };
  };

  const subscriptionStatus = getSubscriptionStatus();
  const { remainingDays, status, message, isExpired, graceDaysLeft } = subscriptionStatus;

  // Helper function to get deletion message
  const getDeletionMessage = () => {
    if (remoteInfo?.weddingPage?.deleted_at) {
      const deletedAt = new Date(remoteInfo.weddingPage.deleted_at);
      const now = new Date();
      const daysSinceDeleted = Math.floor(
        (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const remainingDays = Math.max(0, 30 - daysSinceDeleted);

      if (remainingDays > 0) {
        return `Your wedding page has been soft-deleted. You can still restore it by renewing your subscription within ${remainingDays} day${remainingDays !== 1 ? "s" : ""}. The Page Builder is now disabled.`;
      } else {
        return "Your wedding page has been permanently deleted. The 30-day recovery period has expired.";
      }
    }
    return "Your wedding page has been soft-deleted. You can still restore it by renewing your subscription within 30 days. The Page Builder is now disabled.";
  };

  // Helper function to get restore button
  const getRestoreButton = () => {
    if (remoteInfo?.weddingPage?.deleted_at) {
      const deletedAt = new Date(remoteInfo.weddingPage.deleted_at);
      const now = new Date();
      const daysSinceDeleted = Math.floor(
        (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const remainingDays = Math.max(0, 30 - daysSinceDeleted);

      if (remainingDays > 0) {
        return (
          <button
            onClick={() => setRenewalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            Restore Page
          </button>
        );
      }
      return null;
    }
    return (
      <button
        onClick={() => setRenewalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
      >
        Restore Page
      </button>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div
        className={`rounded-3xl p-6 md:p-8 ${
          isDarkMode
            ? "bg-gradient-to-r from-slate-800 to-slate-700"
            : "bg-gradient-to-r from-indigo-50 to-purple-50"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1
              className={`text-2xl md:text-3xl font-light mb-2 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Welcome back, {displayUser?.groomName || "User"} &{" "}
              {displayUser?.brideName || "Partner"}
            </h1>
            <p
              className={`text-base md:text-md ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
            >
              Your wedding plan is:{" "}
              <span className="font-bold text-lg">{displayUser?.plan?.name || "No plan"}</span>
              {status === "active" && (
                <>
                  , valid for{" "}
                  <span className={`font-bold text-lg ${remainingDays <= 7 ? "text-red-500" : ""}`}>
                    {message}
                  </span>
                </>
              )}
              {(status === "grace-period" || status === "just-expired") && (
                <>
                  {" - "}
                  <span className="font-bold text-lg text-red-600">{message}</span>
                  {graceDaysLeft > 0 && (
                    <span className="text-red-500 text-sm ml-2">
                      Renew within {graceDaysLeft} day{graceDaysLeft !== 1 ? "s" : ""} to avoid
                      deletion
                    </span>
                  )}
                </>
              )}
              {status === "deletion-pending" && (
                <>
                  {" - "}
                  <span className="font-bold text-lg text-red-700">{message}</span>
                  <span className="text-red-700 text-sm ml-2">
                    Wedding page scheduled for deletion
                  </span>
                </>
              )}
            </p>
            {(remainingDays <= 7 || isExpired) && status !== "deletion-pending" && (
              <button
                onClick={() => setRenewalOpen(true)}
                className={`ml-2 underline text-sm font-medium cursor-pointer ${
                  isExpired ? "text-red-600 font-bold" : "text-red-500"
                }`}
              >
                {isExpired ? "URGENT: Renew Now" : "Renew Plan"}
              </button>
            )}
            <RenewalModal
              isOpen={isRenewalOpen}
              onClose={() => setRenewalOpen(false)}
              planId={displayUser?.planId ?? ""}
              userId={displayUser?.id ?? ""}
              groomName={displayUser?.groomName}
              brideName={displayUser?.brideName}
              email={displayUser?.email}
            />
          </div>
          <div className="p-3 md:p-4">
            <Button type="button" onClick={() => setContactUpgradeOpen(true)}>
              Update Plan
            </Button>
            <ContactUpgradeModal
              isOpen={isContactUpgradeOpen}
              onClose={() => setContactUpgradeOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Grace Period Alert Banner */}
      {(status === "grace-period" || status === "just-expired") && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 md:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-red-800 font-semibold text-lg">
                  ⚠️ Plan Expired - Grace Period Active
                </h3>
                <p className="text-red-700 text-sm">
                  {graceDaysLeft > 0 ? (
                    <>
                      You have{" "}
                      <strong>
                        {graceDaysLeft} day{graceDaysLeft !== 1 ? "s" : ""}
                      </strong>{" "}
                      to renew before your wedding page is permanently deleted.
                    </>
                  ) : (
                    <>Your grace period has ended. Wedding page deletion is imminent.</>
                  )}
                </p>
              </div>
            </div>
            {graceDaysLeft > 0 && (
              <button
                onClick={() => setRenewalOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Renew Now
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Deletion Pending Alert Banner */}
      {status === "deletion-pending" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-4 md:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div>
                <h3 className="text-gray-100 font-semibold text-lg">🔒 Wedding Page Deleted</h3>
                <p className="text-gray-300 text-sm">{getDeletionMessage()}</p>
              </div>
            </div>
            {getRestoreButton()}
          </div>
        </motion.div>
      )}

      {/* Two-Factor Authentication Prompt */}
      <TwoFactorPrompt onEnableClick={() => setActiveTab?.("security")} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border ${
              isDarkMode ? "border-slate-700" : "border-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs md:text-sm font-medium ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-xl md:text-3xl font-light mt-1 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm font-medium mt-1 text-emerald-600">
                  {stat.change} this month
                </p>
              </div>
              <div
                className={`p-2 md:p-3 bg-gradient-to-r ${stat.color} rounded-xl md:rounded-2xl`}
              >
                <stat.icon className="h-5 md:h-6 w-5 md:w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* PWA Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* PWA Status Widget */}
        <PWAStatus showInstallButton={true} showNotificationToggle={true} compact={false} />

        {/* Notification Settings */}
        <NotificationPermission showTestButton={true} />
      </div>

      {/* Quick Actions */}
      <div
        className={`${
          isDarkMode ? "bg-slate-800" : "bg-white"
        } rounded-3xl p-6 md:p-8 shadow-lg border ${
          isDarkMode ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <h2
          className={`text-xl md:text-2xl font-light mb-4 md:mb-6 ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              onClick={action.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col items-center gap-3 md:gap-4 p-4 md:p-6 bg-gradient-to-r ${action.color} text-white rounded-xl md:rounded-2xl hover:shadow-lg transition-all duration-300`}
            >
              <action.icon className="h-6 md:h-8 w-6 md:w-8" />
              <div className="text-center">
                <h3 className="font-semibold text-sm md:text-lg">{action.title}</h3>
                <p className="text-white/80 text-xs md:text-sm">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* My Weddings */}
      <div
        className={`${
          isDarkMode ? "bg-slate-800" : "bg-white"
        } rounded-3xl p-6 md:p-8 shadow-lg border ${
          isDarkMode ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2
            className={`text-xl md:text-2xl font-light ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            My Wedding Page
          </h2>
          {/* Change Create New behavior depending on whether the user has a weddingPage or selected template */}
          {loadingRemoteInfo ? (
            <button className="bg-slate-300 text-slate-700 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium">
              Loading...
            </button>
          ) : remoteInfo?.weddingPage ? (
            <button
              onClick={() => {
                // Check if page is soft-deleted
                if (remoteInfo.weddingPage?.deleted_at) {
                  setRenewalOpen(true);
                  return;
                }
                if (setActiveTab) setActiveTab("page-builder");
              }}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 ${
                remoteInfo.weddingPage?.deleted_at
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              }`}
            >
              {remoteInfo.weddingPage?.deleted_at ? (
                <RotateCcw className="h-3 md:h-4 w-3 md:w-4" />
              ) : (
                <Edit2 className="h-3 md:h-4 w-3 md:w-4" />
              )}
              <span className="text-sm md:text-base">
                {remoteInfo.weddingPage?.deleted_at ? "Restore Page" : "Edit Wedding page"}
              </span>
            </button>
          ) : remoteInfo?.userTemplate ? (
            <button
              onClick={() => setActiveTab && setActiveTab("page-builder")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <AccessibilityIcon className="h-3 md:h-4 w-3 md:w-4" />
              <span className="text-sm md:text-base">Customize Template</span>
            </button>
          ) : (
            <button
              onClick={handleCreateWedding}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="h-3 md:h-4 w-3 md:w-4" />
              <span className="text-sm md:text-base">Create New</span>
            </button>
          )}
        </div>

        {userWeddings.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {userWeddings.map((wedding) => {
              const perWedding = tasksByWedding[wedding.id] ?? {
                total: typeof tasksTotal === "number" ? tasksTotal : 0,
                completed: typeof tasksCompleted === "number" ? tasksCompleted : 0,
              };

              // If we have a polled live value for views, prefer it for display
              const displayWedding = {
                ...wedding,
                views: typeof polledViews === "number" ? polledViews : wedding.views,
              } as Wedding;

              return (
                <WeddingCard
                  key={wedding.id}
                  wedding={displayWedding}
                  isDarkMode={isDarkMode}
                  handleViewWedding={handleViewWedding}
                  setActiveTab={(tab: string) => setActiveTab && setActiveTab(tab)}
                  // pass published/template info when available from the /api/wedding-data response
                  hasTemplate={!!remoteInfo?.userTemplate}
                  hasWeddingPage={!!remoteInfo?.weddingPage}
                  liveSlug={remoteInfo?.weddingPage?.slug ?? null}
                  isLive={remoteInfo?.weddingPage?.is_live ?? false}
                  tasksTotal={perWedding.total}
                  tasksCompleted={perWedding.completed}
                  isDeleted={!!remoteInfo?.weddingPage?.deleted_at}
                />
              );
            })}
          </div>
        ) : (
          <NoWeddings isDarkMode={isDarkMode} handleCreateWedding={handleCreateWedding} />
        )}
      </div>
    </div>
  );
};

export default OverviewContent;
