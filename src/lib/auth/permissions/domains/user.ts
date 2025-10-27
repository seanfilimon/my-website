/**
 * User-related permissions
 */

export const USER_PERMISSIONS = {
  READ: "user:read",
  WRITE: "user:write",
  UPDATE: "user:update",
  DELETE: "user:delete",
  READ_OWN: "user:read:own",
  UPDATE_OWN: "user:update:own",
  DELETE_OWN: "user:delete:own",
  LIST: "user:list",
  SEARCH: "user:search",
} as const;

export type UserPermission = (typeof USER_PERMISSIONS)[keyof typeof USER_PERMISSIONS];

