/**
 * Core permission types
 */

/**
 * Available roles in the system
 */
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
  SUPER_ADMIN: "super_admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Base permission type
 */
export type Permission = string;

/**
 * Permission definition structure
 */
export interface PermissionDefinition {
  key: string;
  description?: string;
  category: string;
}

