// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription & Free Trial Management Engine
// Rule: 7-day free trial on signup (one per account)
// Rule: ₦1,500/month or ₦15,000/year renewal via Flutterwave
// Rule: 3-day Grace period with full access before restriction
// Rule: Zero data deletion guarantee — all records stay stored
// ─────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { SubscriptionDetails, SubscriptionStatus, PlanType, BillingCycle } from "@/types/subscription.types";

export const SUBSCRIPTION_CONSTANTS = {
  FREE_TRIAL_DAYS: 7,
  GRACE_PERIOD_DAYS: 3,
  MONTHLY_PRICE_NGN: 1500,
  ANNUAL_PRICE_NGN: 15000,
  PLAN_NAME_MONTHLY: "MoniePay Plus Monthly",
  PLAN_NAME_ANNUAL: "MoniePay Plus Annual",
  CURRENCY: "NGN",
};

/**
 * Calculates trial, grace period, and subscription details for any user
 */
export function calculateSubscriptionDetails(params: {
  createdAt?: Date | string | null;
  trialEndsAt?: Date | string | null;
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: Date | string | null;
  planType?: string | null;
  lastPayment?: {
    txRef: string;
    amount: number;
    paymentType?: string;
    paidAt: string;
  } | null;
}): SubscriptionDetails {
  const now = new Date();
  const created = params.createdAt ? new Date(params.createdAt) : new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Compute trial end date: default to createdAt + 7 days
  const trialEnd = params.trialEndsAt
    ? new Date(params.trialEndsAt)
    : new Date(created.getTime() + SUBSCRIPTION_CONSTANTS.FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const subEnd = params.subscriptionEndsAt ? new Date(params.subscriptionEndsAt) : null;
  const isSubscribed = Boolean(subEnd && subEnd.getTime() > now.getTime());
  const isTrialActive = !isSubscribed && trialEnd.getTime() > now.getTime();

  // Determine effective expiry reference (subEnd if user was subscribed, otherwise trialEnd)
  const expiryDate = subEnd || trialEnd;
  const graceEnd = new Date(expiryDate.getTime() + SUBSCRIPTION_CONSTANTS.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // Check if user is in the 3-day grace period
  const isGracePeriodActive =
    !isSubscribed &&
    !isTrialActive &&
    now.getTime() <= graceEnd.getTime();

  let status: SubscriptionStatus = "expired";
  if (isSubscribed) {
    status = "active";
  } else if (isTrialActive) {
    status = "trialing";
  } else if (isGracePeriodActive) {
    status = "grace_period";
  } else {
    status = "expired";
  }

  // Calculate days remaining on trial
  let trialDaysLeft = 0;
  if (isTrialActive) {
    const diffMs = trialEnd.getTime() - now.getTime();
    trialDaysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Calculate days remaining on grace period
  let graceDaysLeft = 0;
  if (isGracePeriodActive) {
    const diffMs = graceEnd.getTime() - now.getTime();
    graceDaysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Renewal reminder: due within 48 hours (or active trial with 2 days or less left)
  let isRenewalDueSoon = false;
  if (isSubscribed && subEnd) {
    const timeToSubEnd = subEnd.getTime() - now.getTime();
    isRenewalDueSoon = timeToSubEnd <= 2 * 24 * 60 * 60 * 1000;
  } else if (isTrialActive) {
    isRenewalDueSoon = trialDaysLeft <= 2;
  }

  // Determine plan type and billing cycle
  const isAnnual = params.planType === "MONIEPAY_PLUS_ANNUAL" || (params.lastPayment?.amount && params.lastPayment.amount >= 10000);
  const planType: PlanType = isSubscribed
    ? isAnnual
      ? "MONIEPAY_PLUS_ANNUAL"
      : "MONIEPAY_PLUS_MONTHLY"
    : "FREE_TRIAL";
  const billingCycle: BillingCycle = isAnnual ? "annual" : "monthly";

  const nextRenewalDate = isSubscribed && subEnd ? subEnd.toISOString() : null;

  // Plan name display
  let planName = "Free Trial (7 days)";
  if (isSubscribed) {
    planName = isAnnual ? "MoniePay Plus Annual" : "MoniePay Plus Monthly";
  } else if (isGracePeriodActive) {
    planName = `Grace Period (${graceDaysLeft} ${graceDaysLeft === 1 ? "day" : "days"} left)`;
  } else if (!isTrialActive) {
    planName = "MoniePay Plus (Expired)";
  }

  return {
    status,
    planType,
    billingCycle,
    planName,
    amount: isAnnual ? SUBSCRIPTION_CONSTANTS.ANNUAL_PRICE_NGN : SUBSCRIPTION_CONSTANTS.MONTHLY_PRICE_NGN,
    currency: SUBSCRIPTION_CONSTANTS.CURRENCY,
    isTrialActive,
    isSubscriptionActive: isSubscribed,
    isGracePeriodActive,
    trialEndsAt: trialEnd.toISOString(),
    trialDaysLeft,
    graceDaysLeft,
    subscriptionEndsAt: subEnd ? subEnd.toISOString() : null,
    nextRenewalDate,
    isRenewalDueSoon,
    canAccessFullFeatures: isSubscribed || isTrialActive || isGracePeriodActive,
    hasUsedTrial: now.getTime() > trialEnd.getTime() || isSubscribed,
    lastPayment: params.lastPayment || null,
  };
}

/**
 * Fetch current user's subscription details from Prisma / local cache
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionDetails> {
  if (!userId) {
    return calculateSubscriptionDetails({});
  }

  try {
    const user = await (prisma.user as any).findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: "SUCCESSFUL" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (user) {
      const latestPayment = Array.isArray(user.subscriptions) ? user.subscriptions[0] : null;
      return calculateSubscriptionDetails({
        createdAt: user.createdAt,
        trialEndsAt: user.trialEndsAt,
        subscriptionStatus: user.subscriptionStatus || "trialing",
        subscriptionEndsAt: user.subscriptionEndsAt,
        planType: user.planType,
        lastPayment: latestPayment
          ? {
              txRef: latestPayment.txRef,
              amount: latestPayment.amount,
              paymentType: latestPayment.paymentType || "Card / Transfer",
              paidAt: latestPayment.createdAt ? new Date(latestPayment.createdAt).toISOString() : new Date().toISOString(),
            }
          : null,
      });
    }
  } catch (err) {
    console.warn("Could not query user subscription from Prisma:", err);
  }

  // Demo fallback user (e.g. user_owner_01 / local offline)
  const defaultTrialEnd = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
  return calculateSubscriptionDetails({
    createdAt: new Date(),
    trialEndsAt: defaultTrialEnd,
    subscriptionStatus: "trialing",
  });
}

/**
 * Activate or Renew a user's subscription (Monthly = +30 days, Annual = +365 days)
 * Server-Side Only: Must only be invoked after Flutterwave verification or valid webhook
 */
export async function activateUserSubscription(params: {
  userId: string;
  txRef: string;
  flwTransactionId: string;
  flwRef?: string;
  amount: number;
  paymentType?: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  planType?: "monthly" | "annual" | "MONIEPAY_PLUS_MONTHLY" | "MONIEPAY_PLUS_ANNUAL";
  rawPayload?: Record<string, any>;
}): Promise<{ success: boolean; subscription?: SubscriptionDetails; error?: string }> {
  const {
    userId,
    txRef,
    flwTransactionId,
    flwRef,
    amount,
    paymentType,
    customerEmail,
    customerName,
    customerPhone,
    planType,
    rawPayload,
  } = params;

  try {
    // Determine duration: annual plan (₦15,000) gives 365 days; monthly (₦1,500) gives 30 days
    const isAnnual =
      planType === "annual" ||
      planType === "MONIEPAY_PLUS_ANNUAL" ||
      Number(amount) >= 10000;
    const durationDays = isAnnual ? 365 : 30;
    const dbPlanType = isAnnual ? "MONIEPAY_PLUS_ANNUAL" : "MONIEPAY_PLUS_MONTHLY";

    // 1. Fetch current user
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user && customerEmail) {
      user = await prisma.user.findUnique({ where: { email: customerEmail } });
    }

    const now = new Date();
    // Extend from existing end date if active, or from now
    const currentEnd = user?.subscriptionEndsAt && user.subscriptionEndsAt > now ? user.subscriptionEndsAt : now;
    const newSubscriptionEnd = new Date(currentEnd.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 2. Check if this transaction has already been recorded
    const existingPayment = await prisma.subscriptionPayment.findUnique({
      where: { txRef },
    });

    if (existingPayment && existingPayment.status === "SUCCESSFUL") {
      const details = calculateSubscriptionDetails({
        createdAt: user?.createdAt,
        trialEndsAt: user?.trialEndsAt,
        subscriptionStatus: "active",
        subscriptionEndsAt: user?.subscriptionEndsAt || newSubscriptionEnd,
        planType: user?.planType || dbPlanType,
      });
      return { success: true, subscription: details };
    }

    if (user) {
      // 3. Update User subscription fields
      await (prisma.user as any).update({
        where: { id: user.id },
        data: {
          subscriptionStatus: "active",
          subscriptionEndsAt: newSubscriptionEnd,
          planType: dbPlanType,
        },
      });

      // 4. Record payment log
      await ((prisma as any).subscriptionPayment || prisma.user).upsert?.({
        where: { txRef },
        create: {
          userId: user.id,
          txRef,
          flwTransactionId,
          flwRef,
          amount,
          currency: SUBSCRIPTION_CONSTANTS.CURRENCY,
          status: "SUCCESSFUL",
          paymentType,
          customerEmail: customerEmail || user.email,
          customerName: customerName || user.name,
          customerPhone,
          periodStart: now,
          periodEnd: newSubscriptionEnd,
          rawWebhookPayload: rawPayload ? JSON.stringify(rawPayload) : null,
        },
        update: {
          status: "SUCCESSFUL",
          flwTransactionId,
          flwRef,
          amount,
          paymentType,
          periodEnd: newSubscriptionEnd,
          rawWebhookPayload: rawPayload ? JSON.stringify(rawPayload) : null,
        },
      });

      const updatedDetails = calculateSubscriptionDetails({
        createdAt: user.createdAt,
        trialEndsAt: user.trialEndsAt,
        subscriptionStatus: "active",
        subscriptionEndsAt: newSubscriptionEnd,
        planType: dbPlanType,
        lastPayment: {
          txRef,
          amount,
          paymentType,
          paidAt: now.toISOString(),
        },
      });

      return { success: true, subscription: updatedDetails };
    } else {
      // Fallback for mock/demo user
      const updatedDetails = calculateSubscriptionDetails({
        subscriptionStatus: "active",
        subscriptionEndsAt: newSubscriptionEnd,
        planType: dbPlanType,
        lastPayment: {
          txRef,
          amount,
          paymentType,
          paidAt: now.toISOString(),
        },
      });
      return { success: true, subscription: updatedDetails };
    }
  } catch (err: any) {
    console.error("Subscription activation error in DB:", err);
    return { success: false, error: err?.message || "Failed to activate subscription in database." };
  }
}
