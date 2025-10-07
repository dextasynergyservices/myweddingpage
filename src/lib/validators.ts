/**
 * Zod Validation Schemas for API Endpoints
 * Provides type-safe input validation across the application
 */

import { z } from "zod";

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

/**
 * Registration validation schema
 * Used in: /api/auth/register
 */
export const registerSchema = z.object({
  groomName: z
    .string()
    .min(2, "Groom name must be at least 2 characters")
    .max(100, "Groom name must be less than 100 characters")
    .trim(),
  brideName: z
    .string()
    .min(2, "Bride name must be at least 2 characters")
    .max(100, "Bride name must be less than 100 characters")
    .trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format (use E.164 format: +1234567890)")
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=\[\]{}|;:',.<>\/~`])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  weddingDate: z.string().datetime().optional().or(z.literal("")),
});

/**
 * Login validation schema
 * Used in: /api/auth/login (NextAuth)
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

/**
 * Forgot password validation schema
 * Used in: /api/auth/forgot-password
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

/**
 * Reset password validation schema
 * Used in: /api/auth/reset-password
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=\[\]{}|;:',.<>\/~`])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

// ============================================
// CONTACT & COMMUNICATION SCHEMAS
// ============================================

/**
 * Contact form validation schema
 * Used in: /api/contact
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string().email("Invalid email address").trim(),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters")
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters")
    .trim(),
  website: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === "", {
      message: "This field should be empty",
    }),
});

/**
 * Comment/Wish validation schema
 * Used in: /api/comments
 */
export const commentSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters")
    .max(1000, "Message must be less than 1000 characters")
    .trim(),
  weddingPageId: z.string().uuid("Invalid wedding page ID"),
  created_at: z.string().datetime().optional(),
});

/**
 * Comment update validation schema
 * Used in: /api/comments (PUT)
 */
export const commentUpdateSchema = z.object({
  id: z.string().uuid("Invalid comment ID"),
  approved: z.boolean(),
});

// ============================================
// GUEST & RSVP SCHEMAS
// ============================================

/**
 * Guest creation validation schema
 * Used in: /api/guests
 */
export const guestSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .trim(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional()
      .or(z.literal("")),
    customMessage: z.string().max(500, "Message must be less than 500 characters").optional(),
    invitationCard: z.string().url("Invalid invitation card URL").optional().or(z.literal("")),
    mealPreference: z.string().max(100).optional(),
    tableAssignment: z.number().int().positive().optional(),
    plusOne: z.boolean().optional(),
    dietaryRestrictions: z.string().max(200).optional(),
    invitedBy: z.enum(["BRIDE", "GROOM", "BOTH"]),
    category: z.enum(["FAMILY", "FRIENDS", "COLLEAGUES", "OTHER"]),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone number is required",
    path: ["email"],
  });

/**
 * RSVP update validation schema
 * Used in: /api/rsvp/[token]
 */
export const rsvpSchema = z.object({
  rsvpStatus: z.enum(["ATTENDING", "DECLINED"]),
  mealPreference: z.string().max(100).optional(),
  dietaryRestrictions: z.string().max(200).optional(),
});

// ============================================
// PAYMENT SCHEMAS
// ============================================

/**
 * Payment initiation validation schema
 * Used in: /api/paystack/initiate
 */
export const paymentInitiationSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .trim(),
  planId: z.string().uuid("Invalid plan ID"),
  amount: z.number().positive("Amount must be positive").finite("Amount must be a valid number"),
});

/**
 * Payment renewal validation schema
 * Used in: /api/paystack/initiate-renewal
 */
export const paymentRenewalSchema = z.object({
  planId: z.string().uuid("Invalid plan ID"),
  duration: z.number().int().positive("Duration must be positive"),
});

// ============================================
// WEDDING PAGE SCHEMAS
// ============================================

/**
 * Wedding page creation validation schema
 * Used in: /api/wedding-pages
 */
export const weddingPageSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .trim(),
  templateId: z.string().uuid("Invalid template ID"),
  venue: z.string().max(200).optional(),
  welcomeMessage: z.string().max(500).optional(),
});

// ============================================
// FILE UPLOAD SCHEMAS
// ============================================

/**
 * File upload validation schema
 * Used in: /api/upload-image
 */
export const uploadSchema = z.object({
  uploadType: z.enum(["profile", "hero", "logo", "story", "gallery", "general"]).default("general"),
});

// ============================================
// TASK SCHEMAS
// ============================================

/**
 * Task creation validation schema
 * Used in: /api/tasks
 */
export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  description: z.string().max(1000, "Description must be less than 1000 characters").trim(),
  TaskCategoryId: z.string().cuid("Invalid category ID"),
  TaskPriorityId: z.string().cuid("Invalid priority ID"),
  dueDate: z.string().datetime("Invalid date format"),
  assignedTo: z.string().max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  estimatedTime: z.number().int().positive().optional(),
});

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Type inference helpers
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type PaymentInitiationInput = z.infer<typeof paymentInitiationSchema>;
export type PaymentRenewalInput = z.infer<typeof paymentRenewalSchema>;
export type WeddingPageInput = z.infer<typeof weddingPageSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
export type TaskInput = z.infer<typeof taskSchema>;

/**
 * Validation helper function
 * Returns validated data or throws error with formatted messages
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation helper function
 * Returns either success with data or error with formatted messages
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return { success: false, errors };
}
