/**
 * Central export for all auth-related functionality
 */

// Server-side exports
export { auth, authAPI, authHandler } from "./auth";
export type { Session, User } from "./auth";

// Client-side exports
export { authClient, signIn, signUp, signOut } from "./auth-client";

// Utilities
export { 
  getSession, 
  requireAuth, 
  getCurrentUser, 
  isAuthenticated 
} from "./utils";

// Permissions
export * from "./permissions";
export * from "./permissions/middleware";

