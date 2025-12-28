"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/src/lib/trpc/client";
import { ContentType, ContentItem } from "./types";

/**
 * Hook to get all CRUD mutations for a content type
 * Includes cache invalidation for optimistic updates
 */
export function useContentMutations(type: ContentType) {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  // Invalidate queries after mutations
  const invalidateQueries = useCallback(() => {
    switch (type) {
      case "blogs":
        utils.blog.list.invalidate();
        break;
      case "articles":
        utils.article.list.invalidate();
        break;
      case "courses":
        utils.course.list.invalidate();
        break;
      case "videos":
        utils.video.list.invalidate();
        break;
      case "resources":
        utils.resource.list.invalidate();
        break;
      case "experiences":
        utils.experience.list.invalidate();
        break;
    }
  }, [type, utils]);

  // Blog mutations
  const blogCreate = trpc.blog.create.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const blogUpdate = trpc.blog.update.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const blogDelete = trpc.blog.delete.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const blogBulkPublish = trpc.blog.bulkPublish.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const blogBulkArchive = trpc.blog.bulkArchive.useMutation({
    onSuccess: () => invalidateQueries(),
  });

  // Article mutations
  const articleCreate = trpc.article.create.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const articleUpdate = trpc.article.update.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const articleDelete = trpc.article.delete.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const articleBulkPublish = trpc.article.bulkPublish.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const articleBulkArchive = trpc.article.bulkArchive.useMutation({
    onSuccess: () => invalidateQueries(),
  });

  // Course mutations
  const courseCreate = trpc.course.create.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const courseUpdate = trpc.course.update.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const courseDelete = trpc.course.delete.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const courseBulkPublish = trpc.course.bulkPublish.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const courseBulkArchive = trpc.course.bulkArchive.useMutation({
    onSuccess: () => invalidateQueries(),
  });

  // Video mutations
  const videoCreate = trpc.video.create.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const videoUpdate = trpc.video.update.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const videoDelete = trpc.video.delete.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const videoBulkPublish = trpc.video.bulkPublish.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const videoBulkArchive = trpc.video.bulkArchive.useMutation({
    onSuccess: () => invalidateQueries(),
  });

  // Resource mutations
  const resourceCreate = trpc.resource.create.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const resourceUpdate = trpc.resource.update.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const resourceDelete = trpc.resource.delete.useMutation({
    onSuccess: () => invalidateQueries(),
  });

  // Experience mutations
  const experienceCreate = trpc.experience.create.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const experienceUpdate = trpc.experience.update.useMutation({
    onSuccess: () => invalidateQueries(),
  });
  const experienceDelete = trpc.experience.delete.useMutation({
    onSuccess: () => invalidateQueries(),
  });

  // Return the appropriate mutations based on type
  const getMutations = () => {
    switch (type) {
      case "blogs":
        return {
          create: blogCreate,
          update: blogUpdate,
          delete: blogDelete,
          bulkPublish: blogBulkPublish,
          bulkArchive: blogBulkArchive,
        };
      case "articles":
        return {
          create: articleCreate,
          update: articleUpdate,
          delete: articleDelete,
          bulkPublish: articleBulkPublish,
          bulkArchive: articleBulkArchive,
        };
      case "courses":
        return {
          create: courseCreate,
          update: courseUpdate,
          delete: courseDelete,
          bulkPublish: courseBulkPublish,
          bulkArchive: courseBulkArchive,
        };
      case "videos":
        return {
          create: videoCreate,
          update: videoUpdate,
          delete: videoDelete,
          bulkPublish: videoBulkPublish,
          bulkArchive: videoBulkArchive,
        };
      case "resources":
        return {
          create: resourceCreate,
          update: resourceUpdate,
          delete: resourceDelete,
          bulkPublish: null, // Resources don't have bulk publish
          bulkArchive: null, // Resources don't have bulk archive
        };
      case "experiences":
        return {
          create: experienceCreate,
          update: experienceUpdate,
          delete: experienceDelete,
          bulkPublish: null, // Experiences don't have bulk publish
          bulkArchive: null, // Experiences don't have bulk archive
        };
      default:
        return {
          create: blogCreate,
          update: blogUpdate,
          delete: blogDelete,
          bulkPublish: blogBulkPublish,
          bulkArchive: blogBulkArchive,
        };
    }
  };

  const mutations = getMutations();

  return {
    ...mutations,
    invalidateQueries,
    isCreating: mutations.create.isPending,
    isUpdating: mutations.update.isPending,
    isDeleting: mutations.delete.isPending,
    isBulkPublishing: mutations.bulkPublish?.isPending || false,
    isBulkArchiving: mutations.bulkArchive?.isPending || false,
  };
}

/**
 * Hook for bulk delete operations
 * Deletes multiple items sequentially
 */
export function useBulkDelete(type: ContentType) {
  const mutations = useContentMutations(type);

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => mutations.delete.mutateAsync({ id }))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return { succeeded, failed, total: ids.length };
    },
    [mutations.delete]
  );

  return {
    bulkDelete,
    isDeleting: mutations.isDeleting,
  };
}
