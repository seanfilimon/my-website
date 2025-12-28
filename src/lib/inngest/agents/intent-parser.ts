/**
 * Intent Parser Agent
 * Analyzes user input to extract content generation parameters
 */
import { createAgent, gemini, type Agent } from "@inngest/agent-kit";

/**
 * Parsed intent from user input
 */
export interface ParsedIntent {
  contentType: "blog" | "article" | "resource";
  quantity: number;
  topic: string;
  instructions?: string;
  tone: "professional" | "casual" | "technical" | "educational";
  audience?: string;
  wordCount?: number;
  resourceId?: string;
  categoryId?: string;
}

/**
 * System prompt for the Intent Parser Agent
 */
const INTENT_PARSER_PROMPT = `You are an Intent Parser Agent that analyzes user requests for content generation.

## Your Task
Analyze the user's message and extract the following information:

1. **contentType**: What type of content they want
   - "blog" - Personal blog posts, opinions, news-style content
   - "article" - In-depth technical tutorials and guides
   - "resource" - Descriptions of frameworks, libraries, tools

2. **quantity**: How many pieces of content (default: 1)
   - Look for phrases like "3 blogs", "multiple articles", "a few posts"

3. **topic**: The main subject matter
   - Extract the core topic they want to write about

4. **instructions**: Any specific requirements or guidelines
   - Special formatting, specific points to cover, things to avoid

5. **tone**: The writing style (default: "professional")
   - "professional" - Business-appropriate, formal
   - "casual" - Friendly, conversational
   - "technical" - Detailed, precise, for developers
   - "educational" - Teaching-focused, step-by-step

6. **audience**: Who the content is for
   - "beginners", "senior developers", "product managers", etc.

7. **wordCount**: Target length if specified
   - Look for "short", "long", "1000 words", etc.

## Output Format
You MUST respond with ONLY a valid JSON object. No markdown, no explanation, just JSON:

{
  "contentType": "blog",
  "quantity": 1,
  "topic": "the main topic",
  "instructions": "any specific instructions or null",
  "tone": "professional",
  "audience": "target audience or null",
  "wordCount": 1500
}

## Examples

User: "Write me 3 blog posts about React hooks for beginners"
Response:
{
  "contentType": "blog",
  "quantity": 3,
  "topic": "React hooks",
  "instructions": null,
  "tone": "educational",
  "audience": "beginners",
  "wordCount": 1500
}

User: "Create a technical article about Next.js App Router with code examples"
Response:
{
  "contentType": "article",
  "quantity": 1,
  "topic": "Next.js App Router",
  "instructions": "Include code examples",
  "tone": "technical",
  "audience": "developers",
  "wordCount": 2000
}

User: "I need a casual blog about my experience with TypeScript"
Response:
{
  "contentType": "blog",
  "quantity": 1,
  "topic": "TypeScript experience",
  "instructions": null,
  "tone": "casual",
  "audience": null,
  "wordCount": 1000
}`;

// Lazy-initialized agent instance
let _intentParserAgent: Agent | null = null;

/**
 * Get the Intent Parser Agent instance
 */
export function getIntentParserAgent(): Agent {
  if (!_intentParserAgent) {
    _intentParserAgent = createAgent({
      name: "Intent Parser",
      description: "Analyzes user input to extract content generation parameters",
      system: INTENT_PARSER_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: [], // No tools needed - just parsing
    });
  }
  return _intentParserAgent;
}

/**
 * Parse user intent from a message
 * Returns structured intent or defaults if parsing fails
 */
export async function parseUserIntent(message: string): Promise<ParsedIntent> {
  const agent = getIntentParserAgent();
  
  try {
    // Run the agent to parse the intent
    const result = await agent.run(message);
    
    // Extract the JSON from the response
    const responseText = typeof result.output === "string" 
      ? result.output 
      : JSON.stringify(result.output);
    
    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and return with defaults
      return {
        contentType: parsed.contentType || "blog",
        quantity: Math.min(Math.max(parsed.quantity || 1, 1), 10), // Clamp 1-10
        topic: parsed.topic || message,
        instructions: parsed.instructions || undefined,
        tone: parsed.tone || "professional",
        audience: parsed.audience || undefined,
        wordCount: parsed.wordCount || 1500,
        resourceId: parsed.resourceId || undefined,
        categoryId: parsed.categoryId || undefined,
      };
    }
  } catch (error) {
    console.error("Intent parsing failed:", error);
  }
  
  // Return defaults if parsing fails
  return {
    contentType: "blog",
    quantity: 1,
    topic: message,
    tone: "professional",
    wordCount: 1500,
  };
}

// For backwards compatibility
export const intentParserAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getIntentParserAgent() as Record<string, unknown>)[prop as string];
  },
});

export default intentParserAgent;
