/**
 * Web search tools for AgentKit agents
 * Provides research capabilities using Tavily API
 * 
 * CREDIT OPTIMIZATION:
 * - Basic search: 1 credit per query
 * - Advanced search: 2 credits per query (avoid unless necessary)
 * - Basic extract: 1 credit per 5 URLs
 * - Advanced extract: 2 credits per 5 URLs (avoid)
 * - Crawl: Map + Extract pricing (EXPENSIVE - avoid)
 * 
 * Strategy: Use basic search by default, only use advanced for critical docs
 */
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { tavily } from "@tavily/core";

/**
 * Initialize Tavily client (lazy initialization)
 */
function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("TAVILY_API_KEY not set - web search will return empty results");
    return null;
  }
  return tavily({ apiKey });
}

/**
 * Search result interface
 */
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
  score?: number;
  rawContent?: string;
}

/**
 * Search the web for information using Tavily
 * COST: 1 credit (basic search only to conserve credits)
 */
export const searchWebTool = createTool({
  name: "searchWeb",
  description:
    "Search the web for relevant information about a topic. Uses basic search (1 credit) to conserve API credits.",
  parameters: z.object({
    query: z.string().describe("The search query"),
    type: z
      .enum(["general", "documentation", "tutorial", "news", "github"])
      .default("general")
      .describe("Type of search to perform"),
    limit: z.number().default(5).describe("Maximum number of results (keep low to save credits)"),
  }),
  handler: async (input, { network }) => {
    const tvly = getTavilyClient();
    
    if (!tvly) {
      const existingSearches = (network?.state.kv.get("searches") as Array<unknown>) || [];
      network?.state.kv.set("searches", [
        ...existingSearches,
        { query: input.query, type: input.type, resultCount: 0, error: "API key not configured" },
      ]);
      
      return {
        success: false,
        message: `Tavily API key not configured. Proceeding with existing knowledge for "${input.query}".`,
        results: [],
        query: input.query,
        type: input.type,
      };
    }

    try {
      // ALWAYS use basic search (1 credit) - advanced is 2 credits
      const response = await tvly.search(input.query, {
        searchDepth: "basic", // Always basic to save credits
        maxResults: Math.min(input.limit, 5), // Cap at 5 results
        includeAnswer: true,
        topic: input.type === "news" ? "news" : "general",
      });

      const results: SearchResult[] = response.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        score: r.score,
        rawContent: r.rawContent || undefined,
      }));

      const existingSearches = (network?.state.kv.get("searches") as Array<unknown>) || [];
      network?.state.kv.set("searches", [
        ...existingSearches,
        { query: input.query, type: input.type, resultCount: results.length, credits: 1 },
      ]);

      return {
        success: true,
        results,
        query: input.query,
        type: input.type,
        count: results.length,
        answer: response.answer,
        creditsUsed: 1,
      };
    } catch (error) {
      console.error("Tavily search error:", error);
      
      const existingSearches = (network?.state.kv.get("searches") as Array<unknown>) || [];
      network?.state.kv.set("searches", [
        ...existingSearches,
        { query: input.query, type: input.type, resultCount: 0, error: String(error) },
      ]);

      return {
        success: false,
        message: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}. Proceeding with existing knowledge.`,
        results: [],
        query: input.query,
        type: input.type,
      };
    }
  },
});

/**
 * Search for documentation specifically using Tavily
 * COST: 1 credit (basic search to conserve credits)
 */
export const searchDocsTool = createTool({
  name: "searchDocs",
  description:
    "Search for official documentation. Uses basic search (1 credit) to conserve API credits.",
  parameters: z.object({
    technology: z.string().describe("The technology to search documentation for"),
    topic: z.string().optional().describe("Specific topic within the documentation"),
  }),
  handler: async (input, { network }) => {
    const tvly = getTavilyClient();
    
    const query = input.topic
      ? `${input.technology} documentation ${input.topic}`
      : `${input.technology} official documentation`;

    if (!tvly) {
      network?.state.kv.set("docsSearched", true);
      return {
        success: false,
        technology: input.technology,
        topic: input.topic,
        results: [],
        message: `Tavily API key not configured. Using existing knowledge about ${input.technology}.`,
      };
    }

    try {
      // Use basic search (1 credit) instead of advanced (2 credits)
      const response = await tvly.search(query, {
        searchDepth: "basic", // Changed from "advanced" to save 1 credit
        maxResults: 3, // Reduced from 5
        includeAnswer: true,
        // Removed includeRawContent to reduce data transfer
      });

      const results: SearchResult[] = response.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        score: r.score,
      }));

      network?.state.kv.set("docsSearched", true);

      return {
        success: true,
        technology: input.technology,
        topic: input.topic,
        results,
        answer: response.answer,
        message: `Found ${results.length} documentation results.`,
        creditsUsed: 1,
      };
    } catch (error) {
      console.error("Tavily docs search error:", error);
      network?.state.kv.set("docsSearched", true);
      
      return {
        success: false,
        technology: input.technology,
        topic: input.topic,
        results: [],
        message: `Documentation search failed. Using existing knowledge about ${input.technology}.`,
      };
    }
  },
});

/**
 * Search GitHub for code examples using Tavily
 */
export const searchGitHubTool = createTool({
  name: "searchGitHub",
  description:
    "Search GitHub for code examples and repositories. Use this to find real-world implementations and examples.",
  parameters: z.object({
    query: z.string().describe("The search query for GitHub"),
    language: z.string().optional().describe("Programming language to filter by"),
  }),
  handler: async (input, { network }) => {
    const tvly = getTavilyClient();
    
    const searchQuery = input.language
      ? `site:github.com ${input.query} ${input.language}`
      : `site:github.com ${input.query}`;

    if (!tvly) {
      return {
        success: false,
        query: input.query,
        language: input.language,
        results: [],
        message: "Tavily API key not configured. Proceeding with general examples.",
      };
    }

    try {
      const response = await tvly.search(searchQuery, {
        searchDepth: "basic",
        maxResults: 5,
      });

      const results: SearchResult[] = response.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        score: r.score,
      }));

      return {
        success: true,
        query: input.query,
        language: input.language,
        results,
        message: `Found ${results.length} GitHub results.`,
      };
    } catch (error) {
      console.error("Tavily GitHub search error:", error);
      
      return {
        success: false,
        query: input.query,
        language: input.language,
        results: [],
        message: "GitHub search failed. Proceeding with general examples.",
      };
    }
  },
});

/**
 * Extract content from a specific URL using Tavily
 * COST: ~0.2 credits (basic extract = 1 credit per 5 URLs)
 * Use sparingly - prefer search results snippets when possible
 */
export const extractUrlTool = createTool({
  name: "extractUrl",
  description:
    "Extract full content from a URL. COSTS ~0.2 credits. Only use when search snippets are insufficient.",
  parameters: z.object({
    url: z.string().url().describe("The URL to extract content from"),
  }),
  handler: async (input) => {
    const tvly = getTavilyClient();
    
    if (!tvly) {
      return {
        success: false,
        url: input.url,
        content: null,
        message: "Tavily API key not configured. Cannot extract URL content.",
      };
    }

    try {
      // Use basic extract (1 credit per 5 URLs) instead of advanced (2 credits per 5 URLs)
      const response = await tvly.extract([input.url], {
        extractDepth: "basic", // Changed from "advanced" to save credits
      });

      const result = response.results[0];
      
      if (!result) {
        return {
          success: false,
          url: input.url,
          content: null,
          message: "Failed to extract content from URL.",
        };
      }

      return {
        success: true,
        url: input.url,
        content: result.rawContent,
        message: `Successfully extracted content from ${input.url}`,
        creditsUsed: 0.2, // 1 credit per 5 URLs
      };
    } catch (error) {
      console.error("Tavily extract error:", error);
      
      return {
        success: false,
        url: input.url,
        content: null,
        message: `Failed to extract URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

/**
 * Crawl a website to discover pages using Tavily
 * COST: EXPENSIVE! Map (1 credit per 10 URLs) + Extract pricing
 * AVOID using this tool - use search instead
 */
export const crawlWebsiteTool = createTool({
  name: "crawlWebsite",
  description:
    "EXPENSIVE - AVOID! Crawl costs Map + Extract credits. Use search instead unless absolutely necessary.",
  parameters: z.object({
    url: z.string().url().describe("The base URL to start crawling from"),
    instructions: z.string().optional().describe("Natural language instructions for what to find"),
    maxPages: z.number().default(3).describe("Maximum pages to crawl (keep LOW to save credits)"),
  }),
  handler: async (input) => {
    const tvly = getTavilyClient();
    
    if (!tvly) {
      return {
        success: false,
        url: input.url,
        pages: [],
        message: "Tavily API key not configured. Cannot crawl website.",
      };
    }

    // Warn about cost
    console.warn(`[TAVILY COST WARNING] Crawling ${input.url} - this is expensive!`);

    try {
      const response = await tvly.crawl(input.url, {
        instructions: input.instructions,
        limit: Math.min(input.maxPages, 3), // Cap at 3 pages to limit cost
        maxDepth: 1, // Reduced from 2 to save credits
      });

      const pages = response.results.map((r) => ({
        url: r.url,
        content: r.rawContent,
      }));

      return {
        success: true,
        url: input.url,
        pages,
        pageCount: pages.length,
        message: `Crawled ${pages.length} pages from ${input.url}`,
        warning: "Crawl is expensive - consider using search next time",
      };
    } catch (error) {
      console.error("Tavily crawl error:", error);
      
      return {
        success: false,
        url: input.url,
        pages: [],
        message: `Failed to crawl website: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

/**
 * Consolidated research tool - OPTIMIZED FOR CREDIT CONSERVATION
 * 
 * COST BREAKDOWN:
 * - Default (1 search): 1 credit
 * - With GitHub: 2 credits (2 basic searches)
 * - With URL extract: +0.2 credits
 * 
 * Previously used 3+ credits (basic + advanced), now uses 1-2 credits
 */
export const researchTool = createTool({
  name: "research",
  description:
    "Research a topic efficiently. COST: 1 credit (or 2 with GitHub). Uses a single optimized search query.",
  parameters: z.object({
    topic: z.string().describe("The topic to research"),
    includeGitHub: z.boolean().default(false).describe("Add GitHub search (+1 credit) - only if code examples needed"),
    specificUrl: z.string().optional().describe("Extract specific URL (+0.2 credits) - only if really needed"),
  }),
  handler: async (input, { network }) => {
    const tvly = getTavilyClient();
    
    if (!tvly) {
      network?.state.kv.set("researched", true);
      return {
        success: false,
        topic: input.topic,
        message: "Tavily API key not configured. Proceeding with existing knowledge.",
        results: [],
        creditsUsed: 0,
      };
    }

    try {
      let creditsUsed = 0;
      
      // OPTIMIZED: Single comprehensive search instead of multiple
      // Combines topic + documentation keywords in one query to save credits
      const mainQuery = `${input.topic} documentation guide tutorial`;
      
      const searchPromises: Promise<unknown>[] = [
        // Single comprehensive search (1 credit)
        tvly.search(mainQuery, {
          searchDepth: "basic", // Always basic to save credits
          maxResults: 5, // Get enough results from one search
          includeAnswer: true,
        }),
      ];
      creditsUsed += 1;

      // Only add GitHub search if explicitly requested (+1 credit)
      if (input.includeGitHub) {
        searchPromises.push(
          tvly.search(`site:github.com ${input.topic}`, {
            searchDepth: "basic",
            maxResults: 3,
          })
        );
        creditsUsed += 1;
      }

      // Only extract URL if explicitly provided (+0.2 credits)
      if (input.specificUrl) {
        searchPromises.push(
          tvly.extract([input.specificUrl], { extractDepth: "basic" })
        );
        creditsUsed += 0.2;
      }

      const responses = await Promise.all(searchPromises);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mainResponse = responses[0] as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const githubResponse = input.includeGitHub ? responses[1] as any : null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extractResponse = input.specificUrl ? responses[input.includeGitHub ? 2 : 1] as any : null;

      // Transform main results
      const results: SearchResult[] = mainResponse.results.map((r: { title: string; url: string; content: string; score?: number }) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        score: r.score,
      }));

      // Transform GitHub results if present
      const githubResults: SearchResult[] = githubResponse?.results?.map((r: { title: string; url: string; content: string; score?: number }) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        score: r.score,
      })) || [];

      // Mark as researched
      network?.state.kv.set("researched", true);

      return {
        success: true,
        topic: input.topic,
        results, // Combined web + docs results
        githubResults,
        answer: mainResponse.answer,
        extractedContent: extractResponse?.results?.[0]?.rawContent || null,
        totalResults: results.length + githubResults.length,
        creditsUsed,
        message: `Found ${results.length} results${githubResults.length > 0 ? ` + ${githubResults.length} GitHub` : ""}. Credits used: ${creditsUsed}`,
      };
    } catch (error) {
      console.error("Research error:", error);
      network?.state.kv.set("researched", true);
      
      return {
        success: false,
        topic: input.topic,
        message: `Research failed: ${error instanceof Error ? error.message : "Unknown error"}. Proceeding with existing knowledge.`,
        results: [],
        githubResults: [],
        creditsUsed: 0,
      };
    }
  },
});

// Export all web search tools (legacy - for backwards compatibility)
export const webSearchTools = [
  searchWebTool,
  searchDocsTool,
  searchGitHubTool,
  extractUrlTool,
  crawlWebsiteTool,
];

// Export consolidated research tool (recommended)
export const researchTools = [
  researchTool,
];
