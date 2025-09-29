import { SectionType } from "@/generated/prisma";

export interface ComponentContent {
  title?: string;
  subtitle?: string;
  venue?: string;
  content?: string;
  text?: string;
  images?: string[];
  date?: string;
  location?: string;
  welcomeMessage?: string;
  brideName?: string;
  groomName?: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface TemplateComponent {
  id: string;
  type: string;
  content: ComponentContent;
  styles?: Record<string, string>;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: TemplateCategory;
  components: TemplateComponent[];
  colorSchemes: Array<{
    name: string;
    primary: string;
    secondary: string;
    background: string;
    text: string;
  }>;
  layout_data: Record<string, unknown>;
  isActive: boolean;
  created_at: string;
  sections: Array<{
    id: string;
    type: SectionType;
    layout: string;
    components: Record<string, unknown>;
    order: number;
  }>;
  categoryId: string;
  hero_image: string | null;
  story_image: string | null;
  story_text: string | null;
  previewData?: Record<string, unknown>;
}

export interface UserPlan {
  id: string;
  name: string;
  maxComponents: number;
  maxPhotos: number;
  maxVideos?: number;
  maxTabs?: number;
  price?: number;
  duration_days?: number;
}

export interface UserTemplate {
  id: string;
  userId: string;
  templateId: string;
  colorScheme: Record<string, unknown>;
  content: Record<string, unknown>;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
  template?: Template;
}

export interface WeddingPage {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  slug: string;
  views?: number;
  ai_data?: Record<string, unknown>;
  layout_data?: { components: TemplateComponent[] };
  color_theme?: string;
  hero_image?: string;
  story_image?: string;
  logo_url?: string;
  logo_alt?: string;
  venue?: string;
  welcomeMessage?: string;
  is_live: boolean;
  created_by_admin?: boolean;
  created_at: string;
  deleted_at?: string | null; // For soft delete functionality
  deletion_reason?: string | null; // Reason for deletion
}
