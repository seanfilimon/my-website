/**
 * Content Generation Network
 * Multi-agent network for generating blogs, articles, and resources
 */
import { createNetwork, gemini, type Network } from "@inngest/agent-kit";
import {
  getResearchAgent,
  getWriterAgent,
  getEditorAgent,
  getSeoAgent,
} from "../agents";
import type { ContentType } from "../events/content";

// Create Gemini model with API key
function createGeminiModel(maxTokens: number = 8192) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
  }

  return gemini({
    model: "gemini-2.5-pro",
    apiKey,
    defaultParameters: {
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    },
  });
}

/**
 * Content generation state interface
 */
export interface ContentGenerationState {
  // Workflow state
  researched: boolean;
  drafted: boolean;
  edited: boolean;
  optimized: boolean;
  saved: boolean;

  // Content metadata
  contentType: ContentType;
  topic: string;
  instructions?: string;
  audience?: string;
  tone?: string;
  wordCount?: number;

  // Generated content
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  readTime?: string;

  // SEO metadata
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  keywords?: string[];

  // References
  authorId?: string;
  resourceId?: string;
  categoryId?: string;
  difficulty?: string;

  // Results
  contentId?: string;
  error?: string;

  // Research data
  searches?: Array<{ query: string; type: string; resultCount: number }>;
  docsSearched?: boolean;

  // Resource-specific fields (for contentType === "resource")
  officialUrl?: string;
  docsUrl?: string;
  githubUrl?: string;
  icon?: string;
  color?: string;
}

/**
 * Create a network configured for blog generation
 */
export function createBlogNetwork() {
  const researchAgent = getResearchAgent();
  const writerAgent = getWriterAgent();
  const editorAgent = getEditorAgent();
  const seoAgent = getSeoAgent();

  const contentRouter = ({ network }: { network: Network }) => {
    const state = network.state.kv;

    const researched = state.get("researched") === true;
    const drafted = state.get("drafted") === true;
    const edited = state.get("edited") === true;
    const optimized = state.get("optimized") === true;
    const saved = state.get("saved") === true;

    if (saved) return undefined;
    if (!researched) return researchAgent;
    if (!drafted) return writerAgent;
    if (!edited) return editorAgent;
    if (!optimized) return seoAgent;

    return undefined;
  };

  return createNetwork({
    name: "Blog Generation Network",
    agents: [researchAgent, writerAgent, editorAgent, seoAgent],
    defaultModel: createGeminiModel(8192),
    router: contentRouter,
    maxIter: 10,
  });
}

/**
 * Create a network configured for article generation
 */
export function createArticleNetwork() {
  const researchAgent = getResearchAgent();
  const writerAgent = getWriterAgent();
  const editorAgent = getEditorAgent();
  const seoAgent = getSeoAgent();

  const contentRouter = ({ network }: { network: Network }) => {
    const state = network.state.kv;

    const researched = state.get("researched") === true;
    const drafted = state.get("drafted") === true;
    const edited = state.get("edited") === true;
    const optimized = state.get("optimized") === true;
    const saved = state.get("saved") === true;

    if (saved) return undefined;
    if (!researched) return researchAgent;
    if (!drafted) return writerAgent;
    if (!edited) return editorAgent;
    if (!optimized) return seoAgent;

    return undefined;
  };

  return createNetwork({
    name: "Article Generation Network",
    agents: [researchAgent, writerAgent, editorAgent, seoAgent],
    defaultModel: createGeminiModel(8192),
    router: contentRouter,
    maxIter: 10,
  });
}

/**
 * Create a network configured for resource generation (simpler pipeline)
 */
export function createResourceNetwork() {
  const researchAgent = getResearchAgent();
  const writerAgent = getWriterAgent();
  const seoAgent = getSeoAgent();

  const resourceRouter = ({ network }: { network: Network }) => {
    const state = network.state.kv;

    const researched = state.get("researched") === true;
    const drafted = state.get("drafted") === true;
    const optimized = state.get("optimized") === true;

    if (!researched) return researchAgent;
    if (!drafted) return writerAgent;
    if (!optimized) return seoAgent;

    return undefined;
  };

  return createNetwork({
    name: "Resource Generation Network",
    agents: [researchAgent, writerAgent, seoAgent],
    defaultModel: createGeminiModel(4096),
    router: resourceRouter,
    maxIter: 6,
  });
}

/**
 * Create a quick generation network (skips research)
 */
export function createQuickNetwork() {
  const writerAgent = getWriterAgent();
  const editorAgent = getEditorAgent();
  const seoAgent = getSeoAgent();

  const quickRouter = ({ network }: { network: Network }) => {
    const state = network.state.kv;

    const drafted = state.get("drafted") === true;
    const edited = state.get("edited") === true;
    const optimized = state.get("optimized") === true;

    if (!drafted) return writerAgent;
    if (!edited) return editorAgent;
    if (!optimized) return seoAgent;

    return undefined;
  };

  return createNetwork({
    name: "Quick Generation Network",
    agents: [writerAgent, editorAgent, seoAgent],
    defaultModel: createGeminiModel(8192),
    router: quickRouter,
    maxIter: 6,
  });
}

/**
 * Helper to initialize network state for content generation
 */
export function initializeContentState(
  contentType: ContentType,
  options: {
    topic: string;
    instructions?: string;
    audience?: string;
    tone?: string;
    wordCount?: number;
    authorId?: string;
    resourceId?: string;
    categoryId?: string;
    difficulty?: string;
  }
): Map<string, unknown> {
  const state = new Map<string, unknown>();

  // Workflow flags
  state.set("researched", false);
  state.set("drafted", false);
  state.set("edited", false);
  state.set("optimized", false);
  state.set("saved", false);

  // Content metadata
  state.set("contentType", contentType);
  state.set("topic", options.topic);

  if (options.instructions) state.set("instructions", options.instructions);
  if (options.audience) state.set("audience", options.audience);
  if (options.tone) state.set("tone", options.tone);
  if (options.wordCount) state.set("wordCount", options.wordCount);
  if (options.authorId) state.set("authorId", options.authorId);
  if (options.resourceId) state.set("resourceId", options.resourceId);
  if (options.categoryId) state.set("categoryId", options.categoryId);
  if (options.difficulty) state.set("difficulty", options.difficulty);

  return state;
}

/**
 * Build the initial prompt for content generation
 */
export function buildContentPrompt(
  contentType: ContentType,
  options: {
    topic: string;
    instructions?: string;
    audience?: string;
    tone?: string;
    wordCount?: number;
    resourceId?: string;
    categoryId?: string;
  }
): string {
  const parts: string[] = [];

  parts.push(`Generate a ${contentType} about: "${options.topic}"`);

  if (options.instructions) {
    parts.push(`\nAdditional instructions: ${options.instructions}`);
  }

  if (options.audience) {
    parts.push(`\nTarget audience: ${options.audience}`);
  }

  if (options.tone) {
    parts.push(`\nTone: ${options.tone}`);
  }

  if (options.wordCount) {
    parts.push(`\nTarget word count: approximately ${options.wordCount} words`);
  }

  if (options.resourceId) {
    parts.push(`\nAssociate with resource ID: ${options.resourceId}`);
  }

  if (options.categoryId) {
    parts.push(`\nContent category ID: ${options.categoryId}`);
  }

  parts.push(`\nPlease proceed with the ${contentType} generation pipeline.`);

  return parts.join("");
}
