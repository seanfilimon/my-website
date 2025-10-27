/**
 * Payment-related event schemas
 */
export interface PaymentEvents {
  "payment/completed": {
    userId: string;
    amount: number;
    currency: string;
    paymentId: string;
    metadata?: Record<string, unknown>;
  };
  "payment/failed": {
    userId: string;
    amount: number;
    currency: string;
    error: string;
    metadata?: Record<string, unknown>;
  };
  "payment/refunded": {
    userId: string;
    paymentId: string;
    amount: number;
    currency: string;
    reason?: string;
  };
  "subscription/created": {
    userId: string;
    subscriptionId: string;
    planId: string;
    startDate: Date;
  };
  "subscription/cancelled": {
    userId: string;
    subscriptionId: string;
    cancelledAt: Date;
    reason?: string;
  };
  "subscription/renewed": {
    userId: string;
    subscriptionId: string;
    renewedAt: Date;
  };
}

