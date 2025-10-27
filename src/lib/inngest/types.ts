/**
 * Re-export event schemas from events directory
 */
export * from "./events";

/**
 * Inngest function configuration types
 */
export interface FunctionConfig {
  id: string;
  name: string;
  concurrency?: number;
  rateLimit?: {
    limit: number;
    period: string;
  };
  retries?: number;
  cancelOn?: Array<{
    event: string;
    if?: string;
  }>;
}

