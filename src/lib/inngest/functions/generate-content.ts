/**
 * Unified Content Generation Inngest Function
 * Single entry point for all content generation (blogs, articles, resources)
 * Uses a unified orchestrator agent to identify and generate content
 */
import { inngest } from "../client";
import { createAgent, createNetwork, gemini, createTool, createState } from "@inngest/agent-kit";
import { z } from "zod";
import { randomUUID } from "crypto";
import { db } from "@/src/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import type { UnifiedContentRequest, ContentType } from "../events/content";
import { researchTools } from "../tools/web-search";
import { getResourcesTool, getCategoriesTool } from "../tools/database";
import { generateAndUploadBlogOG } from "@/src/lib/og";

// Initialize UploadThing API for server-side uploads
const utapi = new UTApi();

/**
 * Workflow tracking types
 */
interface ToolCallEntry {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  success: boolean;
  timestamp: number;
  duration?: number;
}

/**
 * Individual content item tracking
 */
interface ContentItem {
  id: string;
  type: "blog" | "article" | "resource";
  title: string;
  slug?: string;
  status: "pending" | "drafting" | "saved" | "failed";
  saved: boolean;
  createdAt: number;
  savedAt?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  // For tracking multi-part content
  dbId?: string; // Database ID for appending
  needsMoreContent?: boolean; // Flag if AI wants to append more
  contentParts?: number; // How many parts have been added
  totalContentLength?: number; // Total content length so far
}

/**
 * Research tracking
 */
interface ResearchEntry {
  id: string;
  query: string;
  type: "web" | "docs" | "github" | "general";
  results: unknown[];
  resultCount: number;
  timestamp: number;
  duration?: number;
  // Raw text extraction
  extractedUrl?: string;
  extractedRawText?: string;
  // Crawl results
  crawlUrl?: string;
  crawlPages?: Array<{ url: string; content: string }>;
  crawlPageCount?: number;
  // Credits used
  creditsUsed?: number;
}

/**
 * Extracted content storage - for easy access to raw text
 */
interface ExtractedContent {
  id: string;
  url: string;
  rawText: string;
  extractedAt: number;
  researchId: string; // Links back to the research entry
}

/**
 * Comprehensive network state for content generation
 */
interface ContentNetworkState {
  // Session info
  authorId: string;
  threadId?: string;
  message: string;
  
  // Analysis
  analysisComplete: boolean;
  requestedBlogs: number;
  requestedArticles: number;
  requestedResources: number;
  analysisReasoning?: string;
  
  // Content items - tracked individually with saved boolean
  blogs: ContentItem[];
  articles: ContentItem[];
  resources: ContentItem[];
  
  // Research - all research is saved
  research: ResearchEntry[];
  
  // Extracted content - raw text from URLs for easy access
  extractedContent: ExtractedContent[];
  
  // Crawled pages - all crawled content stored here
  crawledPages: Array<{
    id: string;
    baseUrl: string;
    pages: Array<{ url: string; content: string }>;
    crawledAt: number;
    researchId: string;
  }>;
  
  // Iteration tracking
  currentIteration: number;
  maxIterations: number;
  iterationHistory: Array<{
    iteration: number;
    agentName: string;
    toolsCalled: string[];
    timestamp: number;
  }>;
  
  // Completion flags
  blogsComplete: boolean;
  articlesComplete: boolean;
  resourcesComplete: boolean;
  
  // Created resource ID for linking blogs/articles
  createdResourceId?: string;
  createdResourceName?: string;
}

interface WorkflowState {
  phase: "init" | "analyzing" | "researching" | "creating" | "complete" | "error";
  currentStep: string;
  progress: {
    blogsCreated: number;
    blogsRequested: number;
    articlesCreated: number;
    articlesRequested: number;
    resourcesCreated: number;
    resourcesRequested: number;
  };
  toolCalls: ToolCallEntry[];
  errors: string[];
  startTime: number;
  lastUpdate: number;
}

/**
 * Helper to get content network state
 */
function getContentNetworkState(network: NetworkType): ContentNetworkState {
  const existing = network?.state?.kv?.get("contentState") as ContentNetworkState | undefined;
  if (existing) return existing;
  
  // Initialize default state
  const initial: ContentNetworkState = {
    authorId: network?.state?.kv?.get("authorId") as string || "",
    threadId: network?.state?.kv?.get("threadId") as string | undefined,
    message: network?.state?.kv?.get("message") as string || "",
    analysisComplete: false,
    requestedBlogs: 0,
    requestedArticles: 0,
    requestedResources: 0,
    blogs: [],
    articles: [],
    resources: [],
    research: [],
    extractedContent: [],
    crawledPages: [],
    currentIteration: 0,
    maxIterations: 100,
    iterationHistory: [],
    blogsComplete: false,
    articlesComplete: false,
    resourcesComplete: false,
  };
  
  network?.state?.kv?.set("contentState", initial);
  return initial;
}

/**
 * Helper to update content network state
 */
function updateContentNetworkState(
  network: NetworkType,
  updates: Partial<ContentNetworkState>
): ContentNetworkState {
  const current = getContentNetworkState(network);
  const updated: ContentNetworkState = {
    ...current,
    ...updates,
    blogs: updates.blogs || current.blogs,
    articles: updates.articles || current.articles,
    resources: updates.resources || current.resources,
    research: updates.research || current.research,
    extractedContent: updates.extractedContent || current.extractedContent,
    crawledPages: updates.crawledPages || current.crawledPages,
    iterationHistory: updates.iterationHistory || current.iterationHistory,
  };
  network?.state?.kv?.set("contentState", updated);
  return updated;
}

/**
 * Helper to add a blog to tracking
 */
function trackBlog(network: NetworkType, blog: Omit<ContentItem, "type">): ContentItem {
  const state = getContentNetworkState(network);
  const item: ContentItem = { 
    ...blog, 
    type: "blog",
    // Initialize multi-part content tracking fields
    needsMoreContent: false,
    contentParts: 0,
    totalContentLength: 0,
  };
  state.blogs.push(item);
  network?.state?.kv?.set("contentState", state);
  return item;
}

/**
 * Helper to mark a blog as saved
 */
function markBlogSaved(
  network: NetworkType, 
  id: string, 
  dbId: string, 
  slug: string,
  options?: {
    needsMoreContent?: boolean;
    contentLength?: number;
  }
): void {
  const state = getContentNetworkState(network);
  const blog = state.blogs.find(b => b.id === id);
  if (blog) {
    blog.saved = true;
    blog.status = "saved";
    blog.savedAt = Date.now();
    blog.dbId = dbId;
    blog.slug = slug;
    blog.metadata = { ...blog.metadata, dbId, slug };
    // Track multi-part content
    blog.needsMoreContent = options?.needsMoreContent || false;
    blog.contentParts = 1;
    blog.totalContentLength = options?.contentLength || 0;
  }
  // Check if all blogs are saved (only count as complete if they don't need more content)
  const savedCount = state.blogs.filter(b => b.saved && !b.needsMoreContent).length;
  if (savedCount >= state.requestedBlogs && state.requestedBlogs > 0) {
    state.blogsComplete = true;
  }
  network?.state?.kv?.set("contentState", state);
}

/**
 * Helper to update a blog after appending content
 */
function markBlogAppended(
  network: NetworkType,
  dbId: string,
  additionalLength: number,
  isComplete: boolean
): void {
  const state = getContentNetworkState(network);
  const blog = state.blogs.find(b => b.dbId === dbId);
  if (blog) {
    blog.contentParts = (blog.contentParts || 1) + 1;
    blog.totalContentLength = (blog.totalContentLength || 0) + additionalLength;
    blog.needsMoreContent = !isComplete;
    if (isComplete) {
      blog.status = "saved";
    }
  }
  // Re-check completion status
  const savedCount = state.blogs.filter(b => b.saved && !b.needsMoreContent).length;
  if (savedCount >= state.requestedBlogs && state.requestedBlogs > 0) {
    state.blogsComplete = true;
  }
  network?.state?.kv?.set("contentState", state);
}

/**
 * Helper to add research to tracking
 */
function trackResearch(network: NetworkType, research: Omit<ResearchEntry, "id">): ResearchEntry {
  const state = getContentNetworkState(network);
  const entry: ResearchEntry = {
    ...research,
    id: `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  state.research.push(entry);
  network?.state?.kv?.set("contentState", state);
  return entry;
}

/**
 * Helper to track iteration
 */
function trackIteration(network: NetworkType, agentName: string, toolsCalled: string[]): void {
  const state = getContentNetworkState(network);
  state.currentIteration++;
  state.iterationHistory.push({
    iteration: state.currentIteration,
    agentName,
    toolsCalled,
    timestamp: Date.now(),
  });
  network?.state?.kv?.set("contentState", state);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NetworkType = any;

/**
 * Helper to get or initialize workflow state from network
 */
function getWorkflowState(network: NetworkType): WorkflowState {
  const existing = network?.state?.kv?.get("workflowState") as WorkflowState | undefined;
  if (existing) return existing;
  
  const initial: WorkflowState = {
    phase: "init",
    currentStep: "Starting workflow",
    progress: {
      blogsCreated: 0,
      blogsRequested: 0,
      articlesCreated: 0,
      articlesRequested: 0,
      resourcesCreated: 0,
      resourcesRequested: 0,
    },
    toolCalls: [],
    errors: [],
    startTime: Date.now(),
    lastUpdate: Date.now(),
  };
  
  network?.state?.kv?.set("workflowState", initial);
  return initial;
}

/**
 * Helper to update workflow state
 */
function updateWorkflowState(
  network: NetworkType,
  updates: Partial<WorkflowState>
): WorkflowState {
  const current = getWorkflowState(network);
  const updated: WorkflowState = {
    ...current,
    ...updates,
    lastUpdate: Date.now(),
    progress: updates.progress ? { ...current.progress, ...updates.progress } : current.progress,
    toolCalls: updates.toolCalls || current.toolCalls,
    errors: updates.errors || current.errors,
  };
  network?.state?.kv?.set("workflowState", updated);
  return updated;
}

/**
 * Helper to log a tool call to workflow state
 */
function logToolCall(
  network: NetworkType,
  toolName: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  success: boolean,
  startTime: number
): void {
  const state = getWorkflowState(network);
  const entry: ToolCallEntry = {
    tool: toolName,
    input,
    output,
    success,
    timestamp: Date.now(),
    duration: Date.now() - startTime,
  };
  state.toolCalls.push(entry);
  network?.state?.kv?.set("workflowState", state);
  
  // Also log to console for debugging
  console.log(`[${toolName}] ${success ? "✓" : "✗"} (${entry.duration}ms)`, 
    JSON.stringify({ input: summarizeInput(input), success, output: summarizeOutput(output) }));
}

/**
 * Summarize input for logging (truncate long strings)
 */
function summarizeInput(input: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && value.length > 100) {
      summary[key] = value.substring(0, 100) + "...";
    } else {
      summary[key] = value;
    }
  }
  return summary;
}

/**
 * Summarize output for logging
 */
function summarizeOutput(output: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(output)) {
    if (typeof value === "string" && value.length > 200) {
      summary[key] = value.substring(0, 200) + "...";
    } else if (key === "content" || key === "results") {
      summary[key] = "[truncated]";
    } else {
      summary[key] = value;
    }
  }
  return summary;
}

/**
 * Resolve Clerk user ID to database user
 */
async function resolveUser(clerkUserId: string) {
  let user = await db.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, name: true, email: true },
  });

  if (user) return user;

  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    if (email) {
      user = await db.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });

      if (user) return user;

      user = await db.user.create({
        data: {
          email,
          name: clerkUser.firstName 
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : email.split("@")[0],
          image: clerkUser.imageUrl,
          role: "AUTHOR",
        },
        select: { id: true, name: true, email: true },
      });

      return user;
    }
  } catch (error) {
    console.error("Failed to resolve user from Clerk:", error);
  }

  user = await db.user.findFirst({
    where: { role: { in: ["ADMIN", "AUTHOR"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true },
  });

  if (user) return user;

  user = await db.user.create({
    data: {
      email: "system@seanfilimon.com",
      name: "System",
      role: "ADMIN",
    },
    select: { id: true, name: true, email: true },
  });

  return user;
}

/**
 * Fetch and upload a resource logo from GitHub
 */
const fetchAndUploadLogoTool = createTool({
  name: "fetchAndUploadLogo",
  description: "Search GitHub for a resource's logo, download it, and upload to storage. Returns the uploaded URL to use in saveResource.",
  parameters: z.object({
    resourceName: z.string().describe("Name of the resource (e.g., 'AI SDK', 'Next.js', 'React')"),
    githubOrg: z.string().optional().describe("GitHub organization if known (e.g., 'vercel', 'facebook', 'microsoft')"),
    repoName: z.string().optional().describe("GitHub repository name if known (e.g., 'ai', 'next.js', 'react')"),
  }),
  handler: async (input) => {
    try {
      // Common logo paths in GitHub repos
      const logoPaths = [
        "logo.svg",
        "logo.png",
        "assets/logo.svg",
        "assets/logo.png",
        ".github/logo.svg",
        ".github/logo.png",
        "docs/logo.svg",
        "docs/logo.png",
        "public/logo.svg",
        "public/logo.png",
        "images/logo.svg",
        "images/logo.png",
        "static/logo.svg",
        "static/logo.png",
      ];

      // Try to determine the GitHub org and repo
      let org = input.githubOrg;
      let repo = input.repoName;

      // Common mappings for popular resources
      const knownMappings: Record<string, { org: string; repo: string }> = {
        "ai sdk": { org: "vercel", repo: "ai" },
        "next.js": { org: "vercel", repo: "next.js" },
        "nextjs": { org: "vercel", repo: "next.js" },
        "react": { org: "facebook", repo: "react" },
        "vue": { org: "vuejs", repo: "vue" },
        "angular": { org: "angular", repo: "angular" },
        "svelte": { org: "sveltejs", repo: "svelte" },
        "tailwind": { org: "tailwindlabs", repo: "tailwindcss" },
        "tailwindcss": { org: "tailwindlabs", repo: "tailwindcss" },
        "prisma": { org: "prisma", repo: "prisma" },
        "typescript": { org: "microsoft", repo: "TypeScript" },
        "vite": { org: "vitejs", repo: "vite" },
        "astro": { org: "withastro", repo: "astro" },
        "remix": { org: "remix-run", repo: "remix" },
        "nuxt": { org: "nuxt", repo: "nuxt" },
        "drizzle": { org: "drizzle-team", repo: "drizzle-orm" },
        "trpc": { org: "trpc", repo: "trpc" },
        "zod": { org: "colinhacks", repo: "zod" },
        "tanstack query": { org: "TanStack", repo: "query" },
        "react query": { org: "TanStack", repo: "query" },
      };

      const normalizedName = input.resourceName.toLowerCase().trim();
      if (!org || !repo) {
        const mapping = knownMappings[normalizedName];
        if (mapping) {
          org = org || mapping.org;
          repo = repo || mapping.repo;
        }
      }

      // If we still don't have org/repo, try to guess from the name
      if (!org) {
        org = normalizedName.replace(/[^a-z0-9]/g, "");
      }
      if (!repo) {
        repo = normalizedName.replace(/[^a-z0-9-]/g, "-");
      }

      // Try to find and download the logo
      let logoUrl: string | null = null;
      let foundPath: string | null = null;

      for (const path of logoPaths) {
        const rawUrl = `https://raw.githubusercontent.com/${org}/${repo}/main/${path}`;
        const rawUrlMaster = `https://raw.githubusercontent.com/${org}/${repo}/master/${path}`;
        
        // Try main branch first
        try {
          const response = await fetch(rawUrl, { method: "HEAD" });
          if (response.ok) {
            logoUrl = rawUrl;
            foundPath = path;
            break;
          }
        } catch {
          // Continue to next path
        }

        // Try master branch
        try {
          const response = await fetch(rawUrlMaster, { method: "HEAD" });
          if (response.ok) {
            logoUrl = rawUrlMaster;
            foundPath = path;
            break;
          }
        } catch {
          // Continue to next path
        }
      }

      if (!logoUrl) {
        return {
          success: false,
          message: `Could not find logo for ${input.resourceName} in GitHub repo ${org}/${repo}. Try providing the correct githubOrg and repoName.`,
          searchedPaths: logoPaths.slice(0, 5),
        };
      }

      // Upload to UploadThing
      // First, download the file to get the actual content
      const imageResponse = await fetch(logoUrl);
      if (!imageResponse.ok) {
        return {
          success: false,
          message: `Found logo at ${logoUrl} but failed to download it.`,
          foundUrl: logoUrl,
        };
      }

      const imageBlob = await imageResponse.blob();
      const fileName = `${input.resourceName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-logo${foundPath?.includes(".svg") ? ".svg" : foundPath?.includes(".png") ? ".png" : ".png"}`;
      const file = new File([imageBlob], fileName, { type: imageBlob.type || "image/png" });

      const uploadResult = await utapi.uploadFiles(file);
      
      if (!uploadResult || uploadResult.error) {
        return {
          success: false,
          message: `Found logo at ${logoUrl} but failed to upload to storage: ${uploadResult?.error?.message || "Unknown error"}`,
          foundUrl: logoUrl,
        };
      }

      const uploadedUrl = uploadResult.data?.url;

      if (!uploadedUrl) {
        return {
          success: false,
          message: `Upload succeeded but no URL returned. Found logo at ${logoUrl}`,
          foundUrl: logoUrl,
        };
      }

      return {
        success: true,
        logoUrl: uploadedUrl,
        originalUrl: logoUrl,
        foundPath,
        message: `Successfully fetched and uploaded logo for ${input.resourceName}. Use this logoUrl value "${uploadedUrl}" in the saveResource tool's logoUrl parameter.`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch logo",
        message: "Logo fetch failed. You can still create the resource without a logo.",
      };
    }
  },
});

