import type { Session, User } from "../auth";
import { hasPermission, hasAllPermissions } from "./roles";
import type { Permission } from "./domains";
import type { Role } from "./types";

/**
 * Check if a user session has a specific permission
 */
export function canAccess(
  session: Session | null,
  permission: Permission
): boolean {
  if (!session?.user) return false;
  
  const userRole = session.user.role as Role;
  return hasPermission(userRole, permission);
}

/**
 * Check if a user session has all specified permissions
 */
export function canAccessAll(
  session: Session | null,
  permissions: Permission[]
): boolean {
  if (!session?.user) return false;
  
  const userRole = session.user.role as Role;
  return hasAllPermissions(userRole, permissions);
}

/**
 * Check if user is an admin
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  
  const role = session.user.role as string;
  return role === "admin" || role === "super_admin";
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  
  return session.user.role === "super_admin";
}

/**
 * Throws an error if user doesn't have permission
 */
export function requirePermission(
  session: Session | null,
  permission: Permission
): void {
  if (!canAccess(session, permission)) {
    throw new Error(`Insufficient permissions: ${permission} required`);
  }
}

/**
 * Throws an error if user is not authenticated
 */
export function requireAuth(session: Session | null): asserts session is Session {
  if (!session?.user) {
    throw new Error("Authentication required");
  }
}

/**
 * Throws an error if user is not an admin
 */
export function requireAdmin(session: Session | null): void {
  requireAuth(session);
  
  if (!isAdmin(session)) {
    throw new Error("Admin access required");
  }
}

