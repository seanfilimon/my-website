import { z } from "zod";

// ==================== ARTICLE VALIDATION ====================
export const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().max(200).optional(),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  resourceId: z.string().min(1, "Resource is required"),
  categoryId: z.string().min(1, "Category is required"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("INTERMEDIATE"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  coverImage: z.string().optional(),
  readTime: z.string().default("5 min read"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;

// ==================== BLOG VALIDATION ====================
export const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().max(200).optional(),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  resourceId: z.string().optional(),
  categoryId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  coverImage: z.string().optional(),
  readTime: z.string().default("5 min read"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export type BlogFormData = z.infer<typeof blogFormSchema>;

// ==================== COURSE VALIDATION ====================
export const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().max(200).optional(),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  resourceId: z.string().min(1, "Resource is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("INTERMEDIATE"),
  language: z.string().default("English"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  discountPrice: z.coerce.number().min(0).optional(),
  thumbnail: z.string().optional(),
  promoVideo: z.string().optional(),
  duration: z.string().default("0 hours"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

// Course Section Schema
export const courseSectionSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1, "Section title is required").max(200),
  description: z.string().optional(),
  order: z.number().int().min(0),
  duration: z.string().default("0 min"),
});

export type CourseSectionData = z.infer<typeof courseSectionSchema>;

// Course Lesson Schema
export const courseLessonSchema = z.object({
  sectionId: z.string().min(1),
  title: z.string().min(1, "Lesson title is required").max(200),
  description: z.string().optional(),
  order: z.number().int().min(0),
  videoUrl: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().default("0:00"),
  isFree: z.boolean().default(false),
  resources: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
});

export type CourseLessonData = z.infer<typeof courseLessonSchema>;

// ==================== VIDEO VALIDATION ====================
export const videoFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().max(200).optional(),
  description: z.string().min(1, "Description is required"),
  resourceId: z.string().min(1, "Resource is required"),
  videoUrl: z.string().url("Please enter a valid URL"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  duration: z.string().default("0:00"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  chapters: z.array(z.object({
    title: z.string(),
    time: z.string(),
  })).optional(),
  resources: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

export type VideoFormData = z.infer<typeof videoFormSchema>;

// ==================== RESOURCE VALIDATION ====================
export const resourceFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  slug: z.string().max(100).optional(),
  icon: z.string().default("📦"),
  color: z.string().default("#6366f1"),
  description: z.string().min(1, "Description is required"),
  typeId: z.string().optional(),
  categoryId: z.string().optional(),
  officialUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  docsUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});

export type ResourceFormData = z.infer<typeof resourceFormSchema>;

// ==================== EXPERIENCE VALIDATION ====================
export const experienceFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  summary: z.string().optional(),
  type: z.enum(["WORK", "PROJECT", "EDUCATION", "CERTIFICATION", "VOLUNTEER", "ACHIEVEMENT", "SPEAKING", "PUBLICATION"]),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP", "REMOTE", "HYBRID"]).optional(),
  status: z.enum(["CURRENT", "COMPLETED", "UPCOMING", "ON_HOLD"]).default("COMPLETED"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  duration: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  organization: z.string().optional(),
  organizationLogo: z.string().optional(),
  organizationUrl: z.string().url().optional().or(z.literal("")),
  thumbnail: z.string().optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  projectUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  resourceId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type ExperienceFormData = z.infer<typeof experienceFormSchema>;

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Parse tags from comma-separated string
 */
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/**
 * Format tags array to comma-separated string
 */
export function formatTags(tags: string[] | { name: string }[]): string {
  return tags
    .map((tag) => (typeof tag === "string" ? tag : tag.name))
    .join(", ");
}
