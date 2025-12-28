/**
 * Database tools for AgentKit agents
 * Provides CRUD operations via Prisma for content generation
 */
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { db } from "@/src/lib/db";

/**
 * Create a blog draft in the database
 */
export const createBlogTool = createTool({
  name: "createBlog",
  description:
    "Create a new blog post draft in the database. Use this after generating blog content to save it.",
  parameters: z.object({
    title: z.string().describe("The title of the blog post"),
    slug: z.string().describe("URL-friendly slug for the blog post"),
    excerpt: z.string().describe("A brief summary/excerpt of the blog post"),
    content: z.string().describe("The full MDX content of the blog post"),
    authorId: z.string().describe("The ID of the author"),
    resourceId: z.string().optional().describe("Optional resource ID to associate with"),
    categoryId: z.string().optional().describe("Optional content category ID"),
    metaTitle: z.string().optional().describe("SEO meta title"),
    metaDescription: z.string().optional().describe("SEO meta description"),
    readTime: z.string().default("5 min read").describe("Estimated read time"),
    tags: z.array(z.string()).optional().describe("Tags for the blog post"),
  }),
  handler: async (input, { network }) => {
    const { tags, ...data } = input;

    const blog = await db.blog.create({
      data: {
        ...data,
        status: "DRAFT",
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
        author: { select: { id: true, name: true } },
        resource: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: true,
      },
    });

    // Update network state
    network?.state.kv.set("blogId", blog.id);
    network?.state.kv.set("contentCreated", true);

    return {
      success: true,
      blogId: blog.id,
      title: blog.title,
      slug: blog.slug,
      status: blog.status,
    };
  },
});

/**
 * Create an article draft in the database
 */
export const createArticleTool = createTool({
  name: "createArticle",
  description:
    "Create a new article draft in the database. Use this after generating article content to save it.",
  parameters: z.object({
    title: z.string().describe("The title of the article"),
    slug: z.string().describe("URL-friendly slug for the article"),
    excerpt: z.string().describe("A brief summary/excerpt of the article"),
    content: z.string().describe("The full MDX content of the article"),
    authorId: z.string().describe("The ID of the author"),
    resourceId: z.string().describe("Resource ID to associate with (required)"),
    categoryId: z.string().describe("Content category ID (required)"),
    difficulty: z
      .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
      .default("INTERMEDIATE")
      .describe("Difficulty level of the article"),
    metaTitle: z.string().optional().describe("SEO meta title"),
    metaDescription: z.string().optional().describe("SEO meta description"),
    readTime: z.string().default("5 min read").describe("Estimated read time"),
    tags: z.array(z.string()).optional().describe("Tags for the article"),
  }),
  handler: async (input, { network }) => {
    const { tags, ...data } = input;

    const article = await db.article.create({
      data: {
        ...data,
        status: "DRAFT",
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
        author: { select: { id: true, name: true } },
        resource: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: true,
      },
    });

    // Update resource article count
    await db.resource.update({
      where: { id: data.resourceId },
      data: { articleCount: { increment: 1 } },
    });

    // Update network state
    network?.state.kv.set("articleId", article.id);
    network?.state.kv.set("contentCreated", true);

    return {
      success: true,
      articleId: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
    };
  },
});

/**
 * Update existing content (blog or article)
 */
