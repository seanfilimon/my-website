/**
 * Blog Edit Tools
 * Tools specifically for blog editing agents
 */
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";

/**
 * Set Edit Result Tool
 * Stores the edited text result in the workflow state
 */
export const setEditResultTool = createTool({
  name: "setEditResult",
  description: "Store the edited text result. Call this when you have finished editing the text.",
  parameters: z.object({
    result: z.string().describe("The edited text result"),
    summary: z.string().optional().describe("Optional summary of changes made"),
  }),
  handler: async (params, { network }) => {
    if (!network) {
      return { success: false, error: "No network context available" };
    }

    network.state.kv.set("result", params.result);
    if (params.summary) {
      network.state.kv.set("editSummary", params.summary);
    }

    return {
      success: true,
      message: "Edit result stored successfully",
    };
  },
});

/**
 * Mark Edit Complete Tool
 * Marks the edit operation as complete
 */
export const markEditCompleteTool = createTool({
  name: "markEditComplete",
  description: "Mark the edit operation as complete. Call this after storing the result.",
  parameters: z.object({
    success: z.boolean().describe("Whether the edit was successful"),
    message: z.string().optional().describe("Optional completion message"),
  }),
  handler: async (params, { network }) => {
    if (!network) {
      return { success: false, error: "No network context available" };
    }

    network.state.kv.set("completed", params.success);
    if (params.message) {
      network.state.kv.set("completionMessage", params.message);
    }

    return {
      success: true,
      message: params.success ? "Edit marked as complete" : "Edit marked as failed",
    };
  },
});

/**
 * Combined tool for setting result and marking complete in one call
 * This is more efficient for simple edit operations
 */
export const completeEditTool = createTool({
  name: "completeEdit",
  description: "Store the edited result and mark the edit as complete in one step. Use this when you have finished editing.",
  parameters: z.object({
    result: z.string().describe("The edited text result"),
    summary: z.string().optional().describe("Optional summary of changes made"),
  }),
  handler: async (params, { network }) => {
    if (!network) {
      return { success: false, error: "No network context available" };
    }

    network.state.kv.set("result", params.result);
    network.state.kv.set("completed", true);
    if (params.summary) {
      network.state.kv.set("editSummary", params.summary);
    }

    return {
      success: true,
      message: "Edit completed and result stored",
    };
  },
});

/**
 * All blog edit tools
 */
export const blogEditTools = [
  setEditResultTool,
  markEditCompleteTool,
  completeEditTool,
];

export default blogEditTools;
