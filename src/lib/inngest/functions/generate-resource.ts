/**
 * Resource Generation Inngest Function
 * Orchestrates the multi-agent pipeline for resource description generation
 */
import { inngest } from "../client";
import {
  createResourceNetwork,
  initializeContentState,
} from "../networks";
import { db } from "@/src/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import type { ResourceGenerationRequest } from "../events/content";

/**
 * Find or resolve the user from Clerk userId to database user
 * Clerk userIds (user_xxx) don't match database cuids
 */
async function resolveUser(clerkUserId: string) {
  // First, try direct ID match (in case they're the same)
  let user = await db.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, name: true, email: true },
  });

  if (user) return user;

  // Try to get the user's email from Clerk and find by email
  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    if (email) {
      user = await db.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });

      if (user) return user;

      // Create the user if they don't exist
      user = await db.user.create({
        data: {
          email,
          name: clerkUser.firstName 
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : email.split("@")[0],
          image: clerkUser.imageUrl,
          role: "AUTHOR",
        },
        select: { id: true, name: true, email: true },
      });

      return user;
    }
  } catch (error) {
    console.error("Failed to resolve user from Clerk:", error);
  }

  // Fallback: use the first admin/author user
  user = await db.user.findFirst({
    where: {
      role: { in: ["ADMIN", "AUTHOR"] },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true },
  });

  if (user) return user;

  // Last resort: create a system user
  user = await db.user.create({
    data: {
      email: "system@seanfilimon.com",
      name: "System",
      role: "ADMIN",
    },
    select: { id: true, name: true, email: true },
  });

  return user;
}

/**
 * Generate a resource entry using the multi-agent content network
 */
