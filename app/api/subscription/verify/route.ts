import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave";
import { activateUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transaction_id") || searchParams.get("id");
    const txRef = searchParams.get("tx_ref");
    const statusParam = (searchParams.get("status") || "").toLowerCase();

    // Cancellation or failure guard
    if (statusParam === "cancelled" || statusParam === "failed") {
      return NextResponse.json(
        {
          success: false,
          status: statusParam,
          error: `Payment was ${statusParam} on Flutterwave. Subscription not activated.`,
        },
        { status: 400 }
      );
    }

    if (!transactionId && !txRef) {
      return NextResponse.json(
        { success: false, error: "Transaction identifier is missing." },
        { status: 400 }
      );
    }

    // 1. If we have a transaction ID, verify directly with Flutterwave API (min ₦1,400)
    if (transactionId) {
      const flwResult = await verifyFlutterwaveTransaction(transactionId, 1400);

      if (!flwResult.success || flwResult.status !== "successful") {
        return NextResponse.json(
          {
            success: false,
            status: flwResult.status || "failed",
            error: flwResult.error || "Payment was not successful on Flutterwave.",
          },
          { status: 400 }
        );
      }

      // Extract metadata
      const user = await getSessionUser();
      const userId = (flwResult as any).meta?.userId || user?.id || "user_owner_01";

      // 2. Activate subscription in database (Server-Verified)
      const activation = await activateUserSubscription({
        userId,
        txRef: flwResult.txRef || txRef || `tx_${transactionId}`,
        flwTransactionId: String(transactionId),
        flwRef: flwResult.flwRef,
        amount: flwResult.amount,
        paymentType: flwResult.paymentType || "Card/Transfer",
        planType: flwResult.planType || (flwResult.amount >= 10000 ? "annual" : "monthly"),
        customerEmail: flwResult.customer?.email || user?.email || "trader@moniepay.app",
        customerName: flwResult.customer?.name || user?.name,
        customerPhone: flwResult.customer?.phone,
        rawPayload: (flwResult as any).rawPayload,
      });

      if (activation.success) {
        return NextResponse.json({
          success: true,
          status: "successful",
          message: "MoniePay Plus subscription activated successfully!",
          subscription: activation.subscription,
        });
      }

      return NextResponse.json(
        { success: false, error: activation.error || "Database update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Unable to verify payment without transaction ID." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Subscription verification error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error during verification." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const transactionId = body.transactionId || body.transaction_id;
    const txRef = body.txRef || body.tx_ref;
    const statusParam = (body.status || "").toLowerCase();

    if (statusParam === "cancelled" || statusParam === "failed") {
      return NextResponse.json(
        {
          success: false,
          status: statusParam,
          error: `Payment was ${statusParam} on Flutterwave. Subscription not activated.`,
        },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required." },
        { status: 400 }
      );
    }

    const flwResult = await verifyFlutterwaveTransaction(transactionId, 1400);

    if (!flwResult.success || flwResult.status !== "successful") {
      return NextResponse.json(
        {
          success: false,
          status: flwResult.status || "failed",
          error: flwResult.error || "Payment was not successful on Flutterwave.",
        },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    const userId = (flwResult as any).meta?.userId || body.userId || user?.id || "user_owner_01";

    const activation = await activateUserSubscription({
      userId,
      txRef: flwResult.txRef || txRef || `tx_${transactionId}`,
      flwTransactionId: String(transactionId),
      flwRef: flwResult.flwRef,
      amount: flwResult.amount,
      paymentType: flwResult.paymentType || "Card/Transfer",
      planType: flwResult.planType || (flwResult.amount >= 10000 ? "annual" : "monthly"),
      customerEmail: flwResult.customer?.email || user?.email || "trader@moniepay.app",
      customerName: flwResult.customer?.name || user?.name,
      customerPhone: flwResult.customer?.phone,
      rawPayload: (flwResult as any).rawPayload,
    });

    return NextResponse.json({
      success: activation.success,
      status: "successful",
      subscription: activation.subscription,
      error: activation.error,
    });
  } catch (error: any) {
    console.error("Subscription POST verify error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Server verification error." },
      { status: 500 }
    );
  }
}
