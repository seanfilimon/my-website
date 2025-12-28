/**
 * Inngest API Route
 * Serves the Inngest functions and handles webhook events
 */
import { serve } from "inngest/next";
import { inngest } from "@/src/lib/inngest/client";
import { functions } from "@/src/lib/inngest/functions";

/**
 * Inngest serve endpoint
 * Handles:
 * - GET: Returns Inngest introspection data
 * - POST: Receives and processes events
 * - PUT: Handles function execution requests
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
