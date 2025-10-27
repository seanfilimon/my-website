import { authHandler } from "@/lib/auth";

/**
 * Better Auth API route handler
 * Handles all authentication endpoints:
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-out
 * - GET  /api/auth/session
 * - POST /api/auth/magic-link/send
 * - GET  /api/auth/callback/google
 * - GET  /api/auth/callback/github
 * - And many more...
 */
export const { GET, POST } = authHandler;