/**
 * Analyze request tool - AI determines quantities instead of regex
 * This MUST be called first and can only be called ONCE
 */
const analyzeRequestTool = createTool({
  name: "analyzeRequest",
  description: "CALL THIS FIRST and ONLY ONCE. Analyze the user's request to determine what content to create. Cannot be called again after first use.",
  parameters: z.object({
    blogs: z.number().describe("Number of blog posts to create (0 if none requested)"),
    articles: z.number().describe("Number of articles to create (0 if none requested)"),
    resources: z.number().describe("Number of resources to create (0 if none requested)"),
    reasoning: z.string().describe("Brief explanation of why you determined these quantities based on the user's request"),
  }),
  handler: async (input, { network }) => {
    const startTime = Date.now();
    const contentState = getContentNetworkState(network);
    
    // Check if already called - prevent duplicate analysis
    if (contentState.analysisComplete) {
      const result = {
        success: false,
        error: "analyzeRequest already called. Do not call again. Proceed with content creation.",
        contentState: {
          requestedBlogs: contentState.requestedBlogs,
          requestedArticles: contentState.requestedArticles,
          requestedResources: contentState.requestedResources,
          blogs: contentState.blogs,
          articles: contentState.articles,
          resources: contentState.resources,
        },
      };
      logToolCall(network, "analyzeRequest", input as Record<string, unknown>, result, false, startTime);
      return result;
    }

    // Cap each type at 10 and total at 10
    const blogs = Math.min(Math.max(input.blogs, 0), 10);
    const articles = Math.min(Math.max(input.articles, 0), 10);
    const resources = Math.min(Math.max(input.resources, 0), 10);
    const total = Math.min(blogs + articles + resources, 10);
    
    // Update content network state with analysis results
    updateContentNetworkState(network, {
      analysisComplete: true,
      requestedBlogs: blogs,
      requestedArticles: articles,
      requestedResources: resources,
      analysisReasoning: input.reasoning,
      // Initialize empty arrays for tracking
      blogs: [],
      articles: [],
      resources: [],
    });
    
    // Also set legacy KV values for backward compatibility with router
    network?.state.kv.set("analysisComplete", true);
    network?.state.kv.set("requestedBlogs", blogs);
    network?.state.kv.set("requestedArticles", articles);
    network?.state.kv.set("requestedResources", resources);
    
    // Update workflow state with analysis results
    updateWorkflowState(network, {
      phase: "analyzing",
      currentStep: `Analyzed request: ${blogs} blogs, ${articles} articles, ${resources} resources`,
      progress: {
        blogsCreated: 0,
        blogsRequested: blogs,
        articlesCreated: 0,
        articlesRequested: articles,
        resourcesCreated: 0,
        resourcesRequested: resources,
      },
    });

    const result = {
      success: true,
      requestedBlogs: blogs,
      requestedArticles: articles,
      requestedResources: resources,
      totalItems: total,
      reasoning: input.reasoning,
      contentState: getContentNetworkState(network),
      message: `Analysis complete. Will create: ${resources} resource(s), ${blogs} blog(s), ${articles} article(s). Total: ${total} items. DO NOT call analyzeRequest again.`,
      nextSteps: resources > 0 
        ? "Start by creating resources first (research -> fetchLogo -> saveResource), then create blogs/articles."
        : blogs > 0 
          ? "Research the topic, then create blog posts using saveBlog."
          : "Research the topic, then create articles using saveArticle.",
    };

    // Log the tool call
    logToolCall(network, "analyzeRequest", input as Record<string, unknown>, result, true, startTime);
    
    return result;
  },
});

/**
 * Create a tool for saving blog content
 * Creates blog first with unique slug, then verifies creation
 * Tracks each blog individually with saved: boolean
 */
