/**
 * Billing and payment-related permissions
 */

export const BILLING_PERMISSIONS = {
  READ: "billing:read",
  UPDATE: "billing:update",
  CANCEL: "billing:cancel",
  INVOICES: "billing:invoices",
  PAYMENT_METHODS: "billing:payment_methods",
  SUBSCRIPTIONS: "billing:subscriptions",
  REFUND: "billing:refund",
} as const;

export type BillingPermission = (typeof BILLING_PERMISSIONS)[keyof typeof BILLING_PERMISSIONS];

