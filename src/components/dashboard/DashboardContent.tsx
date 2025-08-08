import { motion, AnimatePresence } from "framer-motion";
import { Wedding, StatItem, QuickAction } from "@/types/dashboard";
import WeddingPageBuilder from "@/components/dashboard/WeddingPageBuilder";
import Gallery from "@/components/dashboard/Gallery";
import GuestManagement from "@/components/dashboard/GuestManagement";
import LiveStreaming from "@/components/dashboard/LiveStreaming";
import GiftRegistration from "@/components/dashboard/GiftRegistration";
import InteractiveChecklist from "@/components/dashboard/InteractiveChecklist";
import OverviewContent from "@/components/dashboard/OverviewContent";

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
}: DashboardContentProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case "builder":
        return <WeddingPageBuilder />;
      case "gallery":
        return <Gallery />;
      case "guests":
        return <GuestManagement />;
      case "streaming":
        return <LiveStreaming />;
      case "gift":
        return <GiftRegistration />;
      case "checklist":
        return <InteractiveChecklist />;
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
