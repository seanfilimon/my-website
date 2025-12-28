/**
 * Blog Edit Inngest Function
 * Handles AI-powered blog editing requests using specialized agents
 * 
 * Supports:
 * - Selection-based edits (rewrite, expand, simplify, fix)
 * - Chat-based full content edits
 * - Automatic saving to database
 */
import { inngest } from "../client";
import { db } from "@/src/lib/db";
import {
  createBlogEditNetwork,
  initializeBlogEditState,
  buildEditPrompt,
} from "../networks/blog-edit-network";
import type { BlogEditRequest } from "../events/content";

/**
 * Edit a blog post using AI agents
 * 
 * Each action type is handled by a specialized agent:
 * - rewrite: Rewrite Agent - improves clarity and engagement
 * - expand: Expand Agent - adds detail and examples
 * - simplify: Simplify Agent - reduces complexity
 * - fix: Fix Grammar Agent - corrects grammar/spelling
 * - chat: Chat Edit Agent - handles natural language instructions
 */
export const editBlog = inngest.createFunction(
  {
    id: "edit-blog",
    name: "Edit Blog Post",
    concurrency: {
      limit: 10,
    },
    retries: 2,
  },
  { event: "content/blog.edit" },
  async ({ event, step }) => {
    const data = event.data as BlogEditRequest;
    console.log(`[edit-blog] Starting blog edit - Action: ${data.action}, BlogId: ${data.blogId || "N/A"}`);

    // Step 1: Validate request and get blog if blogId provided
    const validation = await step.run("validate-request", async () => {
      let blog = null;
      
      if (data.blogId) {
        blog = await db.blog.findUnique({
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
      }

      // Validate chat action has instruction
      if (data.action === "chat" && !data.instruction) {
        throw new Error("Missing instruction for chat action");
      }

      return { blog };
    });

    // Step 2: Run the edit network
    console.log(`[edit-blog] Running edit network with ${data.action} agent...`);
    const startTime = Date.now();

    // Create the network and initialize state
    const network = createBlogEditNetwork();
    
    const initialState = initializeBlogEditState(
      data.action,
      data.text,
      data.instruction
    );

    const prompt = buildEditPrompt(
      data.action,
      data.text,
      data.instruction
    );

    // Run the network
    const result = await network.run(prompt, { state: initialState });
    const state = result.state.kv;

    console.log(`[edit-blog] Network completed in ${Date.now() - startTime}ms`);

    // Extract result from state
    const generatedText = (state.get("result") as string) || "";
    const editSummary = state.get("editSummary") as string | undefined;
    const completed = state.get("completed") === true;

    if (!completed || !generatedText) {
      console.error(`[edit-blog] Edit did not complete successfully`);
      throw new Error("Edit operation did not complete successfully");
    }

    // Step 3: Optionally save to database if blogId provided and saveToDb is true
    let savedBlog = null;
    if (data.blogId && data.saveToDb) {
      savedBlog = await step.run("save-blog", async () => {
        const updated = await db.blog.update({
          where: { id: data.blogId },
          data: {
            // For chat action, save the full content
            // For selection-based edits, the client handles replacing the selection
            content: data.action === "chat" ? generatedText : undefined,
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

      console.log(`[edit-blog] Blog saved: ${savedBlog.id}`);
    }

    // Step 4: Send completion event
    await step.sendEvent("send-completion-event", {
      name: "content/blog.edited",
      data: {
        blogId: data.blogId || null,
        action: data.action,
        originalText: data.text.slice(0, 100) + (data.text.length > 100 ? "..." : ""),
        resultText: generatedText.slice(0, 100) + (generatedText.length > 100 ? "..." : ""),
        saved: !!savedBlog,
      },
    });

    const actionVerb = data.action === "fix" ? "fixed" : `${data.action}ed`;
    
    return {
      success: true,
      result: generatedText,
      summary: editSummary,
      message: data.action === "chat" 
        ? "I've applied the changes you requested."
        : `Text has been ${actionVerb}.`,
      blogId: savedBlog?.id,
      saved: !!savedBlog,
    };
  }
);

export default editBlog;
