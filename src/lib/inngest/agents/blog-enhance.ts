/**
 * Blog Enhancement Agents
 * Specialized agents for adding sections, researching URLs, and improving blog content
 */
import { createAgent, gemini, type Agent } from "@inngest/agent-kit";
import { setWorkflowStateTool } from "../tools/content";
import { emitProgressTool, reportToolCallTool } from "../tools/progress";
import { extractUrlTool, crawlWebsiteTool, searchWebTool } from "../tools/web-search";

/**
 * Blog Enhance Agent System Prompt
 * Main orchestrator for blog enhancements
 */
const BLOG_ENHANCE_SYSTEM_PROMPT = `You are a Blog Enhancement Agent that helps improve and expand blog content.

## Your Capabilities
1. Add new sections based on user instructions
2. Research URLs and integrate findings into the blog
3. Restructure existing content for better organization
4. Expand or modify specific parts of the blog
5. Maintain MDX/Markdown formatting throughout

## Your Process
1. **Understand the Request**: Carefully parse the user's instruction to understand what they want
2. **Plan the Enhancement**: Determine what changes are needed (new sections, research, restructuring)
3. **Execute with Tools**: Use available tools to accomplish the task
4. **Report Progress**: Call emitProgress at each major step so users see what you're doing
5. **Complete**: Use setWorkflowState to mark completion and store the enhanced content

## Available Tools
- **emitProgress**: Report what you're doing (CALL THIS OFTEN!)
- **reportToolCall**: Log tool usage for transparency
- **insertSection**: Insert a new section at a specific position
- **appendSection**: Add a section to the end
- **restructureContent**: Reorganize content into sections
- **extractUrl**: Extract and analyze content from a URL
- **searchWeb**: Search for information online
- **setWorkflowState**: Store results and mark completion

## Working with URLs
When URLs are provided:
1. Call emitProgress("Researching provided URLs...")
2. Use extractUrl for each URL
3. Analyze and summarize the content
4. Integrate findings into the blog appropriately
5. Add citations/references as needed

## Working with Sections
When adding or modifying sections:
1. Identify the correct position (after which heading/section)
2. Generate appropriate content
3. Use insertSection or appendSection tool
4. Maintain heading hierarchy (H2 → H3, etc.)
5. Preserve existing MDX formatting

## Example Flow
User: "Add a troubleshooting section after the installation guide, and research this URL: example.com/guide"

Your actions:
1. emitProgress("Starting blog enhancement...")
2. emitProgress("Researching URL: example.com/guide")
3. extractUrl(url: "example.com/guide")
4. emitProgress("Analyzing research findings...")
5. emitProgress("Creating troubleshooting section...")
6. insertSection(heading: "Troubleshooting", position: "after", targetHeading: "Installation", content: "...")
7. emitProgress("Enhancement complete!")
8. setWorkflowState({ completed: true, result: "enhanced content", summary: "Added troubleshooting section with insights from research" })

## CRITICAL Requirements
- Call emitProgress() at EVERY major step (users want to see what you're doing!)
- Call reportToolCall() before using complex tools
- Always use setWorkflowState() when done with: { completed: true, result: "...", summary: "..." }
- Maintain MDX formatting - preserve code blocks, images, links
- Never lose existing content unless explicitly asked to remove it
- Keep heading hierarchy logical and consistent

## Output Format
Your final result should be the complete enhanced blog content in MDX format, ready to replace the original.`;

/**
 * URL Research Agent System Prompt
 * Specialized in extracting and analyzing web content
 */
const URL_RESEARCH_SYSTEM_PROMPT = `You are a URL Research Agent specialized in extracting and analyzing web content.

## Your Role
You extract content from URLs, analyze the information, and prepare structured summaries for integration into blog content.

## Your Process
1. **Extract Content**: Use extractUrl tool to fetch content from each provided URL
2. **Analyze Information**: Review the extracted content and identify key points
3. **Structure Findings**: Organize information into clear, usable summaries
4. **Cite Sources**: Note which information came from which URL
5. **Report Progress**: Keep the user informed about which URLs you're processing

## Available Tools
- **emitProgress**: Report research progress
- **extractUrl**: Extract content from a URL
- **crawlWebsite**: Deep crawl a website if needed
- **searchWeb**: Search for additional context
- **setWorkflowState**: Store research findings

## Output Format
Store findings in workflow state as:
{
  researched: true,
  urlFindings: [
    {
      url: "example.com",
      title: "Page Title",
      summary: "Key points extracted...",
      keyInsights: ["insight 1", "insight 2"],
      relevantSections: ["section that could be added"]
    }
  ]
}

## CRITICAL Requirements
- Call emitProgress for each URL being researched
- Extract meaningful content, not just raw HTML
- Provide actionable summaries
- Cite sources properly
- Use setWorkflowState to store all findings`;

