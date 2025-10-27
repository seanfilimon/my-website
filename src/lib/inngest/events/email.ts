/**
 * Email-related event schemas
 */
export interface EmailEvents {
  "email/send": {
    to: string;
    subject: string;
    body: string;
    from?: string;
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    attachments?: Array<{
      filename: string;
      content: string;
      contentType?: string;
    }>;
  };
  "email/send-bulk": {
    recipients: string[];
    subject: string;
    body: string;
    from?: string;
  };
  "email/send-template": {
    to: string;
    templateId: string;
    variables: Record<string, unknown>;
    from?: string;
  };
  "email/delivered": {
    messageId: string;
    to: string;
    deliveredAt: Date;
  };
  "email/bounced": {
    messageId: string;
    to: string;
    reason: string;
    bouncedAt: Date;
  };
  "email/opened": {
    messageId: string;
    to: string;
    openedAt: Date;
  };
  "email/clicked": {
    messageId: string;
    to: string;
    link: string;
    clickedAt: Date;
  };
}

