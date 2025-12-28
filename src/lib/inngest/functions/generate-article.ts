/**
 * Article Generation Inngest Function
 * Orchestrates the multi-agent pipeline for technical article generation
 */
import { inngest } from "../client";
import {
  createArticleNetwork,
  initializeContentState,
  buildContentPrompt,
} from "../networks";
import { db } from "@/src/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import type { ArticleGenerationRequest } from "../events/content";

/**
 * Find or resolve the author from Clerk userId to database user
 * Clerk userIds (user_xxx) don't match database cuids
 */
async function resolveAuthor(clerkUserId: string) {
  // First, try direct ID match (in case they're the same)
  let author = await db.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, name: true, email: true },
  });

  if (author) return author;

  // Try to get the user's email from Clerk and find by email
  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    if (email) {
      author = await db.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });

      if (author) return author;

      // Create the user if they don't exist
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

      return author;
    }
  } catch (error) {
    console.error("Failed to resolve author from Clerk:", error);
  }

  // Fallback: use the first admin/author user
  author = await db.user.findFirst({
    where: {
      role: { in: ["ADMIN", "AUTHOR"] },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true },
  });

  if (author) return author;

  // Last resort: create a system user
  author = await db.user.create({
    data: {
      email: "system@seanfilimon.com",
      name: "System",
      role: "ADMIN",
    },
    select: { id: true, name: true, email: true },
  });

  return author;
}

/**
 * Generate a technical article using the multi-agent content network
 */
export const generateArticle = inngest.createFunction(
  {
    id: "generate-article",
    name: "Generate Technical Article",
    concurrency: {
      limit: 5, // Limit concurrent article generations
    },
    retries: 2,
  },
  { event: "content/article.generate" },
  async ({ event, step }) => {
    const data = event.data as ArticleGenerationRequest;

    // Step 1: Validate the request and resolve author
    const validation = await step.run("validate-request", async () => {
      // Resolve author from Clerk userId to database user
      const author = await resolveAuthor(data.userId);

      // Verify resource (required for articles)
      const resource = await db.resource.findUnique({
        where: { id: data.resourceId },
        select: { id: true, name: true, slug: true, description: true },
      });

      if (!resource) {
        throw new Error(`Resource not found: ${data.resourceId}`);
      }

      // Verify category (required for articles)
      const category = await db.contentCategory.findUnique({
        where: { id: data.categoryId },
        select: { id: true, name: true, slug: true },
      });

      if (!category) {
        throw new Error(`Category not found: ${data.categoryId}`);
      }

      return {
        author,
        resource,
        category,
        valid: true,
      };
    });

    // Step 2: Run the content generation network
    // IMPORTANT: Run network.run() OUTSIDE of step.run() to avoid nested Inngest steps
    // AgentKit internally uses Inngest steps, so wrapping it causes NESTING_STEPS errors
    
    // Create the article generation network
    const network = createArticleNetwork();

    // Build enhanced instructions with resource context
    const enhancedInstructions = [
      data.instructions,
      `This article is about ${validation.resource.name}.`,
      validation.resource.description
        ? `Resource description: ${validation.resource.description}`
        : null,
      `Category: ${validation.category.name}`,
      data.difficulty ? `Difficulty level: ${data.difficulty}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Initialize state with request data (use resolved author ID)
    const initialState = initializeContentState("article", {
      topic: data.topic,
      instructions: enhancedInstructions,
      audience: data.audience,
      tone: data.tone || "technical",
      wordCount: data.wordCount,
      authorId: validation.author.id, // Use resolved database user ID
      resourceId: data.resourceId,
      categoryId: data.categoryId,
      difficulty: data.difficulty,
    });

    // Build the initial prompt
    const prompt = buildContentPrompt("article", {
      topic: data.topic,
      instructions: enhancedInstructions,
      audience: data.audience,
      tone: data.tone || "technical",
      wordCount: data.wordCount,
      resourceId: data.resourceId,
      categoryId: data.categoryId,
    });

    // Run the network directly (NOT inside step.run)
    const result = await network.run(prompt, {
      state: initialState,
    });

    // Extract results from network state
    const state = result.state.kv;

    const generationResult = {
      title: state.get("title") as string | undefined,
      slug: state.get("slug") as string | undefined,
      excerpt: state.get("excerpt") as string | undefined,
      content: state.get("content") as string | undefined,
      readTime: state.get("readTime") as string | undefined,
      metaTitle: state.get("metaTitle") as string | undefined,
      metaDescription: state.get("metaDescription") as string | undefined,
      tags: state.get("tags") as string[] | undefined,
    };

    // Step 3: Save the article to the database
    const savedArticle = await step.run("save-article", async () => {
      // Generate slug if not provided
      const slug =
        generationResult.slug ||
        (generationResult.title || data.topic)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      // Check for existing slug
      const existing = await db.article.findUnique({
        where: { slug },
      });

      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      // Create the article using the resolved author ID from validation
      const article = await db.article.create({
        data: {
          title: generationResult.title || data.topic,
          slug: finalSlug,
          excerpt:
            generationResult.excerpt ||
            `A technical article about ${data.topic}`,
          content: generationResult.content || "",
          authorId: validation.author.id, // Use resolved database user ID
          resourceId: data.resourceId,
          categoryId: data.categoryId,
          difficulty: data.difficulty || "INTERMEDIATE",
          metaTitle: generationResult.metaTitle,
          metaDescription: generationResult.metaDescription,
          readTime: generationResult.readTime || "8 min read",
          status: "DRAFT",
          tags: generationResult.tags?.length
            ? {
                connectOrCreate: generationResult.tags.map((tag) => ({
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
          resource: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true } },
          tags: true,
        },
      });

      // Update resource article count
      await db.resource.update({
        where: { id: data.resourceId },
        data: { articleCount: { increment: 1 } },
      });

      return article;
    });

    // Step 4: Send completion event
    await step.sendEvent("send-completion-event", {
      name: "content/article.generated",
      data: {
        contentId: savedArticle.id,
        contentType: "article" as const,
        title: savedArticle.title,
        slug: savedArticle.slug,
        status: savedArticle.status,
      },
    });

    // Return the result
    return {
      success: true,
      articleId: savedArticle.id,
      title: savedArticle.title,
      slug: savedArticle.slug,
      status: savedArticle.status,
      difficulty: savedArticle.difficulty,
      author: savedArticle.author,
      resource: savedArticle.resource,
      category: savedArticle.category,
      tags: savedArticle.tags,
    };
  }
);

export default generateArticle;
