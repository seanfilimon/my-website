import { cache } from "react";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { db } from "@/src/lib/db";

/**
 * Context type - defines what's available in all tRPC procedures
 */
type Context = {
  db: typeof db;
};

/**
 * Create tRPC context
 * This runs for every request and provides shared context to all procedures
 */
export const createTRPCContext = cache(async () => {
  return {
    db,
  };
});

/**
 * Initialize tRPC with the context type
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Create a tRPC router
 */
export const createTRPCRouter = t.router;

/**
 * Create a caller factory (for server-side calls)
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Public procedure - available to all users
 */
export const publicProcedure = t.procedure;

/**
 * You can add middleware for protected procedures later
 * Example:
 * 
 * export const protectedProcedure = t.procedure.use(async (opts) => {
 *   // Add your auth check here
 *   const userId = await getAuthUserId();
 *   if (!userId) throw new Error("Unauthorized");
 *   return opts.next({ ctx: { ...opts.ctx, userId } });
 * });
 */
