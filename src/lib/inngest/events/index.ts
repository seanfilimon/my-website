/**
 * Central export for all event schemas
 * Import individual event schemas and merge them into a single type
 */
import type { UserEvents } from "./user";
import type { PaymentEvents } from "./payment";
import type { ClerkEvents } from "./clerk";
import type { EmailEvents } from "./email";
import type { NotificationEvents } from "./notification";
import type { StripeEvents } from "./stripe";
import type { SystemEvents } from "./system";
import type { ContentEvents } from "./content";

import type { BlogEnhanceEvents } from "./blog-enhance";

/**
 * Combined event schemas from all categories
 * This provides type-safe event handling across your application
 */
export type Events = UserEvents &
  PaymentEvents &
  ClerkEvents &
  EmailEvents &
  NotificationEvents &
  StripeEvents &
  SystemEvents &
  ContentEvents &
  BlogEnhanceEvents;

/**
 * Re-export individual event schemas for granular imports
 */
export type {
  UserEvents,
  PaymentEvents,
  ClerkEvents,
  EmailEvents,
  NotificationEvents,
  StripeEvents,
  SystemEvents,
  ContentEvents,
};

/**
 * Re-export content event types for convenience
 */
export type {
  ContentType,
  ContentStatus,
  DifficultyLevel,
  ContentGenerationRequest,
  BlogGenerationRequest,
  ArticleGenerationRequest,
  ResourceGenerationRequest,
  ContentGenerationResult,
  ContentGenerationFailure,
  AgentChatMessage,
  BlogEditAction,
  BlogEditRequest,
  BlogEditResult,
} from "./content";

/**
 * Re-export blog enhancement event types
 */
export type {
  BlogEnhanceRequest,
  BlogEnhanceResult,
  BlogEnhanceProgress,
  BlogEnhanceFailure,
  BlogEnhanceEvents,
} from "./blog-enhance";

/**
 * Helper type to extract event data for a specific event name
 */
export type EventPayload<T extends keyof Events> = Events[T];

/**
 * Helper type for event names
 */
export type EventName = keyof Events;

