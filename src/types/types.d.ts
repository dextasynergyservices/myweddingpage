export type MediaUpload = {
  id: string;
  cloudinary_url: string;
  type: "PHOTO" | "VIDEO";
};

export type Comment = {
  id: string;
  author_name: string;
  text: string;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  layout_data: Record<string, unknown>;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  max_photos: number;
  max_videos: number;
  max_tabs: number;
};

export type Payment = {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  payment_provider: "STRIPE" | "PAYSTACK";
  status: "SUCCESS" | "FAILED" | "PENDING";
  paid_at: string;
};

export type WeddingPageData = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  is_live: boolean;
  template?: Template | null;
  mediaUploads: MediaUpload[];
  comments: Comment[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  planId?: string;
  whatsapp?: string;
  verification_code?: string;
};
