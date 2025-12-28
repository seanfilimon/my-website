"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  IoSaveOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoArrowBackOutline,
  IoChevronDownOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoArchiveOutline,
  IoLinkOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  ContentType,
  ContentItem,
  CONTENT_TYPE_CONFIGS,
} from "@/src/lib/admin/types";
import { MDXEditor } from "./mdx-editor";
import { SEOEditor } from "./seo-editor";
import { InlineEditTags } from "./inline-edit-field";
import { IconPicker } from "./icon-picker";
import { cn } from "@/src/lib/utils";
import { trpc } from "@/src/lib/trpc/client";

interface ContentEditorPageProps {
  item: ContentItem | null;
  isCreating: boolean;
  contentType: ContentType;
  onSave: (data: Partial<ContentItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// Form section component
function FormSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">{title}</CardTitle>
              <IoChevronDownOutline
                className={cn("h-4 w-4 transition-transform text-muted-foreground", isOpen && "rotate-180")}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-6">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function ContentEditorPage({
  item,
  isCreating,
  contentType,
  onSave,
  onDelete,
}: ContentEditorPageProps) {
  const router = useRouter();
  const config = CONTENT_TYPE_CONFIGS[contentType];

  // Fetch resources and categories via tRPC
  const { data: resources = [], isLoading: resourcesLoading } = trpc.resource.getAll.useQuery();
  // Content categories for articles/blogs
  const { data: contentCategories = [], isLoading: contentCategoriesLoading } = trpc.resource.listContentCategories.useQuery();
  // Resource categories for resources
  const { data: resourceCategories = [], isLoading: resourceCategoriesLoading } = trpc.resource.listCategories.useQuery();
  const { data: resourceTypes = [], isLoading: typesLoading } = trpc.resource.listTypes.useQuery();
  
  // Use the appropriate categories based on content type
  const categories = contentType === "resources" ? resourceCategories : contentCategories;
  const categoriesLoading = contentType === "resources" ? resourceCategoriesLoading : contentCategoriesLoading;

  // Form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({ ...item });
      setIsDirty(false);
    } else if (isCreating) {
      // Default values for new items
      setFormData({
        title: "",
        name: "",
        slug: "",
        excerpt: "",
        content: "",
        description: "",
        status: "DRAFT",
        featured: false,
        published: true,
        resourceId: "",
        categoryId: "",
        typeId: "",
        icon: "📦",
        color: "#6366f1",
        tags: [],
      });
      setIsDirty(false);
    }
  }, [item, isCreating]);

  // Update form field
  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

  // Handle title change with auto-slug
  const handleTitleChange = useCallback(
    (title: string) => {
      updateField("title", title);
      if (isCreating || !formData.slug) {
        updateField("slug", generateSlug(title));
      }
    },
    [updateField, generateSlug, isCreating, formData.slug]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Transform tags from objects to strings if needed
      const dataToSave = {
        ...formData,
        tags: formData.tags?.map((tag: any) => 
          typeof tag === "string" ? tag : tag.name
        ) || [],
      };
      await onSave(dataToSave);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (item) {
      await onDelete(item.id);
      router.push("/admin");
    }
  }, [item, onDelete, router]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (isDirty) {
      // Could show a confirmation dialog here
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    router.push("/admin");
  }, [isDirty, router]);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm shrink-0 z-40">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <IoArrowBackOutline className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">
                {isCreating ? `New ${config.label}` : `Edit ${config.label}`}
              </h1>
              {isDirty && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Preview button */}
            {!isCreating && item && "slug" in item && (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a
                  href={`/${contentType}/${(item as any).slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IoEyeOutline className="h-4 w-4" />
                  Preview
                </a>
              </Button>
            )}

            {/* Save button */}
            <Button
              size="sm"
              className="gap-2"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
            >
              <IoSaveOutline className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>

            {/* Delete button */}
            {!isCreating && item && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <IoTrashOutline className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {config.label}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the{" "}
                      {config.label.toLowerCase()} and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Form Content - Native scrolling */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 pb-24 space-y-6">
          {/* Basic Information */}
          <FormSection title="Basic Information">
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {contentType === "resources" ? "Name" : "Title"} *
                </Label>
                <Input
                  id="title"
                  value={formData.title || formData.name || ""}
                  onChange={(e) =>
                    contentType === "resources"
                      ? updateField("name", e.target.value)
                      : handleTitleChange(e.target.value)
                  }
                  placeholder={`Enter ${contentType === "resources" ? "name" : "title"}...`}
                  className="text-lg"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug || ""}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="auto-generated-from-title"
                />
              </div>

              {/* Excerpt/Subtitle/Description based on type */}
              {(contentType === "blogs" || contentType === "articles") && (
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ""}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    placeholder="Brief summary of the content..."
                    rows={3}
                  />
                </div>
              )}

              {contentType === "courses" && (
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle || ""}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    placeholder="Course subtitle..."
                  />
                </div>
              )}

              {(contentType === "videos" || contentType === "resources" || contentType === "courses") && (
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Detailed description..."
                    rows={4}
                  />
                </div>
              )}

              {/* Resource Icon & Color */}
              {contentType === "resources" && (
                <div className="space-y-4">
                  <IconPicker
                    icon={formData.icon || "📦"}
                    iconUrl={formData.iconUrl || null}
                    onIconChange={(icon) => updateField("icon", icon)}
                    onIconUrlChange={(url) => updateField("iconUrl", url)}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="color">Brand Color *</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color || "#6366f1"}
                      onChange={(e) => updateField("color", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label htmlFor="featured">Featured Resource</Label>
                      <p className="text-xs text-muted-foreground">Show in featured section on resources page</p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.featured || false}
                      onCheckedChange={(checked) => updateField("featured", checked)}
                    />
                  </div>
                </div>
              )}

              {contentType === "experiences" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle / Company</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle || ""}
                      onChange={(e) => updateField("subtitle", e.target.value)}
                      placeholder="Company or organization name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Describe your experience..."
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>
          </FormSection>

          {/* Classification */}
          <FormSection title="Classification">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                {config.hasStatus && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status || "DRAFT"}
                      onValueChange={(value) => updateField("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">
                          <div className="flex items-center gap-2">
                            <IoTimeOutline className="h-4 w-4" />
                            Draft
                          </div>
                        </SelectItem>
                        <SelectItem value="PUBLISHED">
                          <div className="flex items-center gap-2">
                            <IoCheckmarkCircleOutline className="h-4 w-4" />
                            Published
                          </div>
                        </SelectItem>
                        <SelectItem value="ARCHIVED">
                          <div className="flex items-center gap-2">
                            <IoArchiveOutline className="h-4 w-4" />
                            Archived
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Resource */}
                {config.hasResource && (
                  <div className="space-y-2">
                    <Label>Resource</Label>
                    <Select
                      value={formData.resourceId || ""}
                      onValueChange={(value) => updateField("resourceId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={resourcesLoading ? "Loading..." : "Select resource..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {resources.map((resource) => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Resource Type (for resources) */}
                {contentType === "resources" && (
                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <Select
                      value={formData.typeId || ""}
                      onValueChange={(value) => updateField("typeId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={typesLoading ? "Loading..." : "Select type..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Category */}
                {config.hasCategory && (
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.categoryId || ""}
                      onValueChange={(value) => updateField("categoryId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Difficulty (for articles/courses) */}
                {(contentType === "articles" || contentType === "courses") && (
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={formData.difficulty || formData.level || "INTERMEDIATE"}
                      onValueChange={(value) =>
                        updateField(contentType === "courses" ? "level" : "difficulty", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Experience Type */}
                {contentType === "experiences" && (
                  <>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={formData.type || "WORK"}
                        onValueChange={(value) => updateField("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WORK">Work</SelectItem>
                          <SelectItem value="PROJECT">Project</SelectItem>
                          <SelectItem value="EDUCATION">Education</SelectItem>
                          <SelectItem value="CERTIFICATION">Certification</SelectItem>
                          <SelectItem value="SPEAKING">Speaking</SelectItem>
                          <SelectItem value="PUBLICATION">Publication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Experience Status</Label>
                      <Select
                        value={formData.status || "COMPLETED"}
                        onValueChange={(value) => updateField("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CURRENT">Current</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="UPCOMING">Upcoming</SelectItem>
                          <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="space-y-0.5">
                  <Label>Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this {config.label.toLowerCase()} in featured sections
                  </p>
                </div>
                <Switch
                  checked={formData.featured || false}
                  onCheckedChange={(checked) => updateField("featured", checked)}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <InlineEditTags
                  tags={formData.tags || []}
                  onSave={(tags) => updateField("tags", tags)}
                />
              </div>
            </div>
          </FormSection>

          {/* Content (for types with MDX content) */}
          {config.hasContent && (
            <Card className="border-border/50">
              <CardHeader className="py-4">
                <CardTitle className="text-base font-medium">Content</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-0">
                <div className="h-[600px] -mx-6 -mb-6">
                  <MDXEditor
                    value={formData.content || formData.description || ""}
                    onChange={(value) =>
                      updateField(contentType === "experiences" ? "description" : "content", value)
                    }
                    minHeight="600px"
                    className="h-full rounded-t-none border-0 border-t"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media */}
          <FormSection title="Media" defaultOpen={false}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <ImageUpload
                    value={formData.thumbnail}
                    onChange={(url) => updateField("thumbnail", url || "")}
                    endpoint="thumbnailUploader"
                    aspectRatio="video"
                    placeholder="Upload thumbnail"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <ImageUpload
                    value={formData.coverImage}
                    onChange={(url) => updateField("coverImage", url || "")}
                    endpoint="coverImageUploader"
                    aspectRatio="wide"
                    placeholder="Upload cover image"
                  />
                </div>
              </div>

              {/* Video URL for videos */}
              {contentType === "videos" && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl || ""}
                      onChange={(e) => updateField("videoUrl", e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <Button variant="outline" size="icon">
                      <IoLinkOutline className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* SEO */}
          <FormSection title="SEO & Social" defaultOpen={false}>
            {item?.id ? (
              <SEOEditor
                entityType={contentType === "blogs" ? "blog" : contentType === "articles" ? "article" : contentType === "resources" ? "resource" : contentType === "courses" ? "course" : "video"}
                entityId={item.id}
                contentTitle={formData.title || formData.name || ""}
                contentDescription={formData.excerpt || formData.description || ""}
                contentImage={formData.thumbnail || formData.coverImage || formData.ogImage || ""}
                onChange={(seoData) => {
                  // Sync SEO data to form for inline fields
                  if (seoData.metaTitle) updateField("metaTitle", seoData.metaTitle);
                  if (seoData.metaDescription) updateField("metaDescription", seoData.metaDescription);
                  if (seoData.ogTitle) updateField("ogTitle", seoData.ogTitle);
                  if (seoData.ogDescription) updateField("ogDescription", seoData.ogDescription);
                  if (seoData.ogImage) updateField("ogImage", seoData.ogImage);
                  if (seoData.twitterTitle) updateField("twitterTitle", seoData.twitterTitle);
                  if (seoData.twitterDescription) updateField("twitterDescription", seoData.twitterDescription);
                  if (seoData.twitterImage) updateField("twitterImage", seoData.twitterImage);
                }}
              />
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Save the content first to enable advanced SEO settings with auto-generation and social previews.
                </p>
                {/* Basic SEO fields for new content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle || ""}
                      onChange={(e) => updateField("metaTitle", e.target.value)}
                      placeholder="SEO title (defaults to title if empty)"
                    />
                    <p className="text-xs text-muted-foreground">
                      {(formData.metaTitle || formData.title || "").length}/60 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription || ""}
                      onChange={(e) => updateField("metaDescription", e.target.value)}
                      placeholder="SEO description (defaults to excerpt if empty)"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(formData.metaDescription || formData.excerpt || "").length}/160 characters
                    </p>
                  </div>
                </div>
              </div>
            )}
          </FormSection>

          {/* Type-specific sections */}
          {contentType === "courses" && (
            <FormSection title="Course Details" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => updateField("price", parseFloat(e.target.value))}
                    placeholder="99.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price ($)</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    value={formData.discountPrice || ""}
                    onChange={(e) => updateField("discountPrice", parseFloat(e.target.value))}
                    placeholder="49.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration || ""}
                    onChange={(e) => updateField("duration", e.target.value)}
                    placeholder="12 hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language || "English"}
                    onChange={(e) => updateField("language", e.target.value)}
                    placeholder="English"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {contentType === "resources" && (
            <FormSection title="Resource Links" defaultOpen={false}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      value={formData.icon || ""}
                      onChange={(e) => updateField("icon", e.target.value)}
                      placeholder="▲"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color || "#000000"}
                      onChange={(e) => updateField("color", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officialUrl">Official Website</Label>
                  <Input
                    id="officialUrl"
                    value={formData.officialUrl || ""}
                    onChange={(e) => updateField("officialUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docsUrl">Documentation URL</Label>
                  <Input
                    id="docsUrl"
                    value={formData.docsUrl || ""}
                    onChange={(e) => updateField("docsUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl || ""}
                    onChange={(e) => updateField("githubUrl", e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* OG Image Styling - Resources only */}
          {contentType === "resources" && (
            <FormSection title="OG Image Styling" defaultOpen={false}>
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Customize how blog posts for this resource appear in social media previews
                </p>

                {/* Background & Borders */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Background & Borders</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ogBackgroundColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ogBackgroundColor"
                          type="color"
                          value={formData.ogBackgroundColor || "#000000"}
                          onChange={(e) => updateField("ogBackgroundColor", e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.ogBackgroundColor || "#000000"}
                          onChange={(e) => updateField("ogBackgroundColor", e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogBorderColor">Border Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ogBorderColor"
                          type="color"
                          value={formData.ogBorderColor || "#262626"}
                          onChange={(e) => updateField("ogBorderColor", e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.ogBorderColor || "#262626"}
                          onChange={(e) => updateField("ogBorderColor", e.target.value)}
                          placeholder="#262626"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogResourceBgColor">Resource Area Background</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ogResourceBgColor"
                          type="color"
                          value={formData.ogResourceBgColor || "#000000"}
                          onChange={(e) => updateField("ogResourceBgColor", e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.ogResourceBgColor || "#000000"}
                          onChange={(e) => updateField("ogResourceBgColor", e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogBorderWidth">Border Width (px)</Label>
                      <Input
                        id="ogBorderWidth"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.ogBorderWidth || 2}
                        onChange={(e) => updateField("ogBorderWidth", parseInt(e.target.value) || 2)}
                        placeholder="2"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Colors */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Text Colors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ogTextPrimary">Primary Text (Title)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ogTextPrimary"
                          type="color"
                          value={formData.ogTextPrimary || "#ffffff"}
                          onChange={(e) => updateField("ogTextPrimary", e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.ogTextPrimary || "#ffffff"}
                          onChange={(e) => updateField("ogTextPrimary", e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogTextSecondary">Secondary Text (Excerpt)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ogTextSecondary"
                          type="color"
                          value={formData.ogTextSecondary || "#a3a3a3"}
                          onChange={(e) => updateField("ogTextSecondary", e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.ogTextSecondary || "#a3a3a3"}
                          onChange={(e) => updateField("ogTextSecondary", e.target.value)}
                          placeholder="#a3a3a3"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogFontWeight">Title Font Weight</Label>
                      <Select 
                        value={(formData.ogFontWeight || 500).toString()} 
                        onValueChange={(value) => updateField("ogFontWeight", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="400">400 (Normal)</SelectItem>
                          <SelectItem value="500">500 (Medium)</SelectItem>
                          <SelectItem value="600">600 (Semibold)</SelectItem>
                          <SelectItem value="700">700 (Bold)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Accent Gradient */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Accent Gradient (Avatar & Decorations)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ogAccentStart">Gradient Start Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ogAccentStart"
                          type="color"
                          value={formData.ogAccentStart || "#3b82f6"}
                          onChange={(e) => updateField("ogAccentStart", e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.ogAccentStart || "#3b82f6"}
                          onChange={(e) => updateField("ogAccentStart", e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogAccentEnd">Gradient End Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ogAccentEnd"
                          type="color"
                          value={formData.ogAccentEnd || "#8b5cf6"}
                          onChange={(e) => updateField("ogAccentEnd", e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.ogAccentEnd || "#8b5cf6"}
                          onChange={(e) => updateField("ogAccentEnd", e.target.value)}
                          placeholder="#8b5cf6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Preview */}
                  <div className="space-y-2 mt-4">
                    <Label>Gradient Preview</Label>
                    <div 
                      className="h-20 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${formData.ogAccentStart || "#3b82f6"} 0%, ${formData.ogAccentEnd || "#8b5cf6"} 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Info Note */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex gap-2">
                    <IoInformationCircleOutline className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">About OG Image Styling</p>
                      <p>
                        These colors customize how blog posts appear when shared on social media.
                        Visit any blog post associated with this resource to see the custom OG image.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>
          )}

          {contentType === "experiences" && (
            <FormSection title="Experience Details" defaultOpen={false}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={formData.organization || ""}
                      onChange={(e) => updateField("organization", e.target.value)}
                      placeholder="Company name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={
                        formData.startDate
                          ? new Date(formData.startDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => updateField("startDate", new Date(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={
                        formData.endDate
                          ? new Date(formData.endDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        updateField("endDate", e.target.value ? new Date(e.target.value) : null)
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div className="space-y-0.5">
                    <Label>Remote</Label>
                    <p className="text-xs text-muted-foreground">This is a remote position</p>
                  </div>
                  <Switch
                    checked={formData.isRemote || false}
                    onCheckedChange={(checked) => updateField("isRemote", checked)}
                  />
                </div>
              </div>
            </FormSection>
          )}
        </div>
      </div>
    </div>
  );
}
