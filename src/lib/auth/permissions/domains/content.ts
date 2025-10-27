/**
 * Content-related permissions
 */

export const CONTENT_PERMISSIONS = {
  CREATE: "content:create",
  READ: "content:read",
  UPDATE: "content:update",
  DELETE: "content:delete",
  PUBLISH: "content:publish",
  UNPUBLISH: "content:unpublish",
  READ_OWN: "content:read:own",
  UPDATE_OWN: "content:update:own",
  DELETE_OWN: "content:delete:own",
  MODERATE: "content:moderate",
} as const;

export type ContentPermission = (typeof CONTENT_PERMISSIONS)[keyof typeof CONTENT_PERMISSIONS];

