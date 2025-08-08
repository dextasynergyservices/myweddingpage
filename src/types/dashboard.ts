import { ComponentType } from "react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
}

export interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  allowedPlans: string[];
}

export interface QuickAction {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
  allowedPlans: string[];
}

export interface Wedding {
  id: string;
  title: string;
  date: string;
  status: string;
  views: number;
  messages: number;
  photos: number;
  gifts: number;
  budget: number;
  spent: number;
  guestCount: number;
  rsvpCount: number;
}

export interface DashboardProps {
  onSelectCouple: (coupleId: string) => void;
}

export interface UserPlan {
  planName: string;
  maxPhotos?: number;
  maxVideos?: number;
  maxTabs?: number;
  status?: string;
  subscriptionEnd?: Date | null;
}

export interface WeddingPageBuilderProps {
  maxTabs?: number;
  isDarkMode?: boolean;
  setActiveTab?: (tab: string) => void;
}

export interface GalleryProps {
  maxPhotos?: number;
}

export interface LiveStreamingProps {
  maxVideos?: number;
}

export interface GuestManagementProps {
  // Properties will be added when needed
  [key: string]: unknown;
}

export interface GiftRegistrationProps {
  // Properties will be added when needed
  [key: string]: unknown;
}

export interface InteractiveChecklistProps {
  // Properties will be added when needed
  [key: string]: unknown;
}

export interface User {
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
  [key: string]: unknown;
}

export interface OverviewContentProps {
  isDarkMode: boolean;
  user: User;
  stats: StatItem[];
  quickActions: QuickAction[];
  userWeddings: Wedding[];
  handleCreateWedding: () => void;
  handleViewWedding: (weddingId: string) => void;
  userPlan?: UserPlan | null;
}

export interface DashboardContentProps {
  activeTab: string;
  isDarkMode: boolean;
  user: User;
  stats: StatItem[];
  quickActions: QuickAction[];
  userWeddings: Wedding[];
  handleCreateWedding: () => void;
  handleViewWedding: (weddingId: string) => void;
  setActiveTab: (tab: string) => void;
}
