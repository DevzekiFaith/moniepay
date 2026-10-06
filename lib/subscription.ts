// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription & Free Trial Management Engine
// Rule: 7-day free trial on signup; ₦1,500/month renewal via Flutterwave
// Rule: Existing transaction records are ALWAYS preserved upon expiry
// ─────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { SubscriptionDetails, SubscriptionStatus } from "@/types/subscription.types";

export const SUBSCRIPTION_CONSTANTS = {
  FREE_TRIAL_DAYS: 7,
  MONTHLY_PRICE_NGN: 1500,
  PLAN_NAME: "MoniePay Plus Monthly",
  CURRENCY: "NGN",
};

/**
 * Calculates trial and subscription details for any user
 */
export function calculateSubscriptionDetails(params: {
  createdAt?: Date | string | null;
  trialEndsAt?: Date | string | null;
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: Date | string | null;
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
  let trialEnd = params.trialEndsAt ? new Date(params.trialEndsAt) : new Date(created.getTime() + SUBSCRIPTION_CONSTANTS.FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const subEnd = params.subscriptionEndsAt ? new Date(params.subscriptionEndsAt) : null;
  const isSubscribed = Boolean(subEnd && subEnd.getTime() > now.getTime());
  const isTrialActive = !isSubscribed && trialEnd.getTime() > now.getTime();

  let status: SubscriptionStatus = "expired";
  if (isSubscribed) {
    status = "active";
  } else if (isTrialActive) {
    status = "trialing";
  } else {
    status = "expired";
  }

  // Calculate days remaining on trial
  let trialDaysLeft = 0;
  if (isTrialActive) {
    const diffMs = trialEnd.getTime() - now.getTime();
    trialDaysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return {
    status,
    planType: isSubscribed ? "MONIEPAY_PLUS_MONTHLY" : "FREE_TRIAL",
    planName: isSubscribed ? "MoniePay Plus (Active)" : isTrialActive ? `Free Trial (${trialDaysLeft} days left)` : "MoniePay Plus (Expired)",
    amount: SUBSCRIPTION_CONSTANTS.MONTHLY_PRICE_NGN,
    currency: SUBSCRIPTION_CONSTANTS.CURRENCY,
    isTrialActive,
    isSubscriptionActive: isSubscribed,
    trialEndsAt: trialEnd.toISOString(),
    trialDaysLeft,
    subscriptionEndsAt: subEnd ? subEnd.toISOString() : null,
    canAccessFullFeatures: isSubscribed || isTrialActive,
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
 * Activate or Renew a user's subscription for 30 days upon confirmed payment
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
    rawPayload,
  } = params;

  try {
    // 1. Fetch current user
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user && customerEmail) {
      user = await prisma.user.findUnique({ where: { email: customerEmail } });
    }

    const now = new Date();
    // Extend from existing end date if active, or from now
    const currentEnd = user?.subscriptionEndsAt && user.subscriptionEndsAt > now ? user.subscriptionEndsAt : now;
    const newSubscriptionEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);

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
          planType: "MONIEPAY_PLUS_MONTHLY",
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
