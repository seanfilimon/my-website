import { cache } from "react";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { Role } from "@/src/lib/auth/permissions/types";

// Admin emails that have access to admin features
const ADMIN_EMAILS = ["s.filimon@legionedge.ai", "seanfilimon@icloud.com"];

/**
 * Context type - defines what's available in all tRPC procedures
 */
type Context = {
  userId: string | null;
  role: Role | null;
  userEmail: string | null;
  userName: string | null;
};

/**
 * Check if an email is an admin email
 */
function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get user role from Clerk's publicMetadata or email
 * Role is stored in user.publicMetadata.role
 * Or determined by admin email list
 */
async function getUserRole(userId: string | null): Promise<{
  role: Role | null;
  email: string | null;
  name: string | null;
}> {
  if (!userId) return { role: null, email: null, name: null };

  try {
    const user = await currentUser();
    if (!user) return { role: null, email: null, name: null };

    // Get primary email
    const email = user.emailAddresses?.[0]?.emailAddress || null;
    const name =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      null;

    // Check if user is admin by email
    if (isAdminEmail(email)) {
      return { role: "admin", email, name };
    }

    // Get role from Clerk's publicMetadata
    // Default to "user" if no role is set
    const role = (user.publicMetadata?.role as Role) ?? "user";
    return { role, email, name };
  } catch {
    return { role: null, email: null, name: null };
  }
}

/**
 * Create tRPC context
 * This runs for every request and provides shared context to all procedures
 * Integrates with Clerk's auth and publicMetadata for role-based access
 */
export const createTRPCContext = cache(async () => {
  // Get auth from Clerk
  const { userId } = await auth();

  // Get role and email from Clerk
  const { role, email, name } = await getUserRole(userId);

  return {
    userId,
    role,
    userEmail: email,
    userName: name,
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
 * Middleware to check if user is authenticated
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      role: ctx.role,
    },
  });
});

/**
 * Middleware to check if user is admin or super_admin
 * Only admins can create, edit, and delete content across the website
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  // Check if user has admin or super_admin role in Clerk's publicMetadata
  const adminRoles: Role[] = ["admin", "super_admin"];
  if (!ctx.role || !adminRoles.includes(ctx.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "You must be an admin to perform this action. Contact support if you need elevated access.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      role: ctx.role,
    },
  });
});

/**
 * Middleware to check if user is super_admin
 * Super admins have full system access
 */
const isSuperAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  if (ctx.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action requires super admin privileges",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      role: ctx.role as "super_admin",
    },
  });
});

/**
 * Public procedure - available to all users
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(isAuthenticated);

/**
 * Admin procedure - requires admin or super_admin role
 * Use this for content management (create, update, delete blogs, articles, etc.)
 */
export const adminProcedure = t.procedure.use(isAdmin);

/**
 * Super admin procedure - requires super_admin role
 * Use this for system-level operations (user management, system settings)
 */
export const superAdminProcedure = t.procedure.use(isSuperAdmin);

/**
 * Editor procedure - alias for adminProcedure for backwards compatibility
 * @deprecated Use adminProcedure instead
 */
export const editorProcedure = adminProcedure;
