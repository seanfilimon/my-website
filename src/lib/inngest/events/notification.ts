/**
 * Notification-related event schemas
 */
export interface NotificationEvents {
  "notification/send": {
    userId: string;
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error";
    link?: string;
    priority?: "low" | "normal" | "high";
  };
  "notification/send-bulk": {
    userIds: string[];
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error";
  };
  "notification/read": {
    notificationId: string;
    userId: string;
    readAt: Date;
  };
  "notification/dismissed": {
    notificationId: string;
    userId: string;
  };
  "push/send": {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    icon?: string;
    badge?: string;
  };
  "sms/send": {
    to: string;
    message: string;
    from?: string;
  };
}

