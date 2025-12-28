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
const articleCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  authorId: z.string().min(1, "Author is required"),
  resourceId: z.string(),
  categoryId: z.string(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("INTERMEDIATE"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  coverImage: z.string().optional(),
  readTime: z.string().default("5 min read"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

const articleUpdateSchema = articleCreateSchema.partial().extend({
  id: z.string(),
});

const articleListSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
  resourceId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
  orderBy: z.enum(["createdAt", "updatedAt", "publishedAt", "views", "likes"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const articleRouter = createTRPCRouter({
  // List articles with pagination and filters
  list: publicProcedure
    .input(articleListSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, orderBy, order, search, ...filters } = input;

      const where: any = {};
      
      if (filters.resourceId) where.resourceId = filters.resourceId;
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.status) where.status = filters.status;
      if (filters.featured !== undefined) where.featured = filters.featured;
      if (filters.difficulty) where.difficulty = filters.difficulty;
      if (filters.authorId) where.authorId = filters.authorId;
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ];
      }

      const articles = await db.article.findMany({
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
          category: {
            select: { id: true, name: true, slug: true, color: true },
          },
          tags: true,
          _count: {
            select: { comments: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (articles.length > limit) {
        const nextItem = articles.pop();
        nextCursor = nextItem?.id;
      }

      return {
        articles,
        nextCursor,
      };
    }),

  // Get single article by ID
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await db.article.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: { id: true, name: true, image: true, bio: true },
          },
          resource: true,
          category: true,
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

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      return article;
    }),

  // Get single article by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await db.article.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: { id: true, name: true, image: true, bio: true },
          },
          resource: true,
          category: true,
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

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      return article;
    }),

  // Create article
  create: editorProcedure
    .input(articleCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { tags, ...data } = input;

      // Generate slug if not provided
      const slug = data.slug || data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check for existing slug
      const existing = await db.article.findUnique({
        where: { slug },
      });

      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const article = await db.article.create({
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
          category: true,
          tags: true,
        },
      });

      // Update resource article count
      await db.resource.update({
        where: { id: data.resourceId },
        data: { articleCount: { increment: 1 } },
      });

      return article;
    }),

  // Update article
  update: editorProcedure
    .input(articleUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tags, ...data } = input;

      // Check if article exists and user has permission
      const existing = await db.article.findUnique({
        where: { id },
        select: { authorId: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Only allow author or admin to update
      const userRole = ctx.role;
      if (existing.authorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own articles",
        });
      }

      // Set publishedAt if transitioning to published
      const publishedAt =
        data.status === "PUBLISHED" && existing.status !== "PUBLISHED"
          ? new Date()
          : undefined;

      const article = await db.article.update({
        where: { id },
        data: {
          ...data,
          publishedAt,
          tags: tags?.length
            ? {
                set: [], // Disconnect all existing
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
          category: true,
          tags: true,
        },
      });

      return article;
    }),

  // Delete article
  delete: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.article.findUnique({
        where: { id: input.id },
        select: { authorId: true, resourceId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Only allow author or admin to delete
      const userRole = ctx.role;
      if (existing.authorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own articles",
        });
      }

      await db.article.delete({
        where: { id: input.id },
      });

      // Update resource article count
      await db.resource.update({
        where: { id: existing.resourceId },
        data: { articleCount: { decrement: 1 } },
      });

      return { success: true };
    }),

  // Increment view count
  incrementViews: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.article.update({
        where: { id: input.id },
        data: { views: { increment: 1 } },
      });
      return { success: true };
    }),

  // Toggle like
  toggleLike: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // For simplicity, just increment likes
      // In production, you'd track which users liked which articles
      const article = await db.article.update({
        where: { id: input.id },
        data: { likes: { increment: 1 } },
        select: { likes: true },
      });
      return { likes: article.likes };
    }),

  // Bulk publish
  bulkPublish: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await db.article.updateMany({
        where: { id: { in: input.ids } },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      return { success: true, count: input.ids.length };
    }),

  // Bulk archive
  bulkArchive: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await db.article.updateMany({
        where: { id: { in: input.ids } },
        data: { status: "ARCHIVED" },
      });
      return { success: true, count: input.ids.length };
    }),

  // Get tags
  getTags: publicProcedure.query(async ({ ctx }) => {
    return db.articleTag.findMany({
      orderBy: { name: "asc" },
    });
  }),
});

