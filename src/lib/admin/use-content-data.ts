"use client";

import { useMemo } from "react";
import { trpc } from "@/src/lib/trpc/client";
import { ContentType, ContentItem, FilterState } from "./types";

/**
 * Input type for list queries
 */
interface ListInput {
  limit?: number;
  cursor?: string;
  search?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  resourceId?: string;
  categoryId?: string;
  featured?: boolean;
  orderBy?: "createdAt" | "updatedAt" | "publishedAt" | "views" | "likes";
  order?: "asc" | "desc";
}

/**
 * Convert FilterState to list input
 */
function filtersToInput(filters: FilterState): ListInput {
  const input: ListInput = {
    limit: 100,
    order: filters.sortOrder,
  };

  if (filters.search) {
    input.search = filters.search;
  }

  if (filters.status && filters.status !== "ALL") {
    input.status = filters.status;
  }

  if (filters.resourceId && filters.resourceId !== "ALL") {
    input.resourceId = filters.resourceId;
  }

  if (filters.categoryId && filters.categoryId !== "ALL") {
    input.categoryId = filters.categoryId;
  }

  // Map sortBy to valid orderBy values
  if (filters.sortBy === "title") {
    input.orderBy = "createdAt"; // Fallback since title sort isn't supported
  } else {
    input.orderBy = filters.sortBy;
  }

  return input;
}

/**
 * Hook to fetch content list based on type
 * Returns normalized ContentItem[] regardless of content type
 */
export function useContentData(type: ContentType, filters: FilterState) {
  const input = filtersToInput(filters);

  // Use the appropriate router based on content type
  const blogQuery = trpc.blog.list.useQuery(input, {
    enabled: type === "blogs",
  });

  const articleQuery = trpc.article.list.useQuery(input, {
    enabled: type === "articles",
  });

  const courseQuery = trpc.course.list.useQuery(input, {
    enabled: type === "courses",
  });

  const videoQuery = trpc.video.list.useQuery(input, {
    enabled: type === "videos",
  });

  const resourceQuery = trpc.resource.list.useQuery(input, {
    enabled: type === "resources",
  });

  const experienceQuery = trpc.experience.list.useQuery(
    { ...input, type: undefined }, // Experience has different type field
    { enabled: type === "experiences" }
  );

  // Get the active query based on type
  const getActiveQuery = () => {
    switch (type) {
      case "blogs":
        return blogQuery;
      case "articles":
        return articleQuery;
      case "courses":
        return courseQuery;
      case "videos":
        return videoQuery;
      case "resources":
        return resourceQuery;
      case "experiences":
        return experienceQuery;
      default:
        return blogQuery;
    }
  };

  const activeQuery = getActiveQuery();

  // Memoize normalized data to prevent unnecessary re-renders
  const data = useMemo((): ContentItem[] => {
    if (!activeQuery.data) return [];

    switch (type) {
      case "blogs":
        return (blogQuery.data?.blogs || []) as ContentItem[];
      case "articles":
        return (articleQuery.data?.articles || []) as ContentItem[];
      case "courses":
        return (courseQuery.data?.courses || []) as ContentItem[];
      case "videos":
        return (videoQuery.data?.videos || []) as ContentItem[];
      case "resources":
        return (resourceQuery.data?.resources || []) as ContentItem[];
      case "experiences":
        return (experienceQuery.data?.experiences || []) as ContentItem[];
      default:
        return [];
    }
  }, [
    type,
    activeQuery.data,
    blogQuery.data?.blogs,
    articleQuery.data?.articles,
    courseQuery.data?.courses,
    videoQuery.data?.videos,
    resourceQuery.data?.resources,
    experienceQuery.data?.experiences,
  ]);

  return {
    data,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
    isFetching: activeQuery.isFetching,
  };
}

/**
 * Hook to fetch a single content item by ID
 */
export function useContentItem(type: ContentType, id: string | null) {
  const enabled = !!id && id !== "new";

  const blogQuery = trpc.blog.byId.useQuery(
    { id: id || "" },
    { enabled: enabled && type === "blogs" }
  );

  const articleQuery = trpc.article.byId.useQuery(
    { id: id || "" },
    { enabled: enabled && type === "articles" }
  );

  const courseQuery = trpc.course.byId.useQuery(
    { id: id || "" },
    { enabled: enabled && type === "courses" }
  );

  const videoQuery = trpc.video.byId.useQuery(
    { id: id || "" },
    { enabled: enabled && type === "videos" }
  );

  const resourceQuery = trpc.resource.byId.useQuery(
    { id: id || "" },
    { enabled: enabled && type === "resources" }
  );

  const experienceQuery = trpc.experience.byId.useQuery(
    { id: id || "" },
    { enabled: enabled && type === "experiences" }
  );

  // Get the active query based on type
  const getActiveQuery = () => {
    switch (type) {
      case "blogs":
        return blogQuery;
      case "articles":
        return articleQuery;
      case "courses":
        return courseQuery;
      case "videos":
        return videoQuery;
      case "resources":
        return resourceQuery;
      case "experiences":
        return experienceQuery;
      default:
        return blogQuery;
    }
  };

  const activeQuery = getActiveQuery();

  return {
    data: activeQuery.data as ContentItem | null | undefined,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
  };
}

/**
 * Hook to get content counts for all types
 */
export function useContentCounts() {
  const blogQuery = trpc.blog.list.useQuery({ limit: 1 });
  const articleQuery = trpc.article.list.useQuery({ limit: 1 });
  const courseQuery = trpc.course.list.useQuery({ limit: 1 });
  const videoQuery = trpc.video.list.useQuery({ limit: 1 });
  const resourceQuery = trpc.resource.list.useQuery({ limit: 1 });
  const experienceQuery = trpc.experience.list.useQuery({ limit: 1 });

  // Memoize the counts object to prevent unnecessary re-renders
  const counts = useMemo(() => ({
    blogs: blogQuery.data?.blogs?.length || 0,
    articles: articleQuery.data?.articles?.length || 0,
    courses: courseQuery.data?.courses?.length || 0,
    videos: videoQuery.data?.videos?.length || 0,
    resources: resourceQuery.data?.resources?.length || 0,
    experiences: experienceQuery.data?.experiences?.length || 0,
  }), [
    blogQuery.data?.blogs?.length,
    articleQuery.data?.articles?.length,
    courseQuery.data?.courses?.length,
    videoQuery.data?.videos?.length,
    resourceQuery.data?.resources?.length,
    experienceQuery.data?.experiences?.length,
  ]);

  const isLoading = blogQuery.isLoading ||
    articleQuery.isLoading ||
    courseQuery.isLoading ||
    videoQuery.isLoading ||
    resourceQuery.isLoading ||
    experienceQuery.isLoading;

  return {
    ...counts,
    isLoading,
  };
}
