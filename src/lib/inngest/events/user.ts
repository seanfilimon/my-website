/**
 * User-related event schemas
 */
export interface UserEvents {
  "user/created": {
    userId: string;
    email: string;
    name?: string;
    metadata?: Record<string, unknown>;
  };
  "user/updated": {
    userId: string;
    email?: string;
    name?: string;
    metadata?: Record<string, unknown>;
  };
  "user/deleted": {
    userId: string;
  };
  "user/profile-completed": {
    userId: string;
    completedAt: Date;
  };
  "user/preferences-updated": {
    userId: string;
    preferences: Record<string, unknown>;
  };
}

