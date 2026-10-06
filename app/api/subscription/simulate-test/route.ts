import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { activateUserSubscription, calculateSubscriptionDetails } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json().catch(() => ({}));
    const action = body.action || "activate"; // "activate" | "expire_trial" | "reset_trial"
    const userId = body.userId || user?.id || "user_owner_01";

    if (action === "expire_trial") {
      const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      try {
        await prisma.user.update({
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
        message: "Free trial simulated as expired.",
        subscription: details,
      });
    }

    if (action === "reset_trial") {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      try {
        await prisma.user.update({
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

    // Default: Simulate confirmed Flutterwave payment
    const simulatedTxRef = `flw_mock_${Date.now()}`;
    const result = await activateUserSubscription({
      userId,
      txRef: simulatedTxRef,
      flwTransactionId: `flw_id_${Date.now()}`,
      flwRef: `flw_ref_${Date.now()}`,
      amount: 1500,
      paymentType: "Flutterwave Card (Test)",
      customerEmail: user?.email || "trader@moniepay.app",
      customerName: user?.name || "Mama Chidi",
      rawPayload: { simulated: true, timestamp: new Date().toISOString() },
    });

    return NextResponse.json({
      success: result.success,
      message: "MoniePay Plus ₦1,500/month activated!",
      subscription: result.subscription,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
