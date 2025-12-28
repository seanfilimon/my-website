"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { ContentEditorPage } from "@/src/components/admin/content-editor-page";
import { ContentType, ContentItem, CONTENT_TYPE_CONFIGS } from "@/src/lib/admin/types";
import { useContentItem } from "@/src/lib/admin/use-content-data";
import { useContentMutations } from "@/src/lib/admin/use-content-mutations";

// Valid content types
const VALID_TYPES: ContentType[] = ["blogs", "articles", "courses", "videos", "resources", "experiences"];

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  
  const type = params.type as string;
  const id = params.id as string;
  
  // Validate content type
  const isValidType = VALID_TYPES.includes(type as ContentType);
  const contentType = isValidType ? (type as ContentType) : "blogs";
  
  // Check if creating new
  const isCreating = id === "new";
  
  // Fetch item data using tRPC
  const { data: item, isLoading, isError, error } = useContentItem(
    contentType,
    isCreating ? null : id
  );
  
  // Get mutations
  const mutations = useContentMutations(contentType);
  
  // Get config for toast messages
  const config = CONTENT_TYPE_CONFIGS[contentType];
  
  // Handle save
  const handleSave = useCallback(async (data: Partial<ContentItem>) => {
    try {
      if (isCreating) {
        // Create new item
        const result = await mutations.create.mutateAsync(data as any);
        toast.success(`${config.label} created successfully`);
        // Redirect to edit page for the new item
        router.push(`/admin/edit/${contentType}/${result.id}`);
      } else {
        // Update existing item
        await mutations.update.mutateAsync({ id, ...data } as any);
        toast.success(`${config.label} saved successfully`);
      }
    } catch (error: any) {
      console.error("Failed to save:", error);
      toast.error(error?.message || `Failed to save ${config.label.toLowerCase()}`);
      throw error; // Re-throw to let the form handle the error
    }
  }, [isCreating, mutations.create, mutations.update, id, contentType, router, config]);
  
  // Handle delete
  const handleDelete = useCallback(async (itemId: string) => {
    try {
      await mutations.delete.mutateAsync({ id: itemId });
      toast.success(`${config.label} deleted successfully`);
      router.push("/admin");
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error(error?.message || `Failed to delete ${config.label.toLowerCase()}`);
      throw error;
    }
  }, [mutations.delete, router, config]);
  
  // Show 404 if invalid type
  if (!isValidType) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Content Type</h1>
          <p className="text-muted-foreground mb-4">
            The content type &quot;{type}&quot; is not valid.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="text-primary hover:underline"
          >
            Go back to Admin
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (!isCreating && isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (!isCreating && isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Failed to Load Content</h1>
          <p className="text-muted-foreground mb-4">
            {error?.message || "An error occurred while loading the content."}
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="text-primary hover:underline"
          >
            Go back to Admin
          </button>
        </div>
      </div>
    );
  }
  
  // Show 404 if item not found (and not creating)
  if (!isCreating && !item) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Content Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The {contentType.slice(0, -1)} with ID &quot;{id}&quot; was not found.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="text-primary hover:underline"
          >
            Go back to Admin
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <ContentEditorPage
      item={item as ContentItem | null}
      isCreating={isCreating}
      contentType={contentType}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
