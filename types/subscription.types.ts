// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription & Flutterwave Types
// Business Decision Intelligence Subscription Model
// 7-day Free Trial • ₦1,500/Month or ₦15,000/Year
// 3-day Grace Period • Zero Data Deletion Guarantee
// ─────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "trialing" | "active" | "grace_period" | "expired" | "past_due";

export type PlanType = "FREE_TRIAL" | "MONIEPAY_PLUS_MONTHLY" | "MONIEPAY_PLUS_ANNUAL";

export type BillingCycle = "monthly" | "annual";

export interface SubscriptionDetails {
  status: SubscriptionStatus;
  planType: PlanType;
  billingCycle: BillingCycle;
  planName: string;
  amount: number;
  currency: string;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  isGracePeriodActive: boolean;
  trialEndsAt: string;
  trialDaysLeft: number;
  graceDaysLeft: number;
  subscriptionEndsAt: string | null;
  nextRenewalDate: string | null;
  isRenewalDueSoon: boolean;
  canAccessFullFeatures: boolean;
  hasUsedTrial: boolean;
  lastPayment?: {
    txRef: string;
    amount: number;
    paymentType?: string;
    paidAt: string;
  } | null;
}

export interface FlutterwavePaymentInitResponse {
  success: boolean;
  paymentLink?: string;
  txRef?: string;
  error?: string;
}

export interface FlutterwaveVerifyResponse {
  success: boolean;
  status: "successful" | "failed" | "pending";
  txRef: string;
  flwRef?: string;
  amount: number;
  currency: string;
  paymentType?: string;
  customer?: {
    email: string;
    name?: string;
    phone?: string;
  };
  subscription?: SubscriptionDetails;
  message?: string;
}
