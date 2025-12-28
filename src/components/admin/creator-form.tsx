"use client";

import { useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentType, CONTENT_TYPE_CONFIGS } from "@/src/lib/admin/types";
import { QueueItem } from "@/src/lib/admin/use-creator-queue";
import { generateSlug } from "@/src/lib/admin/validation";
import { trpc } from "@/src/lib/trpc/client";
import { IconPicker } from "./icon-picker";
import { MDXEditor } from "./mdx-editor";
import { SEOFormSection, SEOFormData } from "./seo-form-section";

// Field configuration types
interface BaseFieldConfig {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
}

interface TextFieldConfig extends BaseFieldConfig {
  type: "text";
  autoGenerateSlug?: boolean;
}

interface TextareaFieldConfig extends BaseFieldConfig {
  type: "textarea";
  rows?: number;
}

interface MdxFieldConfig extends BaseFieldConfig {
  type: "mdx";
  rows?: number;
}

interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  options:
    | "resources"
    | "resourceTypes"
    | "resourceCategories"
    | "contentCategories"
    | "authors"
    | "static";
  staticOptions?: { value: string; label: string }[];
}

interface SwitchFieldConfig extends BaseFieldConfig {
  type: "switch";
}

interface NumberFieldConfig extends BaseFieldConfig {
  type: "number";
  min?: number;
  max?: number;
}

interface ColorFieldConfig extends BaseFieldConfig {
  type: "color";
}

interface DateFieldConfig extends BaseFieldConfig {
  type: "date";
}

interface ImageFieldConfig extends BaseFieldConfig {
  type: "image";
  endpoint?:
    | "thumbnailUploader"
    | "coverImageUploader"
    | "avatarUploader"
    | "iconUploader"
    | "galleryUploader";
  aspectRatio?: "square" | "video" | "wide" | "auto";
}

interface IconFieldConfig extends BaseFieldConfig {
  type: "icon";
  iconUrlField: string; // The field name for the iconUrl
}

interface SEOFieldConfig extends BaseFieldConfig {
  type: "seo";
  contentType: "blog" | "article" | "resource" | "course" | "video";
}

type FieldConfig =
  | TextFieldConfig
  | TextareaFieldConfig
  | MdxFieldConfig
  | SelectFieldConfig
  | SwitchFieldConfig
  | NumberFieldConfig
  | ColorFieldConfig
  | DateFieldConfig
  | ImageFieldConfig
  | IconFieldConfig
  | SEOFieldConfig;