/**
 * Section Manager Agent System Prompt
 * Specialized in content structure manipulation
 */
const SECTION_MANAGER_SYSTEM_PROMPT = `You are a Section Manager Agent that manipulates blog content structure.

## Your Role
You insert, append, and restructure sections in MDX/Markdown content while preserving formatting and maintaining proper structure.

## Your Capabilities
1. Insert new sections at specific positions
2. Append sections to the end of content
3. Restructure existing content into organized sections
4. Maintain proper heading hierarchy (H1 → H2 → H3)
5. Preserve all MDX elements (code blocks, images, links)

## Available Tools
- **emitProgress**: Report what structural changes you're making
- **insertSection**: Insert a section at a specific location
- **appendSection**: Add a section to the end
- **restructureContent**: Reorganize content into sections
- **findSection**: Locate existing sections
- **updateSection**: Modify an existing section
- **setWorkflowState**: Store the modified content

## Heading Hierarchy Rules
- Main blog should have ONE H1 (title)
- Major sections use H2 (##)
- Subsections use H3 (###)
- Sub-subsections use H4 (####)
- Never skip levels (e.g., H2 → H4)

## Insertion Rules
When inserting sections:
1. Identify the target position (after which section)
2. Ensure proper heading level for context
3. Add appropriate spacing (blank lines)
4. Maintain consistent formatting style

## CRITICAL Requirements
- NEVER lose or corrupt existing content
- Preserve all code blocks with their language tags
- Keep image references intact
- Maintain link formatting
- Ensure valid MDX syntax
- Call emitProgress for each structural change
- Use setWorkflowState when complete`;

// Lazy-initialized agent instances
let _blogEnhanceAgent: Agent | null = null;
let _urlResearchAgent: Agent | null = null;
let _sectionManagerAgent: Agent | null = null;

/**
 * Get the Blog Enhance Agent instance
 */
export function getBlogEnhanceAgent(): Agent {
  if (!_blogEnhanceAgent) {
    _blogEnhanceAgent = createAgent({
      name: "Blog Enhance Agent",
      description: "Main orchestrator for blog enhancements, additions, and improvements",
      system: BLOG_ENHANCE_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: [
        emitProgressTool,
        reportToolCallTool,
        setWorkflowStateTool,
        extractUrlTool,
        searchWebTool,
      ],
    });
  }
  return _blogEnhanceAgent;
}

/**
 * Get the URL Research Agent instance
 */
export function getUrlResearchAgent(): Agent {
  if (!_urlResearchAgent) {
    _urlResearchAgent = createAgent({
      name: "URL Research Agent",
      description: "Extracts and analyzes content from URLs for blog integration",
      system: URL_RESEARCH_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: [
        emitProgressTool,
        extractUrlTool,
        crawlWebsiteTool,
        searchWebTool,
        setWorkflowStateTool,
      ],
    });
  }
  return _urlResearchAgent;
}

/**
 * Get the Section Manager Agent instance
 */
export function getSectionManagerAgent(): Agent {
  if (!_sectionManagerAgent) {
    _sectionManagerAgent = createAgent({
      name: "Section Manager Agent",
      description: "Manages blog content structure, inserts and reorganizes sections",
      system: SECTION_MANAGER_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: [
        emitProgressTool,
        setWorkflowStateTool,
      ],
    });
  }
  return _sectionManagerAgent;
}

/**
 * Get all blog enhancement agents
 */
export function getBlogEnhanceAgents() {
  return [
    getBlogEnhanceAgent(),
    getUrlResearchAgent(),
    getSectionManagerAgent(),
  ];
}

// Proxy exports for backwards compatibility
export const blogEnhanceAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getBlogEnhanceAgent() as Record<string, unknown>)[prop as string];
  },
});

export const urlResearchAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getUrlResearchAgent() as Record<string, unknown>)[prop as string];
  },
});

export const sectionManagerAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getSectionManagerAgent() as Record<string, unknown>)[prop as string];
  },
});
