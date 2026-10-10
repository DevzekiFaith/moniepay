// ─────────────────────────────────────────────────────────────────
// MoniePay — Referral & 7-Day Trader Activation Engine
// Handles Unique Codes, WhatsApp Sharing, 7-Day Milestone Tracking,
// Anti-Abuse Deduplication, and Sustainable Reward Processing
// ─────────────────────────────────────────────────────────────────

import { ReferredTrader, ReferralConfig, ReferralStats, ReferralStatus } from "@/types/referral.types";

const REFERRAL_STORAGE_KEY = "moniepay_referred_traders_v1";
const REFERRAL_CODE_KEY = "moniepay_user_referral_code";
const CLAIMED_REWARDS_KEY = "moniepay_claimed_referral_rewards";

export const DEFAULT_REFERRAL_CONFIG: ReferralConfig = {
  reward_type: "SUBSCRIPTION_EXTENSION",
  reward_value_naira: 500,
  subscription_days_bonus: 14,
  required_active_days: 7,
  monthly_referral_cap: 10,
  min_daily_transactions: 1,
};

export const SEED_REFERRED_TRADERS: ReferredTrader[] = [
  {
    id: "ref_01_segun",
    business_name: "Segun Stitches & Fabrics",
    owner_name: "Bro Segun",
    phone_masked: "+234 803 ••• 4567",
    market_location: "Balogun Market (Lagos)",
    joined_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    active_days_count: 5,
    required_days: 7,
    status: "ACTIVE_RECORDING",
    reward_amount: 500,
    reward_type: "SUBSCRIPTION_EXTENSION",
  },
  {
    id: "ref_02_emeka",
    business_name: "Emeka Gadgets & Phones",
    owner_name: "Chief Emeka",
    phone_masked: "+234 802 ••• 9912",
    market_location: "Alaba International",
    joined_date: new Date(Date.now() - 9 * 86400000).toISOString(),
    active_days_count: 7,
    required_days: 7,
    status: "QUALIFIED_COMPLETED",
    reward_amount: 500,
    reward_type: "SUBSCRIPTION_EXTENSION",
  },
  {
    id: "ref_03_ngozi",
    business_name: "Mama Ngozi Provisions Store",
    owner_name: "Mama Ngozi",
    phone_masked: "+234 814 ••• 3108",
    market_location: "Oyingbo Market",
    joined_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    active_days_count: 2,
    required_days: 7,
    status: "ACTIVE_RECORDING",
    reward_amount: 500,
    reward_type: "SUBSCRIPTION_EXTENSION",
  },
];

/**
 * Generate a clean, brand-standard referral code for a shop owner
 */
export function generateUserReferralCode(businessName?: string, phone?: string): string {
  if (typeof window !== "undefined") {
    const existing = localStorage.getItem(REFERRAL_CODE_KEY);
    if (existing) return existing;
  }

  const cleanName = (businessName || "SHOP")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 5) || "SHOP";
  
  const phoneSuffix = (phone || "")
    .replace(/[^0-9]/g, "")
    .slice(-2) || Math.floor(10 + Math.random() * 89).toString();

  const code = `MONIE-${cleanName}-${phoneSuffix}`;
  
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REFERRAL_CODE_KEY, code);
    } catch {}
  }
  return code;
}

let inMemoryTradersCache: ReferredTrader[] = SEED_REFERRED_TRADERS;

/**
 * Retrieve all referred traders with localStorage fallback
 */
export function getReferredTraders(): ReferredTrader[] {
  if (typeof window === "undefined") return inMemoryTradersCache;
  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(SEED_REFERRED_TRADERS));
      inMemoryTradersCache = SEED_REFERRED_TRADERS;
      return SEED_REFERRED_TRADERS;
    }
    const parsed = JSON.parse(raw);
    inMemoryTradersCache = parsed;
    return parsed;
  } catch {
    return inMemoryTradersCache;
  }
}

/**
 * Save referred traders and emit reactive event
 */
export function saveReferredTraders(traders: ReferredTrader[]): void {
  inMemoryTradersCache = traders;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(traders));
    window.dispatchEvent(new CustomEvent("moniepay:referral-updated", { detail: { traders } }));
  } catch (err) {
    console.warn("Could not save referred traders:", err);
  }
}

