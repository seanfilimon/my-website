/**
 * Blog Enhancement Network
 * Multi-agent network for comprehensive blog content enhancement
 */
import { createNetwork, gemini, type Network } from "@inngest/agent-kit";
import {
  getBlogEnhanceAgent,
  getUrlResearchAgent,
  getSectionManagerAgent,
} from "../agents/blog-enhance";

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
 * Blog enhancement state interface
 */
export interface BlogEnhanceState {
  // Request data
  blogId: string;
  instruction: string;
  urls?: string[];
  content: string;
  threadId?: string;
  
  // Workflow state
  researched: boolean;
  enhanced: boolean;
  completed: boolean;
  
  // Research results
  urlFindings?: Array<{
    url: string;
    title?: string;
    summary: string;
    keyInsights: string[];
  }>;
  
  // Enhancement results
  enhancedContent?: string;
  summary?: string;
  sectionsModified?: Array<{
    heading: string;
    action: "added" | "modified" | "restructured";
  }>;
  
  // Progress tracking
  progress?: Array<{
    stage: string;
    message: string;
    timestamp: Date;
  }>;
  
  // Error handling
  error?: string;
}

/**
 * Create a network for blog enhancement
 * Routes between research, enhancement, and section management agents
 */
export function createBlogEnhanceNetwork() {
  const blogEnhanceAgent = getBlogEnhanceAgent();
  const urlResearchAgent = getUrlResearchAgent();
  const sectionManagerAgent = getSectionManagerAgent();

  /**
   * Router that coordinates between agents based on workflow state
   */
  const enhanceRouter = ({ network }: { network: Network }) => {
    const state = network.state.kv;
    
    const completed = state.get("completed") === true;
    const hasUrls = (state.get("urls") as string[] | undefined)?.length ?? 0 > 0;
    const researched = state.get("researched") === true;
    const enhanced = state.get("enhanced") === true;

    // If completed, stop the network
    if (completed) {
      return undefined;
    }

    // Workflow:
    // 1. If URLs provided and not researched -> URL Research Agent
    // 2. If researched or no URLs -> Blog Enhance Agent
    // 3. Blog Enhance Agent will use section tools and complete
    
    if (hasUrls && !researched) {
      return urlResearchAgent;
    }
    
    if (!enhanced) {
      return blogEnhanceAgent;
    }

    return undefined;
  };

  return createNetwork({
    name: "Blog Enhancement Network",
    agents: [blogEnhanceAgent, urlResearchAgent, sectionManagerAgent],
    defaultModel: createGeminiModel(),
    router: enhanceRouter,
    maxIter: 10, // Allow for complex multi-step enhancements
  });
}

/**
 * Initialize state for blog enhancement network
 */
export function initializeBlogEnhanceState(
  blogId: string,
  instruction: string,
  content: string,
  urls?: string[],
  threadId?: string
): Map<string, unknown> {
  const state = new Map<string, unknown>();

  // Request data
  state.set("blogId", blogId);
  state.set("instruction", instruction);
  state.set("content", content);
  state.set("threadId", threadId || `thread-${Date.now()}`);
  
  if (urls && urls.length > 0) {
    state.set("urls", urls);
  }

  // Workflow state
  state.set("researched", !urls || urls.length === 0); // Skip research if no URLs
  state.set("enhanced", false);
  state.set("completed", false);
  
  // Progress tracking
  state.set("progress", []);

  return state;
}

/**
 * Build the initial prompt for the enhancement
 */
export function buildEnhancePrompt(
  instruction: string,
  content: string,
  urls?: string[]
): string {
  const parts: string[] = [];

  parts.push(`You are enhancing a blog post with the following instruction:`);
  parts.push(`\n"${instruction}"\n`);
  
  if (urls && urls.length > 0) {
    parts.push(`\nURLs to research and integrate:`);
    urls.forEach(url => parts.push(`- ${url}`));
    parts.push('');
  }
  
  parts.push(`\nCurrent blog content:`);
  parts.push(`---`);
  parts.push(content);
  parts.push(`---\n`);
  
  parts.push(`\nPlease enhance the blog according to the instruction.`);
  parts.push(`Remember to call emitProgress() at each step so users can see what you're doing!`);

  return parts.join('\n');
}

export default createBlogEnhanceNetwork;
