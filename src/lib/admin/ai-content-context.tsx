"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { GeneratedContent } from "@/src/components/agent/use-content-agent";

interface AIContentContextValue {
  /** The generated content waiting to be applied */
  pendingContent: GeneratedContent | null;
  /** Selected fields to apply */
  selectedFields: string[];
  /** Set pending content from AI chat */
  setPendingContent: (content: GeneratedContent | null, fields: string[]) => void;
  /** Clear pending content after it's been applied */
  clearPendingContent: () => void;
  /** Current active content type in the creator */
  activeContentType: string | null;
  /** Set the active content type */
  setActiveContentType: (type: string | null) => void;
}

const AIContentContext = createContext<AIContentContextValue | null>(null);

export function AIContentProvider({ children }: { children: ReactNode }) {
  const [pendingContent, setPendingContentState] = useState<GeneratedContent | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [activeContentType, setActiveContentType] = useState<string | null>(null);

  const setPendingContent = useCallback((content: GeneratedContent | null, fields: string[]) => {
    setPendingContentState(content);
    setSelectedFields(fields);
  }, []);

  const clearPendingContent = useCallback(() => {
    setPendingContentState(null);
    setSelectedFields([]);
  }, []);

  return (
    <AIContentContext.Provider
      value={{
        pendingContent,
        selectedFields,
        setPendingContent,
        clearPendingContent,
        activeContentType,
        setActiveContentType,
      }}
    >
      {children}
    </AIContentContext.Provider>
  );
}

export function useAIContent() {
  const context = useContext(AIContentContext);
  if (!context) {
    throw new Error("useAIContent must be used within an AIContentProvider");
  }
  return context;
}

/**
 * Map generated content fields to form fields based on content type
 */
export function mapGeneratedContentToForm(
  content: GeneratedContent,
  selectedFields: string[],
  contentType: string
): Record<string, unknown> {
  const formData: Record<string, unknown> = {};

  // Map title (resources use "name" instead of "title")
  if (selectedFields.includes("title") && content.title) {
    if (contentType === "resources") {
      formData.name = content.title;
    } else {
      formData.title = content.title;
    }
  }

  // Map slug
  if (selectedFields.includes("slug") && content.slug) {
    formData.slug = content.slug;
  }

  // Map excerpt (resources use "description" instead of "excerpt")
  if (selectedFields.includes("excerpt") && content.excerpt) {
    if (contentType === "resources") {
      formData.description = content.excerpt;
    } else {
      formData.excerpt = content.excerpt;
    }
  }

  // Map content
  if (selectedFields.includes("content") && content.content) {
    if (contentType === "resources") {
      // Resources don't have a content field, use description
      if (!formData.description) {
        formData.description = content.content;
      }
    } else if (contentType === "courses") {
      formData.description = content.content;
    } else if (contentType === "videos") {
      formData.description = content.content;
    } else {
      formData.content = content.content;
    }
  }

  // Map meta title
  if (selectedFields.includes("metaTitle") && content.metaTitle) {
    formData.metaTitle = content.metaTitle;
  }

  // Map meta description
  if (selectedFields.includes("metaDescription") && content.metaDescription) {
    formData.metaDescription = content.metaDescription;
  }

  // Map tags (convert array to comma-separated string for form)
  if (selectedFields.includes("tags") && content.tags?.length) {
    formData.tags = content.tags.join(", ");
  }

  // Map read time
  if (selectedFields.includes("readTime") && content.readTime) {
    formData.readTime = content.readTime;
  }

  return formData;
}
