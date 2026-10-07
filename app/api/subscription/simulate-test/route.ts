import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { activateUserSubscription, calculateSubscriptionDetails } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json().catch(() => ({}));
    const action = body.action || "activate"; // "activate" | "activate_annual" | "enter_grace_period" | "expire_trial" | "reset_trial"
    const userId = body.userId || user?.id || "user_owner_01";

    if (action === "enter_grace_period") {
      // Trial expired 1 day ago (within 3-day grace period)
      const pastTrial = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      try {
        await (prisma.user as any).update({
          where: { id: userId },
          data: {
            trialEndsAt: pastTrial,
            subscriptionStatus: "grace_period",
            subscriptionEndsAt: null,
          },
        });
      } catch {}

      const details = calculateSubscriptionDetails({
        trialEndsAt: pastTrial,
        subscriptionStatus: "grace_period",
        subscriptionEndsAt: null,
      });

      return NextResponse.json({
        success: true,
        message: "Grace period (3 days) simulated.",
        subscription: details,
      });
    }

    if (action === "expire_trial") {
      // Expired 5 days ago (past 3-day grace period)
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      try {
        await (prisma.user as any).update({
          where: { id: userId },
          data: {
            trialEndsAt: pastDate,
            subscriptionStatus: "expired",
            subscriptionEndsAt: null,
          },
        });
      } catch {}

      const details = calculateSubscriptionDetails({
        trialEndsAt: pastDate,
        subscriptionStatus: "expired",
        subscriptionEndsAt: null,
      });

      return NextResponse.json({
        success: true,
        message: "Subscription simulated as fully expired (read-only mode).",
        subscription: details,
      });
    }

    if (action === "reset_trial") {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      try {
        await (prisma.user as any).update({
          where: { id: userId },
          data: {
            trialEndsAt: futureDate,
            subscriptionStatus: "trialing",
            subscriptionEndsAt: null,
          },
        });
      } catch {}

      const details = calculateSubscriptionDetails({
        trialEndsAt: futureDate,
        subscriptionStatus: "trialing",
        subscriptionEndsAt: null,
      });

      return NextResponse.json({
        success: true,
        message: "7-day free trial reset.",
        subscription: details,
      });
    }

    const isAnnual = action === "activate_annual";
    const simulatedAmount = isAnnual ? 15000 : 1500;
    const simulatedTxRef = `flw_${isAnnual ? "ann" : "mock"}_${Date.now()}`;

    const result = await activateUserSubscription({
      userId,
      txRef: simulatedTxRef,
      flwTransactionId: `flw_id_${Date.now()}`,
      flwRef: `flw_ref_${Date.now()}`,
      amount: simulatedAmount,
      planType: isAnnual ? "annual" : "monthly",
      paymentType: "Flutterwave Card (Test)",
      customerEmail: user?.email || "trader@moniepay.app",
      customerName: user?.name || "Mama Chidi",
      rawPayload: { simulated: true, plan: isAnnual ? "annual" : "monthly", timestamp: new Date().toISOString() },
    });

    return NextResponse.json({
      success: result.success,
      message: isAnnual ? "MoniePay Plus Annual (₦15,000/year) activated!" : "MoniePay Plus Monthly (₦1,500/month) activated!",
      subscription: result.subscription,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
