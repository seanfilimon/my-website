/**
 * Content manipulation tools for AgentKit agents
 * Provides utilities for content processing and SEO optimization
 */
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";

/**
 * Generate a URL-friendly slug from a title
 */
export const generateSlugTool = createTool({
  name: "generateSlug",
  description:
    "Generate a URL-friendly slug from a title or text. Use this to create slugs for blog posts, articles, or resources.",
  parameters: z.object({
    text: z.string().describe("The text to convert to a slug"),
    maxLength: z.number().default(100).describe("Maximum length of the slug"),
  }),
  handler: async (input, { network }) => {
    const slug = input.text
      .toLowerCase()
      .trim()
      // Replace special characters with spaces
      .replace(/[^\w\s-]/g, " ")
      // Replace multiple spaces/hyphens with single hyphen
      .replace(/[\s_-]+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
      // Truncate to max length at word boundary
      .substring(0, input.maxLength)
      .replace(/-+$/, "");

    // Store generated slug in network state
    network?.state.kv.set("generatedSlug", slug);

    return {
      success: true,
      originalText: input.text,
      slug,
      length: slug.length,
    };
  },
});

/**
 * Estimate read time for content
 */
export const estimateReadTimeTool = createTool({
  name: "estimateReadTime",
  description:
    "Calculate the estimated read time for a piece of content based on word count. Use this to set the readTime field for blogs and articles.",
  parameters: z.object({
    content: z.string().describe("The content to estimate read time for"),
    wordsPerMinute: z
      .number()
      .default(200)
      .describe("Average reading speed in words per minute"),
  }),
  handler: async (input, { network }) => {
    // Count words (simple word count)
    const wordCount = input.content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    // Calculate read time
    const minutes = Math.ceil(wordCount / input.wordsPerMinute);
    const readTime = minutes === 1 ? "1 min read" : `${minutes} min read`;

    // Store in network state
    network?.state.kv.set("wordCount", wordCount);
    network?.state.kv.set("readTime", readTime);

    return {
      success: true,
      wordCount,
      minutes,
      readTime,
      wordsPerMinute: input.wordsPerMinute,
    };
  },
});

/**
 * Extract keywords from content for SEO
 */
export const extractKeywordsTool = createTool({
  name: "extractKeywords",
  description:
    "Extract relevant keywords and phrases from content for SEO optimization. Use this to generate tags and improve searchability.",
  parameters: z.object({
    content: z.string().describe("The content to extract keywords from"),
    title: z.string().optional().describe("The title of the content"),
    maxKeywords: z.number().default(10).describe("Maximum number of keywords to extract"),
  }),
  handler: async (input, { network }) => {
    // Simple keyword extraction based on word frequency
    // In production, you might use NLP libraries or AI for better extraction
    const text = `${input.title || ""} ${input.content}`.toLowerCase();

    // Common stop words to filter out
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "as",
      "is",
      "was",
      "are",
      "were",
      "been",
      "be",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "shall",
      "can",
      "need",
      "dare",
      "ought",
      "used",
      "it",
      "its",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "we",
      "they",
      "what",
      "which",
      "who",
      "when",
      "where",
      "why",
      "how",
      "all",
      "each",
      "every",
      "both",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "nor",
      "not",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "just",
      "also",
    ]);

    // Extract words and count frequency
    const words = text
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    const wordFreq = new Map<string, number>();
    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    // Sort by frequency and get top keywords
    const keywords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, input.maxKeywords)
      .map(([word]) => word);

    // Store in network state
    network?.state.kv.set("extractedKeywords", keywords);

    return {
      success: true,
      keywords,
      count: keywords.length,
    };
  },
});

/**
 * Generate SEO meta description
 */
export const generateMetaDescriptionTool = createTool({
  name: "generateMetaDescription",
  description:
    "Generate an SEO-optimized meta description from content. The description should be 150-160 characters for optimal display in search results.",
  parameters: z.object({
    content: z.string().describe("The content to generate a meta description from"),
    title: z.string().describe("The title of the content"),
    maxLength: z.number().default(160).describe("Maximum length of the meta description"),
  }),
  handler: async (input, { network }) => {
    // Extract first meaningful paragraph or sentences
    const sentences = input.content
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);

    let description = "";
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (description.length + trimmed.length + 2 <= input.maxLength) {
        description += (description ? ". " : "") + trimmed;
      } else {
        break;
      }
    }

    // If still too short, use title + first part of content
    if (description.length < 50) {
      description = `${input.title}. ${input.content.substring(0, input.maxLength - input.title.length - 2)}`;
    }

    // Ensure it ends properly
    if (description.length > input.maxLength) {
      description = description.substring(0, input.maxLength - 3).trim() + "...";
    }

    // Store in network state
    network?.state.kv.set("metaDescription", description);

    return {
      success: true,
      metaDescription: description,
      length: description.length,
      optimal: description.length >= 120 && description.length <= 160,
    };
  },
});