export const updateContentTool = createTool({
  name: "updateContent",
  description:
    "Update an existing blog or article with refined content. Use this after editing or SEO optimization.",
  parameters: z.object({
    contentType: z.enum(["blog", "article"]).describe("Type of content to update"),
    contentId: z.string().describe("ID of the content to update"),
    title: z.string().optional().describe("Updated title"),
    excerpt: z.string().optional().describe("Updated excerpt"),
    content: z.string().optional().describe("Updated MDX content"),
    metaTitle: z.string().optional().describe("Updated SEO meta title"),
    metaDescription: z.string().optional().describe("Updated SEO meta description"),
    tags: z.array(z.string()).optional().describe("Updated tags"),
  }),
  handler: async (input, { network }) => {
    const { contentType, contentId, tags, ...data } = input;

    if (contentType === "blog") {
      const blog = await db.blog.update({
        where: { id: contentId },
        data: {
          ...data,
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
      });

      return {
        success: true,
        contentId: blog.id,
        contentType: "blog",
        title: blog.title,
      };
    } else {
      const article = await db.article.update({
        where: { id: contentId },
        data: {
          ...data,
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
      });

      return {
        success: true,
        contentId: article.id,
        contentType: "article",
        title: article.title,
      };
    }
  },
});

/**
 * Get available resources for context
 */
export const getResourcesTool = createTool({
  name: "getResources",
  description:
    "Fetch available resources (frameworks, libraries, tools) from the database. Use this to understand what resources exist for content association.",
  parameters: z.object({
    search: z.string().optional().describe("Optional search term to filter resources"),
    categoryId: z.string().optional().describe("Filter by category ID"),
    limit: z.number().default(20).describe("Maximum number of resources to return"),
  }),
  handler: async (input) => {
    const where: Record<string, unknown> = {};

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
      ];
    }

    if (input.categoryId) {
      where.categoryId = input.categoryId;
    }

    const resources = await db.resource.findMany({
      where,
      take: input.limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        officialUrl: true,
        docsUrl: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        type: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return {
      resources,
      count: resources.length,
    };
  },
});

/**
 * Get content categories
 */
export const getCategoriesTool = createTool({
  name: "getCategories",
  description:
    "Fetch available content categories from the database. Use this to understand what categories exist for content classification.",
  parameters: z.object({
    type: z
      .enum(["content", "resource"])
      .default("content")
      .describe("Type of categories to fetch"),
  }),
  handler: async (input) => {
    if (input.type === "content") {
      const categories = await db.contentCategory.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
        },
      });

      return { categories, type: "content" };
    } else {
      const categories = await db.resourceCategory.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
        },
      });

      return { categories, type: "resource" };
    }
  },
});

/**
 * Create a new resource
 */
export const createResourceTool = createTool({
  name: "createResource",
  description:
    "Create a new resource (framework, library, tool) in the database.",
  parameters: z.object({
    name: z.string().describe("Name of the resource"),
    slug: z.string().describe("URL-friendly slug"),
    description: z.string().describe("Description of the resource"),
    icon: z.string().default("📦").describe("Emoji or text icon"),
    color: z.string().default("#6366f1").describe("Color hex code"),
    typeId: z.string().optional().describe("Resource type ID"),
    categoryId: z.string().optional().describe("Resource category ID"),
    officialUrl: z.string().optional().describe("Official website URL"),
    docsUrl: z.string().optional().describe("Documentation URL"),
    githubUrl: z.string().optional().describe("GitHub repository URL"),
    tags: z.array(z.string()).optional().describe("Tags for the resource"),
  }),
  handler: async (input, { network }) => {
    const { tags, typeId, categoryId, ...data } = input;

    // Get or create default type if not provided
    let finalTypeId = typeId;
    if (!finalTypeId) {
      let defaultType = await db.resourceType.findFirst({
        where: { slug: "tool" },
      });
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
      let defaultCategory = await db.resourceCategory.findFirst({
        where: { slug: "general" },
      });
      if (!defaultCategory) {
        defaultCategory = await db.resourceCategory.create({
          data: { name: "General", slug: "general", description: "General resources" },
        });
      }
      finalCategoryId = defaultCategory.id;
    }

    const resource = await db.resource.create({
      data: {
        ...data,
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

    // Update network state
    network?.state.kv.set("resourceId", resource.id);
    network?.state.kv.set("resourceCreated", true);

    return {
      success: true,
      resourceId: resource.id,
      name: resource.name,
      slug: resource.slug,
    };
  },
});

/**
 * Get a specific resource by ID or slug
 */
export const getResourceByIdTool = createTool({
  name: "getResourceById",
  description: "Fetch a specific resource by its ID or slug for detailed information.",
  parameters: z.object({
    id: z.string().optional().describe("Resource ID"),
    slug: z.string().optional().describe("Resource slug"),
  }),
  handler: async (input) => {
    const resource = await db.resource.findFirst({
      where: input.id ? { id: input.id } : { slug: input.slug },
      include: {
        type: true,
        category: true,
        tags: true,
      },
    });

    if (!resource) {
      return { found: false, resource: null };
    }

    return {
      found: true,
      resource: {
        id: resource.id,
        name: resource.name,
        slug: resource.slug,
        description: resource.description,
        icon: resource.icon,
        color: resource.color,
        officialUrl: resource.officialUrl,
        docsUrl: resource.docsUrl,
        githubUrl: resource.githubUrl,
        type: resource.type,
        category: resource.category,
        tags: resource.tags,
      },
    };
  },
});

// Export all database tools
export const databaseTools = [
  createBlogTool,
  createArticleTool,
  updateContentTool,
  getResourcesTool,
  getCategoriesTool,
  createResourceTool,
  getResourceByIdTool,
];
