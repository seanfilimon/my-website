/**
 * Admin-related permissions
 */

export const ADMIN_PERMISSIONS = {
  ACCESS: "admin:access",
  DASHBOARD: "admin:dashboard",
  USERS: "admin:users",
  SETTINGS: "admin:settings",
  ROLES: "admin:roles",
  PERMISSIONS: "admin:permissions",
  ANALYTICS: "admin:analytics",
  LOGS: "admin:logs",
  AUDIT: "admin:audit",
} as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

