import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "../init";
import { db } from "@/src/lib/db";

// Input validation schemas
const resourceCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  icon: z.string().optional().default("📦"),
  iconUrl: z.string().url().optional().nullable(),
  color: z.string().optional().default("#6366f1"),
  description: z.string().min(1),
  typeId: z.string().optional(),
  categoryId: z.string().optional(),
  officialUrl: z.string().url().optional().or(z.literal("")).nullable(),
  docsUrl: z.string().url().optional().or(z.literal("")).nullable(),
  githubUrl: z.string().url().optional().or(z.literal("")).nullable(),
  featured: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
  // OG Image Styling
  ogBackgroundColor: z.string().optional().nullable(),
  ogBorderColor: z.string().optional().nullable(),
  ogTextPrimary: z.string().optional().nullable(),
  ogTextSecondary: z.string().optional().nullable(),
  ogAccentStart: z.string().optional().nullable(),
  ogAccentEnd: z.string().optional().nullable(),
  ogResourceBgColor: z.string().optional().nullable(),
  ogFontWeight: z.number().min(400).max(700).optional().nullable(),
  ogBorderWidth: z.number().min(1).max(5).optional().nullable(),
});

const resourceUpdateSchema = resourceCreateSchema.partial().extend({
  id: z.string(),
});

const resourceListSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  typeId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  orderBy: z.enum(["name", "createdAt", "articleCount", "blogCount", "courseCount", "videoCount"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

const resourceTypeCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

const resourceCategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const resourceRouter = createTRPCRouter({
  // ==================== RESOURCES ====================

  // List resources with pagination and filters
  list: publicProcedure
    .input(resourceListSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, orderBy, order, search, ...filters } = input;

      const where: any = {};
      
      if (filters.typeId) where.typeId = filters.typeId;
      if (filters.categoryId) where.categoryId = filters.categoryId;
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const resources = await db.resource.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [orderBy]: order },
        include: {
          type: true,
          category: true,
          tags: true,
        },
      });

      let nextCursor: string | undefined;
      if (resources.length > limit) {
        const nextItem = resources.pop();
        nextCursor = nextItem?.id;
      }

      return {
        resources,
        nextCursor,
      };
    }),

  // Get all resources (no pagination, for dropdowns)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return db.resource.findMany({
      orderBy: { name: "asc" },
      include: {
        type: true,
        category: true,
      },
    });
  }),

  // Get single resource by ID
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const resource = await db.resource.findUnique({
        where: { id: input.id },
        include: {
          type: true,
          category: true,
          tags: true,
          articles: {
            where: { status: "PUBLISHED" },
            take: 5,
            orderBy: { publishedAt: "desc" },
          },
          blogs: {
            where: { status: "PUBLISHED" },
            take: 5,
            orderBy: { publishedAt: "desc" },
          },
          courses: {
            where: { status: "PUBLISHED" },
            take: 5,
            orderBy: { publishedAt: "desc" },
          },
          videos: {
            where: { status: "PUBLISHED" },
            take: 5,
            orderBy: { publishedAt: "desc" },
          },
        },
      });

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      return resource;
    }),

  // Get single resource by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const resource = await db.resource.findUnique({
        where: { slug: input.slug },
        include: {
          type: true,
          category: true,
          tags: true,
          articles: {
            where: { status: "PUBLISHED" },
            take: 5,
            orderBy: { publishedAt: "desc" },
          },
          blogs: {
            where: { status: "PUBLISHED" },
            take: 5,
            orderBy: { publishedAt: "desc" },
          },
          courses: {
            where: { status: "PUBLISHED" },
            take: 5,
            orderBy: { publishedAt: "desc" },
          },
          videos: {
            where: { status: "PUBLISHED" },
            take: 5,
            orderBy: { publishedAt: "desc" },
          },
        },
      });

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      return resource;
    }),

  // Create resource
  create: adminProcedure
    .input(resourceCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { tags, ...data } = input;

      // Generate slug if not provided
      const slug = data.slug || data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check for existing slug
      const existing = await db.resource.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A resource with this slug already exists",
        });
      }

      const { typeId, categoryId, ...restData } = data;
      
      // Get or create default type if not provided
      let finalTypeId = typeId;
      if (!finalTypeId) {
        // Try to find existing type first
        let defaultType = await db.resourceType.findFirst({
          where: { slug: "tool" },
        });
        // Create if not found
        if (!defaultType) {
          defaultType = await db.resourceType.create({
            data: { name: "Tool", slug: "tool", description: "General tools and utilities" },
          });
        }
        finalTypeId = defaultType.id;
      }
      
      // Get or create default category if not provided
      let finalCategoryId = categoryId;
      if (!finalCategoryId) {
        // Try to find existing category first
        let defaultCategory = await db.resourceCategory.findFirst({
          where: { slug: "general" },
        });
        // Create if not found
        if (!defaultCategory) {
          defaultCategory = await db.resourceCategory.create({
            data: { name: "General", slug: "general", description: "General resources" },
          });
        }
        finalCategoryId = defaultCategory.id;
      }
      
      const resource = await db.resource.create({
        data: {
          ...restData,
          slug,
          type: { connect: { id: finalTypeId } },
          category: { connect: { id: finalCategoryId } },
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
          type: true,
          category: true,
          tags: true,
        },
      });

      return resource;
    }),

  // Update resource
  update: adminProcedure
    .input(resourceUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tags, ...data } = input;

      const existing = await db.resource.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      const { typeId, categoryId, ...restData } = data;
      
      const resource = await db.resource.update({
        where: { id },
        data: {
          ...restData,
          ...(typeId && { type: { connect: { id: typeId } } }),
          ...(categoryId && { category: { connect: { id: categoryId } } }),
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
          type: true,
          category: true,
          tags: true,
        },
      });

      return resource;
    }),

  // Delete resource
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.resource.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { articles: true, blogs: true, courses: true, videos: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      const totalContent =
        existing._count.articles +
        existing._count.blogs +
        existing._count.courses +
        existing._count.videos;

      if (totalContent > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete resource with ${totalContent} associated content items`,
        });
      }

      await db.resource.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get tags
  getTags: publicProcedure.query(async ({ ctx }) => {
    return db.resourceTag.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // Get all resources with content counts (for resources grid)
  getAllWithCounts: publicProcedure.query(async ({ ctx }) => {
    const resources = await db.resource.findMany({
      orderBy: { name: "asc" },
      include: {
        type: true,
        category: true,
        tags: {
          select: {
            name: true,
            slug: true,
          },
        },
        articles: {
          where: { status: "PUBLISHED" },
          select: { id: true },
        },
        blogs: {
          where: { status: "PUBLISHED" },
          select: { id: true },
        },
        courses: {
          where: { status: "PUBLISHED" },
          select: { id: true },
        },
        videos: {
          where: { status: "PUBLISHED" },
          select: { id: true },
        },
      },
    });

    return resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      slug: resource.slug,
      icon: resource.icon,
      iconUrl: resource.iconUrl,
      color: resource.color,
      description: resource.description,
      type: {
        id: resource.type.id,
        name: resource.type.name,
        slug: resource.type.slug,
      },
      category: {
        id: resource.category.id,
        name: resource.category.name,
        slug: resource.category.slug,
      },
      officialUrl: resource.officialUrl,
      docsUrl: resource.docsUrl,
      githubUrl: resource.githubUrl,
      featured: resource.featured,
      articleCount: resource.articles.length,
      blogCount: resource.blogs.length,
      courseCount: resource.courses.length,
      videoCount: resource.videos.length,
      totalContent:
        resource.articles.length +
        resource.blogs.length +
        resource.courses.length +
        resource.videos.length,
      tags: resource.tags,
    }));
  }),

  // Get resources formatted for sidebar navigation
  getForSidebar: publicProcedure.query(async ({ ctx }) => {
    // Fetch categories ordered by their order field
    const categories = await db.resourceCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
      },
    });

    const resources = await db.resource.findMany({
      orderBy: { name: "asc" },
      include: {
        category: true,
        _count: {
          select: {
            articles: true,
            blogs: true,
            courses: true,
            videos: true,
          },
        },
      },
    });

    // Create a map of category order for sorting
    const categoryOrderMap = new Map<string, number>();
    categories.forEach((cat, index) => {
      categoryOrderMap.set(cat.name, cat.order ?? index);
    });

    // Group resources by category
    const categoryMap = new Map<
      string,
      {
        category: string;
        categorySlug: string;
        categoryOrder: number;
        items: Array<{
          id: string;
          name: string;
          logo: string;
          logoUrl: string | null;
          color: string;
          tutorials: number;
          guides: number;
          articles: number;
          href: string;
        }>;
      }
    >();

    for (const resource of resources) {
      const categoryName = resource.category.name;
      const categorySlug = resource.category.slug;

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          category: categoryName,
          categorySlug: categorySlug,
          categoryOrder: categoryOrderMap.get(categoryName) ?? 999,
          items: [],
        });
      }

      categoryMap.get(categoryName)!.items.push({
        id: resource.slug,
        name: resource.name,
        logo: resource.icon,
        logoUrl: resource.iconUrl,
        color: resource.color,
        tutorials: resource._count.courses,
        guides: resource._count.videos,
        articles: resource._count.articles + resource._count.blogs,
        href: `/resources/${resource.slug}`,
      });
    }

    // Sort categories by order and return without the order field
    return Array.from(categoryMap.values())
      .sort((a, b) => a.categoryOrder - b.categoryOrder)
      .map(({ categoryOrder, ...rest }) => rest);
  }),

  // ==================== RESOURCE TYPES ====================

  // List types
  listTypes: publicProcedure.query(async ({ ctx }) => {
    return db.resourceType.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { resources: true },
        },
      },
    });
  }),

  // Get type by ID
  getTypeById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const type = await db.resourceType.findUnique({
        where: { id: input.id },
        include: {
          resources: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!type) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource type not found",
        });
      }

      return type;
    }),

  // Create type
  createType: adminProcedure
    .input(resourceTypeCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug || input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existing = await db.resourceType.findFirst({
        where: { OR: [{ name: input.name }, { slug }] },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A type with this name or slug already exists",
        });
      }

      return db.resourceType.create({
        data: { ...input, slug },
      });
    }),

  // Update type
  updateType: adminProcedure
    .input(resourceTypeCreateSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return db.resourceType.update({
        where: { id },
        data,
      });
    }),

  // Delete type
  deleteType: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const type = await db.resourceType.findUnique({
        where: { id: input.id },
        include: { _count: { select: { resources: true } } },
      });

      if (!type) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource type not found",
        });
      }

      if (type._count.resources > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete type with ${type._count.resources} resources`,
        });
      }

      await db.resourceType.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // ==================== RESOURCE CATEGORIES ====================

  // List categories
  listCategories: publicProcedure.query(async ({ ctx }) => {
    return db.resourceCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { resources: true },
        },
      },
    });
  }),

  // Get category by ID
  getCategoryById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await db.resourceCategory.findUnique({
        where: { id: input.id },
        include: {
          resources: {
            include: {
              type: true,
            },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource category not found",
        });
      }

      return category;
    }),

  // Create category
  createCategory: adminProcedure
    .input(resourceCategoryCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug || input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existing = await db.resourceCategory.findFirst({
        where: { OR: [{ name: input.name }, { slug }] },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this name or slug already exists",
        });
      }

      return db.resourceCategory.create({
        data: { ...input, slug },
      });
    }),

  // Update category
  updateCategory: adminProcedure
    .input(resourceCategoryCreateSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return db.resourceCategory.update({
        where: { id },
        data,
      });
    }),

  // Delete category
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await db.resourceCategory.findUnique({
        where: { id: input.id },
        include: { _count: { select: { resources: true } } },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource category not found",
        });
      }

      if (category._count.resources > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete category with ${category._count.resources} resources`,
        });
      }

      await db.resourceCategory.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // ==================== CONTENT CATEGORIES ====================

  // List content categories
  listContentCategories: publicProcedure.query(async ({ ctx }) => {
    return db.contentCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { articles: true, blogs: true },
        },
      },
    });
  }),

  // Create content category
  createContentCategory: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      slug: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug || input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existing = await db.contentCategory.findFirst({
        where: { OR: [{ name: input.name }, { slug }] },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A content category with this name or slug already exists",
        });
      }

      return db.contentCategory.create({
        data: { ...input, slug },
      });
    }),

  // Update content category
  updateContentCategory: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      slug: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return db.contentCategory.update({
        where: { id },
        data,
      });
    }),

  // Delete content category
  deleteContentCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await db.contentCategory.findUnique({
        where: { id: input.id },
        include: { _count: { select: { articles: true, blogs: true } } },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Content category not found",
        });
      }

      const totalContent = category._count.articles + category._count.blogs;

      if (totalContent > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete category with ${totalContent} content items`,
        });
      }

      await db.contentCategory.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // ==================== REORDER ====================

  // Reorder resource types
  reorderTypes: adminProcedure
    .input(z.object({
      items: z.array(z.object({ id: z.string(), order: z.number() }))
    }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.items.map(item =>
          db.resourceType.update({
            where: { id: item.id },
            data: { order: item.order }
          })
        )
      );
      return { success: true };
    }),

  // Reorder resource categories
  reorderCategories: adminProcedure
    .input(z.object({
      items: z.array(z.object({ id: z.string(), order: z.number() }))
    }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.items.map(item =>
          db.resourceCategory.update({
            where: { id: item.id },
            data: { order: item.order }
          })
        )
      );
      return { success: true };
    }),

  // Reorder content categories
  reorderContentCategories: adminProcedure
    .input(z.object({
      items: z.array(z.object({ id: z.string(), order: z.number() }))
    }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.items.map(item =>
          db.contentCategory.update({
            where: { id: item.id },
            data: { order: item.order }
          })
        )
      );
      return { success: true };
    }),
});