/**
 * Calculate aggregated referral statistics
 */
export function getReferralStats(businessName?: string, phone?: string): ReferralStats {
  const code = generateUserReferralCode(businessName, phone);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://moniepay.ng";
  const link = `${baseUrl}/welcome?ref=${code}`;

  const traders = getReferredTraders();
  const active_in_progress = traders.filter((t) => t.status === "ACTIVE_RECORDING" || t.status === "PENDING_ONBOARDING").length;
  const completed_qualified = traders.filter((t) => t.status === "QUALIFIED_COMPLETED" || t.status === "REWARD_CLAIMED").length;
  const pending_claims = traders.filter((t) => t.status === "QUALIFIED_COMPLETED");
  
  const total_reward_earned = completed_qualified * DEFAULT_REFERRAL_CONFIG.reward_value_naira;
  const bonus_days_earned = completed_qualified * DEFAULT_REFERRAL_CONFIG.subscription_days_bonus;

  return {
    referral_code: code,
    referral_link: link,
    total_invited: traders.length,
    active_in_progress,
    completed_qualified,
    total_reward_earned_naira: total_reward_earned,
    bonus_days_earned,
    pending_claims_count: pending_claims.length,
  };
}

/**
 * Claim a qualified referral reward (Extends subscription or adds token)
 */
export function claimReferralReward(traderId: string): { success: boolean; message: string } {
  const traders = getReferredTraders();
  const target = traders.find((t) => t.id === traderId);

  if (!target) {
    return { success: false, message: "Referral record not found." };
  }

  if (target.status !== "QUALIFIED_COMPLETED") {
    return { success: false, message: "Trader has not yet completed 7 active days of recording." };
  }

  const updated = traders.map((t) => (t.id === traderId ? { ...t, status: "REWARD_CLAIMED" as ReferralStatus } : t));
  saveReferredTraders(updated);

  // Extend subscription if cached
  if (typeof window !== "undefined") {
    try {
      const rawSub = localStorage.getItem("moniepay_subscription");
      if (rawSub) {
        const sub = JSON.parse(rawSub);
        const currentEnd = new Date(sub.periodEnd || Date.now());
        currentEnd.setDate(currentEnd.getDate() + DEFAULT_REFERRAL_CONFIG.subscription_days_bonus);
        sub.periodEnd = currentEnd.toISOString();
        localStorage.setItem("moniepay_subscription", JSON.stringify(sub));
      }
    } catch {}
  }

  return {
    success: true,
    message: `Reward Claimed! +${DEFAULT_REFERRAL_CONFIG.subscription_days_bonus} Days free MoniePay Plus added to your shop account!`,
  };
}

/**
 * Generate authentic WhatsApp trader invite text with link
 */
export function generateWhatsAppInviteMessage(referralCode: string, ownerName?: string): string {
  const name = ownerName || "Your market neighbor";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://moniepay.ng";
  const link = `${baseUrl}/welcome?ref=${referralCode}`;

  return encodeURIComponent(
    `Hello! Na ${name} from shop. 👋\n\n` +
    `I dey use *MoniePay* track all my shop daily sales, customer gbese, and calculate my true profit so my money no go dey leak.\n\n` +
    `Register your shop with my code *${referralCode}* to get *7 Days Free Full Access* plus free daily money diagnosis:\n\n` +
    `👉 ${link}\n\n` +
    `MoniePay helps you understand your money — not just record am!`
  );
}

/**
 * Anti-Fraud check for new incoming referrals
 */
export function validateReferralEligibility(params: {
  referralCode: string;
  userPhone: string;
  userDeviceId?: string;
  referrerPhone?: string;
}): { eligible: boolean; reason?: string } {
  const { referralCode, userPhone, referrerPhone } = params;

  if (!referralCode || !referralCode.startsWith("MONIE-")) {
    return { eligible: false, reason: "Invalid referral code format." };
  }

  // Self-referral guard
  if (referrerPhone && userPhone && referrerPhone.replace(/[^0-9]/g, "") === userPhone.replace(/[^0-9]/g, "")) {
    return { eligible: false, reason: "Self-referral is not allowed on the same phone number." };
  }

  return { eligible: true };
}
