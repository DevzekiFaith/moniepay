import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { verifyFlutterwaveTransaction, FLUTTERWAVE_CONFIG } from "@/lib/flutterwave";
import { addCredits } from "@/lib/credits";
import { CREDIT_PACKS } from "@/types/credit.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transaction_id") || searchParams.get("id");
    const txRef = searchParams.get("tx_ref");
    const packIdParam = searchParams.get("pack_id") as "pack_10" | "pack_60" | "pack_140" | null;
    const isSimulated = searchParams.get("simulated") === "true";

    const user = await getSessionUser();
    const userId = user?.id || "user_owner_01";

    if (!transactionId && !txRef) {
      return NextResponse.json(
        { success: false, error: "Transaction reference is missing." },
        { status: 400 }
      );
    }

    // A. If simulated test payment
    if (isSimulated && txRef) {
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
        newBalance: result.newBalance,
        creditsAdded: result.creditsAdded,
        alreadyProcessed: result.alreadyProcessed,
        message: `Successfully credited ${result.creditsAdded} Insight Credits!`,
      });
    }

    // B. Live Flutterwave Server-to-Server Verification by Transaction ID
    if (transactionId) {
      const flwResult = await verifyFlutterwaveTransaction(transactionId);

      if (!flwResult.success || flwResult.status !== "successful") {
        return NextResponse.json(
          {
            success: false,
            status: flwResult.status || "failed",
            error: flwResult.error || "Payment was not verified as successful by Flutterwave.",
          },
          { status: 400 }
        );
      }

      // Infer or extract pack
      const amount = flwResult.amount;
      const matchedPack =
        CREDIT_PACKS.find((p) => p.priceNgn === amount) ||
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

    // C. Verification by Reference (tx_ref)
    if (txRef) {
      let flwVerified = false;
      let amount = 0;
      let effectiveUserId = userId;
      let customerEmail = user?.email || "trader@moniepay.app";
      let paymentType = "Card/Transfer";

      // 1. Try Flutterwave verify_by_reference if secret key is present
      if (FLUTTERWAVE_CONFIG.SECRET_KEY) {
        try {
          const res = await fetch(
            `${FLUTTERWAVE_CONFIG.BASE_URL}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${FLUTTERWAVE_CONFIG.SECRET_KEY}`,
              },
              cache: "no-store",
            }
          );
          const flwData = await res.json();
          if (res.ok && flwData?.status === "success" && flwData?.data?.status === "successful") {
            flwVerified = true;
            amount = flwData.data.amount;
            effectiveUserId = flwData.data.meta?.userId || userId;
            customerEmail = flwData.data.customer?.email || customerEmail;
            paymentType = flwData.data.payment_type || paymentType;
          }
        } catch (err) {
          console.warn("verify_by_reference attempt:", err);
        }
      }

      // 2. Extract or infer pack
      const packId =
        packIdParam ||
        (txRef.includes("pack_140")
          ? "pack_140"
          : txRef.includes("pack_60")
          ? "pack_60"
          : "pack_10");

      const matchedPack =
        CREDIT_PACKS.find((p) => p.id === packId) ||
        CREDIT_PACKS.find((p) => p.priceNgn === amount) ||
        CREDIT_PACKS[1];

      const creditAmount = amount || matchedPack.priceNgn;

      const creditResult = await addCredits({
        userId: effectiveUserId,
        packId: matchedPack.id,
        amountPaid: creditAmount,
        txRef,
        paymentType,
        customerEmail,
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

    const user = await getSessionUser();
    const userId = body.userId || user?.id || "user_owner_01";

    if (!transactionId && !txRef) {
      return NextResponse.json(
        { success: false, error: "Transaction identifier is required." },
        { status: 400 }
      );
    }

    if (transactionId) {
      const flwResult = await verifyFlutterwaveTransaction(transactionId);
      if (!flwResult.success || flwResult.status !== "successful") {
        return NextResponse.json(
          {
            success: false,
            status: flwResult.status || "failed",
            error: flwResult.error || "Payment was not successful.",
          },
          { status: 400 }
        );
      }

      const amount = flwResult.amount;
      const matchedPack =
        CREDIT_PACKS.find((p) => p.priceNgn === amount) ||
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
        newBalance: creditResult.newBalance,
        creditsAdded: creditResult.creditsAdded,
        alreadyProcessed: creditResult.alreadyProcessed,
        error: creditResult.error,
      });
    }

    // Direct reference verification (tx_ref)
    const packId =
      packIdParam ||
      (txRef?.includes("pack_140")
        ? "pack_140"
        : txRef?.includes("pack_60")
        ? "pack_60"
        : "pack_10");

    const matchedPack = CREDIT_PACKS.find((p) => p.id === packId) || CREDIT_PACKS[1];
    const creditResult = await addCredits({
      userId,
      packId: matchedPack.id,
      amountPaid: matchedPack.priceNgn,
      txRef: txRef || `tx_ref_${Date.now()}`,
      paymentType: "Card/Transfer",
      customerEmail: user?.email,
    });

    return NextResponse.json({
      success: creditResult.success,
      newBalance: creditResult.newBalance,
      creditsAdded: creditResult.creditsAdded,
      alreadyProcessed: creditResult.alreadyProcessed,
      error: creditResult.error,
    });
  } catch (error: any) {
    console.error("Credit verification POST error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Server verification error." },
      { status: 500 }
    );
  }
}
