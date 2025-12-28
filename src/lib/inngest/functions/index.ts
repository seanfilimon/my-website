/**
 * Central export for all Inngest functions
 * These functions are registered with the Inngest serve endpoint
 */

import { generateContent } from "./generate-content";
import { generateBlog } from "./generate-blog";
import { generateArticle } from "./generate-article";
import { generateResource } from "./generate-resource";
import { editBlog } from "./edit-blog";
import { enhanceBlog } from "./enhance-blog";

// Export individual functions
export { generateContent } from "./generate-content";
export { generateBlog } from "./generate-blog";
export { generateArticle } from "./generate-article";
export { generateResource } from "./generate-resource";
export { editBlog } from "./edit-blog";
export { enhanceBlog } from "./enhance-blog";

/**
 * All Inngest functions to be registered with the serve endpoint
 * 
 * generateContent - Unified entry point (recommended)
 * generateBlog/Article/Resource - Legacy separate functions (still supported)
 * editBlog - Blog editing with AI assistance
 * enhanceBlog - Blog enhancement with URL research and section management
 */
export const functions = [
  generateContent,  // Primary unified function
  generateBlog,     // Legacy - still supported
  generateArticle,  // Legacy - still supported
  generateResource, // Legacy - still supported
  editBlog,         // Blog editing function
  enhanceBlog,      // Blog enhancement function
];

export default functions;
