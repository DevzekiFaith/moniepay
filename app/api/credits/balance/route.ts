import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserCreditBalance } from "@/lib/credits";
import { CREDIT_PACKS, INSIGHT_CREDIT_COST } from "@/types/credit.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id || "user_owner_01";

    const { balance, transactions } = await getUserCreditBalance(userId);

    return NextResponse.json({
      success: true,
      balance,
      costPerInsight: INSIGHT_CREDIT_COST,
      packs: CREDIT_PACKS,
      transactions,
    });
  } catch (error: any) {
    console.error("GET /api/credits/balance error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve credit balance." },
      { status: 500 }
    );
  }
}
