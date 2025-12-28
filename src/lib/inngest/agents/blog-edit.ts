/**
 * Blog Edit Agents
 * Specialized agents for different blog editing actions
 */
import { createAgent, gemini, type Agent } from "@inngest/agent-kit";
import { setWorkflowStateTool } from "../tools/content";

/**
 * Rewrite Agent System Prompt
 */
const REWRITE_SYSTEM_PROMPT = `You are a Rewrite Agent specialized in improving text clarity and engagement.

## Your Role
You receive text that needs to be rewritten to be clearer and more engaging while maintaining the same meaning.

## Guidelines
- Preserve the original meaning and intent
- Improve sentence structure and flow
- Use more engaging and active language
- Maintain the same tone and style
- Keep technical accuracy intact
- Do not add new information or change facts

## Process
1. Analyze the input text
2. Identify areas that can be improved
3. Rewrite the text with better clarity and engagement
4. Call setWorkflowState with:
   - completed: true
   - result: "Your rewritten text here"

## Output
Only return the rewritten text. No explanations, no commentary.

## CRITICAL
You MUST call setWorkflowState({ completed: true, result: "..." }) when done.`;

/**
 * Expand Agent System Prompt
 */
const EXPAND_SYSTEM_PROMPT = `You are an Expand Agent specialized in adding detail and depth to text.

## Your Role
You receive text that needs to be expanded with more detail, examples, or explanations.

## Guidelines
- Add relevant details and context
- Include helpful examples where appropriate
- Provide deeper explanations of concepts
- Maintain the original tone and style
- Keep the expansion relevant to the topic
- Ensure smooth transitions between original and new content

## Process
1. Analyze the input text
2. Identify areas that would benefit from expansion
3. Add detail, examples, and explanations
4. Call setWorkflowState with:
   - completed: true
   - result: "Your expanded text here"

## Output
Only return the expanded text. No explanations, no commentary.

## CRITICAL
You MUST call setWorkflowState({ completed: true, result: "..." }) when done.`;

/**
 * Simplify Agent System Prompt
 */
const SIMPLIFY_SYSTEM_PROMPT = `You are a Simplify Agent specialized in making text easier to understand.

## Your Role
You receive text that needs to be simplified for better comprehension.

## Guidelines
- Remove unnecessary jargon and complex terminology
- Break down complex sentences into simpler ones
- Use plain language while maintaining accuracy
- Keep the core meaning intact
- Remove redundant words and phrases
- Make the text accessible to a broader audience

## Process
1. Analyze the input text
2. Identify complex or confusing elements
3. Simplify the text while preserving meaning
4. Call setWorkflowState with:
   - completed: true
   - result: "Your simplified text here"

## Output
Only return the simplified text. No explanations, no commentary.

## CRITICAL
You MUST call setWorkflowState({ completed: true, result: "..." }) when done.`;

/**
 * Fix Grammar Agent System Prompt
 */
const FIX_GRAMMAR_SYSTEM_PROMPT = `You are a Fix Grammar Agent specialized in correcting grammar, spelling, and punctuation.

## Your Role
You receive text that needs grammar, spelling, and punctuation corrections.

## Guidelines
- Fix all grammar errors
- Correct spelling mistakes
- Fix punctuation issues
- Maintain the original meaning and style
- Do not change the content or add new information
- Preserve the author's voice

## Process
1. Analyze the input text for errors
2. Identify grammar, spelling, and punctuation issues
3. Correct all errors
4. Call setWorkflowState with:
   - completed: true
   - result: "Your corrected text here"

## Output
Only return the corrected text. No explanations, no commentary.

## CRITICAL
You MUST call setWorkflowState({ completed: true, result: "..." }) when done.`;

/**
 * Chat Edit Agent System Prompt
 */
