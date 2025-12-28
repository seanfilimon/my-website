// Types for the multi-create admin panel

export type ContentType = "blog" | "article" | "resource" | "video" | "course";

export interface QueueItem {
  id: string;
  type: ContentType;
  title: string;
  status: "pending" | "creating" | "success" | "error";
  error?: string;
  data: Record<string, unknown>;
}

export interface ContentTypeConfig {
  type: ContentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    type: "blog",
    label: "Blog Post",
    icon: () => null, // Will be set in component
    color: "bg-blue-500",
    description: "Personal thoughts, tutorials, and updates",
  },
  {
    type: "article",
    label: "Article",
    icon: () => null,
    color: "bg-purple-500",
    description: "In-depth technical documentation",
  },
  {
    type: "resource",
    label: "Resource",
    icon: () => null,
    color: "bg-green-500",
    description: "Technology or framework reference",
  },
  {
    type: "video",
    label: "Video",
    icon: () => null,
    color: "bg-red-500",
    description: "Video content and tutorials",
  },
  {
    type: "course",
    label: "Course",
    icon: () => null,
    color: "bg-orange-500",
    description: "Structured learning content",
  },
];
