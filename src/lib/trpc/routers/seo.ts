import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "../init";
import { db } from "@/src/lib/db";

// Valid entity types for SEO
const entityTypes = ["blog", "article", "resource", "course", "video"] as const;
type EntityType = (typeof entityTypes)[number];

// Input validation schemas
const seoEntitySchema = z.object({
  entityType: z.enum(entityTypes),
  entityId: z.string(),
});

const seoDataSchema = z.object({
  // Basic SEO
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable().or(z.literal("")),

  // Open Graph
  ogTitle: z.string().max(95).optional().nullable(),
  ogDescription: z.string().max(300).optional().nullable(),
  ogImage: z.string().url().optional().nullable().or(z.literal("")),
  ogType: z.string().optional().nullable(),

  // Twitter Cards
  twitterTitle: z.string().max(70).optional().nullable(),
  twitterDescription: z.string().max(200).optional().nullable(),
  twitterImage: z.string().url().optional().nullable().or(z.literal("")),
  twitterCard: z.enum(["summary", "summary_large_image", "app", "player"]).optional().nullable(),

  // Advanced
  robots: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  publishedTime: z.date().optional().nullable(),
  modifiedTime: z.date().optional().nullable(),

  // Schema.org
  schemaType: z.string().optional().nullable(),
  schemaData: z.any().optional().nullable(),
});

const seoUpsertSchema = seoEntitySchema.extend({
  data: seoDataSchema,
});

// Helper to get content data for auto-generation
async function getEntityData(entityType: EntityType, entityId: string) {
  switch (entityType) {
    case "blog":
      return db.blog.findUnique({
        where: { id: entityId },
        select: {
          title: true,
          excerpt: true,
          thumbnail: true,
          coverImage: true,
          author: { select: { name: true } },
          publishedAt: true,
          updatedAt: true,
        },
      });
    case "article":
      return db.article.findUnique({
        where: { id: entityId },
        select: {
          title: true,
          excerpt: true,
          thumbnail: true,
          coverImage: true,
          author: { select: { name: true } },
          publishedAt: true,
          updatedAt: true,
        },
      });
    case "resource":
      return db.resource.findUnique({
        where: { id: entityId },
        select: {
          name: true,
          description: true,
          iconUrl: true,
          updatedAt: true,
        },
      });
    case "course":
      return db.course.findUnique({
        where: { id: entityId },
        select: {
          title: true,
          description: true,
          subtitle: true,
          thumbnail: true,
          instructor: { select: { name: true } },
          publishedAt: true,
          updatedAt: true,
        },
      });
    case "video":
      return db.video.findUnique({
        where: { id: entityId },
        select: {
          title: true,
          description: true,
          thumbnail: true,
          author: { select: { name: true } },
          publishedAt: true,
          updatedAt: true,
        },
      });
    default:
      return null;
  }
}

// Get schema type based on entity type
function getSchemaType(entityType: EntityType): string {
  switch (entityType) {
    case "blog":
      return "BlogPosting";
    case "article":
      return "Article";
    case "resource":
      return "SoftwareApplication";
    case "course":
      return "Course";
    case "video":
      return "VideoObject";
    default:
      return "WebPage";
  }
}

export const seoRouter = createTRPCRouter({
  // Get SEO data for a specific entity
  getByEntity: publicProcedure
    .input(seoEntitySchema)
    .query(async ({ input }) => {
      const seo = await db.sEO.findUnique({
        where: {
          entityType_entityId: {
            entityType: input.entityType,
            entityId: input.entityId,
          },
        },
      });

      return seo;
    }),

  // Create or update SEO data
  upsert: adminProcedure
    .input(seoUpsertSchema)
    .mutation(async ({ input }) => {
      const { entityType, entityId, data } = input;

      // Clean empty strings to null
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      );

      const seo = await db.sEO.upsert({
        where: {
          entityType_entityId: {
            entityType,
            entityId,
          },
        },
        create: {
          entityType,
          entityId,
          ...cleanedData,
        },
        update: {
          ...cleanedData,
          modifiedTime: new Date(),
        },
      });

      return seo;
    }),

  // Delete SEO data
  delete: adminProcedure
    .input(seoEntitySchema)
    .mutation(async ({ input }) => {
      const { entityType, entityId } = input;

      const existing = await db.sEO.findUnique({
        where: {
          entityType_entityId: {
            entityType,
            entityId,
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "SEO data not found",
        });
      }

      await db.sEO.delete({
        where: {
          entityType_entityId: {
            entityType,
            entityId,
          },
        },
      });

      return { success: true };
    }),

  // Auto-generate SEO defaults from content
  generateDefaults: adminProcedure
    .input(seoEntitySchema)
    .mutation(async ({ input }) => {
      const { entityType, entityId } = input;

      const entityData = await getEntityData(entityType, entityId);

      if (!entityData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${entityType} not found`,
        });
      }

      // Extract common fields
      const title = "title" in entityData ? entityData.title : "name" in entityData ? entityData.name : "";
      const description = "excerpt" in entityData ? entityData.excerpt : "description" in entityData ? entityData.description : "";
      const image = "thumbnail" in entityData ? entityData.thumbnail : "coverImage" in entityData ? entityData.coverImage : "iconUrl" in entityData ? entityData.iconUrl : null;
      const authorName = "author" in entityData && entityData.author ? entityData.author.name : "instructor" in entityData && entityData.instructor ? entityData.instructor.name : null;
      const publishedAt = "publishedAt" in entityData ? entityData.publishedAt : null;
      const updatedAt = entityData.updatedAt;

      // Truncate for SEO limits
      const metaTitle = title.slice(0, 60);
      const metaDescription = description?.slice(0, 155) || null;
      const ogTitle = title.slice(0, 90);
      const ogDescription = description?.slice(0, 295) || null;
      const twitterTitle = title.slice(0, 65);
      const twitterDescription = description?.slice(0, 195) || null;

      const generatedData = {
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImage: image,
        ogType: entityType === "video" ? "video.other" : "article",
        twitterTitle,
        twitterDescription,
        twitterImage: image,
        twitterCard: "summary_large_image" as const,
        robots: "index,follow",
        author: authorName,
        publishedTime: publishedAt,
        modifiedTime: updatedAt,
        schemaType: getSchemaType(entityType),
      };

      // Upsert the generated data
      const seo = await db.sEO.upsert({
        where: {
          entityType_entityId: {
            entityType,
            entityId,
          },
        },
        create: {
          entityType,
          entityId,
          ...generatedData,
        },
        update: generatedData,
      });

      return seo;
    }),

  // Get all SEO records (for admin overview)
  list: adminProcedure
    .input(
      z.object({
        entityType: z.enum(entityTypes).optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { entityType, limit, cursor } = input;

      const where = entityType ? { entityType } : {};

      const seoRecords = await db.sEO.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (seoRecords.length > limit) {
        const nextItem = seoRecords.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: seoRecords,
        nextCursor,
      };
    }),
});