/**
 * Validate content structure
 */
export const validateContentTool = createTool({
  name: "validateContent",
  description:
    "Validate that content meets quality standards and has proper structure. Use this before saving content to ensure quality.",
  parameters: z.object({
    title: z.string().describe("The title to validate"),
    excerpt: z.string().describe("The excerpt to validate"),
    content: z.string().describe("The content to validate"),
    contentType: z.enum(["blog", "article"]).describe("Type of content"),
  }),
  handler: async (input, { network }) => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (input.title.length < 10) {
      issues.push("Title is too short (minimum 10 characters)");
    }
    if (input.title.length > 100) {
      warnings.push("Title is quite long (over 100 characters)");
    }

    // Excerpt validation
    if (input.excerpt.length < 50) {
      issues.push("Excerpt is too short (minimum 50 characters)");
    }
    if (input.excerpt.length > 300) {
      warnings.push("Excerpt is quite long (over 300 characters)");
    }

    // Content validation
    const wordCount = input.content.split(/\s+/).length;
    if (wordCount < 100) {
      issues.push("Content is too short (minimum 100 words)");
    }

    // Check for headings in content
    const hasHeadings = /^#{1,6}\s/m.test(input.content);
    if (!hasHeadings && wordCount > 300) {
      warnings.push("Long content should have headings for better readability");
    }

    // Check for code blocks if technical content
    const hasCodeBlocks = /```[\s\S]*?```/.test(input.content);

    const isValid = issues.length === 0;

    // Store validation result in network state
    network?.state.kv.set("contentValidated", isValid);
    network?.state.kv.set("validationIssues", issues);

    return {
      success: true,
      isValid,
      issues,
      warnings,
      stats: {
        titleLength: input.title.length,
        excerptLength: input.excerpt.length,
        wordCount,
        hasHeadings,
        hasCodeBlocks,
      },
    };
  },
});

/**
 * Format content as MDX
 */
