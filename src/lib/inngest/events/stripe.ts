/**
 * Stripe webhook event schemas
 */
export interface StripeEvents {
  "stripe/webhook": {
    type: string;
    data: Record<string, unknown>;
  };
  "stripe/checkout.session.completed": {
    sessionId: string;
    customerId: string;
    userId?: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
  };
  "stripe/customer.created": {
    customerId: string;
    userId?: string;
    email: string;
  };
  "stripe/customer.updated": {
    customerId: string;
    email?: string;
    metadata?: Record<string, unknown>;
  };
  "stripe/customer.deleted": {
    customerId: string;
  };
  "stripe/invoice.paid": {
    invoiceId: string;
    customerId: string;
    userId?: string;
    amount: number;
    currency: string;
  };
  "stripe/invoice.payment_failed": {
    invoiceId: string;
    customerId: string;
    userId?: string;
    amount: number;
    currency: string;
    error?: string;
  };
  "stripe/subscription.created": {
    subscriptionId: string;
    customerId: string;
    userId?: string;
    status: string;
    items: Array<{
      priceId: string;
      quantity: number;
    }>;
  };
  "stripe/subscription.updated": {
    subscriptionId: string;
    customerId: string;
    userId?: string;
    status: string;
  };
  "stripe/subscription.deleted": {
    subscriptionId: string;
    customerId: string;
    userId?: string;
  };
}

