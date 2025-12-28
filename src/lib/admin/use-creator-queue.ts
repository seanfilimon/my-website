"use client";

import { useState, useCallback, useEffect } from "react";
import { ContentType, CONTENT_TYPE_CONFIGS } from "./types";

// Queue item status
export type QueueItemStatus = "draft" | "saving" | "saved" | "error";

// Queue item interface
export interface QueueItem {
  id: string;
  type: ContentType;
  formData: Record<string, any>;
  status: QueueItemStatus;
  error?: string;
  createdAt: Date;
}

// Default form data for each content type
export const DEFAULT_FORM_DATA: Record<ContentType, Record<string, any>> = {
  blogs: {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    resourceId: "",
    categoryId: "",
    metaTitle: "",
    metaDescription: "",
    thumbnail: "",
    coverImage: "",
    readTime: "5 min read",
    status: "DRAFT",
    featured: false,
    tags: "",
  },
  articles: {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    resourceId: "",
    categoryId: "",
    difficulty: "INTERMEDIATE",
    metaTitle: "",
    metaDescription: "",
    thumbnail: "",
    coverImage: "",
    readTime: "5 min read",
    status: "DRAFT",
    featured: false,
    tags: "",
  },
  courses: {
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    resourceId: "",
    level: "INTERMEDIATE",
    language: "English",
    price: 0,
    discountPrice: "",
    thumbnail: "",
    promoVideo: "",
    duration: "0 hours",
    status: "DRAFT",
    featured: false,
    tags: "",
  },
  videos: {
    title: "",
    slug: "",
    description: "",
    resourceId: "",
    videoUrl: "",
    thumbnail: "",
    duration: "0:00",
    status: "DRAFT",
    featured: false,
    chapters: [],
    resources: [],
    tags: "",
  },
  resources: {
    name: "",
    slug: "",
    icon: "📦",
    color: "#6366f1",
    description: "",
    typeId: "",
    categoryId: "",
    officialUrl: "",
    docsUrl: "",
    githubUrl: "",
    tags: "",
  },
  experiences: {
    title: "",
    subtitle: "",
    description: "",
    summary: "",
    type: "PROJECT",
    employmentType: "",
    status: "COMPLETED",
    startDate: "",
    endDate: "",
    duration: "",
    location: "",
    isRemote: false,
    organization: "",
    organizationLogo: "",
    organizationUrl: "",
    thumbnail: "",
    coverImage: "",
    gallery: [],
    projectUrl: "",
    githubUrl: "",
    demoUrl: "",
    videoUrl: "",
    resourceId: "",
    metaTitle: "",
    metaDescription: "",
    slug: "",
    featured: false,
    published: true,
    order: 0,
  },
};

const STORAGE_KEY = "admin-creator-queue";

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Load queue from localStorage
function loadQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        // Reset saving status on load
        status: item.status === "saving" ? "draft" : item.status,
      }));
    }
  } catch (e) {
    console.error("Failed to load queue from localStorage:", e);
  }
  return [];
}

// Save queue to localStorage
function saveQueue(queue: QueueItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to save queue to localStorage:", e);
  }
}

/**
 * Hook for managing the content creation queue
 */
export function useCreatorQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    const loaded = loadQueue();
    setQueue(loaded);
    if (loaded.length > 0) {
      setActiveItemId(loaded[0].id);
    }
    setIsInitialized(true);
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveQueue(queue);
    }
  }, [queue, isInitialized]);

  // Get the active item
  const activeItem = queue.find((item) => item.id === activeItemId) || null;

  // Add a new item to the queue
  const addItem = useCallback((type: ContentType) => {
    const newItem: QueueItem = {
      id: generateId(),
      type,
      formData: { ...DEFAULT_FORM_DATA[type] },
      status: "draft",
      createdAt: new Date(),
    };

    setQueue((prev) => [...prev, newItem]);
    setActiveItemId(newItem.id);

    return newItem.id;
  }, []);

  // Remove an item from the queue
  const removeItem = useCallback((id: string) => {
    setQueue((prev) => {
      const newQueue = prev.filter((item) => item.id !== id);
      return newQueue;
    });

    // If removing the active item, select the first remaining item
    setActiveItemId((currentActive) => {
      if (currentActive === id) {
        const remaining = queue.filter((item) => item.id !== id);
        return remaining.length > 0 ? remaining[0].id : null;
      }
      return currentActive;
    });
  }, [queue]);

  // Update form data for an item
  const updateFormData = useCallback((id: string, data: Partial<Record<string, any>>) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, formData: { ...item.formData, ...data } }
          : item
      )
    );
  }, []);

  // Update item status
  const updateStatus = useCallback((id: string, status: QueueItemStatus, error?: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, error } : item
      )
    );
  }, []);

  // Clear all saved items from the queue
  const clearSaved = useCallback(() => {
    setQueue((prev) => {
      const remaining = prev.filter((item) => item.status !== "saved");
      return remaining;
    });

    // Update active item if needed
    setActiveItemId((currentActive) => {
      const remaining = queue.filter((item) => item.status !== "saved");
      if (!remaining.find((item) => item.id === currentActive)) {
        return remaining.length > 0 ? remaining[0].id : null;
      }
      return currentActive;
    });
  }, [queue]);

  // Clear the entire queue
  const clearAll = useCallback(() => {
    setQueue([]);
    setActiveItemId(null);
  }, []);

  // Get display title for an item
  const getItemTitle = useCallback((item: QueueItem): string => {
    const config = CONTENT_TYPE_CONFIGS[item.type];
    const titleField = item.type === "resources" ? "name" : "title";
    const title = item.formData[titleField];
    
    if (title && title.trim()) {
      return title.trim();
    }
    
    return `New ${config.label}`;
  }, []);

  // Get count of items by status
  const getCounts = useCallback(() => {
    return {
      total: queue.length,
      draft: queue.filter((item) => item.status === "draft").length,
      saving: queue.filter((item) => item.status === "saving").length,
      saved: queue.filter((item) => item.status === "saved").length,
      error: queue.filter((item) => item.status === "error").length,
    };
  }, [queue]);

  return {
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
  };
}
