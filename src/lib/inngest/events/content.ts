/**
 * Content generation event schemas
 * Used for AI-powered content generation via AgentKit
 */

export type ContentType = "blog" | "article" | "resource";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * Base content generation request
 */
export interface ContentGenerationRequest {
  /** User ID requesting the generation */
  userId: string;
  /** Optional thread ID for conversation context */
  threadId?: string;
  /** Topic or title for the content */
  topic: string;
  /** Additional context or instructions */
  instructions?: string;
  /** Target audience */
  audience?: string;
  /** Desired tone (professional, casual, technical, etc.) */
  tone?: "professional" | "casual" | "technical" | "educational";
  /** Target word count */
  wordCount?: number;
  /** Tags to associate with the content */
  tags?: string[];
}

/**
 * Blog generation specific fields
 */
export interface BlogGenerationRequest extends ContentGenerationRequest {
  /** Optional resource to associate with */
  resourceId?: string;
  /** Content category ID */
  categoryId?: string;
}

/**
 * Article generation specific fields
 */
export interface ArticleGenerationRequest extends ContentGenerationRequest {
  /** Required resource to associate with */
  resourceId: string;
  /** Required content category ID */
  categoryId: string;
  /** Difficulty level */
  difficulty?: DifficultyLevel;
}

/**
 * Resource generation specific fields
 */
export interface ResourceGenerationRequest {
  /** User ID requesting the generation */
  userId: string;
  /** Name of the resource */
  name: string;
  /** Description or context for generation */
  description?: string;
  /** Resource type ID */
  typeId?: string;
  /** Resource category ID */
  categoryId?: string;
  /** Official URL */
  officialUrl?: string;
  /** Documentation URL */
  docsUrl?: string;
  /** GitHub URL */
  githubUrl?: string;
}

/**
 * Content generation result
 */
export interface ContentGenerationResult {
  /** Generated content ID */
  contentId: string;
  /** Type of content generated */
  contentType: ContentType;
  /** Title of the generated content */
  title: string;
  /** Generated slug */
  slug: string;
  /** Status of the content */
  status: ContentStatus;
}

/**
 * Content generation failure
 */
export interface ContentGenerationFailure {
  /** User ID who requested the generation */
  userId: string;
  /** Type of content that failed */
  contentType: ContentType;
  /** Error message */
  error: string;
  /** Error code */
  code?: string;
  /** Original request topic */
  topic?: string;
}

/**
 * Chat message for agent interaction
 */
export interface AgentChatMessage {
  /** User ID */
  userId: string;
  /** Thread ID for conversation */
  threadId: string;
  /** User's message */
  message: string;
  /** Content type being generated */
  contentType?: ContentType;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Blog edit action types
 */
export type BlogEditAction = "rewrite" | "expand" | "simplify" | "fix" | "chat";

/**
 * Blog edit request
 */
export interface BlogEditRequest {
  /** User ID requesting the edit */
  userId: string;
  /** Blog ID to edit (optional - can edit text without saving) */
  blogId?: string;
  /** The action to perform */
  action: BlogEditAction;
  /** The text to edit (selection or full content) */
  text: string;
  /** Custom instruction for chat action */
  instruction?: string;
  /** Whether to save the result to the database */
  saveToDb?: boolean;
  /** Selection range if editing a selection */
  selectionRange?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

/**
 * Blog edit result
 */
export interface BlogEditResult {
  /** Blog ID if saved */
  blogId: string | null;
  /** Action performed */
  action: BlogEditAction;
  /** Original text (truncated) */
  originalText: string;
  /** Result text (truncated) */
  resultText: string;
  /** Whether the result was saved */
  saved: boolean;
}

/**
 * Unified content request - single entry point for all content generation
 * The agent will determine what type of content to create based on the message
 */
export interface UnifiedContentRequest {
  /** User ID requesting the generation */
  userId: string;
  /** Thread ID for conversation context */
  threadId: string;
  /** User's natural language message/request */
  message: string;
  /** Optional hint for content type (agent will verify/override) */
  contentTypeHint?: ContentType;
  /** Optional context from the UI */
  context?: {
    topic?: string;
    instructions?: string;
    audience?: string;
    tone?: "professional" | "casual" | "technical" | "educational";
    wordCount?: number;
    resourceId?: string;
    categoryId?: string;
    difficulty?: DifficultyLevel;
    /** For resource creation */
    resourceName?: string;
    officialUrl?: string;
    docsUrl?: string;
    githubUrl?: string;
  };
}

/**
 * Content events type definition
 */
export interface ContentEvents {
  // Unified content request - main entry point
  "content/request": UnifiedContentRequest;
  "content/request.completed": ContentGenerationResult;
  "content/request.failed": ContentGenerationFailure;

  // Blog generation events (legacy - still supported)
  "content/blog.generate": BlogGenerationRequest;
  "content/blog.generated": ContentGenerationResult;

  // Blog edit events
  "content/blog.edit": BlogEditRequest;
  "content/blog.edited": BlogEditResult;

  // Article generation events (legacy - still supported)
  "content/article.generate": ArticleGenerationRequest;
  "content/article.generated": ContentGenerationResult;

  // Resource generation events (legacy - still supported)
  "content/resource.generate": ResourceGenerationRequest;
  "content/resource.generated": ContentGenerationResult;

  // Generic events
  "content/generation.completed": ContentGenerationResult;
  "content/generation.failed": ContentGenerationFailure;

  // Agent chat events
  "content/agent.chat": AgentChatMessage;
  "content/agent.response": {
    threadId: string;
    userId: string;
    response: string;
    toolCalls?: Array<{
      name: string;
      input: Record<string, unknown>;
      output?: unknown;
    }>;
  };
}
