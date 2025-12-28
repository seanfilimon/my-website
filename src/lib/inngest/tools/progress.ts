/**
 * Progress tracking tools for AgentKit agents
 * Enables real-time UI updates during content generation
 */
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { db } from "@/src/lib/db";

/**
 * Progress stage type
 */
export type ProgressStage = 
  | "research"
  | "writing"
  | "editing"
  | "seo"
  | "saving"
  | "complete"
  | "error";

/**
 * Progress event stored in the database or memory
 */
export interface ProgressEvent {
  id: string;
  threadId: string;
  stage: ProgressStage;
  message: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: unknown;
  timestamp: Date;
}

// In-memory progress store (for development)
// In production, use Redis or database
const progressStore = new Map<string, ProgressEvent[]>();

/**
 * Store a progress event
 */
export function storeProgress(threadId: string, event: Omit<ProgressEvent, "id" | "timestamp">) {
  const events = progressStore.get(threadId) || [];
  const newEvent: ProgressEvent = {
    ...event,
    id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  events.push(newEvent);
  progressStore.set(threadId, events);
  return newEvent;
}

/**
 * Get progress events for a thread
 */
export function getProgress(threadId: string): ProgressEvent[] {
  return progressStore.get(threadId) || [];
}

/**
 * Clear progress events for a thread
 */
export function clearProgress(threadId: string) {
  progressStore.delete(threadId);
}

/**
 * Emit a progress update for UI streaming
 */
export const emitProgressTool = createTool({
  name: "emitProgress",
  description:
    "Emit a progress update for the UI. Use this to report what you're doing at each stage.",
  parameters: z.object({
    stage: z.enum(["research", "writing", "editing", "seo", "saving", "complete", "error"])
      .describe("Current stage of the pipeline"),
    message: z.string().describe("Human-readable progress message"),
    toolName: z.string().optional().describe("Name of the tool being used"),
    toolInput: z.record(z.unknown()).optional().describe("Input passed to the tool"),
    toolOutput: z.unknown().optional().describe("Output from the tool"),
  }),
  handler: async (input, { network }) => {
    // Get thread ID from network state
    const threadId = network?.state.kv.get("threadId") as string || "unknown";
    
    // Store the progress event
    const event = storeProgress(threadId, {
      threadId,
      stage: input.stage,
      message: input.message,
      toolName: input.toolName,
      toolInput: input.toolInput,
      toolOutput: input.toolOutput,
    });

    // Also store in network state for immediate access
    const existingProgress = (network?.state.kv.get("progress") as ProgressEvent[]) || [];
    network?.state.kv.set("progress", [...existingProgress, event]);

    return {
      success: true,
      eventId: event.id,
      message: `Progress emitted: ${input.stage} - ${input.message}`,
    };
  },
});

/**
 * Report a tool execution for visibility in the UI
 */
export const reportToolCallTool = createTool({
  name: "reportToolCall",
  description:
    "Report that a tool is being called. Use this before calling other tools to make them visible in the UI.",
  parameters: z.object({
    toolName: z.string().describe("Name of the tool being called"),
    toolInput: z.record(z.unknown()).describe("Input being passed to the tool"),
    status: z.enum(["starting", "completed", "error"]).describe("Status of the tool call"),
    output: z.unknown().optional().describe("Output from the tool (if completed)"),
    error: z.string().optional().describe("Error message (if error)"),
  }),
  handler: async (input, { network }) => {
    const threadId = network?.state.kv.get("threadId") as string || "unknown";
    
    // Store tool call in network state
    const toolCalls = (network?.state.kv.get("toolCalls") as Array<unknown>) || [];
    const toolCall = {
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: input.toolName,
      input: input.toolInput,
      status: input.status,
      output: input.output,
      error: input.error,
      timestamp: new Date().toISOString(),
    };
    network?.state.kv.set("toolCalls", [...toolCalls, toolCall]);

    // Also emit as progress event
    storeProgress(threadId, {
      threadId,
      stage: input.status === "error" ? "error" : "research",
      message: `Tool ${input.toolName}: ${input.status}`,
      toolName: input.toolName,
      toolInput: input.toolInput,
      toolOutput: input.output,
    });

    return {
      success: true,
      toolCallId: toolCall.id,
    };
  },
});

/**
 * Mark content generation as complete
 */
export const markCompleteTool = createTool({
  name: "markComplete",
  description:
    "Mark the content generation as complete. Use this after saving the content to the database.",
  parameters: z.object({
    contentId: z.string().describe("ID of the created content"),
    contentType: z.enum(["blog", "article", "resource"]).describe("Type of content created"),
    title: z.string().describe("Title of the created content"),
    slug: z.string().describe("URL slug of the created content"),
  }),
  handler: async (input, { network }) => {
    const threadId = network?.state.kv.get("threadId") as string || "unknown";
    
    // Store completion in network state
    network?.state.kv.set("completed", true);
    network?.state.kv.set("contentId", input.contentId);
    network?.state.kv.set("contentType", input.contentType);
    network?.state.kv.set("contentTitle", input.title);
    network?.state.kv.set("contentSlug", input.slug);

    // Emit completion progress
    storeProgress(threadId, {
      threadId,
      stage: "complete",
      message: `Created ${input.contentType}: "${input.title}"`,
    });

    return {
      success: true,
      contentId: input.contentId,
      contentType: input.contentType,
      title: input.title,
      slug: input.slug,
      editUrl: `/admin/edit/${input.contentType}s/${input.contentId}`,
    };
  },
});

// Export all progress tools
export const progressTools = [
  emitProgressTool,
  reportToolCallTool,
  markCompleteTool,
];
