/**
 * System-level permissions
 */

export const SYSTEM_PERMISSIONS = {
  IMPERSONATE: "system:impersonate",
  LOGS: "system:logs",
  CONFIG: "system:config",
  BACKUP: "system:backup",
  RESTORE: "system:restore",
  MAINTENANCE: "system:maintenance",
  API_KEYS: "system:api_keys",
  WEBHOOKS: "system:webhooks",
} as const;

export type SystemPermission = (typeof SYSTEM_PERMISSIONS)[keyof typeof SYSTEM_PERMISSIONS];

