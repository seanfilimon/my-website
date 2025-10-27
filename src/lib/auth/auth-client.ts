"use client";

import { createAuthClient } from "better-auth/client";
import {
  lastLoginMethodClient,
  jwtClient,
  adminClient,
  magicLinkClient,
  usernameClient,
} from "better-auth/client/plugins";

/**
 * Better Auth client for client-side authentication
 * Use this in your React components
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  plugins: [
    // Last login method tracking
    lastLoginMethodClient({
      cookieName: "better-auth.last_login_method",
    }),

    // JWT token retrieval
    jwtClient(),

    // Admin capabilities (impersonation, user management)
    adminClient(),

    // Magic link authentication
    magicLinkClient(),

    // Username support
    usernameClient(),
  ],
});

/**
 * Export commonly used methods
 */
export const {
  signIn,
  signUp,
  signOut,
  getSession,
} = authClient;

