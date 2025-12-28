/**
 * Blog Edit Network
 * Network for routing blog edit requests to the appropriate agent
 */
import { createNetwork, gemini, type Network } from "@inngest/agent-kit";
import {
  getRewriteAgent,
  getExpandAgent,
  getSimplifyAgent,
  getFixGrammarAgent,
  getChatEditAgent,
} from "../agents/blog-edit";
import type { BlogEditAction } from "../events/content";

/**
 * Create Gemini model with API key
 */
function createGeminiModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
  }

  return gemini({
    model: "gemini-2.5-pro",
    apiKey,
    defaultParameters: {
      generationConfig: {
        maxOutputTokens: 8192,
      },
    },
  });
}

/**
 * Blog edit state interface
 */
export interface BlogEditState {
  // Action to perform
  action: BlogEditAction;
  
  // Input text to edit
  text: string;
  
  // Instruction for chat action
  instruction?: string;
  
  // Workflow state
  completed: boolean;
  
  // Result
  result?: string;
  editSummary?: string;
  completionMessage?: string;
  
  // Error handling
  error?: string;
}

/**
 * Create a network for blog editing
 * Routes to the appropriate agent based on the action
 */
export function createBlogEditNetwork() {
  const rewriteAgent = getRewriteAgent();
  const expandAgent = getExpandAgent();
  const simplifyAgent = getSimplifyAgent();
  const fixGrammarAgent = getFixGrammarAgent();
  const chatEditAgent = getChatEditAgent();

  /**
   * Router that selects the appropriate agent based on the action
   */
  const editRouter = ({ network }: { network: Network }) => {
    const state = network.state.kv;
    
    const completed = state.get("completed") === true;
    const action = state.get("action") as BlogEditAction;

    // If completed, stop the network
    if (completed) {
      return undefined;
    }

    // Route to the appropriate agent based on action
    switch (action) {
      case "rewrite":
        return rewriteAgent;
      case "expand":
        return expandAgent;
      case "simplify":
        return simplifyAgent;
      case "fix":
        return fixGrammarAgent;
      case "chat":
        return chatEditAgent;
      default:
        console.error(`[blog-edit-network] Unknown action: ${action}`);
        return undefined;
    }
  };

  return createNetwork({
    name: "Blog Edit Network",
    agents: [rewriteAgent, expandAgent, simplifyAgent, fixGrammarAgent, chatEditAgent],
    defaultModel: createGeminiModel(),
    router: editRouter,
    maxIter: 3, // Edit operations should complete quickly
  });
}

/**
 * Initialize state for blog edit network
 */
export function initializeBlogEditState(
  action: BlogEditAction,
  text: string,
  instruction?: string
): Map<string, unknown> {
  const state = new Map<string, unknown>();

  state.set("action", action);
  state.set("text", text);
  state.set("completed", false);

  if (instruction) {
    state.set("instruction", instruction);
  }

  return state;
}

/**
 * Build the prompt for the edit agent
 */
export function buildEditPrompt(
  action: BlogEditAction,
  text: string,
  instruction?: string
): string {
  if (action === "chat") {
    return `Current content:
---
${text}
---

User's instruction: ${instruction}

Apply the requested changes and return the complete edited content.`;
  }

  // For other actions, just provide the text
  return `Please ${action} the following text:

${text}`;
}

export default createBlogEditNetwork;