const saveBlogTool = createTool({
  name: "saveBlog",
  description: `Save a blog post with SEO metadata. MUST call analyzeRequest FIRST.

CONTENT LIMIT: Maximum 30000 characters per call. If your content exceeds 30000 characters:
1. Save the first part with saveBlog and set hasMoreContent=true
2. Use appendToBlog with the returned 'dbId' to add the remaining content
3. The state tracks which blogs need more content

Required: title, excerpt, content, authorId. ALWAYS provide metaTitle and metaDescription for SEO. ALWAYS connect to a resource using resourceId when the blog is about a specific technology.`,
  parameters: z.object({
    title: z.string().describe("Blog title - THIS IS REQUIRED AND MUST BE PROVIDED. The main headline of the blog post."),
    excerpt: z.string().describe("Short summary 150-200 chars - REQUIRED"),
    content: z.string().describe("Full MDX content - REQUIRED. Max 30000 characters. Use appendToBlog for additional content."),
    metaTitle: z.string().describe("SEO meta title (50-60 chars) - REQUIRED for good SEO"),
    metaDescription: z.string().describe("SEO meta description (150-160 chars) - REQUIRED for good SEO"),
    tags: z.array(z.string()).describe("Content tags array - REQUIRED for SEO keywords"),
    authorId: z.string().describe("Author database ID - REQUIRED"),
    resourceId: z.string().optional().describe("Associated resource ID - REQUIRED when blog is about a specific technology. Use createdResourceId from state if you just created a resource, or use getResources to find existing resources."),
    categoryId: z.string().optional().describe("Content category ID"),
    hasMoreContent: z.boolean().optional().describe("Set to true if you plan to append more content to this blog using appendToBlog. The blog will be tracked as needing more content."),
  }),
  handler: async (input, { network }) => {
    const startTime = Date.now();
    const contentState = getContentNetworkState(network);
    const workflowState = getWorkflowState(network);
    
    try {
      // 1. FILL IN THE BLANKS - Auto-generate missing fields from available data
      const content = input.content?.trim() || "";
      
      // Content is the only truly required field - we can derive everything else
      if (!content) {
        const result = { success: false, error: "Content is required - this is the only field that cannot be auto-generated", contentState };
        logToolCall(network, "saveBlog", { title: input.title || "unknown" }, result, false, startTime);
        return result;
      }
      
      // Extract title from content if missing
      let finalTitle = input.title?.trim();
      if (!finalTitle) {
        // Try to extract from markdown heading
        const headingMatch = content.match(/^##?\s+(.+?)(?:\n|$)/m);
        if (headingMatch) {
          finalTitle = headingMatch[1].trim();
          console.log(`[saveBlog] Title auto-generated from heading: "${finalTitle}"`);
        } else {
          // Try first non-empty line
          const firstLine = content.split('\n').find(line => line.trim().length > 0);
          if (firstLine) {
            finalTitle = firstLine.replace(/^#+\s*/, '').trim().substring(0, 100);
            console.log(`[saveBlog] Title auto-generated from first line: "${finalTitle}"`);
          } else {
            // Last resort - generate from timestamp
            finalTitle = `Blog Post ${new Date().toISOString().split('T')[0]}`;
            console.log(`[saveBlog] Title auto-generated from timestamp: "${finalTitle}"`);
          }
        }
      }
      
      // Generate excerpt from content if missing (first 150-200 chars of content, cleaned)
      let finalExcerpt = input.excerpt?.trim();
      if (!finalExcerpt) {
        // Remove markdown formatting and get first paragraph
        const cleanContent = content
          .replace(/^#+\s+.+?\n/gm, '') // Remove headings
          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
          .replace(/\*\*|__/g, '') // Remove bold
          .replace(/\*|_/g, '') // Remove italic
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .trim();
        
        finalExcerpt = cleanContent.substring(0, 200);
        if (cleanContent.length > 200) {
          // Cut at last word boundary
          const lastSpace = finalExcerpt.lastIndexOf(' ');
          if (lastSpace > 150) {
            finalExcerpt = finalExcerpt.substring(0, lastSpace) + '...';
          } else {
            finalExcerpt += '...';
          }
        }
        console.log(`[saveBlog] Excerpt auto-generated: "${finalExcerpt.substring(0, 50)}..."`);
      }
      
      // Generate metaTitle from title if missing (50-60 chars)
      let finalMetaTitle = input.metaTitle?.trim();
      if (!finalMetaTitle) {
        finalMetaTitle = finalTitle.length > 60 
          ? finalTitle.substring(0, 57) + '...'
          : finalTitle;
        console.log(`[saveBlog] MetaTitle auto-generated from title`);
      }
      
      // Generate metaDescription from excerpt if missing (150-160 chars)
      let finalMetaDescription = input.metaDescription?.trim();
      if (!finalMetaDescription) {
        finalMetaDescription = finalExcerpt.length > 160
          ? finalExcerpt.substring(0, 157) + '...'
          : finalExcerpt;
        console.log(`[saveBlog] MetaDescription auto-generated from excerpt`);
      }
      
      // Generate tags from content if missing
      let finalTags = input.tags && input.tags.length > 0 ? input.tags : [];
      if (finalTags.length === 0) {
        // Extract potential tags from title and content
        const commonTechTerms = [
          'javascript', 'typescript', 'react', 'nextjs', 'next.js', 'node', 'nodejs',
          'python', 'api', 'sdk', 'cloud', 'aws', 'azure', 'docker', 'kubernetes',
          'database', 'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'graphql',
          'rest', 'authentication', 'security', 'performance', 'testing', 'ci/cd',
          'devops', 'frontend', 'backend', 'fullstack', 'mobile', 'web', 'ai', 'ml',
          'machine learning', 'deep learning', 'data', 'analytics', 'serverless',
          'microservices', 'architecture', 'design patterns', 'best practices',
          'tutorial', 'guide', 'introduction', 'getting started', 'advanced'
        ];
        
        const contentLower = (finalTitle + ' ' + content).toLowerCase();
        finalTags = commonTechTerms.filter(term => contentLower.includes(term)).slice(0, 7);
        
        if (finalTags.length === 0) {
          // Extract capitalized words as potential tags
          const capitalizedWords = content.match(/\b[A-Z][a-zA-Z]+\b/g) || [];
          const uniqueWords = [...new Set(capitalizedWords)].filter(w => w.length > 3);
          finalTags = uniqueWords.slice(0, 5);
        }
        
        if (finalTags.length > 0) {
          console.log(`[saveBlog] Tags auto-generated: ${finalTags.join(', ')}`);
        }
      }
      
      // Use authorId from input or fall back to state
      let finalAuthorId = input.authorId?.trim();
      if (!finalAuthorId) {
        finalAuthorId = contentState.authorId;
        if (finalAuthorId) {
          console.log(`[saveBlog] AuthorId auto-filled from state: ${finalAuthorId}`);
        }
      }
      
      if (!finalAuthorId) {
        const result = { success: false, error: "AuthorId is required and could not be auto-filled from state", contentState };
        logToolCall(network, "saveBlog", { title: finalTitle }, result, false, startTime);
        return result;
      }
      
      console.log(`[saveBlog] Final values - Title: "${finalTitle}", Excerpt: ${finalExcerpt.length} chars, Tags: ${finalTags.length}, Author: ${finalAuthorId}`);

      // 2. Check if analyzeRequest was called first
      if (!contentState.analysisComplete) {
        const result = { 
          success: false, 
          error: "MUST call analyzeRequest FIRST before saveBlog. Call analyzeRequest to set quantities.",
          contentState,
        };
        logToolCall(network, "saveBlog", { title: finalTitle }, result, false, startTime);
        return result;
      }

      // 3. Check for duplicate titles in DATABASE (critical for parallel tool calls)
      // Network state checks don't work for parallel calls - they all read the same initial state
      const normalizedTitle = finalTitle.toLowerCase().trim();
      
      // Check database for existing blog with same/similar title by this author
      const existingDbBlog = await db.blog.findFirst({
        where: {
          authorId: finalAuthorId,
          title: {
            equals: finalTitle,
            mode: 'insensitive',
          },
        },
        select: { id: true, title: true, slug: true },
      });
      
      if (existingDbBlog) {
        const result = { 
          success: false, 
          error: `DUPLICATE! Blog with title "${finalTitle}" already exists in database (id: ${existingDbBlog.id}). Create a DIFFERENT blog with a UNIQUE title.`,
          isDuplicate: true,
          existingBlog: existingDbBlog,
          contentState,
        };
        logToolCall(network, "saveBlog", { title: finalTitle }, result, false, startTime);
        return result;
      }
      
      // Also check in-memory state for duplicates (for same-request duplicates)
      const existingStateBlog = contentState.blogs.find(b => b.title.toLowerCase().trim() === normalizedTitle);
      if (existingStateBlog) {
        const result = { 
          success: false, 
          error: `DUPLICATE! Blog with title "${finalTitle}" already tracked in this request (saved: ${existingStateBlog.saved}). Create a DIFFERENT blog with a UNIQUE title.`,
          isDuplicate: true,
          existingBlog: existingStateBlog,
          allBlogs: contentState.blogs,
          contentState,
        };
        logToolCall(network, "saveBlog", { title: finalTitle }, result, false, startTime);
        return result;
      }

      // 4. Check if we've reached the limit
      // Use in-memory state count - this is updated after each successful save
      const savedBlogs = contentState.blogs.filter(b => b.saved);
      if (contentState.requestedBlogs > 0 && savedBlogs.length >= contentState.requestedBlogs) {
        const result = { 
          success: false, 
          error: `STOP! Blog limit reached. Already saved ${savedBlogs.length}/${contentState.requestedBlogs} blogs. DO NOT call saveBlog again.`,
          limitReached: true,
          savedBlogs: savedBlogs.map(b => ({ id: b.id, title: b.title })),
          requestedBlogs: contentState.requestedBlogs,
          contentState,
        };
        logToolCall(network, "saveBlog", { title: finalTitle }, result, false, startTime);
        return result;
      }

      // 5. Create a tracking entry for this blog (pending state)
      const blogTrackingId = `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const blogItem = trackBlog(network, {
        id: blogTrackingId,
        title: finalTitle,
        status: "drafting",
        saved: false,
        createdAt: Date.now(),
      });

      // Update workflow state
      updateWorkflowState(network, {
        phase: "creating",
        currentStep: `Creating blog ${savedBlogs.length + 1}/${contentState.requestedBlogs}: ${finalTitle}`,
      });

      // 6. Validate foreign keys
      let validResourceId: string | null = null;
      let validCategoryId: string | null = null;

      const resourceIdToCheck = input.resourceId || contentState.createdResourceId;
      if (resourceIdToCheck) {
        const resource = await db.resource.findUnique({ where: { id: resourceIdToCheck } });
        if (resource) validResourceId = resource.id;
      }

      if (input.categoryId) {
        const category = await db.contentCategory.findUnique({ where: { id: input.categoryId } });
        if (category) validCategoryId = category.id;
      }

      // 7. Generate unique slug with UUID
      const baseSlug = finalTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 40) || "blog"; // Fallback if title produces empty slug

      // 8. Calculate read time
      const words = content.trim().split(/\s+/).length;
      const mins = Math.ceil(words / 200);
      const readTime = mins === 1 ? "1 min read" : `${mins} min read`;

      // 9. Create blog in database with retry on slug collision
      let blog: { id: string; title: string; slug: string; status: string } | null = null;
      let createAttempts = 0;
      const maxCreateAttempts = 5;

      while (!blog && createAttempts < maxCreateAttempts) {
        // Always use full UUID to minimize collision chance
        const slug = `${baseSlug}-${randomUUID()}`;
        
        try {
          blog = await db.blog.create({
        data: {
              title: finalTitle,
          slug,
              excerpt: finalExcerpt,
              content: content,
              authorId: finalAuthorId,
          resourceId: validResourceId,
          categoryId: validCategoryId,
              metaTitle: finalMetaTitle,
              metaDescription: finalMetaDescription,
          readTime,
          status: "DRAFT",
              tags: finalTags.length > 0 ? {
                connectOrCreate: finalTags.map((t) => ({
              where: { name: t },
              create: { name: t, slug: t.toLowerCase().replace(/\s+/g, "-") },
            })),
          } : undefined,
        },
        select: { id: true, title: true, slug: true, status: true },
      });
        } catch (createError: unknown) {
          createAttempts++;
          const errorMessage = createError instanceof Error ? createError.message : String(createError);
          
          // Check if it's a unique constraint error on slug
          if (errorMessage.includes("Unique constraint") && errorMessage.includes("slug")) {
            console.log(`[saveBlog] Slug collision on create attempt ${createAttempts}, retrying with new UUID...`);
            if (createAttempts >= maxCreateAttempts) {
              throw new Error(`Failed to create blog after ${maxCreateAttempts} attempts due to slug collisions`);
            }
            continue;
          }
          // Re-throw other errors
          throw createError;
        }
      }

      // Ensure blog was created
      if (!blog) {
        const result = { success: false, error: "Blog creation failed - no blog returned after create attempts", contentState: getContentNetworkState(network) };
        logToolCall(network, "saveBlog", { title: finalTitle }, result, false, startTime);
        return result;
      }

      // 10. Verify the blog was created
      const verified = await db.blog.findUnique({ where: { id: blog.id } });
      if (!verified) {
        // Mark as failed in tracking
        const state = getContentNetworkState(network);
        const blogToUpdate = state.blogs.find(b => b.id === blogTrackingId);
        if (blogToUpdate) {
          blogToUpdate.status = "failed";
          blogToUpdate.error = "Blog creation failed - record not found after insert";
          network?.state?.kv?.set("contentState", state);
        }
        const result = { success: false, error: "Blog creation failed - record not found after insert", contentState: getContentNetworkState(network) };
        logToolCall(network, "saveBlog", { title: finalTitle }, result, false, startTime);
        return result;
      }

      // 10a. Update resource blogCount if connected to a resource
      if (validResourceId) {
        await db.resource.update({
          where: { id: validResourceId },
          data: { blogCount: { increment: 1 } },
        });
      }

      // 10b. Create SEO record for the blog (using auto-filled values)
      await db.sEO.create({
        data: {
          entityType: "blog",
          entityId: blog.id,
          metaTitle: finalMetaTitle,
          metaDescription: finalMetaDescription,
          ogTitle: finalMetaTitle,
          ogDescription: finalMetaDescription,
          ogType: "article",
          twitterTitle: finalMetaTitle,
          twitterDescription: finalMetaDescription,
          twitterCard: "summary_large_image",
          robots: "index,follow",
          keywords: finalTags.length > 0 ? finalTags.join(", ") : null,
          schemaType: "BlogPosting",
        },
      });

      // 10c. Generate OG image for the blog (since no thumbnail was provided)
      try {
        const ogImageUrl = await generateAndUploadBlogOG({
          title: finalTitle,
          excerpt: finalExcerpt,
          blogId: blog.id,
        });
        
        if (ogImageUrl) {
          await db.blog.update({
            where: { id: blog.id },
            data: { thumbnail: ogImageUrl },
          });
          console.log(`[saveBlog] Generated OG image for blog: ${ogImageUrl}`);
        }
      } catch (ogError) {
        // Non-fatal - blog is still created, just without auto-generated thumbnail
        console.log(`[saveBlog] OG image generation failed (non-fatal):`, ogError);
      }

      // 11. Mark blog as saved in tracking (with multi-part content support)
      const hasMoreContent = input.hasMoreContent === true;
      markBlogSaved(network, blogTrackingId, blog.id, blog.slug, {
        needsMoreContent: hasMoreContent,
        contentLength: content.length,
      });
      
      // Store the last created blog ID for easy access when appending
      network?.state.kv.set("lastCreatedBlogId", blog.id);
      network?.state.kv.set("lastCreatedBlogTitle", blog.title);
      
      // Also update legacy KV for router compatibility
      const updatedContentState = getContentNetworkState(network);
      // Only count blogs that don't need more content as fully saved
      const newSavedCount = updatedContentState.blogs.filter(b => b.saved && !b.needsMoreContent).length;
      const blogsNeedingMoreContent = updatedContentState.blogs.filter(b => b.saved && b.needsMoreContent);
      network?.state.kv.set("blogsSaved", newSavedCount);
      
      const remainingBlogs = contentState.requestedBlogs - newSavedCount;
      const isComplete = remainingBlogs <= 0 && blogsNeedingMoreContent.length === 0;

      if (isComplete) {
        network?.state.kv.set("blogsComplete", true);
        updateContentNetworkState(network, { blogsComplete: true });
      }

      // Update workflow state with progress
      updateWorkflowState(network, {
        phase: isComplete ? "complete" : "creating",
        currentStep: isComplete 
          ? `All ${contentState.requestedBlogs} blogs created successfully`
          : hasMoreContent
            ? `Created blog ${blog.title} (part 1) - waiting for more content via appendToBlog`
          : `Created blog ${newSavedCount}/${contentState.requestedBlogs}: ${blog.title}`,
        progress: {
          blogsCreated: newSavedCount,
          blogsRequested: contentState.requestedBlogs,
          articlesCreated: workflowState.progress.articlesCreated,
          articlesRequested: workflowState.progress.articlesRequested,
          resourcesCreated: workflowState.progress.resourcesCreated,
          resourcesRequested: workflowState.progress.resourcesRequested,
        },
      });

      const finalContentState = getContentNetworkState(network);
      const result = { 
        success: true, 
        contentType: "blog", 
        dbId: blog.id,
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
        trackingId: blogTrackingId,
        saved: true,
        contentLength: content.length,
        // Multi-part content tracking
        hasMoreContent,
        needsAppend: hasMoreContent,
        appendInstructions: hasMoreContent 
          ? `Use appendToBlog({ blogId: "${blog.id}", content: "..." }) to add more content to this blog.`
          : undefined,
        // Show all blogs with their saved status and multi-part info
        allBlogs: finalContentState.blogs.map(b => ({
          id: b.id,
          dbId: b.dbId,
          title: b.title,
          saved: b.saved,
          status: b.status,
          needsMoreContent: b.needsMoreContent,
          contentParts: b.contentParts,
          totalContentLength: b.totalContentLength,
        })),
        blogsNeedingMoreContent: blogsNeedingMoreContent.map(b => ({
          dbId: b.dbId,
          title: b.title,
          contentParts: b.contentParts,
          totalContentLength: b.totalContentLength,
        })),
        savedCount: newSavedCount,
        requestedBlogs: contentState.requestedBlogs,
        remainingBlogs,
        isComplete,
        contentState: finalContentState,
        message: hasMoreContent
          ? `Blog "${blog.title}" saved (part 1, ${content.length} chars). Use appendToBlog with blogId="${blog.id}" to add more content.`
          : isComplete 
          ? `All ${contentState.requestedBlogs} blog(s) saved. STOP - DO NOT call saveBlog again.`
            : `Blog "${blog.title}" saved (${newSavedCount}/${contentState.requestedBlogs}). YOU MUST CREATE ${remainingBlogs} MORE BLOG(S) with DIFFERENT titles. DO NOT STOP until all ${contentState.requestedBlogs} blogs are created.`,
        nextAction: hasMoreContent
          ? `Call appendToBlog({ blogId: "${blog.id}", content: "..." }) to add more content`
          : isComplete 
          ? "STOP creating content. All requested items are complete." 
            : `IMMEDIATELY call saveBlog again to create blog ${newSavedCount + 1} of ${contentState.requestedBlogs}. Use a UNIQUE title different from: ${finalContentState.blogs.map(b => b.title).join(", ")}`,
        IMPORTANT: hasMoreContent 
          ? `This blog needs more content. Call appendToBlog with blogId="${blog.id}"`
          : isComplete ? undefined : `YOU ARE NOT DONE. ${remainingBlogs} blogs remaining. Call saveBlog NOW.`,
      };

      logToolCall(network, "saveBlog", { title: finalTitle, authorId: finalAuthorId }, result, true, startTime);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to save blog";
      const state = getWorkflowState(network);
      state.errors.push(`saveBlog: ${errorMsg}`);
      network?.state.kv.set("workflowState", state);
      
      const result = { success: false, error: errorMsg, contentState: getContentNetworkState(network) };
      logToolCall(network, "saveBlog", { title: input.title || "unknown" }, result, false, startTime);
      return result;
    }
  },
});

/**
 * Append content to an existing blog post
 * Use this when content exceeds 30000 characters or when adding additional sections
 */
const appendToBlogTool = createTool({
  name: "appendToBlog",
  description: `Append additional content to an existing blog post. Use this when:
1. Your blog content exceeds 30000 characters - save the first part with saveBlog (hasMoreContent=true), then use appendToBlog for remaining content
2. You want to add more sections to an existing blog
3. The blog was created in a previous call and you need to extend it

The content will be appended to the end of the existing blog's content. Set isLastPart=true when you're done adding content.`,
  parameters: z.object({
    blogId: z.string().optional().describe("The ID of the blog to append to (returned from saveBlog as 'dbId'). If not provided, uses the last created blog from state."),
    content: z.string().describe("Additional MDX content to append to the blog"),
    isLastPart: z.boolean().optional().describe("Set to true if this is the final part of the content. The blog will be marked as complete."),
    updateExcerpt: z.string().optional().describe("Optional: Update the excerpt if the new content changes the summary"),
    additionalTags: z.array(z.string()).optional().describe("Optional: Additional tags to add to the blog"),
  }),
  handler: async (input, { network }) => {
    const startTime = Date.now();
    const contentState = getContentNetworkState(network);
    
    try {
      // Get blogId from input or from state (last created blog)
      let blogId = input.blogId;
      if (!blogId) {
        blogId = network?.state.kv.get("lastCreatedBlogId") as string | undefined;
        if (blogId) {
          console.log(`[appendToBlog] Using last created blog ID from state: ${blogId}`);
        }
      }
      
      if (!blogId) {
        const result = { 
          success: false, 
          error: "No blogId provided and no recent blog found in state. Either provide blogId or create a blog first with saveBlog.",
          blogsInState: contentState.blogs.filter(b => b.dbId).map(b => ({ dbId: b.dbId, title: b.title })),
        };
        logToolCall(network, "appendToBlog", { blogId: "missing" }, result, false, startTime);
        return result;
      }
      
      // Find the existing blog
      const existingBlog = await db.blog.findUnique({
        where: { id: blogId },
        select: { 
          id: true, 
          title: true, 
          slug: true, 
          content: true,
          excerpt: true,
          tags: { select: { name: true } },
        },
      });
      
      if (!existingBlog) {
        const result = { 
          success: false, 
          error: `Blog with ID "${blogId}" not found. Make sure you're using the 'dbId' returned from saveBlog.`,
          blogsInState: contentState.blogs.filter(b => b.dbId).map(b => ({ dbId: b.dbId, title: b.title })),
        };
        logToolCall(network, "appendToBlog", { blogId }, result, false, startTime);
        return result;
      }
      
      // Append the new content
      const newContent = existingBlog.content + "\n\n" + input.content.trim();
      const newContentLength = newContent.length;
      
      // Prepare update data
      const updateData: Record<string, unknown> = {
        content: newContent,
      };
      
      // Update excerpt if provided
      if (input.updateExcerpt?.trim()) {
        updateData.excerpt = input.updateExcerpt.trim();
      }
      
      // Recalculate read time
      const words = newContent.trim().split(/\s+/).length;
      const mins = Math.ceil(words / 200);
      updateData.readTime = mins === 1 ? "1 min read" : `${mins} min read`;
      
      // Add additional tags if provided
      if (input.additionalTags && input.additionalTags.length > 0) {
        updateData.tags = {
          connectOrCreate: input.additionalTags.map((t) => ({
            where: { name: t },
            create: { name: t, slug: t.toLowerCase().replace(/\s+/g, "-") },
          })),
        };
      }
      
      // Update the blog
      const updatedBlog = await db.blog.update({
        where: { id: blogId },
        data: updateData,
        select: { id: true, title: true, slug: true, content: true },
      });
      
      // Update state tracking
      const isLastPart = input.isLastPart === true;
      markBlogAppended(network, blogId, input.content.length, isLastPart);
      
      // Get updated state
      const updatedContentState = getContentNetworkState(network);
      const blogInState = updatedContentState.blogs.find(b => b.dbId === blogId);
      const blogsNeedingMoreContent = updatedContentState.blogs.filter(b => b.needsMoreContent);
      
      const result = {
        success: true,
        blogId: updatedBlog.id,
        title: updatedBlog.title,
        slug: updatedBlog.slug,
        previousContentLength: existingBlog.content.length,
        appendedContentLength: input.content.length,
        newTotalContentLength: newContentLength,
        readTime: updateData.readTime,
        isLastPart,
        contentComplete: isLastPart,
        // State tracking info
        contentParts: blogInState?.contentParts || 1,
        needsMoreContent: !isLastPart,
        blogsNeedingMoreContent: blogsNeedingMoreContent.map(b => ({
          dbId: b.dbId,
          title: b.title,
          contentParts: b.contentParts,
          totalContentLength: b.totalContentLength,
        })),
        message: isLastPart
          ? `Successfully completed blog "${updatedBlog.title}" with ${blogInState?.contentParts || 1} parts. Total content: ${newContentLength} characters.`
          : `Appended part ${blogInState?.contentParts || 1} to blog "${updatedBlog.title}". Total: ${newContentLength} chars. Call appendToBlog again with isLastPart=true when done.`,
        nextAction: isLastPart
          ? blogsNeedingMoreContent.length > 0
            ? `Complete remaining blogs: ${blogsNeedingMoreContent.map(b => b.title).join(", ")}`
            : "Blog content complete. Continue with other tasks."
          : `Call appendToBlog again to add more content, or set isLastPart=true if done.`,
      };
      
      logToolCall(network, "appendToBlog", { blogId, contentLength: input.content.length, isLastPart }, result, true, startTime);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to append to blog";
      const result = { success: false, error: errorMsg };
      logToolCall(network, "appendToBlog", { blogId: input.blogId }, result, false, startTime);
      return result;
    }
  },
});

/**
 * Update an existing blog post
 * Use this to modify any field of an existing blog - title, content, excerpt, SEO, tags, etc.
 */
const updateBlogTool = createTool({
  name: "updateBlog",
  description: `Update an existing blog post. Use this to:
1. Fix or improve blog content
2. Update SEO metadata (metaTitle, metaDescription)
3. Change the title or excerpt
4. Add or remove tags
5. Connect to a different resource
6. Replace content entirely (use 'content' field)

Use getBlogs first to find the blog you want to update.`,
  parameters: z.object({
    blogId: z.string().describe("The ID of the blog to update (use getBlogs to find it)"),
    title: z.string().optional().describe("New title for the blog"),
    excerpt: z.string().optional().describe("New excerpt/summary (150-200 chars)"),
    content: z.string().optional().describe("New content to REPLACE existing content entirely"),
    metaTitle: z.string().optional().describe("New SEO meta title (50-60 chars)"),
    metaDescription: z.string().optional().describe("New SEO meta description (150-160 chars)"),
    tags: z.array(z.string()).optional().describe("New tags array - REPLACES existing tags"),
    addTags: z.array(z.string()).optional().describe("Tags to ADD to existing tags"),
    resourceId: z.string().optional().describe("Connect to a different resource"),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().describe("Change publication status"),
  }),
  handler: async (input, { network }) => {
    const startTime = Date.now();
    
    try {
      // Find the existing blog
      const existingBlog = await db.blog.findUnique({
        where: { id: input.blogId },
        include: {
          tags: { select: { id: true, name: true } },
        },
      });
      
      if (!existingBlog) {
        const result = { 
          success: false, 
          error: `Blog with ID "${input.blogId}" not found. Use getBlogs to find existing blogs.`,
        };
        logToolCall(network, "updateBlog", { blogId: input.blogId }, result, false, startTime);
        return result;
      }
      
      // Find existing SEO record (polymorphic relation)
      const existingSeo = await db.sEO.findUnique({
        where: {
          entityType_entityId: {
            entityType: "Blog",
            entityId: input.blogId,
          },
        },
      });
      
      // Build update data
      const updateData: Record<string, unknown> = {};
      const changes: string[] = [];
      
      if (input.title?.trim()) {
        updateData.title = input.title.trim();
        // Update slug if title changes
        const baseSlug = input.title.trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        updateData.slug = `${baseSlug}-${existingBlog.id.slice(-8)}`;
        changes.push(`title: "${existingBlog.title}" → "${input.title.trim()}"`);
      }
      
      if (input.excerpt?.trim()) {
        updateData.excerpt = input.excerpt.trim();
        changes.push("excerpt updated");
      }
      
      if (input.content?.trim()) {
        updateData.content = input.content.trim();
        // Recalculate read time
        const words = input.content.trim().split(/\s+/).length;
        const mins = Math.ceil(words / 200);
        updateData.readTime = mins === 1 ? "1 min read" : `${mins} min read`;
        changes.push(`content replaced (${input.content.length} chars)`);
      }
      
      if (input.status) {
        updateData.status = input.status;
        changes.push(`status: ${existingBlog.status} → ${input.status}`);
      }
      
      if (input.resourceId) {
        // Validate resource exists
        const resource = await db.resource.findUnique({ where: { id: input.resourceId } });
        if (resource) {
          updateData.resourceId = input.resourceId;
          changes.push(`connected to resource: ${resource.name}`);
        }
      }
      
      // Handle tags
      if (input.tags && input.tags.length > 0) {
        // Replace all tags
        updateData.tags = {
          set: [], // Disconnect all existing
          connectOrCreate: input.tags.map((t) => ({
            where: { name: t },
            create: { name: t, slug: t.toLowerCase().replace(/\s+/g, "-") },
          })),
        };
        changes.push(`tags replaced: [${input.tags.join(", ")}]`);
      } else if (input.addTags && input.addTags.length > 0) {
        // Add to existing tags
        updateData.tags = {
          connectOrCreate: input.addTags.map((t) => ({
            where: { name: t },
            create: { name: t, slug: t.toLowerCase().replace(/\s+/g, "-") },
          })),
        };
        changes.push(`tags added: [${input.addTags.join(", ")}]`);
      }
      
      // Update SEO if provided
      const seoUpdates: Record<string, string> = {};
      if (input.metaTitle?.trim()) {
        seoUpdates.metaTitle = input.metaTitle.trim();
        changes.push("metaTitle updated");
      }
      if (input.metaDescription?.trim()) {
        seoUpdates.metaDescription = input.metaDescription.trim();
        changes.push("metaDescription updated");
      }
      
      // Check if there's anything to update
      if (Object.keys(updateData).length === 0 && Object.keys(seoUpdates).length === 0) {
        const result = {
          success: false,
          error: "No fields provided to update. Provide at least one field to change.",
          currentBlog: {
            id: existingBlog.id,
            title: existingBlog.title,
            excerpt: existingBlog.excerpt,
            status: existingBlog.status,
            tags: existingBlog.tags.map(t => t.name),
          },
        };
        logToolCall(network, "updateBlog", { blogId: input.blogId }, result, false, startTime);
        return result;
      }
      
      // Update the blog
      const updatedBlog = await db.blog.update({
        where: { id: input.blogId },
        data: updateData,
        include: {
          tags: { select: { name: true } },
          resource: { select: { id: true, name: true } },
        },
      });
      
      // Update SEO record if needed
      if (Object.keys(seoUpdates).length > 0 && existingSeo) {
        await db.sEO.update({
          where: { id: existingSeo.id },
          data: seoUpdates,
        });
      } else if (Object.keys(seoUpdates).length > 0 && !existingSeo) {
        // Create SEO record if it doesn't exist
        await db.sEO.create({
          data: {
            entityType: "Blog",
            entityId: input.blogId,
            metaTitle: seoUpdates.metaTitle || updatedBlog.title,
            metaDescription: seoUpdates.metaDescription || updatedBlog.excerpt || "",
          },
        });
        changes.push("SEO record created");
      }
      
      const result = {
        success: true,
        blogId: updatedBlog.id,
        title: updatedBlog.title,
        slug: updatedBlog.slug,
        status: updatedBlog.status,
        changes,
        updatedFields: Object.keys(updateData).concat(Object.keys(seoUpdates)),
        currentState: {
          title: updatedBlog.title,
          excerpt: updatedBlog.excerpt,
          status: updatedBlog.status,
          tags: updatedBlog.tags.map(t => t.name),
          resource: updatedBlog.resource ? { id: updatedBlog.resource.id, name: updatedBlog.resource.name } : null,
          contentLength: updatedBlog.content.length,
        },
        message: `Blog "${updatedBlog.title}" updated successfully. Changes: ${changes.join(", ")}`,
      };
      
      logToolCall(network, "updateBlog", { blogId: input.blogId, changes }, result, true, startTime);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to update blog";
      const result = { success: false, error: errorMsg };
      logToolCall(network, "updateBlog", { blogId: input.blogId }, result, false, startTime);
      return result;
    }
  },
});

/**
 * Create a tool for saving article content
 * Creates article first with unique slug, then verifies creation (no iteration)
 */
const saveArticleTool = createTool({
  name: "saveArticle",
  description: "Save a technical article. MUST call analyzeRequest FIRST. Required: title, excerpt, content, authorId. Articles need a resourceId.",
  parameters: z.object({
    title: z.string().describe("Article title - REQUIRED"),
    excerpt: z.string().describe("Short summary 150-200 chars - REQUIRED"),
    content: z.string().describe("Full MDX content with code examples - REQUIRED"),
    metaTitle: z.string().optional().describe("SEO meta title"),
    metaDescription: z.string().optional().describe("SEO meta description"),
    tags: z.array(z.string()).optional().describe("Content tags array"),
    authorId: z.string().describe("Author database ID - REQUIRED"),
    resourceId: z.string().optional().describe("Associated resource ID (uses createdResourceId from state if not provided)"),
    categoryId: z.string().optional().describe("Content category ID (uses default if not provided)"),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().describe("Article difficulty level"),
  }),
  handler: async (input, { network }) => {
    const startTime = Date.now();
    const workflowState = getWorkflowState(network);
    
    try {
      // 1. Validate required fields
      if (!input.title?.trim()) {
        const result = { success: false, error: "Title is required", workflowProgress: workflowState.progress };
        logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
        return result;
      }
      if (!input.content?.trim()) {
        const result = { success: false, error: "Content is required", workflowProgress: workflowState.progress };
        logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
        return result;
      }
      if (!input.excerpt?.trim()) {
        const result = { success: false, error: "Excerpt is required", workflowProgress: workflowState.progress };
        logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
        return result;
      }
      if (!input.authorId?.trim()) {
        const result = { success: false, error: "AuthorId is required", workflowProgress: workflowState.progress };
        logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
        return result;
      }

      // 2. Check if analyzeRequest was called first
      const analysisComplete = network?.state.kv.get("analysisComplete");
      if (!analysisComplete) {
        const result = { 
          success: false, 
          error: "MUST call analyzeRequest FIRST before saveArticle. Call analyzeRequest to set quantities.",
          workflowProgress: workflowState.progress,
        };
        logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
        return result;
      }

      // 3. Check per-type quantity limits
      const requestedArticles = (network?.state.kv.get("requestedArticles") as number) || 0;
      const articlesSaved = (network?.state.kv.get("articlesSaved") as number) || 0;
      const savedCount = (network?.state.kv.get("savedCount") as number) || 0;

      // 4. Check for duplicate titles in this session
      const savedArticleTitles = (network?.state.kv.get("savedArticleTitles") as string[]) || [];
      const normalizedTitle = input.title.toLowerCase().trim();
      
      if (savedArticleTitles.includes(normalizedTitle)) {
        const result = { 
          success: false, 
          error: `DUPLICATE! Article with title "${input.title}" was already saved in this session. Create a DIFFERENT article with a UNIQUE title.`,
          isDuplicate: true,
          alreadySavedTitles: savedArticleTitles,
          articlesSaved,
          requestedArticles,
          workflowProgress: workflowState.progress,
        };
        logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
        return result;
      }

      // Update workflow state
      updateWorkflowState(network, {
        phase: "creating",
        currentStep: `Creating article ${articlesSaved + 1}/${requestedArticles}: ${input.title}`,
      });

      if (articlesSaved >= requestedArticles) {
        const result = { 
          success: false, 
          error: `STOP! Article limit reached. Already saved ${articlesSaved}/${requestedArticles} articles. DO NOT call saveArticle again.`,
          limitReached: true,
          articlesSaved,
          requestedArticles,
          workflowProgress: workflowState.progress,
        };
        logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
        return result;
      }

      // 3. Validate foreign keys
      let validResourceId: string | null = null;
      let validCategoryId: string | null = null;

      const resourceIdToCheck = input.resourceId || (network?.state.kv.get("createdResourceId") as string | undefined);
      if (resourceIdToCheck) {
        const resource = await db.resource.findUnique({ where: { id: resourceIdToCheck } });
        if (resource) validResourceId = resource.id;
      }

      if (!validResourceId) {
        return {
          success: false,
          error: "Articles require a valid resourceId. Create a resource first or provide a valid resource ID.",
        };
      }

      if (input.categoryId) {
        const category = await db.contentCategory.findUnique({ where: { id: input.categoryId } });
        if (category) validCategoryId = category.id;
      }

      if (!validCategoryId) {
        let defaultCategory = await db.contentCategory.findFirst({ where: { slug: "tutorial" } });
        if (!defaultCategory) {
          defaultCategory = await db.contentCategory.create({
            data: { name: "Tutorial", slug: "tutorial", description: "Tutorial articles" },
          });
        }
        validCategoryId = defaultCategory.id;
      }

      // 4. Generate unique slug with UUID to handle parallel executions
      const baseSlug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 40);
      
      // Use UUID for guaranteed uniqueness across parallel executions
      const uniqueId = randomUUID().slice(0, 8);
      let slug = `${baseSlug}-${uniqueId}`;
      
      // Double-check slug doesn't exist (handles race conditions)
      const existingSlug = await db.article.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${baseSlug}-${randomUUID().slice(0, 12)}`;
      }

      // 5. Calculate read time
      const words = input.content.trim().split(/\s+/).length;
      const mins = Math.ceil(words / 200);
      const readTime = mins === 1 ? "1 min read" : `${mins} min read`;

      // 6. Create article - no pre-check, just create with unique slug
      const article = await db.article.create({
        data: {
          title: input.title,
          slug,
          excerpt: input.excerpt,
          content: input.content,
          authorId: input.authorId,
          resourceId: validResourceId,
          categoryId: validCategoryId,
          difficulty: input.difficulty || "INTERMEDIATE",
          metaTitle: input.metaTitle || null,
          metaDescription: input.metaDescription || null,
          readTime,
          status: "DRAFT",
          tags: input.tags?.length ? {
            connectOrCreate: input.tags.map((t) => ({
              where: { name: t },
              create: { name: t, slug: t.toLowerCase().replace(/\s+/g, "-") },
            })),
          } : undefined,
        },
        select: { id: true, title: true, slug: true, status: true },
      });

      // 7. Verify the article was created
      const verified = await db.article.findUnique({ where: { id: article.id } });
      if (!verified) {
        const result = { success: false, error: "Article creation failed - record not found after insert" };
        logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
        return result;
      }

      // Update resource article count
      await db.resource.update({
        where: { id: validResourceId },
        data: { articleCount: { increment: 1 } },
      });

      // 8. Update counters and track saved titles
      const newArticlesSaved = articlesSaved + 1;
      const newSavedCount = savedCount + 1;
      network?.state.kv.set("articlesSaved", newArticlesSaved);
      network?.state.kv.set("savedCount", newSavedCount);
      network?.state.kv.set("savedContentId", article.id);
      network?.state.kv.set("savedContentType", "article");
      network?.state.kv.set("savedTitle", article.title);
      network?.state.kv.set("savedSlug", article.slug);
      
      // Track saved titles to prevent duplicates
      savedArticleTitles.push(normalizedTitle);
      network?.state.kv.set("savedArticleTitles", savedArticleTitles);

      const remainingArticles = requestedArticles - newArticlesSaved;
      const isComplete = remainingArticles <= 0;

      // Update workflow state with progress
      const updatedWorkflow = updateWorkflowState(network, {
        phase: isComplete ? "complete" : "creating",
        currentStep: isComplete 
          ? `All ${requestedArticles} articles created successfully`
          : `Created article ${newArticlesSaved}/${requestedArticles}: ${article.title}`,
        progress: {
          blogsCreated: workflowState.progress.blogsCreated,
          blogsRequested: workflowState.progress.blogsRequested,
          articlesCreated: newArticlesSaved,
          articlesRequested: requestedArticles,
          resourcesCreated: workflowState.progress.resourcesCreated,
          resourcesRequested: workflowState.progress.resourcesRequested,
        },
      });

      if (isComplete) {
        network?.state.kv.set("articlesComplete", true);
      }

      const result = { 
        success: true, 
        contentType: "article", 
        ...article,
        verified: true,
        articlesSaved: newArticlesSaved,
        requestedArticles,
        remainingArticles,
        totalSaved: newSavedCount,
        isComplete,
        savedTitles: savedArticleTitles, // Show what titles have been saved
        workflowProgress: updatedWorkflow.progress,
        message: isComplete 
          ? `All ${requestedArticles} article(s) saved. STOP - DO NOT call saveArticle again.`
          : `Article "${article.title}" saved (${newArticlesSaved}/${requestedArticles}). Create ${remainingArticles} more article(s) with DIFFERENT titles. Already saved: ${savedArticleTitles.join(", ")}`,
        nextAction: isComplete 
          ? "STOP creating articles. All requested items are complete." 
          : `Create article ${newArticlesSaved + 1} with a UNIQUE title (not: ${savedArticleTitles.join(", ")})`,
      };

      logToolCall(network, "saveArticle", { title: input.title, authorId: input.authorId }, result, true, startTime);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to save article";
      const state = getWorkflowState(network);
      state.errors.push(`saveArticle: ${errorMsg}`);
      network?.state.kv.set("workflowState", state);
      
      const result = { success: false, error: errorMsg, workflowProgress: state.progress };
      logToolCall(network, "saveArticle", { title: input.title }, result, false, startTime);
      return result;
    }
  },
});

/**
 * Create a tool for saving resource content
 * Uses per-type counters set by analyzeRequest
 */
const saveResourceTool = createTool({
  name: "saveResource",
  description: "Save a new resource/tool/framework. MUST call analyzeRequest FIRST. Use fetchAndUploadLogo first to get a logoUrl for the icon.",
  parameters: z.object({
    name: z.string().describe("Resource name - REQUIRED"),
    description: z.string().describe("Resource description (2-3 paragraphs) - REQUIRED"),
    icon: z.string().optional().describe("Emoji icon fallback if no logoUrl"),
    logoUrl: z.string().optional().describe("URL of uploaded logo from fetchAndUploadLogo"),
    color: z.string().optional().describe("Brand color as hex code"),
    officialUrl: z.string().optional().describe("Official website URL"),
    docsUrl: z.string().optional().describe("Documentation URL"),
    githubUrl: z.string().optional().describe("GitHub repository URL"),
    tags: z.array(z.string()).optional().describe("Resource tags array"),
    typeId: z.string().optional().describe("Resource type ID"),
    categoryId: z.string().optional().describe("Resource category ID"),
  }),
  handler: async (input, { network }) => {
    const startTime = Date.now();
    const workflowState = getWorkflowState(network);
    
    try {
      // 1. Validate required fields
      if (!input.name?.trim()) {
        const result = { success: false, error: "Name is required", workflowProgress: workflowState.progress };
        logToolCall(network, "saveResource", { name: input.name }, result, false, startTime);
        return result;
      }
      if (!input.description?.trim()) {
        const result = { success: false, error: "Description is required", workflowProgress: workflowState.progress };
        logToolCall(network, "saveResource", { name: input.name }, result, false, startTime);
        return result;
      }

      // 2. Check if analyzeRequest was called first
      const analysisComplete = network?.state.kv.get("analysisComplete");
      if (!analysisComplete) {
        const result = { 
          success: false, 
          error: "MUST call analyzeRequest FIRST before saveResource. Call analyzeRequest to set quantities.",
          workflowProgress: workflowState.progress,
        };
        logToolCall(network, "saveResource", { name: input.name }, result, false, startTime);
        return result;
      }

      // 3. Check per-type quantity limits
      const requestedResources = (network?.state.kv.get("requestedResources") as number) || 0;
      const resourcesSaved = (network?.state.kv.get("resourcesSaved") as number) || 0;
      const savedCount = (network?.state.kv.get("savedCount") as number) || 0;

      // Update workflow state
      updateWorkflowState(network, {
        phase: "creating",
        currentStep: `Creating resource ${resourcesSaved + 1}/${requestedResources}: ${input.name}`,
      });

      if (resourcesSaved >= requestedResources) {
        const result = { 
          success: false, 
          error: `STOP! Resource limit reached. Already saved ${resourcesSaved}/${requestedResources} resources. DO NOT call saveResource again.`,
          limitReached: true,
          resourcesSaved,
          requestedResources,
          workflowProgress: workflowState.progress,
        };
        logToolCall(network, "saveResource", { name: input.name }, result, false, startTime);
        return result;
      }

      // 3. Generate slug from name
      const baseSlug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existing = await db.resource.findFirst({
        where: { OR: [{ name: input.name }, { slug: baseSlug }] },
      });

      if (existing) {
        return { success: false, error: `Resource already exists: ${existing.name}` };
      }

      // Get or create type - validate provided ID or create default
      let finalTypeId: string | undefined = input.typeId;
      if (finalTypeId) {
        // Validate the provided type ID exists
        const existingType = await db.resourceType.findUnique({ where: { id: finalTypeId } });
        if (!existingType) {
          // Invalid ID provided, fall back to default
          finalTypeId = undefined;
        }
      }
      if (!finalTypeId) {
        let defaultType = await db.resourceType.findFirst({ where: { slug: "tool" } });
        if (!defaultType) {
          defaultType = await db.resourceType.create({
            data: { name: "Tool", slug: "tool", description: "General tools and utilities" },
          });
        }
        finalTypeId = defaultType.id;
      }

      // Get or create category - validate provided ID or create default
      let finalCategoryId: string | undefined = input.categoryId;
      if (finalCategoryId) {
        // Validate the provided category ID exists
        const existingCategory = await db.resourceCategory.findUnique({ where: { id: finalCategoryId } });
        if (!existingCategory) {
          // Invalid ID provided, fall back to default
          finalCategoryId = undefined;
        }
      }
      if (!finalCategoryId) {
        let defaultCategory = await db.resourceCategory.findFirst({ where: { slug: "general" } });
        if (!defaultCategory) {
          defaultCategory = await db.resourceCategory.create({
            data: { name: "General", slug: "general", description: "General resources" },
          });
        }
        finalCategoryId = defaultCategory.id;
      }

      const resource = await db.resource.create({
        data: {
          name: input.name,
          slug: baseSlug,
          description: input.description,
          icon: input.icon || "📦",
          iconUrl: input.logoUrl || null, // Use uploaded logo URL if provided
          color: input.color || "#6366f1",
          officialUrl: input.officialUrl || null,
          docsUrl: input.docsUrl || null,
          githubUrl: input.githubUrl || null,
          type: { connect: { id: finalTypeId } },
          category: { connect: { id: finalCategoryId } },
          tags: input.tags && input.tags.length > 0
            ? {
                connectOrCreate: input.tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, "-") },
                })),
              }
            : undefined,
        },
        select: { id: true, name: true, slug: true, iconUrl: true },
      });

      // 7. Update counters
      const newResourcesSaved = resourcesSaved + 1;
      const newSavedCount = savedCount + 1;
      network?.state.kv.set("resourcesSaved", newResourcesSaved);
      network?.state.kv.set("savedCount", newSavedCount);
      
      // Store the created resource ID for subsequent blog/article creation
      network?.state.kv.set("createdResourceId", resource.id);
      network?.state.kv.set("createdResourceName", resource.name);
      network?.state.kv.set("savedContentId", resource.id);
      network?.state.kv.set("savedContentType", "resource");
      network?.state.kv.set("savedTitle", resource.name);
      network?.state.kv.set("savedSlug", resource.slug);

      const remainingResources = requestedResources - newResourcesSaved;
      const isComplete = remainingResources <= 0;

      // Update workflow state with progress
      const updatedWorkflow = updateWorkflowState(network, {
        phase: isComplete ? "creating" : "creating", // Still creating if blogs/articles needed
        currentStep: isComplete 
          ? `All ${requestedResources} resources created. Resource ID: ${resource.id}`
          : `Created resource ${newResourcesSaved}/${requestedResources}: ${resource.name}`,
        progress: {
          blogsCreated: workflowState.progress.blogsCreated,
          blogsRequested: workflowState.progress.blogsRequested,
          articlesCreated: workflowState.progress.articlesCreated,
          articlesRequested: workflowState.progress.articlesRequested,
          resourcesCreated: newResourcesSaved,
          resourcesRequested: requestedResources,
        },
      });

      if (isComplete) {
        network?.state.kv.set("resourcesComplete", true);
      }

      const result = { 
        success: true, 
        contentType: "resource", 
        id: resource.id,
        resourceId: resource.id, // Explicitly return for easy access in subsequent calls
        title: resource.name, 
        slug: resource.slug, 
        status: "DRAFT",
        resourcesSaved: newResourcesSaved,
        requestedResources,
        remainingResources,
        totalSaved: newSavedCount,
        isComplete,
        workflowProgress: updatedWorkflow.progress,
        message: remainingResources > 0 
          ? `Resource saved (${newResourcesSaved}/${requestedResources}). Resource ID: ${resource.id}. Use this resourceId when creating blogs/articles.`
          : `All ${requestedResources} resource(s) saved. Resource ID: ${resource.id}. Now create blogs/articles if requested.`,
        nextAction: isComplete 
          ? (workflowState.progress.blogsRequested > 0 || workflowState.progress.articlesRequested > 0)
            ? `Now create ${workflowState.progress.blogsRequested} blog(s) and ${workflowState.progress.articlesRequested} article(s) using resourceId: ${resource.id}`
            : "All content complete."
          : undefined,
      };

      logToolCall(network, "saveResource", { name: input.name }, result, true, startTime);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to save resource";
      const state = getWorkflowState(network);
      state.errors.push(`saveResource: ${errorMsg}`);
      network?.state.kv.set("workflowState", state);
      
      const result = { success: false, error: errorMsg, workflowProgress: state.progress };
      logToolCall(network, "saveResource", { name: input.name }, result, false, startTime);
      return result;
    }
  },
});

/**
 * Tool to check current workflow progress
 * Uses the comprehensive content state for accurate tracking
 */
const checkProgressTool = createTool({
  name: "checkProgress",
  description: "Check the current workflow progress. Shows all tracked items with their saved status, research entries, and iteration history.",
  parameters: z.object({}),
  handler: async (_input, { network }) => {
    const contentState = getContentNetworkState(network);
    const workflowState = getWorkflowState(network);
    
    // Count saved items from tracked arrays
    const savedBlogs = contentState.blogs.filter(b => b.saved);
    const savedArticles = contentState.articles.filter(a => a.saved);
    const savedResources = contentState.resources.filter(r => r.saved);
    
    const blogsRemaining = contentState.requestedBlogs - savedBlogs.length;
    const articlesRemaining = contentState.requestedArticles - savedArticles.length;
    const resourcesRemaining = contentState.requestedResources - savedResources.length;
    
    const allComplete = blogsRemaining <= 0 && articlesRemaining <= 0 && resourcesRemaining <= 0;
    
    return {
      success: true,
      phase: workflowState.phase,
      currentStep: workflowState.currentStep,
      
      // Detailed progress with individual item tracking
      progress: {
        blogs: {
          saved: savedBlogs.length,
          requested: contentState.requestedBlogs,
          remaining: blogsRemaining,
          items: contentState.blogs.map(b => ({
            id: b.id,
            title: b.title,
            saved: b.saved,
            status: b.status,
          })),
        },
        articles: {
          saved: savedArticles.length,
          requested: contentState.requestedArticles,
          remaining: articlesRemaining,
          items: contentState.articles.map(a => ({
            id: a.id,
            title: a.title,
            saved: a.saved,
            status: a.status,
          })),
        },
        resources: {
          saved: savedResources.length,
          requested: contentState.requestedResources,
          remaining: resourcesRemaining,
          items: contentState.resources.map(r => ({
            id: r.id,
            title: r.title,
            saved: r.saved,
            status: r.status,
          })),
        },
      },
      
      // Research tracking
      research: {
        totalEntries: contentState.research.length,
        entries: contentState.research.map(r => ({
          id: r.id,
          query: r.query,
          type: r.type,
          resultCount: r.resultCount,
          timestamp: r.timestamp,
        })),
      },
      
      // Iteration tracking
      iterations: {
        current: contentState.currentIteration,
        max: contentState.maxIterations,
        history: contentState.iterationHistory,
      },
      
      allComplete,
      toolCallCount: workflowState.toolCalls.length,
      errors: workflowState.errors,
      elapsedTime: `${Date.now() - workflowState.startTime}ms`,
      
      message: allComplete 
        ? "All requested content has been created. STOP - do not create more."
        : `Remaining: ${resourcesRemaining} resources, ${blogsRemaining} blogs, ${articlesRemaining} articles`,
      nextAction: allComplete 
        ? "STOP - workflow complete"
        : resourcesRemaining > 0 
          ? "Create resources first"
          : blogsRemaining > 0 
            ? "Create blogs"
            : "Create articles",
    };
  },
});

/**
 * Get blogs from the database - optionally filtered by resource
 */
const getBlogsTool = createTool({
  name: "getBlogs",
  description: "Fetch existing blogs from the database. Use this to see what blogs already exist, especially for a specific resource. Helps avoid creating duplicate content and understand existing coverage.",
  parameters: z.object({
    resourceId: z.string().optional().describe("Filter blogs by resource ID - use this to see all blogs about a specific technology"),
    resourceSlug: z.string().optional().describe("Filter blogs by resource slug (e.g., 'nextjs', 'react') - alternative to resourceId"),
    search: z.string().optional().describe("Search term to filter blogs by title or content"),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().describe("Filter by publication status"),
    limit: z.number().default(20).describe("Maximum number of blogs to return"),
  }),
  handler: async (input) => {
    const where: Record<string, unknown> = {};

    // Filter by resource ID
    if (input.resourceId) {
      where.resourceId = input.resourceId;
    }

    // Filter by resource slug (lookup resource first)
    if (input.resourceSlug && !input.resourceId) {
      const resource = await db.resource.findUnique({
        where: { slug: input.resourceSlug },
        select: { id: true },
      });
      if (resource) {
        where.resourceId = resource.id;
      } else {
        return {
          success: false,
          error: `Resource with slug "${input.resourceSlug}" not found`,
          blogs: [],
          count: 0,
        };
      }
    }

    // Search filter
    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { excerpt: { contains: input.search, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (input.status) {
      where.status = input.status;
    }

    const blogs = await db.blog.findMany({
      where,
      take: input.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        readTime: true,
        createdAt: true,
        publishedAt: true,
        resource: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { id: true, name: true },
        },
        tags: {
          select: { name: true },
        },
      },
    });

    return {
      success: true,
      blogs: blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        status: blog.status,
        readTime: blog.readTime,
        createdAt: blog.createdAt,
        publishedAt: blog.publishedAt,
        resource: blog.resource,
        author: blog.author,
        tags: blog.tags.map(t => t.name),
      })),
      count: blogs.length,
      message: blogs.length > 0 
        ? `Found ${blogs.length} blog(s)${input.resourceId || input.resourceSlug ? ` for this resource` : ""}`
        : "No blogs found matching the criteria",
    };
  },
});

/**
 * Get stored research data from agent state
 * Allows agent to retrieve previously extracted raw text and crawled pages
 */
const getStoredResearchTool = createTool({
  name: "getStoredResearch",
  description: "Retrieve stored research data from agent state. Use this to access previously extracted raw text content or crawled pages. All research, extracted content, and crawled pages are automatically stored when you use the research tool.",
  parameters: z.object({
    type: z.enum(["all", "extracted", "crawled", "research"]).default("all").describe("Type of stored data to retrieve: 'all' for everything, 'extracted' for raw text extractions, 'crawled' for crawled pages, 'research' for search results"),
    url: z.string().optional().describe("Filter by specific URL - get extracted content or crawled pages for this URL"),
    researchId: z.string().optional().describe("Filter by specific research ID"),
    includeContent: z.boolean().default(true).describe("Include full content in response (set false for just metadata/summaries)"),
  }),
  handler: async (input, { network }) => {
    const contentState = getContentNetworkState(network);
    
    const response: {
      success: boolean;
      research?: ResearchEntry[];
      extractedContent?: ExtractedContent[];
      crawledPages?: typeof contentState.crawledPages;
      summary: {
        totalResearchEntries: number;
        totalExtractedUrls: number;
        totalCrawledSites: number;
        totalCrawledPages: number;
      };
      message: string;
    } = {
      success: true,
      summary: {
        totalResearchEntries: contentState.research.length,
        totalExtractedUrls: contentState.extractedContent.length,
        totalCrawledSites: contentState.crawledPages.length,
        totalCrawledPages: contentState.crawledPages.reduce((sum, c) => sum + c.pages.length, 0),
      },
      message: "",
    };
    
    // Filter by URL if provided
    if (input.url) {
      const extractedForUrl = contentState.extractedContent.filter(e => e.url === input.url);
      const crawledForUrl = contentState.crawledPages.filter(c => 
        c.baseUrl === input.url || c.pages.some(p => p.url === input.url)
      );
      
      if (extractedForUrl.length > 0) {
        response.extractedContent = input.includeContent 
          ? extractedForUrl 
          : extractedForUrl.map(e => ({ ...e, rawText: `[${e.rawText.length} chars - set includeContent=true to see full text]` }));
      }
      
      if (crawledForUrl.length > 0) {
        response.crawledPages = input.includeContent 
          ? crawledForUrl 
          : crawledForUrl.map(c => ({ 
              ...c, 
              pages: c.pages.map(p => ({ url: p.url, content: `[${p.content.length} chars]` })) 
            }));
      }
      
      response.message = `Found ${extractedForUrl.length} extracted content and ${crawledForUrl.length} crawl entries for URL: ${input.url}`;
      return response;
    }
    
    // Filter by research ID if provided
    if (input.researchId) {
      const research = contentState.research.find(r => r.id === input.researchId);
      const extracted = contentState.extractedContent.filter(e => e.researchId === input.researchId);
      const crawled = contentState.crawledPages.filter(c => c.researchId === input.researchId);
      
      if (research) response.research = [research];
      if (extracted.length > 0) {
        response.extractedContent = input.includeContent 
          ? extracted 
          : extracted.map(e => ({ ...e, rawText: `[${e.rawText.length} chars]` }));
      }
      if (crawled.length > 0) {
        response.crawledPages = input.includeContent 
          ? crawled 
          : crawled.map(c => ({ ...c, pages: c.pages.map(p => ({ url: p.url, content: `[${p.content.length} chars]` })) }));
      }
      
      response.message = `Found data for research ID: ${input.researchId}`;
      return response;
    }
    
    // Return based on type filter
    switch (input.type) {
      case "extracted":
        response.extractedContent = input.includeContent 
          ? contentState.extractedContent 
          : contentState.extractedContent.map(e => ({ ...e, rawText: `[${e.rawText.length} chars - set includeContent=true to see full text]` }));
        response.message = `Retrieved ${contentState.extractedContent.length} extracted content entries`;
        break;
        
      case "crawled":
        response.crawledPages = input.includeContent 
          ? contentState.crawledPages 
          : contentState.crawledPages.map(c => ({ 
              ...c, 
              pages: c.pages.map(p => ({ url: p.url, content: `[${p.content.length} chars]` })) 
            }));
        response.message = `Retrieved ${contentState.crawledPages.length} crawled sites with ${response.summary.totalCrawledPages} total pages`;
        break;
        
      case "research":
        response.research = contentState.research;
        response.message = `Retrieved ${contentState.research.length} research entries`;
        break;
        
      case "all":
      default:
        response.research = contentState.research;
        response.extractedContent = input.includeContent 
          ? contentState.extractedContent 
          : contentState.extractedContent.map(e => ({ ...e, rawText: `[${e.rawText.length} chars]` }));
        response.crawledPages = input.includeContent 
          ? contentState.crawledPages 
          : contentState.crawledPages.map(c => ({ 
              ...c, 
              pages: c.pages.map(p => ({ url: p.url, content: `[${p.content.length} chars]` })) 
            }));
        response.message = `Retrieved all stored research: ${contentState.research.length} searches, ${contentState.extractedContent.length} extracted URLs, ${contentState.crawledPages.length} crawled sites`;
        break;
    }
    
    return response;
  },
});

/**
 * Unified Content Orchestrator Agent System Prompt
 * Advanced reasoning-based prompt with decision frameworks
 */
const ORCHESTRATOR_SYSTEM_PROMPT = `# Content Orchestrator Agent v2.0

You are an advanced Content Orchestrator Agent with sophisticated reasoning capabilities. You create high-quality blogs, articles, and resources through intelligent planning, research, and execution.

## 🧠 COGNITIVE FRAMEWORK

### Think Before Acting
Before EVERY action, briefly reason through:
1. **Current State**: What has been done? What remains?
2. **Goal**: What am I trying to achieve right now?
3. **Best Action**: Which tool best accomplishes this goal?
4. **Validation**: Does this action make sense given the context?

### Decision Tree for Content Creation
\`\`\`
START
  │
  ├─► Is this my first action?
  │     YES → Call analyzeRequest (MANDATORY)
  │     NO  → Continue to next check
  │
  ├─► Do I need to create a RESOURCE?
  │     YES → Is it a new technology/tool?
  │           YES → research → fetchAndUploadLogo → saveResource
  │           NO  → Use getResources to find existing resourceId
  │
  ├─► Do I need to create BLOGS?
  │     YES → For EACH blog:
  │           1. Plan unique angle/topic
  │           2. Research if needed
  │           3. Generate content (check length)
  │           4. If >30000 chars: use hasMoreContent=true
  │           5. saveBlog with ALL required fields
  │           6. Check response: remainingBlogs > 0? → REPEAT
  │
  ├─► Do I need to UPDATE existing content?
  │     YES → getBlogs to find → updateBlog or appendToBlog
  │
  └─► Is everything complete?
        Check: isComplete=true AND remainingBlogs=0 AND blogsNeedingMoreContent=[]
        YES → Task complete
        NO  → Continue working
\`\`\`

## 📋 MANDATORY INITIALIZATION

### Step 1: ALWAYS Start with analyzeRequest
\`\`\`
analyzeRequest({ message: "[user's request]" })
\`\`\`
This returns:
- \`requestedBlogs\`: Number of blogs to create
- \`requestedArticles\`: Number of articles to create  
- \`requestedResources\`: Number of resources to create
- \`intent\`: What the user wants (create, update, research, etc.)

**NEVER skip this step. NEVER call it twice.**

## 🎯 INTELLIGENT CONTENT PLANNING

### For Multiple Blogs: Plan Diverse Angles
When creating N blogs about a topic, plan N DISTINCT perspectives:

**Example: "Create 5 blogs about React"**
1. "Getting Started with React in 2024" (beginner tutorial)
2. "React Performance Optimization Techniques" (advanced/optimization)
3. "React vs Vue vs Angular: A Developer's Comparison" (comparison)
4. "Building a Full-Stack App with React and Node.js" (project-based)
5. "React Server Components: The Future of Web Development" (cutting-edge features)

**Planning Framework:**
- Beginner/Getting Started
- Advanced Techniques
- Comparisons with Alternatives
- Real-World Projects/Use Cases
- Latest Features/Future Trends
- Best Practices/Patterns
- Common Mistakes/Debugging
- Integration with Other Tools

### Content Quality Standards
Each piece of content MUST have:
- **Unique Value**: What makes this different from existing content?
- **Clear Structure**: Introduction → Main Content → Conclusion
- **Actionable Insights**: Readers should learn something practical
- **SEO Optimization**: Keywords naturally integrated

## 🔧 TOOL MASTERY

### Research Tools (Use Strategically)
| Tool | When to Use | Cost |
|------|-------------|------|
| \`research({ topic })\` | General information gathering | 1 credit |
| \`research({ topic, includeGitHub: true })\` | Need code examples | 2 credits |
| \`research({ topic, extractRawText: "url" })\` | Need full page content | 1.2 credits |
| \`research({ topic, crawlUrl: "url", crawlInstructions: "..." })\` | Need comprehensive docs | 3-4 credits |
| \`getStoredResearch({ type: "..." })\` | Retrieve previous research | 0 credits |

**Research Strategy:**
1. Start with basic search to understand the landscape
2. If you need specific documentation, use extractRawText
3. If you need comprehensive coverage, use crawlUrl
4. Always check getStoredResearch before re-researching

### Content Management Tools
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| \`saveBlog\` | Create new blog | title, content, excerpt, metaTitle, metaDescription, tags, resourceId |
| \`appendToBlog\` | Add content to existing blog | blogId (optional), content, isLastPart |
| \`updateBlog\` | Modify existing blog | blogId, [any field to change] |
| \`getBlogs\` | Find existing blogs | search, resourceId, status, limit |
| \`saveArticle\` | Create technical article | title, content, resourceId, etc. |
| \`saveResource\` | Create new resource entry | name, description, logoUrl, etc. |

### Database Lookup Tools
| Tool | Purpose |
|------|---------|
| \`getResources\` | Find existing resources (for resourceId) |
| \`getCategories\` | Get content categories |
| \`getBlogs\` | Find existing blogs |
| \`checkProgress\` | Verify current workflow state |

## 📝 CONTENT CREATION WORKFLOW

### Creating a Single Blog
\`\`\`
1. analyzeRequest → confirms 1 blog needed
2. getResources → find if technology resource exists
3. research → gather information (if needed)
4. saveBlog({
     title: "Compelling, SEO-friendly title",
     excerpt: "150-200 char summary that hooks readers",
     content: "Full MDX content with proper formatting",
     metaTitle: "50-60 chars with primary keyword",
     metaDescription: "150-160 chars, compelling with keywords",
     tags: ["relevant", "keywords", "for", "seo"],
     resourceId: "existing-resource-id" // if about a technology
   })
5. Check response → isComplete should be true
\`\`\`

### Creating Multiple Blogs (CRITICAL)
\`\`\`
1. analyzeRequest → confirms N blogs needed
2. Plan N unique angles (see Planning Framework above)
3. For i = 1 to N:
   a. Generate unique title and content for blog i
   b. saveBlog(...)
   c. Read response carefully:
      - remainingBlogs > 0? → CONTINUE to next blog
      - isComplete = false? → CONTINUE
      - isComplete = true? → STOP
4. NEVER stop until remainingBlogs = 0
\`\`\`

### Handling Long Content (>30000 characters)
\`\`\`
1. saveBlog({ ..., hasMoreContent: true }) → saves first 30000 chars
2. appendToBlog({ content: "next section" }) → adds more
3. appendToBlog({ content: "final section", isLastPart: true }) → completes
\`\`\`

### Updating Existing Content
\`\`\`
1. getBlogs({ search: "topic" }) → find the blog
2. Decide: appendToBlog (add content) vs updateBlog (replace/modify)
3. Execute the appropriate tool
\`\`\`

## 🎨 CONTENT QUALITY GUIDELINES

### Blog Structure Template
\`\`\`mdx
# [Compelling Title with Primary Keyword]

[Hook - 1-2 sentences that grab attention]

## Introduction
[Context and what readers will learn - 100-150 words]

## [Main Section 1]
[Detailed content with examples - 300-500 words]

### [Subsection if needed]
[Supporting details]

## [Main Section 2]
[Continue pattern...]

## [Code Examples / Practical Application]
\\\`\\\`\\\`language
// Well-commented code example
\\\`\\\`\\\`

## Key Takeaways
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

## Conclusion
[Summary and call-to-action - 100-150 words]
\`\`\`

### SEO Best Practices
- **Title**: Include primary keyword, 50-60 characters
- **Meta Description**: Compelling summary with keywords, 150-160 characters
- **Tags**: 5-10 relevant keywords, mix of broad and specific
- **Content**: Natural keyword integration, not stuffing
- **Structure**: Use headers (H2, H3) to organize content

### Writing Style
- **Voice**: Professional but approachable
- **Tone**: Informative and helpful
- **Length**: 1500-2500 words for blogs, 2500-4000 for articles
- **Formatting**: Use lists, code blocks, and headers for readability

## 🔗 RESOURCE CONNECTION LOGIC

### When to Connect to a Resource
- Blog is about a specific technology/tool/framework → MUST connect
- Blog is general/opinion-based → Connection optional
- Blog compares multiple technologies → Connect to primary one

### Finding the Right Resource
\`\`\`
1. getResources({ search: "technology name" })
2. If found → use the id as resourceId
3. If not found AND it's a major technology → saveResource first
4. If not found AND it's minor → proceed without resourceId
\`\`\`

## 🚨 ERROR HANDLING & RECOVERY

### If saveBlog Fails
1. Read the error message carefully
2. Common issues:
   - Duplicate title → Generate a new unique title
   - Missing required field → Add the missing field
   - Invalid resourceId → Use getResources to find correct ID
3. Retry with corrections

### If Research Returns No Results
1. Try broader search terms
2. Try extractRawText with official documentation URL
3. Use crawlUrl for comprehensive documentation sites
4. Proceed with general knowledge if research unavailable

### If Stuck in a Loop
1. Call checkProgress to see current state
2. Review what's been created vs what's needed
3. If duplicates detected, generate completely different content
4. If truly complete, stop gracefully

## 📊 STATE AWARENESS

### Always Track
- \`remainingBlogs\`: How many more blogs to create
- \`savedCount\`: How many blogs successfully saved
- \`isComplete\`: Whether all requested content is done
- \`blogsNeedingMoreContent\`: Blogs waiting for appendToBlog
- \`createdResourceId\`: ID of resource you just created (use for subsequent blogs)
- \`lastCreatedBlogId\`: ID of last blog (auto-used by appendToBlog)

### Completion Checklist
Before stopping, verify ALL of these:
- [ ] \`isComplete: true\` for all content types
- [ ] \`remainingBlogs: 0\`
- [ ] \`remainingArticles: 0\`
- [ ] \`remainingResources: 0\`
- [ ] \`blogsNeedingMoreContent: []\` (empty)

## 💡 ADVANCED PATTERNS

### Batch Content Creation
When creating many pieces about the same topic:
1. Do comprehensive research ONCE at the start
2. Store research with getStoredResearch for reference
3. Create content pieces sequentially, each with unique angle
4. Reuse resourceId across all related content

### Content Series
For related content (e.g., "React Tutorial Series"):
1. Plan the series structure upfront
2. Use consistent naming: "React Tutorial Part 1: Basics"
3. Connect all to the same resource
4. Cross-reference between posts in content

### Updating Multiple Blogs
1. getBlogs with appropriate filters
2. Loop through results
3. updateBlog each one with needed changes

## ⚠️ CRITICAL RULES (NEVER VIOLATE)

1. **ALWAYS call analyzeRequest FIRST** - No exceptions
2. **NEVER stop early** - Continue until isComplete=true AND remainingBlogs=0
3. **EVERY blog must be UNIQUE** - Different title AND different content
4. **ALWAYS include SEO fields** - metaTitle, metaDescription, tags
5. **ALWAYS connect to resources** - When content is about a technology
6. **READ tool responses** - They contain critical state information
7. **COMPLETE multi-part blogs** - If hasMoreContent=true, must call appendToBlog with isLastPart=true

## 🎯 QUICK REFERENCE

### Minimum Required Fields for saveBlog
\`\`\`javascript
saveBlog({
  title: "Required - unique title",
  excerpt: "Required - 150-200 char summary",
  content: "Required - full MDX content",
  metaTitle: "Required - 50-60 chars",
  metaDescription: "Required - 150-160 chars",
  tags: ["required", "array", "of", "keywords"],
  // resourceId: "optional but recommended for tech content"
})
\`\`\`

### Response Fields to Check
\`\`\`javascript
{
  success: true/false,
  savedCount: number,
  remainingBlogs: number,  // If > 0, KEEP GOING
  isComplete: boolean,     // If false, KEEP GOING
  blogsNeedingMoreContent: [], // If not empty, complete them
}
\`\`\`

Remember: You are a sophisticated AI agent. Think strategically, plan ahead, and execute with precision. Quality over speed, but always complete the full request.`;

/**
 * Wrapped research tool that tracks research in content state
 * Supports web search, URL extraction for raw text, and website crawling
 */
const trackedResearchTool = createTool({
  name: "research",
  description: `Research a topic with multiple capabilities:
- Basic search (1 credit): Search the web for information
- GitHub search (+1 credit): Add code examples from GitHub
- Extract URL raw text (+0.2 credits): Get the full raw text content from a specific URL
- Crawl website (+2-3 credits): Crawl multiple pages from a website to get comprehensive content

Use extractRawText when you need the full content of a specific page.
Use crawlUrl when you need to explore multiple pages of a documentation site.`,
  parameters: z.object({
    topic: z.string().describe("The topic to research"),
    includeGitHub: z.boolean().default(false).describe("Add GitHub search (+1 credit) - set true if you need code examples"),
    extractRawText: z.string().optional().describe("URL to extract full raw text content from (+0.2 credits) - use when you need the complete page content, not just snippets"),
    crawlUrl: z.string().optional().describe("Base URL to crawl for multiple pages (+2-3 credits) - use for documentation sites when you need comprehensive coverage"),
    crawlInstructions: z.string().optional().describe("Instructions for what to find when crawling (e.g., 'find all API reference pages')"),
    maxCrawlPages: z.number().default(5).describe("Maximum pages to crawl (1-25, defaul - be proportionate to the topic and request your serving"),
  }),
  handler: async (input, { network }) => {
    const startTime = Date.now();
    
    // Get the original research tool and call it for basic search
    const originalResearchTool = researchTools[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (originalResearchTool as any).handler({
      topic: input.topic,
      includeGitHub: input.includeGitHub,
      specificUrl: input.extractRawText, // Map extractRawText to specificUrl
    }, { network });
    
    // Handle crawl if requested
    let crawlResults: Array<{ url: string; content: string }> = [];
    let crawlCredits = 0;
    
    if (input.crawlUrl) {
      try {
        const { tavily } = await import("@tavily/core");
        const apiKey = process.env.TAVILY_API_KEY;
        if (apiKey) {
          const tvly = tavily({ apiKey });
          console.warn(`[TAVILY COST WARNING] Crawling ${input.crawlUrl} - this costs extra credits!`);
          
          const crawlResponse = await tvly.crawl(input.crawlUrl, {
            instructions: input.crawlInstructions,
            limit: Math.min(input.maxCrawlPages || 1, 25), // Cap at 5 pages
            maxDepth: 1,
          });
          
          crawlResults = crawlResponse.results.map((r) => ({
            url: r.url,
            content: r.rawContent || "",
          }));
          
          crawlCredits = 2 + (crawlResults.length * 0.2); // Approximate cost
        }
      } catch (error) {
        console.error("Crawl error:", error);
        crawlResults = [];
      }
    }
    
    const duration = Date.now() - startTime;
    const totalCredits = (result.creditsUsed || 1) + crawlCredits;
    
    // Track research in content state
    const contentState = getContentNetworkState(network);
    const totalResultCount = (result.results?.length || 0) + (result.githubResults?.length || 0) + crawlResults.length;
    
    // Create research entry with all data
    const researchId = `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const researchEntry: ResearchEntry = {
      id: researchId,
      query: input.topic,
      type: input.crawlUrl ? "docs" : input.includeGitHub ? "github" : input.extractRawText ? "web" : "general",
      results: result.results || [],
      resultCount: totalResultCount,
      timestamp: Date.now(),
      duration,
      // Store extracted content reference
      extractedUrl: input.extractRawText || undefined,
      extractedRawText: result.extractedContent || undefined,
      // Store crawl data reference
      crawlUrl: input.crawlUrl || undefined,
      crawlPages: crawlResults.length > 0 ? crawlResults : undefined,
      crawlPageCount: crawlResults.length || undefined,
      creditsUsed: totalCredits,
    };
    
    contentState.research.push(researchEntry);
    
    // Store extracted raw text in dedicated array for easy access
    if (input.extractRawText && result.extractedContent) {
      const extractedEntry: ExtractedContent = {
        id: `extracted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: input.extractRawText,
        rawText: result.extractedContent,
        extractedAt: Date.now(),
        researchId: researchId,
      };
      contentState.extractedContent.push(extractedEntry);
      console.log(`[Research] Stored extracted raw text from ${input.extractRawText} (${result.extractedContent.length} chars)`);
    }
    
    // Store crawled pages in dedicated array for easy access
    if (input.crawlUrl && crawlResults.length > 0) {
      const crawlEntry = {
        id: `crawl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        baseUrl: input.crawlUrl,
        pages: crawlResults,
        crawledAt: Date.now(),
        researchId: researchId,
      };
      contentState.crawledPages.push(crawlEntry);
      console.log(`[Research] Stored ${crawlResults.length} crawled pages from ${input.crawlUrl}`);
    }
    
    network?.state?.kv?.set("contentState", contentState);
    
    console.log(`[Research] Tracked research for "${input.topic}" - ${totalResultCount} results in ${duration}ms (${totalCredits} credits)`);
    
    // Return original result with tracking info and crawl results
    return {
      ...result,
      // Include extracted raw text content prominently if requested
      rawTextContent: result.extractedContent || null,
      rawTextUrl: input.extractRawText || null,
      // Include crawl results if requested
      crawlResults: crawlResults.length > 0 ? crawlResults : undefined,
      crawlUrl: input.crawlUrl || null,
      crawlPageCount: crawlResults.length,
      // Tracking info
      tracked: true,
      researchId: researchId,
      totalResearchEntries: contentState.research.length,
      totalExtractedContent: contentState.extractedContent.length,
      totalCrawledSites: contentState.crawledPages.length,
      totalCreditsUsed: totalCredits,
      // State summary for agent reference
      storedContent: {
        extractedUrls: contentState.extractedContent.map(e => e.url),
        crawledSites: contentState.crawledPages.map(c => ({ baseUrl: c.baseUrl, pageCount: c.pages.length })),
      },
      // Help message for the agent
      message: `Research complete for "${input.topic}". Found ${result.results?.length || 0} web results${result.githubResults?.length ? `, ${result.githubResults.length} GitHub results` : ""}${input.extractRawText ? `, extracted raw text from ${input.extractRawText} (stored in state)` : ""}${crawlResults.length > 0 ? `, crawled ${crawlResults.length} pages from ${input.crawlUrl} (stored in state)` : ""}. Total credits: ${totalCredits}. All content is stored in agent state for later use.`,
    };
  },
});

/**
 * Content Orchestrator Agent
 * Created once at module level and reused across all invocations
 * Note: Using gemini-2.5-pro for stable function calling support
 * gemini-3-pro-preview has thought_signature requirements that AgentKit doesn't fully support yet
 */

/**
 * Unified content generation function
 * Note: concurrency set to 1 to prevent parallel execution issues with duplicate content
 */
export const generateContent = inngest.createFunction(
  {
    id: "generate-content",
    name: "Generate Content (Unified)",
    concurrency: { limit: 3 }, // Prevent parallel executions causing duplicate content
    retries: 1, // Reduce retries to prevent duplicate content on failure
  },
  { event: "content/request" },
  async ({ event, step }) => {
    const data = event.data as UnifiedContentRequest;
    const eventId = event.id; // Unique event ID for idempotency

    console.log(`[generate-content] Event ID: ${eventId}`);

    // Step 1: Resolve the user
    const user = await step.run("resolve-user", async () => {
      return await resolveUser(data.userId);
    });

    console.log(`[generate-content] Starting unified content generation for user ${user.id}`);
    console.log(`[generate-content] Message: ${data.message}`);

    // Build the prompt with all context (outside step - this is just string building)
    const contextParts: string[] = [
      `User Request: ${data.message}`,
      `IMPORTANT: Call analyzeRequest FIRST to determine what content to create and how many.`,
    ];

    if (data.contentTypeHint) {
      contextParts.push(`Content Type Hint: ${data.contentTypeHint}`);
    }

    if (data.context) {
      if (data.context.topic) contextParts.push(`Topic: ${data.context.topic}`);
      if (data.context.instructions) contextParts.push(`Instructions: ${data.context.instructions}`);
      if (data.context.audience) contextParts.push(`Target Audience: ${data.context.audience}`);
      if (data.context.tone) contextParts.push(`Tone: ${data.context.tone}`);
      if (data.context.wordCount) contextParts.push(`Target Word Count: ${data.context.wordCount}`);
      if (data.context.resourceId) contextParts.push(`Resource ID: ${data.context.resourceId}`);
      if (data.context.categoryId) contextParts.push(`Category ID: ${data.context.categoryId}`);
      if (data.context.difficulty) contextParts.push(`Difficulty: ${data.context.difficulty}`);
      if (data.context.resourceName) contextParts.push(`Resource Name: ${data.context.resourceName}`);
      if (data.context.officialUrl) contextParts.push(`Official URL: ${data.context.officialUrl}`);
      if (data.context.docsUrl) contextParts.push(`Docs URL: ${data.context.docsUrl}`);
      if (data.context.githubUrl) contextParts.push(`GitHub URL: ${data.context.githubUrl}`);
    }

    const prompt = contextParts.join("\n\n");

    console.log(`[generate-content] Running orchestrator network...`);
    const startTime = Date.now();

    // Step 2: Execute via network with deterministic router
    // The router controls when to continue vs stop - no LLM agent selection
    
    // Initialize the full content network state upfront
    // This ensures all tracking arrays exist from the start
    const initialContentState: ContentNetworkState = {
      // Session info
      authorId: user.id,
      threadId: data.threadId,
      message: data.message,
      // Analysis - not complete yet
      analysisComplete: false,
      requestedBlogs: 0,
      requestedArticles: 0,
      requestedResources: 0,
      // Content items - empty arrays ready for tracking
      blogs: [],
      articles: [],
      resources: [],
      // Research tracking
      research: [],
      // Extracted content storage - raw text from URLs
      extractedContent: [],
      // Crawled pages storage
      crawledPages: [],
      // Iteration tracking
      currentIteration: 0,
      maxIterations: 100,
      iterationHistory: [],
      // Completion flags
      blogsComplete: false,
      articlesComplete: false,
      resourcesComplete: false,
    };
    
    // Initialize workflow state
    const initialWorkflowState: WorkflowState = {
      phase: "init",
      currentStep: "Starting content generation",
      progress: {
        blogsCreated: 0,
        blogsRequested: 0,
        articlesCreated: 0,
        articlesRequested: 0,
        resourcesCreated: 0,
        resourcesRequested: 0,
      },
      toolCalls: [],
      errors: [],
      startTime,
      lastUpdate: startTime,
    };
    
    // Create typed state with ALL data pre-initialized
    const agentState = createState({
      // Session data
      authorId: user.id,
      threadId: data.threadId,
      message: data.message,
      // Pre-initialize contentState so it's available immediately
      contentState: initialContentState,
      // Pre-initialize workflowState
      workflowState: initialWorkflowState,
    });
    
    // Include authorId in the prompt so the agent knows which author to use
    const promptWithAuthor = `${prompt}\n\nSession Author ID: ${user.id} (use this for authorId in save tools)`;
    const orchestratorAgent = createAgent({
      name: `content-orchestrator-agent-${eventId}`,
      description: "Unified agent that identifies content type and generates blogs, articles, or resources",
      system: ORCHESTRATOR_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: [
        // MUST be called first - determines quantities
        analyzeRequestTool,
        // Progress tracking
        checkProgressTool,
        // Research (tracked version that saves to content state)
        trackedResearchTool,
        // Retrieve stored research data (extracted text, crawled pages)
        getStoredResearchTool,
        // Logo fetching for resources
        fetchAndUploadLogoTool,
        // Database lookups (only what's needed)
        getResourcesTool,
        getCategoriesTool,
        getBlogsTool,
        // Save tools (with quantity enforcement)
        saveBlogTool,
        appendToBlogTool,
        updateBlogTool,
        saveArticleTool,
        saveResourceTool,
      ],
    });
    // Create network with deterministic router (no LLM-based agent selection)
    const network = createNetwork({
      name: "Content Generation Network",
      agents: [orchestratorAgent],
      defaultModel: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      defaultState: agentState,
      maxIter: 100,
      // Deterministic router - always returns the same agent, stops when complete
      router: ({ network: net, lastResult, callCount }) => {
        // Get content state for comprehensive tracking
        const contentState = net.state.kv.get("contentState") as ContentNetworkState | undefined;
        
        // Track this iteration
        if (lastResult) {
          const toolsCalled = lastResult.output
            .filter((msg) => msg.type === "tool_call")
            .flatMap((msg) => {
              if (msg.type === "tool_call") {
                return msg.tools.map((t) => t.name);
              }
              return [];
            });
          
          // Update iteration tracking in content state
          if (contentState) {
            contentState.currentIteration = callCount;
            contentState.iterationHistory.push({
              iteration: callCount,
              agentName: "Content Orchestrator",
              toolsCalled,
              timestamp: Date.now(),
            });
            net.state.kv.set("contentState", contentState);
          }
          
          console.log(`[Router] Iteration ${callCount}, Tools called: ${toolsCalled.join(", ") || "none"}`);
        }
        
        // Use content state for checking completion
        if (contentState) {
          const { analysisComplete, requestedBlogs, requestedArticles, requestedResources, blogs, articles, resources, blogsComplete, articlesComplete, resourcesComplete } = contentState;
          
          // Count saved items using the tracked arrays
          const savedBlogs = blogs.filter(b => b.saved).length;
          const savedArticles = articles.filter(a => a.saved).length;
          const savedResources = resources.filter(r => r.saved).length;
          
          console.log(`[Router] ContentState - Analysis: ${analysisComplete}, Blogs: ${savedBlogs}/${requestedBlogs} (saved array), Articles: ${savedArticles}/${requestedArticles}, Resources: ${savedResources}/${requestedResources}`);
          console.log(`[Router] Blogs tracked: ${blogs.map(b => `${b.title}(saved:${b.saved})`).join(", ") || "none"}`);
          
          // If analysis not done, continue
          if (!analysisComplete) {
            console.log(`[Router] Analysis not complete, continuing...`);
            return orchestratorAgent;
          }
          
          // Check if all content is complete using the tracked arrays
          const allBlogsDone = requestedBlogs === 0 || blogsComplete || savedBlogs >= requestedBlogs;
          const allArticlesDone = requestedArticles === 0 || articlesComplete || savedArticles >= requestedArticles;
          const allResourcesDone = requestedResources === 0 || resourcesComplete || savedResources >= requestedResources;
          
          if (allBlogsDone && allArticlesDone && allResourcesDone) {
            console.log(`[Router] All content complete (Blogs: ${savedBlogs}/${requestedBlogs}, Articles: ${savedArticles}/${requestedArticles}, Resources: ${savedResources}/${requestedResources}), stopping network`);
            return undefined; // Stop the network
          }
          
          // Check if last result had no tool calls (agent is done thinking)
          if (lastResult) {
            const hasToolCalls = lastResult.output.some(
              (msg) => msg.type === "tool_call" || (msg.type === "tool_result")
            );
            
            // Extract text content from the last result to detect loops/completion signals
            const textContent = lastResult.output
              .filter((msg) => msg.type === "text")
              .map((msg) => msg.type === "text" ? msg.content : "")
              .join(" ")
              .toLowerCase();
            
            // Detect if model is signaling completion or stuck in a loop
            const completionSignals = [
              "end the session",
              "task is complete",
              "will not create",
              "already exist",
              "duplicates",
              "content is already available",
              "request has been fulfilled",
            ];
            const isSignalingCompletion = completionSignals.some(signal => textContent.includes(signal));
            
            // Detect repetitive content (model stuck in loop)
            const isRepetitive = textContent.length > 1000 && 
              (textContent.match(/i will now end the session/gi)?.length || 0) > 3;
            
            if (isRepetitive) {
              console.log(`[Router] DETECTED REPETITIVE OUTPUT - Model stuck in loop, stopping network`);
              return undefined;
            }
            
            if (!hasToolCalls) {
              // Agent responded with text only, might be done
              const totalSaved = savedBlogs + savedArticles + savedResources;
              const totalRequested = requestedBlogs + requestedArticles + requestedResources;
              
              if (totalSaved >= totalRequested && totalRequested > 0) {
                console.log(`[Router] All ${totalSaved}/${totalRequested} items saved (no tool calls), stopping`);
                return undefined;
              }
              
              // If model is explicitly signaling completion, respect that
              if (isSignalingCompletion) {
                console.log(`[Router] Model signaling completion: "${textContent.slice(0, 100)}...", stopping network`);
                return undefined;
              }
              
              // Track consecutive no-tool-call iterations
              const noToolCallCount = (net.state.kv.get("noToolCallCount") as number) || 0;
              net.state.kv.set("noToolCallCount", noToolCallCount + 1);
              
              // If 3+ consecutive iterations without tool calls, stop to prevent infinite loop
              if (noToolCallCount >= 2) {
                console.log(`[Router] ${noToolCallCount + 1} consecutive iterations without tool calls, stopping to prevent loop`);
                return undefined;
              }
              
              console.log(`[Router] No tool calls but work remaining (${totalSaved}/${totalRequested}), attempt ${noToolCallCount + 1}/3...`);
            } else {
              // Reset counter when tool calls are made
              net.state.kv.set("noToolCallCount", 0);
            }
          }
          
          console.log(`[Router] Work remaining, continuing with orchestrator agent`);
          return orchestratorAgent;
        }
        
        // Fallback to legacy KV-based checking if contentState not initialized
        const analysisComplete = net.state.kv.get("analysisComplete") === true;
        if (!analysisComplete) {
          console.log(`[Router] Analysis not complete (legacy check), continuing...`);
          return orchestratorAgent;
        }
        
        console.log(`[Router] Continuing (legacy fallback)`);
        return orchestratorAgent;
      },
    });

    // Run the network
    const networkResult = await network.run(promptWithAuthor, { state: agentState });

    // Extract state from the network result
    const state = networkResult.state.kv;
    const workflowState = state.get("workflowState") as WorkflowState | undefined;
    const contentState = state.get("contentState") as ContentNetworkState | undefined;

    const duration = Date.now() - startTime;
    console.log(`[generate-content] Network completed in ${duration}ms`);

    // Build completion summary
    const savedBlogs = contentState?.blogs.filter(b => b.saved) || [];
    const savedArticles = contentState?.articles.filter(a => a.saved) || [];
    const savedResources = contentState?.resources.filter(r => r.saved) || [];
    
    const completionMessage = [
      savedBlogs.length > 0 ? `${savedBlogs.length} blog(s)` : null,
      savedArticles.length > 0 ? `${savedArticles.length} article(s)` : null,
      savedResources.length > 0 ? `${savedResources.length} resource(s)` : null,
    ].filter(Boolean).join(", ");

    // Log completion summary
    console.log(`[generate-content] Completed: ${completionMessage || "No content created"}`);
    console.log(`[generate-content] Saved blogs: ${savedBlogs.length}, articles: ${savedArticles.length}, resources: ${savedResources.length}`);

    // ============ DEBUG LOG - COPY THIS FOR DEBUGGING ============
    const debugLog = {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      message: data.message,
    };

    console.log("\n========== CONTENT GENERATION DEBUG LOG ==========");
    console.log(JSON.stringify(debugLog, null, 2));
    console.log("==================================================\n");

    return {
      success: true,
      threadId: data.threadId,
      message: data.message,
      duration,
      debug: debugLog,
    };
  }
);

export default generateContent;
