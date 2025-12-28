import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  editorProcedure,
  adminProcedure,
} from "../init";
import { db } from "@/src/lib/db";

// Input validation schemas
const videoCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().min(1),
  authorId: z.string().min(1, "Author is required"),
  resourceId: z.string(),
  videoUrl: z.string().url(),
  thumbnail: z.string(),
  duration: z.string().default("0:00"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  chapters: z.array(z.object({
    title: z.string(),
    time: z.string(),
  })).optional(),
  resources: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

const videoUpdateSchema = videoCreateSchema.partial().extend({
  id: z.string(),
});

const videoListSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
  resourceId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
  orderBy: z.enum(["createdAt", "updatedAt", "publishedAt", "views", "likes"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const videoRouter = createTRPCRouter({
  // List videos with pagination and filters
  list: publicProcedure
    .input(videoListSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, orderBy, order, search, ...filters } = input;

      const where: any = {};
      
      if (filters.resourceId) where.resourceId = filters.resourceId;
      if (filters.status) where.status = filters.status;
      if (filters.featured !== undefined) where.featured = filters.featured;
      if (filters.authorId) where.authorId = filters.authorId;
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const videos = await db.video.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [orderBy]: order },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          resource: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
          tags: true,
          _count: {
            select: { comments: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (videos.length > limit) {
        const nextItem = videos.pop();
        nextCursor = nextItem?.id;
      }

      return {
        videos,
        nextCursor,
      };
    }),

  // Get single video by ID
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const video = await db.video.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: { id: true, name: true, image: true, bio: true },
          },
          resource: true,
          tags: true,
          comments: {
            where: { approved: true, parentId: null },
            include: {
              user: { select: { id: true, name: true, image: true } },
              replies: {
                include: {
                  user: { select: { id: true, name: true, image: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return video;
    }),

  // Get single video by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const video = await db.video.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: { id: true, name: true, image: true, bio: true },
          },
          resource: true,
          tags: true,
          comments: {
            where: { approved: true, parentId: null },
            include: {
              user: { select: { id: true, name: true, image: true } },
              replies: {
                include: {
                  user: { select: { id: true, name: true, image: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return video;
    }),

  // Create video
  create: editorProcedure
    .input(videoCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { tags, ...data } = input;

      // Generate slug if not provided
      const slug = data.slug || data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check for existing slug
      const existing = await db.video.findUnique({
        where: { slug },
      });

      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const video = await db.video.create({
        data: {
          ...data,
          slug: finalSlug,
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          tags: tags?.length
            ? {
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: {
                    name: tag,
                    slug: tag.toLowerCase().replace(/\s+/g, "-"),
                  },
                })),
              }
            : undefined,
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
          resource: true,
          tags: true,
        },
      });

      // Update resource video count
      await db.resource.update({
        where: { id: data.resourceId },
        data: { videoCount: { increment: 1 } },
      });

      return video;
    }),

  // Update video
  update: editorProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tags, ...data } = input;

      const existing = await db.video.findUnique({
        where: { id },
        select: { authorId: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const userRole = ctx.role;
      if (existing.authorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own videos",
        });
      }

      const publishedAt =
        data.status === "PUBLISHED" && existing.status !== "PUBLISHED"
          ? new Date()
          : undefined;

      const video = await db.video.update({
        where: { id },
        data: {
          ...data,
          publishedAt,
          tags: tags?.length
            ? {
                set: [],
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: {
                    name: tag,
                    slug: tag.toLowerCase().replace(/\s+/g, "-"),
                  },
                })),
              }
            : undefined,
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
          resource: true,
          tags: true,
        },
      });

      return video;
    }),

  // Delete video
  delete: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.video.findUnique({
        where: { id: input.id },
        select: { authorId: true, resourceId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const userRole = ctx.role;
      if (existing.authorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own videos",
        });
      }

      await db.video.delete({
        where: { id: input.id },
      });

      await db.resource.update({
        where: { id: existing.resourceId },
        data: { videoCount: { decrement: 1 } },
      });

      return { success: true };
    }),

  // Increment view count
  incrementViews: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.video.update({
        where: { id: input.id },
        data: { views: { increment: 1 } },
      });
      return { success: true };
    }),

  // Toggle like
  toggleLike: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const video = await db.video.update({
        where: { id: input.id },
        data: { likes: { increment: 1 } },
        select: { likes: true },
      });
      return { likes: video.likes };
    }),

  // Bulk publish
  bulkPublish: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await db.video.updateMany({
        where: { id: { in: input.ids } },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      return { success: true, count: input.ids.length };
    }),

  // Bulk archive
  bulkArchive: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await db.video.updateMany({
        where: { id: { in: input.ids } },
        data: { status: "ARCHIVED" },
      });
      return { success: true, count: input.ids.length };
    }),

  // Get tags
  getTags: publicProcedure.query(async ({ ctx }) => {
    return db.videoTag.findMany({
      orderBy: { name: "asc" },
    });
  }),
});

