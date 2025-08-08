import { motion } from "framer-motion";
import { StatItem, QuickAction, Wedding } from "@/types/dashboard";
import { Plus } from "lucide-react";
import WeddingCard from "@/components/dashboard/WeddingCard";
import NoWeddings from "@/components/dashboard/NoWeddings";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserData {
  groomName?: string;
  brideName?: string;
  plan?: {
    name?: string;
  };
  subscription_end?: string;
  // Add other user properties as needed
}

interface OverviewContentProps {
  isDarkMode: boolean;
  user?: UserData;
  stats: StatItem[];
  quickActions: QuickAction[];
  userWeddings: Wedding[];
  handleCreateWedding: () => void;
  handleViewWedding: (weddingId: string) => void;
}

const OverviewContent = ({
  isDarkMode,
  user,
  stats,
  quickActions,
  userWeddings,
  handleCreateWedding,
  handleViewWedding,
}: OverviewContentProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Use the fetched userData if available, otherwise fall back to the user prop
  const displayUser = userData || user;

  // Calculate remaining days
  const remainingDays = displayUser?.subscription_end
    ? Math.max(
        0,
        Math.ceil(
          (new Date(displayUser.subscription_end).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section - Now using the fetched userData */}
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
              <span className="font-bold text-lg">{displayUser?.plan?.name || "No plan"}</span>,
              valid for{" "}
              <span className={`font-bold text-lg ${remainingDays <= 7 ? "text-red-500" : ""}`}>
                {remainingDays} days
              </span>
              {remainingDays <= 7 && (
                <Link href="/pricing" className="ml-2 text-red-500 underline text-sm font-medium">
                  Renew Plan
                </Link>
              )}
            </p>
          </div>
          <div className="p-3 md:p-4">
            <Button type="submit">Update Plan</Button>
          </div>
        </div>
      </div>

      {/* Rest of your existing code remains exactly the same */}
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
            My Wedding Pages
          </h2>
          <button
            onClick={handleCreateWedding}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="h-3 md:h-4 w-3 md:w-4" />
            <span className="text-sm md:text-base">Create New</span>
          </button>
        </div>

        {userWeddings.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {userWeddings.map((wedding) => (
              <WeddingCard
                key={wedding.id}
                wedding={wedding}
                isDarkMode={isDarkMode}
                handleViewWedding={handleViewWedding}
                setActiveTab={() => {}}
              />
            ))}
          </div>
        ) : (
          <NoWeddings isDarkMode={isDarkMode} handleCreateWedding={handleCreateWedding} />
        )}
      </div>
    </div>
  );
};

export default OverviewContent;
