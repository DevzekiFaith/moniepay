// ─────────────────────────────────────────────────────────────────
// MoniePay — Referral & 7-Day Trader Activation Reward Types
// Mobile-First • Anti-Abuse Protected • Sustainable Reward Model
// ─────────────────────────────────────────────────────────────────

export type ReferralStatus =
  | "PENDING_ONBOARDING"    // Invited, haven't completed setup
  | "ACTIVE_RECORDING"      // Onboarded, currently in 7-day trial recording
  | "QUALIFIED_COMPLETED"   // Successfully logged transactions for 7 active days
  | "REWARD_CLAIMED"        // Referrer has claimed the reward
  | "FLAGGED_INELIGIBLE";   // Detected self-referral or suspicious activity

export type RewardType = "SUBSCRIPTION_EXTENSION" | "AIRTIME_TOKEN" | "CASH_DISCOUNT";

export interface ReferredTrader {
  id: string;
  business_name: string;
  owner_name: string;
  phone_masked: string;
  market_location?: string;
  joined_date: string;
  active_days_count: number; // 0 to 7 days of distinct transaction logging
  required_days: number;    // default: 7
  status: ReferralStatus;
  last_active_date?: string;
  reward_amount: number;    // e.g. 500 NGN or 14 days
  reward_type: RewardType;
  ineligible_reason?: string;
}

export interface ReferralConfig {
  reward_type: RewardType;
  reward_value_naira: number;         // e.g. 500
  subscription_days_bonus: number;    // e.g. 14 days
  required_active_days: number;       // 7 days
  monthly_referral_cap: number;       // Max 10 successful referrals per month
  min_daily_transactions: number;     // At least 1 transaction per active day
}

export interface ReferralStats {
  referral_code: string;
  referral_link: string;
  total_invited: number;
  active_in_progress: number;
  completed_qualified: number;
  total_reward_earned_naira: number;
  bonus_days_earned: number;
  pending_claims_count: number;
}