// Field configurations for each content type
const FORM_FIELDS: Record<ContentType, FieldConfig[]> = {
  blogs: [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "My Journey with React Server Components",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      placeholder: "my-journey-with-react-server-components",
    },
    {
      name: "excerpt",
      label: "Excerpt",
      type: "textarea",
      required: true,
      rows: 3,
      placeholder: "Brief description of the blog post...",
    },
    {
      name: "authorId",
      label: "Author",
      type: "select",
      options: "authors",
      required: true,
      description: "Select the author for this blog post",
    },
    {
      name: "resourceId",
      label: "Resource",
      type: "select",
      options: "resources",
      description: "Optional: Link to a technology/framework",
    },
    {
      name: "categoryId",
      label: "Category",
      type: "select",
      options: "contentCategories",
      description: "Optional: Content category",
    },
    {
      name: "content",
      label: "Content (MDX)",
      type: "mdx",
      required: true,
      rows: 15,
      placeholder: "Write your blog post content in MDX format...",
    },
    {
      name: "thumbnail",
      label: "Thumbnail",
      type: "image",
      endpoint: "thumbnailUploader",
      aspectRatio: "video",
      description: "Upload a thumbnail image",
    },
    {
      name: "coverImage",
      label: "Cover Image",
      type: "image",
      endpoint: "coverImageUploader",
      aspectRatio: "wide",
      description: "Upload a cover image",
    },
    {
      name: "seo",
      label: "SEO Settings",
      type: "seo",
      contentType: "blog",
      description: "Search engine optimization settings",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "DRAFT", label: "Draft" },
        { value: "PUBLISHED", label: "Published" },
        { value: "ARCHIVED", label: "Archived" },
      ],
    },
    {
      name: "tags",
      label: "Tags",
      type: "text",
      placeholder: "react, typescript, web-dev (comma separated)",
    },
    {
      name: "featured",
      label: "Featured",
      type: "switch",
      description: "Feature this blog post on the homepage",
    },
  ],
  articles: [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Understanding Next.js App Router",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      placeholder: "understanding-nextjs-app-router",
    },
    {
      name: "excerpt",
      label: "Excerpt",
      type: "textarea",
      required: true,
      rows: 3,
      placeholder: "Brief description of the article...",
    },
    {
      name: "authorId",
      label: "Author",
      type: "select",
      options: "authors",
      required: true,
      description: "Select the author for this article",
    },
    {
      name: "resourceId",
      label: "Resource",
      type: "select",
      options: "resources",
      required: true,
    },
    {
      name: "categoryId",
      label: "Category",
      type: "select",
      options: "contentCategories",
      required: true,
    },
    {
      name: "difficulty",
      label: "Difficulty",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "BEGINNER", label: "Beginner" },
        { value: "INTERMEDIATE", label: "Intermediate" },
        { value: "ADVANCED", label: "Advanced" },
      ],
    },
    {
      name: "content",
      label: "Content (MDX)",
      type: "mdx",
      required: true,
      rows: 15,
      placeholder: "Write your article content in MDX format...",
    },
    {
      name: "thumbnail",
      label: "Thumbnail",
      type: "image",
      endpoint: "thumbnailUploader",
      aspectRatio: "video",
      description: "Upload a thumbnail image",
    },
    {
      name: "seo",
      label: "SEO Settings",
      type: "seo",
      contentType: "article",
      description: "Search engine optimization settings",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "DRAFT", label: "Draft" },
        { value: "PUBLISHED", label: "Published" },
        { value: "ARCHIVED", label: "Archived" },
      ],
    },
    {
      name: "tags",
      label: "Tags",
      type: "text",
      placeholder: "nextjs, react, typescript (comma separated)",
    },
    {
      name: "featured",
      label: "Featured",
      type: "switch",
      description: "Feature this article on the homepage",
    },
  ],
  courses: [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Complete Next.js Course",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      placeholder: "complete-nextjs-course",
    },
    {
      name: "subtitle",
      label: "Subtitle",
      type: "text",
      placeholder: "From beginner to advanced",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      rows: 4,
      placeholder: "Course description...",
    },
    {
      name: "instructorId",
      label: "Instructor",
      type: "select",
      options: "authors",
      required: true,
      description: "Select the instructor for this course",
    },
    {
      name: "resourceId",
      label: "Resource",
      type: "select",
      options: "resources",
      required: true,
    },
    {
      name: "level",
      label: "Level",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "BEGINNER", label: "Beginner" },
        { value: "INTERMEDIATE", label: "Intermediate" },
        { value: "ADVANCED", label: "Advanced" },
      ],
    },
    {
      name: "language",
      label: "Language",
      type: "text",
      placeholder: "English",
    },
    { name: "price", label: "Price", type: "number", min: 0, placeholder: "0" },
    {
      name: "discountPrice",
      label: "Discount Price",
      type: "number",
      min: 0,
      placeholder: "Optional discount price",
    },
    {
      name: "thumbnail",
      label: "Thumbnail",
      type: "image",
      endpoint: "thumbnailUploader",
      aspectRatio: "video",
      description: "Upload a thumbnail image",
    },
    {
      name: "promoVideo",
      label: "Promo Video URL",
      type: "text",
      placeholder: "https://youtube.com/...",
    },
    {
      name: "duration",
      label: "Duration",
      type: "text",
      placeholder: "10 hours",
    },
    {
      name: "seo",
      label: "SEO Settings",
      type: "seo",
      contentType: "course",
      description: "Search engine optimization settings",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "DRAFT", label: "Draft" },
        { value: "PUBLISHED", label: "Published" },
        { value: "ARCHIVED", label: "Archived" },
      ],
    },
    {
      name: "tags",
      label: "Tags",
      type: "text",
      placeholder: "nextjs, react, web-dev (comma separated)",
    },
    {
      name: "featured",
      label: "Featured",
      type: "switch",
      description: "Feature this course on the homepage",
    },
  ],
  videos: [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Building a REST API with Next.js",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      placeholder: "building-rest-api-nextjs",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      rows: 4,
      placeholder: "Video description...",
    },
    {
      name: "authorId",
      label: "Author",
      type: "select",
      options: "authors",
      required: true,
      description: "Select the author for this video",
    },
    {
      name: "resourceId",
      label: "Resource",
      type: "select",
      options: "resources",
      required: true,
    },
    {
      name: "videoUrl",
      label: "Video URL",
      type: "text",
      required: true,
      placeholder: "https://youtube.com/watch?v=...",
    },
    {
      name: "thumbnail",
      label: "Thumbnail",
      type: "image",
      required: true,
      endpoint: "thumbnailUploader",
      aspectRatio: "video",
      description: "Upload a thumbnail image",
    },
    { name: "duration", label: "Duration", type: "text", placeholder: "15:30" },
    {
      name: "seo",
      label: "SEO Settings",
      type: "seo",
      contentType: "video",
      description: "Search engine optimization settings",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "DRAFT", label: "Draft" },
        { value: "PUBLISHED", label: "Published" },
        { value: "ARCHIVED", label: "Archived" },
      ],
    },
    {
      name: "tags",
      label: "Tags",
      type: "text",
      placeholder: "nextjs, api, tutorial (comma separated)",
    },
    {
      name: "featured",
      label: "Featured",
      type: "switch",
      description: "Feature this video on the homepage",
    },
  ],
  resources: [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Next.js",
      autoGenerateSlug: true,
    },
    { name: "slug", label: "Slug", type: "text", placeholder: "nextjs" },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      rows: 4,
      placeholder: "A React framework for production...",
    },
    {
      name: "icon",
      label: "Icon",
      type: "icon",
      iconUrlField: "iconUrl",
      description: "Choose an emoji or upload a custom icon",
    },
    { name: "color", label: "Brand Color", type: "color" },
    {
      name: "typeId",
      label: "Resource Type",
      type: "select",
      options: "resourceTypes",
      description: "e.g., Framework, Library, Language, Tool",
    },
    {
      name: "categoryId",
      label: "Category",
      type: "select",
      options: "resourceCategories",
      description: "e.g., Frontend, Backend, DevOps",
    },
    {
      name: "featured",
      label: "Featured",
      type: "switch",
      description: "Show in featured section on resources page",
    },
    {
      name: "officialUrl",
      label: "Official Website",
      type: "text",
      placeholder: "https://nextjs.org",
    },
    {
      name: "docsUrl",
      label: "Documentation URL",
      type: "text",
      placeholder: "https://nextjs.org/docs",
    },
    {
      name: "githubUrl",
      label: "GitHub URL",
      type: "text",
      placeholder: "https://github.com/vercel/next.js",
    },
    {
      name: "seo",
      label: "SEO Settings",
      type: "seo",
      contentType: "resource",
      description: "Search engine optimization settings",
    },
    {
      name: "tags",
      label: "Tags",
      type: "text",
      placeholder: "react, javascript, web (comma separated)",
    },
  ],
  experiences: [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Senior Software Engineer",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      placeholder: "senior-software-engineer-company",
    },
    {
      name: "subtitle",
      label: "Subtitle",
      type: "text",
      placeholder: "Full-stack development",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      rows: 4,
      placeholder: "Detailed description of the experience...",
    },
    {
      name: "summary",
      label: "Summary",
      type: "textarea",
      rows: 2,
      placeholder: "Brief summary...",
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: "static",
      required: true,
      staticOptions: [
        { value: "WORK", label: "Work" },
        { value: "PROJECT", label: "Project" },
        { value: "EDUCATION", label: "Education" },
        { value: "CERTIFICATION", label: "Certification" },
        { value: "VOLUNTEER", label: "Volunteer" },
        { value: "ACHIEVEMENT", label: "Achievement" },
        { value: "SPEAKING", label: "Speaking" },
        { value: "PUBLICATION", label: "Publication" },
      ],
    },
    {
      name: "employmentType",
      label: "Employment Type",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "FULL_TIME", label: "Full Time" },
        { value: "PART_TIME", label: "Part Time" },
        { value: "CONTRACT", label: "Contract" },
        { value: "FREELANCE", label: "Freelance" },
        { value: "INTERNSHIP", label: "Internship" },
        { value: "REMOTE", label: "Remote" },
        { value: "HYBRID", label: "Hybrid" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "CURRENT", label: "Current" },
        { value: "COMPLETED", label: "Completed" },
        { value: "UPCOMING", label: "Upcoming" },
        { value: "ON_HOLD", label: "On Hold" },
      ],
    },
    { name: "startDate", label: "Start Date", type: "date", required: true },
    { name: "endDate", label: "End Date", type: "date" },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "San Francisco, CA",
    },
    {
      name: "isRemote",
      label: "Remote",
      type: "switch",
      description: "This is a remote position",
    },
    {
      name: "organization",
      label: "Organization",
      type: "text",
      placeholder: "Company Name",
    },
    {
      name: "organizationUrl",
      label: "Organization URL",
      type: "text",
      placeholder: "https://company.com",
    },
    {
      name: "projectUrl",
      label: "Project URL",
      type: "text",
      placeholder: "https://project.com",
    },
    {
      name: "githubUrl",
      label: "GitHub URL",
      type: "text",
      placeholder: "https://github.com/...",
    },
    {
      name: "resourceId",
      label: "Related Resource",
      type: "select",
      options: "resources",
    },
    {
      name: "featured",
      label: "Featured",
      type: "switch",
      description: "Feature this experience",
    },
    {
      name: "published",
      label: "Published",
      type: "switch",
      description: "Make this experience visible",
    },
  ],
  authors: [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "John Doe",
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      required: true,
      placeholder: "john@example.com",
    },
    {
      name: "image",
      label: "Avatar",
      type: "image",
      endpoint: "avatarUploader",
      aspectRatio: "square",
      description: "Upload a profile picture",
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      placeholder: "Senior Software Engineer",
    },
    {
      name: "bio",
      label: "Bio",
      type: "textarea",
      rows: 4,
      placeholder: "A brief bio about the author...",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: "static",
      staticOptions: [
        { value: "AUTHOR", label: "Author" },
        { value: "EDITOR", label: "Editor" },
        { value: "ADMIN", label: "Admin" },
        { value: "VIEWER", label: "Viewer" },
      ],
    },
    {
      name: "website",
      label: "Website",
      type: "text",
      placeholder: "https://johndoe.com",
    },
    {
      name: "github",
      label: "GitHub Username",
      type: "text",
      placeholder: "johndoe",
    },
    {
      name: "twitter",
      label: "Twitter Username",
      type: "text",
      placeholder: "johndoe",
    },
    {
      name: "linkedin",
      label: "LinkedIn Username",
      type: "text",
      placeholder: "johndoe",
    },
  ],
  assets: [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Hero Banner",
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      placeholder: "Optional title for SEO",
    },
    {
      name: "alt",
      label: "Alt Text",
      type: "text",
      placeholder: "Descriptive alt text for accessibility",
    },
    {
      name: "caption",
      label: "Caption",
      type: "text",
      placeholder: "Optional caption",
    },
  ],
};

