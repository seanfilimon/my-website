/**
 * Central export for all AgentKit tools
 */

// Database tools
export {
  createBlogTool,
  createArticleTool,
  updateContentTool,
  getResourcesTool,
  getCategoriesTool,
  createResourceTool,
  getResourceByIdTool,
  databaseTools,
} from "./database";

// Web search tools
export {
  searchWebTool,
  searchDocsTool,
  searchGitHubTool,
  webSearchTools,
} from "./web-search";

// Content manipulation tools
export {
  generateSlugTool,
  estimateReadTimeTool,
  extractKeywordsTool,
  generateMetaDescriptionTool,
  validateContentTool,
  formatAsMdxTool,
  setWorkflowStateTool,
  contentTools,
} from "./content";

// Progress tracking tools
export {
  emitProgressTool,
  reportToolCallTool,
  markCompleteTool,
  progressTools,
  storeProgress,
  getProgress,
  clearProgress,
  type ProgressEvent,
  type ProgressStage,
} from "./progress";

// New web search tools
export {
  extractUrlTool,
  crawlWebsiteTool,
} from "./web-search";

// Combined tool collections for different agent types
import { databaseTools } from "./database";
import { webSearchTools } from "./web-search";
import { contentTools } from "./content";
import { progressTools } from "./progress";

/**
 * All available tools
 */
export const allTools = [...databaseTools, ...webSearchTools, ...contentTools, ...progressTools];

// Import setWorkflowStateTool directly for inclusion in all agent tools
import { setWorkflowStateTool } from "./content";

/**
 * Tools for the Research Agent
 */
export const researchAgentTools = [
  ...webSearchTools,
  // Include resource lookup for context
  ...databaseTools.filter((t) =>
    ["getResources", "getCategories", "getResourceById"].includes(t.name)
  ),
  // CRITICAL: Include setWorkflowState so agent can mark research as complete
  setWorkflowStateTool,
];

/**
 * Tools for the Writer Agent
 */
export const writerAgentTools = [
  ...databaseTools.filter((t) =>
    ["getResources", "getCategories", "getResourceById"].includes(t.name)
  ),
  ...contentTools.filter((t) =>
    ["generateSlug", "estimateReadTime", "formatAsMdx", "setWorkflowState"].includes(t.name)
  ),
];

/**
 * Tools for the Editor Agent
 */
export const editorAgentTools = [
  ...contentTools.filter((t) =>
    ["validateContent", "formatAsMdx", "estimateReadTime", "setWorkflowState"].includes(t.name)
  ),
];

/**
 * Tools for the SEO Agent (includes createBlog for auto-saving)
 */
export const seoAgentTools = [
  ...contentTools.filter((t) =>
    ["generateSlug", "extractKeywords", "generateMetaDescription", "setWorkflowState"].includes(t.name)
  ),
  // Include createBlog so SEO agent can save the final content
  ...databaseTools.filter((t) =>
    ["createBlog", "createArticle"].includes(t.name)
  ),
  // Include progress tools for completion reporting
  ...progressTools.filter((t) =>
    ["markComplete", "emitProgress"].includes(t.name)
  ),
];

/**
 * Tools for saving content (used after all processing)
 */
export const savingTools = [
  ...databaseTools.filter((t) =>
    ["createBlog", "createArticle", "createResource", "updateContent"].includes(t.name)
  ),
];

// Blog edit tools
export {
  setEditResultTool,
  markEditCompleteTool,
  completeEditTool,
  blogEditTools,
} from "./blog-edit";

// Section management tools
export {
  insertSectionTool,
  appendSectionTool,
  restructureContentTool,
  findSectionTool,
  updateSectionTool,
  sectionManagementTools,
} from "./section-management";
