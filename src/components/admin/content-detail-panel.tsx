"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  IoCloseOutline,
  IoChevronDownOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoArchiveOutline,
  IoAddOutline,
  IoImageOutline,
  IoLinkOutline,
} from "react-icons/io5";
import {
  ContentType,
  ContentItem,
  ContentStatus,
  CONTENT_TYPE_CONFIGS,
  DifficultyLevel,
  ExperienceType,
  ExperienceStatus,
  EmploymentType,
} from "@/src/lib/admin/types";
import { MDXEditor } from "./mdx-editor";
import { InlineEditTags } from "./inline-edit-field";
import { cn } from "@/src/lib/utils";

interface ContentDetailPanelProps {
  item: ContentItem | null;
  isCreating: boolean;
  activeType: ContentType;
  onSave: (data: Partial<ContentItem>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  open: boolean;
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 bg-muted/30 hover:bg-muted/50 transition-colors">
        <span className="font-medium text-sm">{title}</span>
        <IoChevronDownOutline
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-4 border-b">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Mock resources for dropdowns
const RESOURCES = [
  { id: "nextjs", name: "Next.js" },
  { id: "react", name: "React" },
  { id: "typescript", name: "TypeScript" },
  { id: "nodejs", name: "Node.js" },
];

const CATEGORIES = [
  { id: "framework", name: "Framework" },
  { id: "library", name: "Library" },
  { id: "language", name: "Language" },
  { id: "tool", name: "Tool" },
];

export function ContentDetailPanel({
  item,
  isCreating,
  activeType,
  onSave,
  onDelete,
  onClose,
  open,
}: ContentDetailPanelProps) {
  const config = CONTENT_TYPE_CONFIGS[activeType];
  
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
        slug: "",
        excerpt: "",
        content: "",
        description: "",
        status: "DRAFT",
        featured: false,
        published: true,
        resourceId: "",
        categoryId: "",
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
      await onSave(formData);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (item) {
      onDelete(item.id);
    }
  }, [item, onDelete]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle>
                {isCreating ? `New ${config.label}` : `Edit ${config.label}`}
              </DialogTitle>
              {isDirty && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Preview button */}
              {!isCreating && item && "slug" in item && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a
                    href={`/${activeType}/${(item as any).slug}`}
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
        </DialogHeader>

        {/* Form Content */}
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="divide-y">
          {/* Basic Information */}
          <FormSection title="Basic Information">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                {activeType === "resources" ? "Name" : "Title"} *
              </Label>
              <Input
                id="title"
                value={formData.title || formData.name || ""}
                onChange={(e) =>
                  activeType === "resources"
                    ? updateField("name", e.target.value)
                    : handleTitleChange(e.target.value)
                }
                placeholder={`Enter ${activeType === "resources" ? "name" : "title"}...`}
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
            {(activeType === "blogs" || activeType === "articles") && (
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

            {activeType === "courses" && (
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

            {(activeType === "videos" || activeType === "resources" || activeType === "courses") && (
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

            {activeType === "experiences" && (
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
          </FormSection>

          {/* Classification */}
          <FormSection title="Classification">
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
                      <SelectValue placeholder="Select resource..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCES.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name}
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
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Difficulty (for articles/courses) */}
              {(activeType === "articles" || activeType === "courses") && (
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={formData.difficulty || formData.level || "INTERMEDIATE"}
                    onValueChange={(value) =>
                      updateField(activeType === "courses" ? "level" : "difficulty", value)
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
              {activeType === "experiences" && (
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
            <div className="flex items-center justify-between">
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
                onSave={(tags) =>
                  updateField(
                    "tags",
                    tags.map((t, i) => ({ id: `new-${i}`, name: t, slug: t.toLowerCase() }))
                  )
                }
              />
            </div>
          </FormSection>

          {/* Content (for types with MDX content) */}
          {config.hasContent && (
            <FormSection title="Content">
              <MDXEditor
                value={formData.content || formData.description || ""}
                onChange={(value) =>
                  updateField(activeType === "experiences" ? "description" : "content", value)
                }
                minHeight="400px"
              />
            </FormSection>
          )}

          {/* Media */}
          <FormSection title="Media" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail || ""}
                    onChange={(e) => updateField("thumbnail", e.target.value)}
                    placeholder="https://..."
                  />
                  <Button variant="outline" size="icon">
                    <IoImageOutline className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="coverImage"
                    value={formData.coverImage || ""}
                    onChange={(e) => updateField("coverImage", e.target.value)}
                    placeholder="https://..."
                  />
                  <Button variant="outline" size="icon">
                    <IoImageOutline className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Video URL for videos */}
            {activeType === "videos" && (
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
          </FormSection>

          {/* SEO */}
          <FormSection title="SEO" defaultOpen={false}>
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
          </FormSection>

          {/* Type-specific sections */}
          {activeType === "courses" && (
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

          {activeType === "resources" && (
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

          {activeType === "experiences" && (
            <FormSection title="Experience Details" defaultOpen={false}>
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Remote</Label>
                  <p className="text-xs text-muted-foreground">This is a remote position</p>
                </div>
                <Switch
                  checked={formData.isRemote || false}
                  onCheckedChange={(checked) => updateField("isRemote", checked)}
                />
              </div>
            </FormSection>
          )}
        </div>
      </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