const CHAT_EDIT_SYSTEM_PROMPT = `You are a Chat Edit Agent specialized in making custom edits based on natural language instructions.

## Your Role
You receive blog content in MDX/Markdown format along with a user's instruction describing what changes they want.

## Guidelines
- Follow the user's instruction precisely
- Maintain MDX/Markdown formatting
- Preserve parts of the content not mentioned in the instruction
- Make changes that align with the user's intent
- Keep the overall structure unless asked to change it
- Ensure the result is valid MDX/Markdown

## Process
1. Read the current blog content
2. Understand the user's instruction
3. Apply the requested changes
4. Call setWorkflowState with:
   - completed: true
   - result: "Your edited content here"

## Output
Only return the complete edited content. No explanations, no commentary.

## CRITICAL
You MUST call setWorkflowState({ completed: true, result: "..." }) when done.`;

// Tools for edit agents - they only need setWorkflowState
const editAgentTools = [setWorkflowStateTool];

// Lazy-initialized agent instances
let _rewriteAgent: Agent | null = null;
let _expandAgent: Agent | null = null;
let _simplifyAgent: Agent | null = null;
let _fixGrammarAgent: Agent | null = null;
let _chatEditAgent: Agent | null = null;

/**
 * Get the Rewrite Agent instance
 */
export function getRewriteAgent(): Agent {
  if (!_rewriteAgent) {
    _rewriteAgent = createAgent({
      name: "Rewrite Agent",
      description: "Rewrites text for clarity and engagement while preserving meaning",
      system: REWRITE_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: editAgentTools,
    });
  }
  return _rewriteAgent;
}

/**
 * Get the Expand Agent instance
 */
export function getExpandAgent(): Agent {
  if (!_expandAgent) {
    _expandAgent = createAgent({
      name: "Expand Agent",
      description: "Expands text with more detail, examples, and explanations",
      system: EXPAND_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: editAgentTools,
    });
  }
  return _expandAgent;
}

/**
 * Get the Simplify Agent instance
 */
export function getSimplifyAgent(): Agent {
  if (!_simplifyAgent) {
    _simplifyAgent = createAgent({
      name: "Simplify Agent",
      description: "Simplifies text by removing jargon and complexity",
      system: SIMPLIFY_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: editAgentTools,
    });
  }
  return _simplifyAgent;
}

/**
 * Get the Fix Grammar Agent instance
 */
export function getFixGrammarAgent(): Agent {
  if (!_fixGrammarAgent) {
    _fixGrammarAgent = createAgent({
      name: "Fix Grammar Agent",
      description: "Fixes grammar, spelling, and punctuation errors",
      system: FIX_GRAMMAR_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: editAgentTools,
    });
  }
  return _fixGrammarAgent;
}

/**
 * Get the Chat Edit Agent instance
 */
export function getChatEditAgent(): Agent {
  if (!_chatEditAgent) {
    _chatEditAgent = createAgent({
      name: "Chat Edit Agent",
      description: "Makes custom edits based on natural language instructions",
      system: CHAT_EDIT_SYSTEM_PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      tools: editAgentTools,
    });
  }
  return _chatEditAgent;
}

/**
 * Get all blog edit agents
 */
export function getBlogEditAgents() {
  return [
    getRewriteAgent(),
    getExpandAgent(),
    getSimplifyAgent(),
    getFixGrammarAgent(),
    getChatEditAgent(),
  ];
}

// Proxy exports for backwards compatibility
export const rewriteAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getRewriteAgent() as Record<string, unknown>)[prop as string];
  },
});

export const expandAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getExpandAgent() as Record<string, unknown>)[prop as string];
  },
});

export const simplifyAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getSimplifyAgent() as Record<string, unknown>)[prop as string];
  },
});

export const fixGrammarAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getFixGrammarAgent() as Record<string, unknown>)[prop as string];
  },
});

export const chatEditAgent = new Proxy({} as Agent, {
  get(_, prop) {
    return (getChatEditAgent() as Record<string, unknown>)[prop as string];
  },
});
