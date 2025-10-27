/**
 * Export all permission domains
 */

export * from "./user";
export * from "./content";
export * from "./admin";
export * from "./system";
export * from "./billing";

import { USER_PERMISSIONS, type UserPermission } from "./user";
import { CONTENT_PERMISSIONS, type ContentPermission } from "./content";
import { ADMIN_PERMISSIONS, type AdminPermission } from "./admin";
import { SYSTEM_PERMISSIONS, type SystemPermission } from "./system";
import { BILLING_PERMISSIONS, type BillingPermission } from "./billing";

/**
 * Combined permissions object
 */
export const PERMISSIONS = {
  USER: USER_PERMISSIONS,
  CONTENT: CONTENT_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  SYSTEM: SYSTEM_PERMISSIONS,
  BILLING: BILLING_PERMISSIONS,
} as const;

/**
 * Flattened permissions for easy access
 */
export const ALL_PERMISSIONS = {
  ...USER_PERMISSIONS,
  ...CONTENT_PERMISSIONS,
  ...ADMIN_PERMISSIONS,
  ...SYSTEM_PERMISSIONS,
  ...BILLING_PERMISSIONS,
} as const;

/**
 * Union type of all permissions
 */
export type Permission =
  | UserPermission
  | ContentPermission
  | AdminPermission
  | SystemPermission
  | BillingPermission;

