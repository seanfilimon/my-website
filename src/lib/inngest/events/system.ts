/**
 * System and infrastructure event schemas
 */
export interface SystemEvents {
  "system/health-check": {
    service: string;
    status: "healthy" | "unhealthy";
    timestamp: Date;
  };
  "system/error": {
    error: string;
    stack?: string;
    context?: Record<string, unknown>;
    severity: "low" | "medium" | "high" | "critical";
  };
  "system/backup-completed": {
    backupId: string;
    size: number;
    completedAt: Date;
  };
  "system/backup-failed": {
    error: string;
    failedAt: Date;
  };
  "system/cleanup-completed": {
    itemsDeleted: number;
    type: string;
    completedAt: Date;
  };
  "analytics/track": {
    userId?: string;
    event: string;
    properties?: Record<string, unknown>;
    timestamp: Date;
  };
  "analytics/page-view": {
    userId?: string;
    path: string;
    referrer?: string;
    timestamp: Date;
  };
}

