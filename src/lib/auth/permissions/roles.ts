import type { Role } from "./types";
import type { Permission } from "./domains";
import {
  USER_PERMISSIONS,
  CONTENT_PERMISSIONS,
  ADMIN_PERMISSIONS,
  SYSTEM_PERMISSIONS,
  BILLING_PERMISSIONS,
} from "./domains";

/**
 * Role to permissions mapping
 * Define which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: [
    // User permissions
    USER_PERMISSIONS.READ_OWN,
    USER_PERMISSIONS.UPDATE_OWN,
    
    // Content permissions
    CONTENT_PERMISSIONS.CREATE,
    CONTENT_PERMISSIONS.READ,
    CONTENT_PERMISSIONS.READ_OWN,
    CONTENT_PERMISSIONS.UPDATE_OWN,
    CONTENT_PERMISSIONS.DELETE_OWN,
    
    // Billing permissions
    BILLING_PERMISSIONS.READ,
    BILLING_PERMISSIONS.UPDATE,
    BILLING_PERMISSIONS.INVOICES,
    BILLING_PERMISSIONS.PAYMENT_METHODS,
  ],
  
  moderator: [
    // User permissions
    USER_PERMISSIONS.READ,
    USER_PERMISSIONS.READ_OWN,
    USER_PERMISSIONS.UPDATE_OWN,
    USER_PERMISSIONS.LIST,
    
    // Content permissions
    CONTENT_PERMISSIONS.CREATE,
    CONTENT_PERMISSIONS.READ,
    CONTENT_PERMISSIONS.UPDATE,
    CONTENT_PERMISSIONS.DELETE,
    CONTENT_PERMISSIONS.MODERATE,
    CONTENT_PERMISSIONS.PUBLISH,
    CONTENT_PERMISSIONS.UNPUBLISH,
    
    // Billing permissions
    BILLING_PERMISSIONS.READ,
    BILLING_PERMISSIONS.UPDATE,
    BILLING_PERMISSIONS.INVOICES,
  ],
  
  admin: [
    // User permissions
    USER_PERMISSIONS.READ,
    USER_PERMISSIONS.WRITE,
    USER_PERMISSIONS.UPDATE,
    USER_PERMISSIONS.DELETE,
    USER_PERMISSIONS.LIST,
    USER_PERMISSIONS.SEARCH,
    
    // Content permissions
    CONTENT_PERMISSIONS.CREATE,
    CONTENT_PERMISSIONS.READ,
    CONTENT_PERMISSIONS.UPDATE,
    CONTENT_PERMISSIONS.DELETE,
    CONTENT_PERMISSIONS.PUBLISH,
    CONTENT_PERMISSIONS.UNPUBLISH,
    CONTENT_PERMISSIONS.MODERATE,
    
    // Admin permissions
    ADMIN_PERMISSIONS.ACCESS,
    ADMIN_PERMISSIONS.DASHBOARD,
    ADMIN_PERMISSIONS.USERS,
    ADMIN_PERMISSIONS.SETTINGS,
    ADMIN_PERMISSIONS.ANALYTICS,
    ADMIN_PERMISSIONS.LOGS,
    ADMIN_PERMISSIONS.AUDIT,
    
    // Billing permissions
    BILLING_PERMISSIONS.READ,
    BILLING_PERMISSIONS.UPDATE,
    BILLING_PERMISSIONS.CANCEL,
    BILLING_PERMISSIONS.INVOICES,
    BILLING_PERMISSIONS.PAYMENT_METHODS,
    BILLING_PERMISSIONS.SUBSCRIPTIONS,
    BILLING_PERMISSIONS.REFUND,
  ],
  
  super_admin: [
    // All user permissions
    ...Object.values(USER_PERMISSIONS),
    
    // All content permissions
    ...Object.values(CONTENT_PERMISSIONS),
    
    // All admin permissions
    ...Object.values(ADMIN_PERMISSIONS),
    
    // All system permissions
    ...Object.values(SYSTEM_PERMISSIONS),
    
    // All billing permissions
    ...Object.values(BILLING_PERMISSIONS),
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

