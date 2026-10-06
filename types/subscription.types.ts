// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription & Flutterwave Types
// Business Decision Intelligence Subscription Model
// ─────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "trialing" | "active" | "expired" | "past_due";

export type PlanType = "FREE_TRIAL" | "MONIEPAY_PLUS_MONTHLY";

export interface SubscriptionDetails {
  status: SubscriptionStatus;
  planType: PlanType;
  planName: string;
  amount: number;
  currency: string;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  trialEndsAt: string;
  trialDaysLeft: number;
  subscriptionEndsAt: string | null;
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
