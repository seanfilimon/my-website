"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IoSaveOutline,
  IoCheckmarkCircleOutline,
  IoAddOutline,
  IoNewspaperOutline,
  IoDocumentTextOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoLibraryOutline,
  IoBriefcaseOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { toast } from "sonner";
import { ContentType, CONTENT_TYPE_CONFIGS } from "@/src/lib/admin/types";
import { useCreatorQueue, QueueItem } from "@/src/lib/admin/use-creator-queue";
import { parseTags, generateSlug } from "@/src/lib/admin/validation";
import { trpc } from "@/src/lib/trpc/client";
import { CreatorQueueSidebar } from "./creator-queue-sidebar";
import { CreatorForm } from "./creator-form";
import { useAIContent, mapGeneratedContentToForm } from "@/src/lib/admin/ai-content-context";

// Icon mapping for content types
const TYPE_ICONS: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  blogs: IoNewspaperOutline,
  articles: IoDocumentTextOutline,
  courses: IoBookOutline,
  videos: IoPlayCircleOutline,
  resources: IoLibraryOutline,
  experiences: IoBriefcaseOutline,
  authors: IoPersonOutline,
};

interface UnifiedCreatorProps {
  initialType?: ContentType | null;
}

export function UnifiedCreator({ initialType }: UnifiedCreatorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<{ type: ContentType; title: string }[]>([]);
  const [hasAddedInitialType, setHasAddedInitialType] = useState(false);

  const {
    queue,
    activeItem,
    activeItemId,
    setActiveItemId,
    addItem,
    removeItem,
    updateFormData,
    updateStatus,
    clearSaved,
    clearAll,
    getItemTitle,
    getCounts,
    isInitialized,
  } = useCreatorQueue();

  // AI Content integration
  const { pendingContent, selectedFields, clearPendingContent, setActiveContentType } = useAIContent();

  // Update active content type in context when it changes
  useEffect(() => {
    if (activeItem) {
      setActiveContentType(activeItem.type);
    } else {
      setActiveContentType(null);
    }
  }, [activeItem, setActiveContentType]);

  // Apply AI-generated content when available
  useEffect(() => {
    if (pendingContent && selectedFields.length > 0 && activeItem && activeItemId) {
      const mappedData = mapGeneratedContentToForm(
        pendingContent,
        selectedFields,
        activeItem.type
      );

      if (Object.keys(mappedData).length > 0) {
        updateFormData(activeItemId, mappedData);
        toast.success(`Applied ${selectedFields.length} field${selectedFields.length !== 1 ? "s" : ""} from AI`);
      }

      clearPendingContent();
    }
  }, [pendingContent, selectedFields, activeItem, activeItemId, updateFormData, clearPendingContent]);

  // Add initial type from URL parameter (only once)
  useEffect(() => {
    if (isInitialized && initialType && !hasAddedInitialType && queue.length === 0) {
      const validTypes: ContentType[] = ["blogs", "articles", "courses", "videos", "resources", "experiences", "authors"];
      if (validTypes.includes(initialType)) {
        addItem(initialType);
        setHasAddedInitialType(true);
      }
    }
  }, [isInitialized, initialType, hasAddedInitialType, queue.length, addItem]);

  // tRPC mutations
  const blogCreate = trpc.blog.create.useMutation();
  const articleCreate = trpc.article.create.useMutation();
  const courseCreate = trpc.course.create.useMutation();
  const videoCreate = trpc.video.create.useMutation();
  const resourceCreate = trpc.resource.create.useMutation();
  const experienceCreate = trpc.experience.create.useMutation();
  const authorCreate = trpc.user.create.useMutation();
  const seoUpsert = trpc.seo.upsert.useMutation();

  // Map content types to SEO entity types
  const CONTENT_TO_SEO_TYPE: Record<string, "blog" | "article" | "resource" | "course" | "video"> = {
    blogs: "blog",
    articles: "article",
    courses: "course",
    videos: "video",
    resources: "resource",
  };

  // Content types that support SEO
  const SEO_SUPPORTED_TYPES: ContentType[] = ["blogs", "articles", "courses", "videos", "resources"];

  // Get the appropriate mutation for a content type
  const getMutation = (type: ContentType) => {
    switch (type) {
      case "blogs": return blogCreate;
      case "articles": return articleCreate;
      case "courses": return courseCreate;
      case "videos": return videoCreate;
      case "resources": return resourceCreate;
      case "experiences": return experienceCreate;
      case "authors": return authorCreate;
    }
  };

  // Prepare form data for submission
  const prepareFormData = (item: QueueItem): { data: Record<string, any>; seoData: Record<string, any> | null } => {
    const data = { ...item.formData };
    
    // Extract SEO data before processing
    const seoData = data.seo || null;
    delete data.seo;
    
    // Parse tags from comma-separated string
    if (typeof data.tags === "string") {
      data.tags = parseTags(data.tags);
    }

    // Generate slug if empty
    const titleField = item.type === "resources" ? "name" : "title";
    if (!data.slug && data[titleField]) {
      data.slug = generateSlug(data[titleField]);
    }

    // Define which fields are optional per content type
    // Articles: resourceId and categoryId are REQUIRED
    // Blogs: resourceId and categoryId are OPTIONAL
    // Courses: resourceId is REQUIRED
    // Videos: resourceId is REQUIRED
    // Experiences: resourceId is OPTIONAL
    // Resources: typeId and categoryId handled by backend defaults
    const optionalFields: Record<ContentType, string[]> = {
      blogs: ["resourceId", "categoryId", "metaTitle", "metaDescription", "thumbnail", "coverImage"],
      articles: ["metaTitle", "metaDescription", "thumbnail", "coverImage"],
      courses: ["subtitle", "discountPrice", "thumbnail", "promoVideo"],
      videos: ["chapters", "resources"],
      resources: ["typeId", "categoryId", "officialUrl", "docsUrl", "githubUrl"],
      experiences: ["resourceId", "subtitle", "summary", "employmentType", "endDate", "duration", "location", 
                    "organizationLogo", "organizationUrl", "thumbnail", "coverImage", "projectUrl", 
                    "githubUrl", "demoUrl", "videoUrl", "metaTitle", "metaDescription"],
      authors: ["image", "bio", "title", "website", "github", "twitter", "linkedin"],
    };

    const currentOptionalFields = optionalFields[item.type] || [];

    // Clean up empty fields - only set to undefined for optional fields
    Object.keys(data).forEach((key) => {
      if (data[key] === "" || data[key] === "none") {
        if (currentOptionalFields.includes(key)) {
          data[key] = undefined;
        } else {
          // For required fields, keep empty string so validation catches it
          // But "none" should become undefined for select fields
          if (data[key] === "none") {
            data[key] = undefined;
          }
        }
      }
    });

    // Handle specific type conversions
    if (item.type === "courses") {
      data.price = Number(data.price) || 0;
      if (data.discountPrice) {
        data.discountPrice = Number(data.discountPrice);
      }
    }

    if (item.type === "experiences") {
      if (data.startDate) {
        data.startDate = new Date(data.startDate);
      }
      if (data.endDate) {
        data.endDate = new Date(data.endDate);
      }
    }

    return { data, seoData };
  };

  // Save a single item
  const saveItem = useCallback(async (item: QueueItem): Promise<boolean> => {
    const mutation = getMutation(item.type);
    const { data, seoData } = prepareFormData(item);

    try {
      updateStatus(item.id, "saving");
      
      // Create the content first
      const result = await mutation.mutateAsync(data as any);
      
      // If SEO data exists and this content type supports SEO, save it
      if (seoData && SEO_SUPPORTED_TYPES.includes(item.type) && result && typeof result === "object" && "id" in result) {
        const entityType = CONTENT_TO_SEO_TYPE[item.type];
        const entityId = (result as { id: string }).id;
        
        // Check if there's any actual SEO data to save (not just empty values)
        const hasActualSeoData = Object.values(seoData).some(
          (value) => value !== null && value !== undefined && value !== ""
        );
        
        if (hasActualSeoData) {
          try {
            await seoUpsert.mutateAsync({
              entityType,
              entityId,
              data: seoData,
            });
          } catch (seoError) {
            // Log SEO error but don't fail the whole save
            console.warn(`SEO data save failed for ${item.type}:`, seoError);
          }
        }
      }
      
      updateStatus(item.id, "saved");
      return true;
    } catch (error: any) {
      console.error(`Failed to save ${item.type}:`, error);
      updateStatus(item.id, "error", error.message || "Failed to save");
      return false;
    }
  }, [updateStatus, blogCreate, articleCreate, courseCreate, videoCreate, resourceCreate, experienceCreate, seoUpsert]);

  // Save the current item
  const handleSaveCurrent = useCallback(async () => {
    if (!activeItem) return;

    setIsSaving(true);
    const success = await saveItem(activeItem);
    setIsSaving(false);

    if (success) {
      toast.success(`${CONTENT_TYPE_CONFIGS[activeItem.type].label} created successfully!`);
      
      // Move to next unsaved item or show success
      const nextUnsaved = queue.find((item) => item.id !== activeItem.id && item.status === "draft");
      if (nextUnsaved) {
        setActiveItemId(nextUnsaved.id);
      }
    } else {
      toast.error(`Failed to create ${CONTENT_TYPE_CONFIGS[activeItem.type].label.toLowerCase()}`);
    }
  }, [activeItem, saveItem, queue, setActiveItemId]);

  // Save all items
  const handleSaveAll = useCallback(async () => {
    const unsavedItems = queue.filter((item) => item.status === "draft" || item.status === "error");
    if (unsavedItems.length === 0) {
      toast.info("No items to save");
      return;
    }

    setIsSavingAll(true);
    const results: { type: ContentType; title: string }[] = [];

    for (const item of unsavedItems) {
      const success = await saveItem(item);
      if (success) {
        results.push({
          type: item.type,
          title: getItemTitle(item),
        });
      }
    }

    setIsSavingAll(false);

    if (results.length > 0) {
      setSavedItems(results);
      setSuccessDialogOpen(true);
    }

    if (results.length < unsavedItems.length) {
      toast.warning(`${results.length}/${unsavedItems.length} items saved. Some items failed.`);
    }
  }, [queue, saveItem, getItemTitle]);

  // Handle success dialog close
  const handleSuccessClose = useCallback(() => {
    setSuccessDialogOpen(false);
    clearSaved();
    setSavedItems([]);

    // If all items were saved, redirect to admin
    if (queue.every((item) => item.status === "saved")) {
      router.push("/admin");
    }
  }, [clearSaved, queue, router]);

  // Handle form data update
  const handleUpdateFormData = useCallback((data: Partial<Record<string, any>>) => {
    if (activeItemId) {
      updateFormData(activeItemId, data);
    }
  }, [activeItemId, updateFormData]);

  const counts = getCounts();
  const contentTypes: ContentType[] = ["blogs", "articles", "courses", "videos", "resources", "experiences", "authors"];

  // Loading state
  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Queue Sidebar */}
      <CreatorQueueSidebar
        queue={queue}
        activeItemId={activeItemId}
        onSelectItem={setActiveItemId}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onClearAll={clearAll}
        getItemTitle={getItemTitle}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="h-14 border-b bg-card/50 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">
              {activeItem ? (
                <>
                  {getItemTitle(activeItem)}
                  <Badge variant="outline" className="ml-2">
                    {CONTENT_TYPE_CONFIGS[activeItem.type].label}
                  </Badge>
                </>
              ) : (
                "Content Creator"
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {counts.total > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveCurrent}
                  disabled={!activeItem || activeItem.status === "saved" || isSaving || isSavingAll}
                  className="gap-2"
                >
                  <IoSaveOutline className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Current"}
                </Button>

                {counts.draft > 1 && (
                  <Button
                    size="sm"
                    onClick={handleSaveAll}
                    disabled={isSavingAll || counts.draft === 0}
                    className="gap-2"
                  >
                    <IoCheckmarkCircleOutline className="h-4 w-4" />
                    {isSavingAll ? `Saving ${counts.saving}/${counts.draft}...` : `Save All (${counts.draft})`}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto pb-24">
            {activeItem ? (
              <CreatorForm
                item={activeItem}
                onUpdateFormData={handleUpdateFormData}
              />
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                  <IoAddOutline className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Start Creating</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Add content to your creation queue. You can create multiple items at once
                  and save them all together.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {contentTypes.map((type) => {
                    const config = CONTENT_TYPE_CONFIGS[type];
                    const Icon = TYPE_ICONS[type];
                    return (
                      <Button
                        key={type}
                        variant="outline"
                        className="h-auto py-6 flex flex-col gap-2"
                        onClick={() => addItem(type)}
                      >
                        <Icon className="h-8 w-8 text-muted-foreground" />
                        <span className="font-medium">{config.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500" />
              Content Created Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-4">
                  {savedItems.length} {savedItems.length === 1 ? "item has" : "items have"} been created:
                </p>
                <ul className="space-y-2">
                  {savedItems.map((item, index) => {
                    const Icon = TYPE_ICONS[item.type];
                    return (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {CONTENT_TYPE_CONFIGS[item.type].label}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSuccessClose}>
              Continue Creating
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/admin")}>
              Go to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
