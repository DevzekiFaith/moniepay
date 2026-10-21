import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { addCredits } from "@/lib/credits";
import { CREDIT_PACKS } from "@/types/credit.types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json().catch(() => ({}));

    const userId = body.userId || user?.id || "user_owner_01";
    const packId = (body.packId || "pack_10") as "pack_10" | "pack_60" | "pack_140";
    const pack = CREDIT_PACKS.find((p) => p.id === packId) || CREDIT_PACKS[0];

    const txRef = `sim_${pack.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const result = await addCredits({
      userId,
      packId: pack.id,
      amountPaid: pack.priceNgn,
      txRef,
      paymentType: "Test Simulation",
      customerEmail: user?.email || "trader@moniepay.app",
    });

    return NextResponse.json({
      success: result.success,
      message: `Simulated purchase of ${pack.credits} Insight Credits (₦${pack.priceNgn.toLocaleString()}) succeeded!`,
      newBalance: result.newBalance,
      creditsAdded: result.creditsAdded,
      txRef,
      error: result.error,
    });
  } catch (error: any) {
    console.error("Credit simulation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Simulation failed." },
      { status: 500 }
    );
  }
}
