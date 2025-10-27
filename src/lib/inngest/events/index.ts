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
  SystemEvents;

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
};

/**
 * Helper type to extract event data for a specific event name
 */
export type EventPayload<T extends keyof Events> = Events[T];

/**
 * Helper type for event names
 */
export type EventName = keyof Events;

