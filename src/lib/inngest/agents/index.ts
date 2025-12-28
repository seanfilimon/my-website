/**
 * Central export for all AgentKit agents
 */

export { researchAgent, getResearchAgent } from "./research";
export { writerAgent, getWriterAgent } from "./writer";
export { editorAgent, getEditorAgent } from "./editor";
export { seoAgent, getSeoAgent } from "./seo";
export { intentParserAgent, getIntentParserAgent, parseUserIntent, type ParsedIntent } from "./intent-parser";

// Blog edit agents
export {
  rewriteAgent,
  expandAgent,
  simplifyAgent,
  fixGrammarAgent,
  chatEditAgent,
  getRewriteAgent,
  getExpandAgent,
  getSimplifyAgent,
  getFixGrammarAgent,
  getChatEditAgent,
  getBlogEditAgents,
} from "./blog-edit";

// Blog enhancement agents
export {
  blogEnhanceAgent,
  urlResearchAgent,
  sectionManagerAgent,
  getBlogEnhanceAgent,
  getUrlResearchAgent,
  getSectionManagerAgent,
  getBlogEnhanceAgents,
} from "./blog-enhance";

// Re-export for convenience
import { getResearchAgent } from "./research";
import { getWriterAgent } from "./writer";
import { getEditorAgent } from "./editor";
import { getSeoAgent } from "./seo";

/**
 * Get all content generation agents (lazy initialization)
 */
export function getContentAgents() {
  return [getResearchAgent(), getWriterAgent(), getEditorAgent(), getSeoAgent()];
}

/**
 * Agent configuration for different content types
 */
export const agentConfigs = {
  blog: {
    getAgents: () => getContentAgents(),
    description: "Full pipeline for blog post generation",
  },
  article: {
    getAgents: () => getContentAgents(),
    description: "Full pipeline for technical article generation",
  },
  resource: {
    // Resources use a simpler pipeline
    getAgents: () => [getResearchAgent(), getWriterAgent(), getSeoAgent()],
    description: "Simplified pipeline for resource description generation",
  },
  quick: {
    // Quick generation skips research
    getAgents: () => [getWriterAgent(), getEditorAgent(), getSeoAgent()],
    description: "Fast pipeline that skips research phase",
  },
};

// Legacy exports for backwards compatibility
export const contentAgents = {
  get agents() {
    return getContentAgents();
  },
};
