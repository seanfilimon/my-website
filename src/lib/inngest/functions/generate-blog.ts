/**
 * Blog Generation Inngest Function
 * Orchestrates the multi-agent pipeline for blog post generation
 * 
 * NOTE: AgentKit networks use Inngest steps internally, so we can't wrap
 * them in step.run(). Instead, we run the network directly and use steps
 * only for database operations.
 */
import { inngest } from "../client";
import {
  createBlogNetwork,
  initializeContentState,
  buildContentPrompt,
} from "../networks";
import { db } from "@/src/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import type { BlogGenerationRequest } from "../events/content";

/**
 * Find or resolve the author from Clerk userId to database user
 * Clerk userIds (user_xxx) don't match database cuids
 */
async function resolveAuthor(clerkUserId: string) {
  console.log(`[resolveAuthor] Resolving author for Clerk user: ${clerkUserId}`);
  
  // First, try direct ID match (in case they're the same)
  let author = await db.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, name: true, email: true },
  });

  if (author) {
    console.log(`[resolveAuthor] Found by direct ID match: ${author.id}`);
    return author;
  }

  // Try to get the user's email from Clerk and find by email
  try {
    console.log(`[resolveAuthor] Fetching user from Clerk API...`);
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    console.log(`[resolveAuthor] Clerk user email: ${email}`);

    if (email) {
      author = await db.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });

      if (author) {
        console.log(`[resolveAuthor] Found by email: ${author.id}`);
        return author;
      }

      // Create the user if they don't exist
      console.log(`[resolveAuthor] Creating new user for email: ${email}`);
      author = await db.user.create({
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

      console.log(`[resolveAuthor] Created new user: ${author.id}`);
      return author;
    }
  } catch (error) {
    console.error("[resolveAuthor] Failed to resolve author from Clerk:", error);
  }

  // Fallback: use the first admin/author user
  console.log(`[resolveAuthor] Falling back to first admin/author user...`);
  author = await db.user.findFirst({
    where: {
      role: { in: ["ADMIN", "AUTHOR"] },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true },
  });

  if (author) {
    console.log(`[resolveAuthor] Using fallback author: ${author.id} (${author.email})`);
    return author;
  }

  // Last resort: create a system user
  console.log(`[resolveAuthor] No users found, creating system user...`);
  author = await db.user.create({
    data: {
      email: "system@seanfilimon.com",
      name: "System",
      role: "ADMIN",
    },
    select: { id: true, name: true, email: true },
  });

  console.log(`[resolveAuthor] Created system user: ${author.id}`);
  return author;
}

/**
 * Generate a blog post using the multi-agent content network
 */
export const generateBlog = inngest.createFunction(
  {
    id: "generate-blog",
    name: "Generate Blog Post",
    concurrency: {
      limit: 5,
    },
    retries: 1,
  },
  { event: "content/blog.generate" },
  async ({ event, step }) => {
    const data = event.data as BlogGenerationRequest;
    console.log(`[generate-blog] Starting blog generation for topic: ${data.topic}`);

    // Step 1: Validate request and resolve author (DB operations only)
    const validation = await step.run("validate-request", async () => {
      const author = await resolveAuthor(data.userId);

      let resource = null;
      if (data.resourceId) {
        resource = await db.resource.findUnique({
          where: { id: data.resourceId },
          select: { id: true, name: true, slug: true },
        });
        if (!resource) {
          throw new Error(`Resource not found: ${data.resourceId}`);
        }
      }

      let category = null;
      if (data.categoryId) {
        category = await db.contentCategory.findUnique({
          where: { id: data.categoryId },
          select: { id: true, name: true, slug: true },
        });
        if (!category) {
          throw new Error(`Category not found: ${data.categoryId}`);
        }
      }

      return { author, resource, category };
    });

    // Step 2: Generate content using AI (NOT in a step - AgentKit uses steps internally)
    // We run this directly without wrapping in step.run()
    console.log(`[generate-blog] Running content generation network...`);
    const startTime = Date.now();

    const network = createBlogNetwork();
    
    const initialState = initializeContentState("blog", {
      topic: data.topic,
      instructions: data.instructions,
      audience: data.audience,
      tone: data.tone,
      wordCount: data.wordCount,
      authorId: validation.author.id,
      resourceId: data.resourceId,
      categoryId: data.categoryId,
    });

    const prompt = buildContentPrompt("blog", {
      topic: data.topic,
      instructions: data.instructions,
      audience: data.audience,
      tone: data.tone,
      wordCount: data.wordCount,
      resourceId: data.resourceId,
      categoryId: data.categoryId,
    });

    const result = await network.run(prompt, { state: initialState });
    const state = result.state.kv;

    console.log(`[generate-blog] Network completed in ${Date.now() - startTime}ms`);

    const generationResult = {
      title: (state.get("title") as string) || data.topic,
      slug: (state.get("slug") as string) || undefined,
      excerpt: (state.get("excerpt") as string) || `A blog post about ${data.topic}`,
      content: (state.get("content") as string) || "",
      readTime: (state.get("readTime") as string) || "5 min read",
      metaTitle: (state.get("metaTitle") as string) || undefined,
      metaDescription: (state.get("metaDescription") as string) || undefined,
      tags: (state.get("tags") as string[]) || [],
    };

    // Step 3: Save to database
    const savedBlog = await step.run("save-blog", async () => {
      const titleForSlug = generationResult.title || data.topic;
      const slug = generationResult.slug || titleForSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existing = await db.blog.findUnique({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const tags = generationResult.tags;
      const blog = await db.blog.create({
        data: {
          title: generationResult.title,
          slug: finalSlug,
          excerpt: generationResult.excerpt,
          content: generationResult.content,
          authorId: validation.author.id,
          resourceId: data.resourceId || null,
          categoryId: data.categoryId || null,
          metaTitle: generationResult.metaTitle || null,
          metaDescription: generationResult.metaDescription || null,
          readTime: generationResult.readTime,
          status: "DRAFT",
          tags: tags && tags.length > 0
            ? {
                connectOrCreate: tags.map((tag: string) => ({
                  where: { name: tag },
                  create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, "-") },
                })),
              }
            : undefined,
        },
      });

      if (data.resourceId) {
        await db.resource.update({
          where: { id: data.resourceId },
          data: { blogCount: { increment: 1 } },
        });
      }

      return blog;
    });

    // Step 4: Send completion event
    await step.sendEvent("send-completion-event", {
      name: "content/blog.generated",
      data: {
        contentId: savedBlog.id,
        contentType: "blog" as const,
        title: savedBlog.title,
        slug: savedBlog.slug,
        status: savedBlog.status,
      },
    });

    console.log(`[generate-blog] Blog saved: ${savedBlog.id} - ${savedBlog.title}`);

    return {
      success: true,
      blogId: savedBlog.id,
      title: savedBlog.title,
      slug: savedBlog.slug,
      status: savedBlog.status,
    };
  }
);

export default generateBlog;