export const formatAsMdxTool = createTool({
  name: "formatAsMdx",
  description:
    "Format and clean up content as valid MDX. Ensures proper markdown syntax and structure.",
  parameters: z.object({
    content: z.string().describe("The content to format as MDX"),
    addTableOfContents: z.boolean().default(false).describe("Whether to add a table of contents"),
  }),
  handler: async (input) => {
    let formatted = input.content;

    // Ensure proper heading hierarchy
    // (This is a simple implementation - could be more sophisticated)
    formatted = formatted
      // Normalize line endings
      .replace(/\r\n/g, "\n")
      // Ensure blank lines around headings
      .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
      .replace(/(#{1,6}\s[^\n]+)\n([^\n#])/g, "$1\n\n$2")
      // Ensure blank lines around code blocks
      .replace(/([^\n])\n```/g, "$1\n\n```")
      .replace(/```\n([^\n])/g, "```\n\n$1")
      // Clean up excessive blank lines
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Generate table of contents if requested
    let toc = "";
    if (input.addTableOfContents) {
      const headings = formatted.match(/^#{2,3}\s.+$/gm) || [];
      if (headings.length > 2) {
        toc =
          "## Table of Contents\n\n" +
          headings
            .map((h) => {
              const level = h.match(/^#+/)?.[0].length || 2;
              const text = h.replace(/^#+\s/, "");
              const anchor = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
              const indent = "  ".repeat(level - 2);
              return `${indent}- [${text}](#${anchor})`;
            })
            .join("\n") +
          "\n\n";
      }
    }

    return {
      success: true,
      content: toc + formatted,
      hasToc: toc.length > 0,
    };
  },
});

/**
 * Set workflow state flags and content data
 * This is the primary tool for agents to update the pipeline state
 */
export const setWorkflowStateTool = createTool({
  name: "setWorkflowState",
  description:
    "Set workflow state flags and content data. Use this to mark your phase as complete and store generated content. IMPORTANT: You MUST call this tool when you finish your work to advance the pipeline.",
  parameters: z.object({
    // Workflow flags
    researched: z.boolean().optional().describe("Set to true when research phase is complete"),
    drafted: z.boolean().optional().describe("Set to true when writing phase is complete"),
    edited: z.boolean().optional().describe("Set to true when editing phase is complete"),
    optimized: z.boolean().optional().describe("Set to true when SEO optimization is complete"),
    saved: z.boolean().optional().describe("Set to true when content is saved to database"),
    
    // Content data (for blogs and articles)
    title: z.string().optional().describe("The generated title"),
    slug: z.string().optional().describe("The URL-friendly slug"),
    excerpt: z.string().optional().describe("Short summary/excerpt"),
    content: z.string().optional().describe("The main content body"),
    readTime: z.string().optional().describe("Estimated read time"),
    metaTitle: z.string().optional().describe("SEO meta title"),
    metaDescription: z.string().optional().describe("SEO meta description"),
    tags: z.array(z.string()).optional().describe("Content tags"),
    keywords: z.array(z.string()).optional().describe("SEO keywords"),
    
    // Resource-specific fields (for resource content type)
    officialUrl: z.string().url().optional().describe("Official website URL for the resource"),
    docsUrl: z.string().url().optional().describe("Documentation URL for the resource"),
    githubUrl: z.string().url().optional().describe("GitHub repository URL for the resource"),
    icon: z.string().optional().describe("Emoji icon representing the resource (e.g., ⚛️, 📦, 🚀)"),
    color: z.string().optional().describe("Brand color as hex code (e.g., #61DAFB for React)"),
  }),
  handler: async (input, { network }) => {
    const state = network?.state.kv;
    if (!state) {
      return { success: false, error: "No network state available" };
    }

    const updated: string[] = [];

    // Set workflow flags
    if (input.researched !== undefined) {
      state.set("researched", input.researched);
      updated.push("researched");
    }
    if (input.drafted !== undefined) {
      state.set("drafted", input.drafted);
      updated.push("drafted");
    }
    if (input.edited !== undefined) {
      state.set("edited", input.edited);
      updated.push("edited");
    }
    if (input.optimized !== undefined) {
      state.set("optimized", input.optimized);
      updated.push("optimized");
    }
    if (input.saved !== undefined) {
      state.set("saved", input.saved);
      updated.push("saved");
    }

    // Set content data
    if (input.title) {
      state.set("title", input.title);
      updated.push("title");
    }
    if (input.slug) {
      state.set("slug", input.slug);
      updated.push("slug");
    }
    if (input.excerpt) {
      state.set("excerpt", input.excerpt);
      updated.push("excerpt");
    }
    if (input.content) {
      state.set("content", input.content);
      updated.push("content");
    }
    if (input.readTime) {
      state.set("readTime", input.readTime);
      updated.push("readTime");
    }
    if (input.metaTitle) {
      state.set("metaTitle", input.metaTitle);
      updated.push("metaTitle");
    }
    if (input.metaDescription) {
      state.set("metaDescription", input.metaDescription);
      updated.push("metaDescription");
    }
    if (input.tags) {
      state.set("tags", input.tags);
      updated.push("tags");
    }
    if (input.keywords) {
      state.set("keywords", input.keywords);
      updated.push("keywords");
    }

    // Set resource-specific fields
    if (input.officialUrl) {
      state.set("officialUrl", input.officialUrl);
      updated.push("officialUrl");
    }
    if (input.docsUrl) {
      state.set("docsUrl", input.docsUrl);
      updated.push("docsUrl");
    }
    if (input.githubUrl) {
      state.set("githubUrl", input.githubUrl);
      updated.push("githubUrl");
    }
    if (input.icon) {
      state.set("icon", input.icon);
      updated.push("icon");
    }
    if (input.color) {
      state.set("color", input.color);
      updated.push("color");
    }

    return {
      success: true,
      updated,
      message: `Updated state: ${updated.join(", ")}`,
    };
  },
});

// Export all content tools
export const contentTools = [
  generateSlugTool,
  estimateReadTimeTool,
  extractKeywordsTool,
  generateMetaDescriptionTool,
  validateContentTool,
  formatAsMdxTool,
  setWorkflowStateTool,
];
