import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  verifyFlutterwaveTransaction,
  verifyFlutterwaveByReference,
  FLUTTERWAVE_CONFIG,
} from "@/lib/flutterwave";
import { addCredits } from "@/lib/credits";
import { CREDIT_PACKS } from "@/types/credit.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transaction_id") || searchParams.get("id");
    const txRef = searchParams.get("tx_ref");
    const packIdParam = searchParams.get("pack_id") as "pack_10" | "pack_60" | "pack_140" | null;
    const statusParam = (searchParams.get("status") || "").toLowerCase();
    const isSimulated = searchParams.get("simulated") === "true";

    // 1. Critical Security Rule: Instant Rejection on Cancellation or Failure
    // If the customer clicks 'Cancel' on Flutterwave, Flutterwave appends ?status=cancelled.
    // Under NO circumstances should coins or credits be allocated.
    if (statusParam === "cancelled" || statusParam === "failed") {
      return NextResponse.json(
        {
          success: false,
          status: statusParam,
          error: `Payment was ${statusParam} on Flutterwave. No insight credits have been added.`,
        },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    const userId = user?.id || "user_owner_01";

    if (!transactionId && !txRef) {
      return NextResponse.json(
        { success: false, error: "Transaction reference is missing." },
        { status: 400 }
      );
    }

    // 2. Explicit Sandbox/Simulation Test Mode (Isolated Dev Feature)
    // Only accepted if specifically flagged with simulated=true and never if cancelled
    if (isSimulated && txRef && (txRef.startsWith("sim_") || !FLUTTERWAVE_CONFIG.SECRET_KEY)) {
      const packId =
        packIdParam ||
        (txRef.includes("pack_140")
          ? "pack_140"
          : txRef.includes("pack_60")
          ? "pack_60"
          : "pack_10");
      const pack = CREDIT_PACKS.find((p) => p.id === packId) || CREDIT_PACKS[0];

      const result = await addCredits({
        userId,
        packId: pack.id,
        amountPaid: pack.priceNgn,
        txRef,
        paymentType: "Simulated Test",
        customerEmail: user?.email || "trader@moniepay.app",
      });

      return NextResponse.json({
        success: result.success,
        status: "successful",
        newBalance: result.newBalance,
        creditsAdded: result.creditsAdded,
        alreadyProcessed: result.alreadyProcessed,
        message: `Successfully credited ${result.creditsAdded} Insight Credits!`,
      });
    }

    // 3. Live Flutterwave Server-to-Server Verification by Transaction ID
    if (transactionId) {
      const flwResult = await verifyFlutterwaveTransaction(transactionId, 50);

      if (!flwResult.success || flwResult.status !== "successful") {
        return NextResponse.json(
          {
            success: false,
            status: flwResult.status || "failed",
            error: flwResult.error || "Payment was not verified as successful by Flutterwave ledger.",
          },
          { status: 400 }
        );
      }

      // Infer or extract pack based on verified amount
      const amount = flwResult.amount;
      const matchedPack =
        CREDIT_PACKS.find((p) => p.priceNgn === amount) ||
        CREDIT_PACKS.find((p) => p.id === packIdParam) ||
        (amount >= 1000 ? CREDIT_PACKS[2] : amount >= 500 ? CREDIT_PACKS[1] : CREDIT_PACKS[0]);

      const effectiveUserId = (flwResult as any).meta?.userId || userId;
      const effectiveTxRef = flwResult.txRef || txRef || `tx_flw_${transactionId}`;

      const creditResult = await addCredits({
        userId: effectiveUserId,
        packId: matchedPack.id,
        amountPaid: amount,
        txRef: effectiveTxRef,
        paymentType: flwResult.paymentType || "Card/Transfer",
        customerEmail: flwResult.customer?.email || user?.email,
      });

      if (creditResult.success) {
        return NextResponse.json({
          success: true,
          status: "successful",
          newBalance: creditResult.newBalance,
          creditsAdded: creditResult.creditsAdded,
          alreadyProcessed: creditResult.alreadyProcessed,
          message: `Successfully credited ${creditResult.creditsAdded} Insight Credits!`,
        });
      }

      return NextResponse.json(
        { success: false, error: creditResult.error || "Failed to update credit ledger." },
        { status: 500 }
      );
    }

    // 4. Live Flutterwave Server-to-Server Verification by Reference (tx_ref)
    // CRITICAL: NEVER assume a tx_ref is successful without Flutterwave ledger confirmation
    if (txRef) {
      const flwResult = await verifyFlutterwaveByReference(txRef, 50);

      if (!flwResult.success || flwResult.status !== "successful") {
        return NextResponse.json(
          {
            success: false,
            status: flwResult.status || "failed",
            error: flwResult.error || "Transaction reference could not be confirmed as successful on Flutterwave.",
          },
          { status: 400 }
        );
      }

      const amount = flwResult.amount;
      const matchedPack =
        CREDIT_PACKS.find((p) => p.priceNgn === amount) ||
        CREDIT_PACKS.find((p) => p.id === packIdParam) ||
        (amount >= 1000 ? CREDIT_PACKS[2] : amount >= 500 ? CREDIT_PACKS[1] : CREDIT_PACKS[0]);

      const effectiveUserId = (flwResult as any).meta?.userId || userId;

      const creditResult = await addCredits({
        userId: effectiveUserId,
        packId: matchedPack.id,
        amountPaid: amount,
        txRef,
        paymentType: flwResult.paymentType || "Card/Transfer",
        customerEmail: flwResult.customer?.email || user?.email || "trader@moniepay.app",
      });

      if (creditResult.success) {
        return NextResponse.json({
          success: true,
          status: "successful",
          newBalance: creditResult.newBalance,
          creditsAdded: creditResult.creditsAdded,
          alreadyProcessed: creditResult.alreadyProcessed,
          message: `Successfully credited ${creditResult.creditsAdded} Insight Credits!`,
        });
      }

      return NextResponse.json(
        { success: false, error: creditResult.error || "Failed to update credit ledger." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Cannot verify transaction without Flutterwave ID or valid reference." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Credit verification error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error during credit verification." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const transactionId = body.transactionId || body.transaction_id;
    const txRef = body.txRef || body.tx_ref;
    const packIdParam = body.packId as "pack_10" | "pack_60" | "pack_140" | undefined;
    const statusParam = (body.status || "").toLowerCase();

    // 1. Critical Security Rule: Instant Rejection on Cancellation or Failure
    if (statusParam === "cancelled" || statusParam === "failed") {
      return NextResponse.json(
        {
          success: false,
          status: statusParam,
          error: `Payment was ${statusParam} on Flutterwave. No insight credits have been added.`,
        },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    const userId = body.userId || user?.id || "user_owner_01";

    if (!transactionId && !txRef) {
      return NextResponse.json(
        { success: false, error: "Transaction identifier is required." },
        { status: 400 }
      );
    }

    // 2. Server-to-Server Verification by Transaction ID
    if (transactionId) {
      const flwResult = await verifyFlutterwaveTransaction(transactionId, 50);
      if (!flwResult.success || flwResult.status !== "successful") {
        return NextResponse.json(
          {
            success: false,
            status: flwResult.status || "failed",
            error: flwResult.error || "Payment was not verified as successful on Flutterwave.",
          },
          { status: 400 }
        );
      }

      const amount = flwResult.amount;
      const matchedPack =
        CREDIT_PACKS.find((p) => p.priceNgn === amount) ||
        (packIdParam ? CREDIT_PACKS.find((p) => p.id === packIdParam) : undefined) ||
        (amount >= 1000 ? CREDIT_PACKS[2] : amount >= 500 ? CREDIT_PACKS[1] : CREDIT_PACKS[0]);

      const effectiveUserId = (flwResult as any).meta?.userId || userId;
      const effectiveTxRef = flwResult.txRef || txRef || `tx_flw_${transactionId}`;

      const creditResult = await addCredits({
        userId: effectiveUserId,
        packId: matchedPack.id,
        amountPaid: amount,
        txRef: effectiveTxRef,
        paymentType: flwResult.paymentType || "Card/Transfer",
        customerEmail: flwResult.customer?.email || user?.email,
      });

      return NextResponse.json({
        success: creditResult.success,
        status: "successful",
        newBalance: creditResult.newBalance,
        creditsAdded: creditResult.creditsAdded,
        alreadyProcessed: creditResult.alreadyProcessed,
        error: creditResult.error,
      });
    }

    // 3. Server-to-Server Verification by Reference (tx_ref)
    // CRITICAL: NEVER credit without server confirmation from Flutterwave
    if (txRef) {
      const flwResult = await verifyFlutterwaveByReference(txRef, 50);
      if (!flwResult.success || flwResult.status !== "successful") {
        return NextResponse.json(
          {
            success: false,
            status: flwResult.status || "failed",
            error: flwResult.error || "Payment reference could not be verified on Flutterwave.",
          },
          { status: 400 }
        );
      }

      const amount = flwResult.amount;
      const matchedPack =
        CREDIT_PACKS.find((p) => p.priceNgn === amount) ||
        (packIdParam ? CREDIT_PACKS.find((p) => p.id === packIdParam) : undefined) ||
        (amount >= 1000 ? CREDIT_PACKS[2] : amount >= 500 ? CREDIT_PACKS[1] : CREDIT_PACKS[0]);

      const effectiveUserId = (flwResult as any).meta?.userId || userId;
      const creditResult = await addCredits({
        userId: effectiveUserId,
        packId: matchedPack.id,
        amountPaid: amount,
        txRef,
        paymentType: flwResult.paymentType || "Card/Transfer",
        customerEmail: flwResult.customer?.email || user?.email,
      });

      return NextResponse.json({
        success: creditResult.success,
        status: "successful",
        newBalance: creditResult.newBalance,
        creditsAdded: creditResult.creditsAdded,
        alreadyProcessed: creditResult.alreadyProcessed,
        error: creditResult.error,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unable to verify transaction." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Credit verification POST error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Server verification error." },
      { status: 500 }
    );
  }
}
