/**
 * Blog Enhancement Inngest Function
 * Handles AI-powered blog content enhancement with URL research and section management
 * 
 * Features:
 * - Add new sections with natural language instructions
 * - Research URLs and integrate findings
 * - Restructure existing content
 * - Real-time progress tracking
 */
import { inngest } from "../client";
import { db } from "@/src/lib/db";
import {
  createBlogEnhanceNetwork,
  initializeBlogEnhanceState,
  buildEnhancePrompt,
} from "../networks/blog-enhance-network";
import type { BlogEnhanceRequest } from "../events/blog-enhance";

/**
 * Enhance a blog post using AI agents
 * 
 * Workflow:
 * 1. If URLs provided -> URL Research Agent extracts and analyzes content
 * 2. Blog Enhance Agent processes the instruction and applies changes
 * 3. Section Manager Agent handles structural modifications
 * 4. Progress is emitted at each step for real-time UI updates
 */
export const enhanceBlog = inngest.createFunction(
  {
    id: "enhance-blog",
    name: "Enhance Blog Post",
    concurrency: {
      limit: 5,
    },
    retries: 2,
  },
  { event: "blog/enhance.request" },
  async ({ event, step }) => {
    const data = event.data as BlogEnhanceRequest;
    console.log(`[enhance-blog] Starting enhancement for blog: ${data.blogId}`);
    console.log(`[enhance-blog] Instruction: ${data.instruction}`);
    if (data.urls) {
      console.log(`[enhance-blog] URLs to research: ${data.urls.length}`);
    }

    // Step 1: Validate request and load blog
    const validation = await step.run("validate-request", async () => {
      const blog = await db.blog.findUnique({
        where: { id: data.blogId },
        select: { 
          id: true, 
          title: true, 
          content: true,
          authorId: true,
        },
      });
      
      if (!blog) {
        throw new Error(`Blog not found: ${data.blogId}`);
      }

      // Use provided content or blog content
      const content = data.content || blog.content;

      return { blog, content };
    });

    // Step 2: Run the enhancement network
    console.log(`[enhance-blog] Running enhancement network...`);
    const startTime = Date.now();

    // Create the network and initialize state
    const network = createBlogEnhanceNetwork();
    
    const initialState = initializeBlogEnhanceState(
      data.blogId,
      data.instruction,
      validation.content,
      data.urls,
      data.threadId
    );

    const prompt = buildEnhancePrompt(
      data.instruction,
      validation.content,
      data.urls
    );

    // Run the network
    const result = await network.run(prompt, { state: initialState });
    const state = result.state.kv;

    console.log(`[enhance-blog] Network completed in ${Date.now() - startTime}ms`);

    // Extract results from state
    const enhancedContent = (state.get("enhancedContent") as string) || (state.get("content") as string) || "";
    const summary = state.get("summary") as string | undefined;
    const completed = state.get("completed") === true;
    const urlFindings = state.get("urlFindings") as any[] | undefined;
    const sectionsModified = state.get("sectionsModified") as any[] | undefined;

    if (!completed || !enhancedContent) {
      console.error(`[enhance-blog] Enhancement did not complete successfully`);
      throw new Error("Enhancement operation did not complete successfully");
    }

    // Step 3: Optionally save to database
    let savedBlog = null;
    if (data.autoSave) {
      savedBlog = await step.run("save-blog", async () => {
        const updated = await db.blog.update({
          where: { id: data.blogId },
          data: {
            content: enhancedContent,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            updatedAt: true,
          },
        });

        return updated;
      });

      console.log(`[enhance-blog] Blog saved: ${savedBlog.id}`);
    }

    // Step 4: Send completion event
    await step.sendEvent("send-completion-event", {
      name: "blog/enhance.completed",
      data: {
        blogId: data.blogId,
        enhancedContent,
        summary: summary || "Blog content enhanced successfully",
        researchedUrls: data.urls,
        sectionsModified,
        saved: !!savedBlog,
      },
    });

    return {
      success: true,
      blogId: data.blogId,
      enhancedContent,
      summary: summary || "Enhancement complete",
      urlFindings,
      sectionsModified,
      saved: !!savedBlog,
      threadId: data.threadId,
    };
  }
);

export default enhanceBlog;