interface CreatorFormProps {
  item: QueueItem;
  onUpdateFormData: (data: Partial<Record<string, any>>) => void;
}

export function CreatorForm({ item, onUpdateFormData }: CreatorFormProps) {
  const config = CONTENT_TYPE_CONFIGS[item.type];
  const fields = FORM_FIELDS[item.type];

  // Fetch data for select fields with loading states
  const { data: resources, isLoading: resourcesLoading } =
    trpc.resource.getAll.useQuery();
  const { data: resourceTypes, isLoading: typesLoading } =
    trpc.resource.listTypes.useQuery();
  const { data: resourceCategories, isLoading: resourceCategoriesLoading } =
    trpc.resource.listCategories.useQuery();
  const { data: contentCategories, isLoading: contentCategoriesLoading } =
    trpc.resource.listContentCategories.useQuery();
  const { data: authors, isLoading: authorsLoading } =
    trpc.user.getAuthors.useQuery();

  // Check if a specific select field is loading
  const isSelectLoading = (optionsType: string): boolean => {
    switch (optionsType) {
      case "resources":
        return resourcesLoading;
      case "resourceTypes":
        return typesLoading;
      case "resourceCategories":
        return resourceCategoriesLoading;
      case "contentCategories":
        return contentCategoriesLoading;
      case "authors":
        return authorsLoading;
      default:
        return false;
    }
  };

  // Handle field change
  const handleChange = useCallback(
    (name: string, value: any, field?: FieldConfig) => {
      const updates: Record<string, any> = { [name]: value };

      // Auto-generate slug if this is a title/name field
      if (
        field?.type === "text" &&
        (field as TextFieldConfig).autoGenerateSlug
      ) {
        const slugField = fields.find((f) => f.name === "slug");
        if (slugField && !item.formData.slug) {
          updates.slug = generateSlug(value);
        }
      }

      onUpdateFormData(updates);
    },
    [fields, item.formData.slug, onUpdateFormData],
  );

  // Get options for select fields
  const getSelectOptions = (field: SelectFieldConfig) => {
    switch (field.options) {
      case "resources":
        return resources?.map((r) => ({ value: r.id, label: r.name })) || [];
      case "resourceTypes":
        return (
          resourceTypes?.map((t) => ({ value: t.id, label: t.name })) || []
        );
      case "resourceCategories":
        return (
          resourceCategories?.map((c) => ({ value: c.id, label: c.name })) || []
        );
      case "contentCategories":
        return (
          contentCategories?.map((c) => ({ value: c.id, label: c.name })) || []
        );
      case "authors":
        return (
          authors?.map((a) => ({ value: a.id, label: a.name || a.email })) || []
        );
      case "static":
        return field.staticOptions || [];
      default:
        return [];
    }
  };

  // Render a single field
  const renderField = (field: FieldConfig) => {
    const value = item.formData[field.name] ?? "";

    switch (field.type) {
      case "text":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value, field)}
              placeholder={field.placeholder}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "textarea":
      case "mdx":
        return (
          <div key={field.name} className="space-y-2">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <MDXEditor
              value={value || ""}
              onChange={(newValue) => handleChange(field.name, newValue)}
              placeholder={field.placeholder}
              minHeight={field.rows ? `${field.rows * 24}px` : "400px"}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "select":
        const options = getSelectOptions(field);
        const loading =
          field.options !== "static" && isSelectLoading(field.options);
        const hasOptions = options.length > 0;
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select
              value={value || "none"}
              onValueChange={(v) =>
                handleChange(field.name, v === "none" ? "" : v)
              }
              disabled={loading}
            >
              <SelectTrigger className={loading ? "opacity-70" : ""}>
                <SelectValue
                  placeholder={
                    loading
                      ? "Loading..."
                      : !hasOptions && field.options !== "static"
                        ? `No ${field.label.toLowerCase()} available`
                        : `Select ${field.label.toLowerCase()}`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!field.required && <SelectItem value="none">None</SelectItem>}
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading options...
                  </SelectItem>
                ) : !hasOptions && field.options !== "static" ? (
                  <SelectItem value="empty" disabled>
                    No options available
                  </SelectItem>
                ) : (
                  options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "switch":
        return (
          <div key={field.name} className="flex items-center gap-3 py-2">
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
            />
            <div>
              <Label htmlFor={field.name} className="cursor-pointer">
                {field.label}
              </Label>
              {field.description && (
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
          </div>
        );

      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) =>
                handleChange(
                  field.name,
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "color":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <div className="flex gap-2">
              <Input
                id={field.name}
                type="color"
                value={value || "#6366f1"}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={value || "#6366f1"}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder="#6366f1"
                className="flex-1"
              />
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "image":
        return (
          <div key={field.name} className="space-y-2">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <ImageUpload
              value={value || null}
              onChange={(url) => handleChange(field.name, url || "")}
              endpoint={field.endpoint || "thumbnailUploader"}
              aspectRatio={field.aspectRatio || "video"}
              placeholder={
                field.placeholder || `Upload ${field.label.toLowerCase()}`
              }
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "icon":
        const iconUrlValue = item.formData[field.iconUrlField] ?? null;
        return (
          <div key={field.name} className="space-y-2">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <IconPicker
              icon={value || "📦"}
              iconUrl={iconUrlValue}
              onIconChange={(icon) => handleChange(field.name, icon)}
              onIconUrlChange={(url) => handleChange(field.iconUrlField, url)}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "seo":
        // Get content values for SEO preview
        const titleField = item.type === "resources" ? "name" : "title";
        const descField =
          item.type === "courses"
            ? "description"
            : item.type === "videos"
              ? "description"
              : "excerpt";
        const contentTitle = item.formData[titleField] || "";
        const contentDescription =
          item.formData[descField] || item.formData.description || "";
        const contentImage =
          item.formData.thumbnail || item.formData.coverImage || "";

        return (
          <SEOFormSection
            key={field.name}
            value={(value as SEOFormData) || {}}
            onChange={(seoData) => handleChange(field.name, seoData)}
            contentTitle={contentTitle}
            contentDescription={contentDescription}
            contentImage={contentImage}
            contentType={(field as SEOFieldConfig).contentType}
          />
        );

      default:
        return null;
    }
  };

  // Group fields into sections
  const basicFields: FieldConfig[] = fields.slice(
    0,
    Math.min(6, fields.length),
  );
  const contentFields: FieldConfig[] = fields.filter((f) => f.type === "mdx");
  const seoFields: FieldConfig[] = fields.filter((f) => f.type === "seo");
  const mediaFields: FieldConfig[] = fields.filter(
    (f) =>
      (f.name.includes("thumbnail") ||
        f.name.includes("cover") ||
        f.name.includes("Image") ||
        f.type === "image") &&
      f.type !== "seo",
  );
  const settingsFields: FieldConfig[] = fields.filter(
    (f) => f.type === "switch" || f.name === "status" || f.name === "tags",
  );
  const otherFields: FieldConfig[] = fields.filter(
    (f) =>
      !basicFields.includes(f) &&
      !contentFields.includes(f) &&
      !seoFields.includes(f) &&
      !mediaFields.includes(f) &&
      !settingsFields.includes(f),
  );

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="border rounded-lg p-6 bg-card space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {basicFields.map((field) => (
            <div
              key={field.name}
              className={field.type === "textarea" ? "md:col-span-2" : ""}
            >
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      {/* Content (if applicable) */}
      {contentFields.length > 0 && (
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-lg font-semibold">Content</h2>
          {contentFields.map(renderField)}
        </div>
      )}

      {/* Other Fields */}
      {otherFields.length > 0 && (
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-lg font-semibold">Additional Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {otherFields.map((field) => (
              <div
                key={field.name}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media (if applicable) */}
      {mediaFields.length > 0 && (
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-lg font-semibold">Media</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mediaFields.map((field) => (
              <div
                key={field.name}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Settings (if applicable) */}
      {seoFields.length > 0 && (
        <div className="border rounded-lg p-6 bg-card space-y-4">
          {seoFields.map(renderField)}
        </div>
      )}

      {/* Settings */}
      {settingsFields.length > 0 && (
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {settingsFields.map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
