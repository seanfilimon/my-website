import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../init";
import { prisma } from "@/src/lib/prisma";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";

// Initialize UploadThing API for server-side operations
const utapi = new UTApi();

// Zod schemas for asset operations
const assetTypeSchema = z.enum(["IMAGE", "VIDEO", "DOCUMENT", "AUDIO", "OTHER"]);
const assetCategorySchema = z.enum([
  "THUMBNAIL",
  "COVER_IMAGE",
  "AVATAR",
  "ICON",
  "GALLERY",
  "ATTACHMENT",
  "OTHER",
]);

const createAssetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  url: z.string().url(),
  key: z.string(),
  filename: z.string(),
  size: z.number().int().positive(),
  mimeType: z.string(),
  type: assetTypeSchema.optional().default("IMAGE"),
  category: assetCategorySchema.optional().default("OTHER"),
  alt: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const assetRouter = createTRPCRouter({
  // Create a new asset record
  create: adminProcedure
    .input(createAssetSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user exists in database before linking
      let uploadedById: string | null = null;
      if (ctx.userId) {
        const user = await prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { id: true },
        });
        if (user) {
          uploadedById = user.id;
        }
      }

      const asset = await prisma.asset.create({
        data: {
          ...input,
          uploadedById,
        },
      });
      return asset;
    }),

  // Get asset by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const asset = await prisma.asset.findUnique({
        where: { id: input.id },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      return asset;
    }),

  // Get asset by key (UploadThing key)
  getByKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const asset = await prisma.asset.findUnique({
        where: { key: input.key },
      });
      return asset;
    }),

  // Get all assets (for admin panel)
  getAll: adminProcedure.query(async () => {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    return assets;
  }),

  // Get asset count
  count: adminProcedure.query(async () => {
    const count = await prisma.asset.count();
    return count;
  }),

  // List assets with pagination and filtering
  list: adminProcedure
    .input(
      z.object({
        type: assetTypeSchema.optional(),
        category: assetCategorySchema.optional(),
        search: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { type, category, search, limit, cursor } = input;

      const assets = await prisma.asset.findMany({
        where: {
          ...(type && { type }),
          ...(category && { category }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { title: { contains: search, mode: "insensitive" } },
              { filename: { contains: search, mode: "insensitive" } },
              { alt: { contains: search, mode: "insensitive" } },
              { caption: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (assets.length > limit) {
        const nextItem = assets.pop();
        nextCursor = nextItem?.id;
      }

      return {
        assets,
        nextCursor,
      };
    }),

  // Update asset metadata
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        title: z.string().optional().nullable(),
        alt: z.string().optional().nullable(),
        caption: z.string().optional().nullable(),
        category: assetCategorySchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const asset = await prisma.asset.update({
        where: { id },
        data,
      });
      return asset;
    }),

  // Delete asset
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Get the asset first to get the key for UploadThing deletion
      const asset = await prisma.asset.findUnique({
        where: { id: input.id },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      // Delete from database first
      await prisma.asset.delete({
        where: { id: input.id },
      });

      // Delete from UploadThing
      try {
        await utapi.deleteFiles(asset.key);
      } catch (error) {
        console.error("Failed to delete file from UploadThing:", error);
        // Don't throw - the DB record is already deleted
      }

      return { success: true };
    }),

  // Delete asset by key
  deleteByKey: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const asset = await prisma.asset.findUnique({
        where: { key: input.key },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      // Delete from database first
      await prisma.asset.delete({
        where: { key: input.key },
      });

      // Delete from UploadThing
      try {
        await utapi.deleteFiles(input.key);
      } catch (error) {
        console.error("Failed to delete file from UploadThing:", error);
        // Don't throw - the DB record is already deleted
      }

      return { success: true };
    }),

  // Bulk delete assets
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      // Get all assets to get their keys
      const assets = await prisma.asset.findMany({
        where: { id: { in: input.ids } },
        select: { id: true, key: true },
      });

      if (assets.length === 0) {
        return { success: true, deleted: 0 };
      }

      // Delete from database
      await prisma.asset.deleteMany({
        where: { id: { in: input.ids } },
      });

      // Delete from UploadThing
      const keys = assets.map((a) => a.key);
      try {
        await utapi.deleteFiles(keys);
      } catch (error) {
        console.error("Failed to delete files from UploadThing:", error);
      }

      return { success: true, deleted: assets.length };
    }),
});
