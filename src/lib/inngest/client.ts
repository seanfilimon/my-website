import { Inngest } from "inngest";
import type { Events, EventName, EventPayload } from "./events";

/**
 * Inngest client instance
 * Used to send events and define functions
 */
export const inngest = new Inngest({
  id: "seanfilimon",
  name: "Sean Filimon App",
});

/**
 * Type-safe event sender
 * Use this to send events throughout your application
 */
export const sendEvent = <T extends EventName>(
  name: T,
  data: EventPayload<T>
) => {
  return inngest.send({
    name,
    data,
  });
};

/**
 * Batch event sender
 */
export const sendEvents = <T extends EventName>(
  events: Array<{
    name: T;
    data: EventPayload<T>;
  }>
) => {
  return inngest.send(events);
};

export type { Events, EventName, EventPayload };

