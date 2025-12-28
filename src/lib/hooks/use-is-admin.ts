"use client";

import { useUser } from "@clerk/nextjs";

// Admin emails that have access to admin features
// This should match the list in middleware.ts
const ADMIN_EMAILS = [
  "s.filimon@legionedge.ai",
  "seanfilimon@icloud.com",
];

/**
 * Hook to check if the current user is an admin
 * Returns isAdmin status and loading state
 */
export function useIsAdmin() {
  const { user, isLoaded } = useUser();

  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  return {
    isAdmin,
    isLoading: !isLoaded,
    user,
  };
}