export const generateResource = inngest.createFunction(
  {
    id: "generate-resource",
    name: "Generate Resource",
    concurrency: {
      limit: 3, // Limit concurrent resource generations
    },
    retries: 2,
  },
  { event: "content/resource.generate" },
  async ({ event, step }) => {
    const data = event.data as ResourceGenerationRequest;

    // Step 1: Validate the request and check for duplicates
    const validation = await step.run("validate-request", async () => {
      // Resolve user from Clerk userId to database user
      const user = await resolveUser(data.userId);

      // Generate slug from name
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check for existing resource with same name or slug
      const existing = await db.resource.findFirst({
        where: {
          OR: [{ name: data.name }, { slug }],
        },
      });

      if (existing) {
        throw new Error(
          `Resource already exists: ${existing.name} (${existing.slug})`
        );
      }

      // Get or verify type
      let type = null;
      if (data.typeId) {
        type = await db.resourceType.findUnique({
          where: { id: data.typeId },
          select: { id: true, name: true, slug: true },
        });

        if (!type) {
          throw new Error(`Resource type not found: ${data.typeId}`);
        }
      }

      // Get or verify category
      let category = null;
      if (data.categoryId) {
        category = await db.resourceCategory.findUnique({
          where: { id: data.categoryId },
          select: { id: true, name: true, slug: true },
        });

        if (!category) {
          throw new Error(`Resource category not found: ${data.categoryId}`);
        }
      }

      return {
        user,
        slug,
        type,
        category,
        valid: true,
      };
    });

    // Step 2: Run the content generation network for description
    // IMPORTANT: Run network.run() OUTSIDE of step.run() to avoid nested Inngest steps
    // AgentKit internally uses Inngest steps, so wrapping it causes NESTING_STEPS errors
    
    // Create the resource generation network (simpler pipeline)
    const network = createResourceNetwork();

    // Build the prompt for resource description generation
    const prompt = [
      `Generate a comprehensive description for a resource/tool called "${data.name}".`,
      data.description
        ? `Initial description: ${data.description}`
        : null,
      data.officialUrl
        ? `Official website: ${data.officialUrl}`
        : null,
      data.docsUrl ? `Documentation: ${data.docsUrl}` : null,
      data.githubUrl ? `GitHub: ${data.githubUrl}` : null,
      validation.type
        ? `Resource type: ${validation.type.name}`
        : null,
      validation.category
        ? `Category: ${validation.category.name}`
        : null,
      "",
      "Please research this resource and generate:",
      "1. A comprehensive description (2-3 paragraphs)",
      "2. Key features and use cases",
      "3. Suggested tags/keywords",
      "4. An appropriate emoji icon",
      "5. A suggested color (hex code) that matches the resource's branding",
    ]
      .filter(Boolean)
      .join("\n");

    // Initialize state
    const initialState = initializeContentState("resource", {
      topic: data.name,
      instructions: data.description,
    });

    // Run the network directly (NOT inside step.run)
    const result = await network.run(prompt, {
      state: initialState,
    });

    // Extract results from network state
    const state = result.state.kv;

    const generationResult = {
      description: (state.get("content") as string) || undefined,
      icon: (state.get("icon") as string) || undefined,
      color: (state.get("color") as string) || undefined,
      tags: (state.get("tags") as string[]) || undefined,
      // Resource-specific URLs discovered by research agent
      officialUrl: (state.get("officialUrl") as string) || undefined,
      docsUrl: (state.get("docsUrl") as string) || undefined,
      githubUrl: (state.get("githubUrl") as string) || undefined,
    };

    // Step 3: Save the resource to the database
    const savedResource = await step.run("save-resource", async () => {
      // Get or create default type if not provided
      let finalTypeId = data.typeId;
      if (!finalTypeId) {
        let defaultType = await db.resourceType.findFirst({
          where: { slug: "tool" },
        });
        if (!defaultType) {
          defaultType = await db.resourceType.create({
            data: {
              name: "Tool",
              slug: "tool",
              description: "General tools and utilities",
            },
          });
        }
        finalTypeId = defaultType.id;
      }

      // Get or create default category if not provided
      let finalCategoryId = data.categoryId;
      if (!finalCategoryId) {
        let defaultCategory = await db.resourceCategory.findFirst({
          where: { slug: "general" },
        });
        if (!defaultCategory) {
          defaultCategory = await db.resourceCategory.create({
            data: {
              name: "General",
              slug: "general",
              description: "General resources",
            },
          });
        }
        finalCategoryId = defaultCategory.id;
      }

      // Create the resource
      // Use user-provided URLs first, then fall back to AI-discovered URLs
      const tags = generationResult.tags;
      const resource = await db.resource.create({
        data: {
          name: data.name,
          slug: validation.slug,
          description:
            generationResult.description ||
            data.description ||
            `${data.name} is a tool/resource.`,
          icon: generationResult.icon || "📦",
          color: generationResult.color || "#6366f1",
          // Prefer user-provided URLs, fall back to AI-discovered URLs
          officialUrl: data.officialUrl || generationResult.officialUrl || null,
          docsUrl: data.docsUrl || generationResult.docsUrl || null,
          githubUrl: data.githubUrl || generationResult.githubUrl || null,
          type: { connect: { id: finalTypeId } },
          category: { connect: { id: finalCategoryId } },
          tags: tags && tags.length > 0
            ? {
                connectOrCreate: tags.map((tag: string) => ({
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
    });

    // Step 4: Send completion event
    await step.sendEvent("send-completion-event", {
      name: "content/resource.generated",
      data: {
        contentId: savedResource.id,
        contentType: "resource" as const,
        title: savedResource.name,
        slug: savedResource.slug,
        status: "DRAFT" as const,
      },
    });

    // Return the result
    return {
      success: true,
      resourceId: savedResource.id,
      name: savedResource.name,
      slug: savedResource.slug,
      description: savedResource.description,
      icon: savedResource.icon,
      color: savedResource.color,
      typeId: savedResource.typeId,
      categoryId: savedResource.categoryId,
    };
  }
);

export default generateResource;
