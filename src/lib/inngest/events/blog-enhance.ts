/**
 * Blog Enhancement Event Schemas
 * Events for AI-powered blog content enhancement
 */

/**
 * Blog enhancement request
 */
export interface BlogEnhanceRequest {
  /** User ID requesting the enhancement */
  userId: string;
  
  /** Blog ID to enhance */
  blogId: string;
  
  /** Natural language instruction describing what to do */
  instruction: string;
  
  /** Optional URLs to research and integrate */
  urls?: string[];
  
  /** Optional thread ID for conversation context */
  threadId?: string;
  
  /** Whether to automatically save changes to database */
  autoSave?: boolean;
  
  /** Current blog content */
  content: string;
}

/**
 * Blog enhancement result
 */
export interface BlogEnhanceResult {
  /** Blog ID that was enhanced */
  blogId: string;
  
  /** Enhanced content */
  enhancedContent: string;
  
  /** Summary of changes made */
  summary: string;
  
  /** URLs that were researched */
  researchedUrls?: string[];
  
  /** Sections that were added/modified */
  sectionsModified?: Array<{
    heading: string;
    action: "added" | "modified" | "restructured";
  }>;
  
  /** Whether changes were saved to database */
  saved: boolean;
}

/**
 * Blog enhancement progress event
 */
export interface BlogEnhanceProgress {
  /** Blog ID being enhanced */
  blogId: string;
  
  /** Thread ID for tracking */
  threadId: string;
  
  /** Current stage */
  stage: "researching" | "analyzing" | "writing" | "inserting" | "complete";
  
  /** Progress message */
  message: string;
  
  /** Agent currently working */
  agent?: string;
  
  /** Tool being used */
  toolName?: string;
  
  /** Tool input */
  toolInput?: Record<string, unknown>;
  
  /** Tool output */
  toolOutput?: unknown;
  
  /** Timestamp */
  timestamp: Date;
}

/**
 * Blog enhancement failure
 */
export interface BlogEnhanceFailure {
  /** Blog ID */
  blogId: string;
  
  /** User ID */
  userId: string;
  
  /** Error message */
  error: string;
  
  /** Error code */
  code?: string;
  
  /** Original instruction */
  instruction?: string;
}

/**
 * Blog enhancement events type definition
 */
export interface BlogEnhanceEvents {
  // Main enhancement events
  "blog/enhance.request": BlogEnhanceRequest;
  "blog/enhance.completed": BlogEnhanceResult;
  "blog/enhance.failed": BlogEnhanceFailure;
  
  // Progress events
  "blog/enhance.progress": BlogEnhanceProgress;
}
