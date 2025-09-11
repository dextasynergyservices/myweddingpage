// Gift item interface that matches what template components expect
export interface GiftItem {
  id: string;
  item: string; // Display name
  name?: string; // Alternative name field
  description?: string;
  link?: string;
  price: string; // Formatted price string
  image: string;
  purchased: boolean;
}

// User data interface to replace 'any' types throughout the application
export interface UserData {
  id?: string;
  brideName?: string;
  bride_name?: string;
  bride?: string;
  groomName?: string;
  groom_name?: string;
  groom?: string;
  weddingDate?: string;
  wedding_date?: string;
  date?: string;
  venue?: string;
  welcomeMessage?: string;
  gallery?: Array<{
    id: string;
    url: string;
    title?: string;
    category?: string;
  }>;
  gifts?: GiftItem[]; // Use the correct GiftItem interface
  guests?: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    rsvp?: "yes" | "no" | "pending";
  }>;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
  };
  heroImage?: string;
  storyImage?: string;
  sections?: Record<string, Record<string, unknown>>;
  guestMessages?: Array<{
    id: string;
    author: string;
    message: string;
    timestamp?: string;
  }>;
  // Allow for additional unknown properties
  [key: string]: unknown;
}

// Section content interface
export interface SectionContent {
  [key: string]: unknown;
}

// Component props interface
export interface ComponentProps {
  sectionId?: string;
  sectionType?: string;
  userPlan?: {
    id: string;
    name: string;
    maxComponents: number;
  };
  theme?: {
    name: string;
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  editable?: boolean;
  onContentUpdate?: (newContent: Record<string, unknown>) => void;
  gallery?: UserData["gallery"];
  gifts?: GiftItem[]; // Use correct type
  guests?: UserData["guests"];
  bankDetails?: UserData["bankDetails"];
  userId?: string;
  heroImage?: string;
  storyImage?: string;
  [key: string]: unknown;
}
