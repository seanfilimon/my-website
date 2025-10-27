/**
 * Permission and role management for Better Auth
 * Organized by domain for better maintainability
 */

// Export types
export * from "./types";

// Export all permission domains
export * from "./domains";

// Export role management
export * from "./roles";

// Re-export commonly used items for convenience
export { ROLES } from "./types";
export type { Role, Permission } from "./types";
export { PERMISSIONS, ALL_PERMISSIONS } from "./domains";
export {
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
} from "./roles";

