import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { deductCredits, getUserCreditBalance } from "@/lib/credits";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json().catch(() => ({}));

    const userId = body.userId || user?.id || "user_owner_01";
    const userEmail = body.email || user?.email;
    const cost = Number(body.cost) || 0;
    const description = body.description || "Credit Action";
    const idempotencyKey = body.idempotencyKey || `act_${userId}_${Date.now()}`;
    const metadata = body.metadata || {};

    if (cost <= 0) {
      return NextResponse.json({ success: false, error: "Invalid credit cost." }, { status: 400 });
    }

    // Verify current balance
    const { balance } = await getUserCreditBalance(userId);
    if (balance < cost) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient credits",
          currentBalance: balance,
          required: cost,
        },
        { status: 402 }
      );
    }

    // Deduct credits atomically
    const result = await deductCredits({
      userId,
      cost,
      idempotencyKey,
      description,
      metadata,
      userEmail,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        newBalance: result.newBalance,
        creditsDeducted: cost,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || "Failed to process credits." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error in /api/credits/use:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
