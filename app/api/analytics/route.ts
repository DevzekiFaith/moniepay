// ─────────────────────────────────────────────
// MoniePay — Analytics & Business Health API Route
// Deterministic Business Operating Intelligence — Zero Prisma
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { calculateDeterministicMetrics } from "@/lib/intelligence/deterministicEngine";
import {
  DEFAULT_TRANSACTIONS,
  DEFAULT_DEBTS,
  DEFAULT_ACCOUNTS,
} from "@/lib/data/initialBusinessData";
import { z } from "zod";

const querySchema = z.object({
  period: z
    .enum(["today", "this_week", "this_month", "last_3_months", "custom"])
    .default("this_month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const { searchParams } = request.nextUrl;
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { period } = parsed.data;
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    let transactions = DEFAULT_TRANSACTIONS;
    let debts = DEFAULT_DEBTS;
    let accounts = DEFAULT_ACCOUNTS;

    if (supabase) {
      const [txRes, debtRes, accRes] = await Promise.all([
        supabase.from("transactions").select("*").limit(200),
        supabase.from("debts").select("*").limit(100),
        supabase.from("accounts").select("*").limit(20),
      ]);

      if (txRes.data && txRes.data.length > 0) transactions = txRes.data;
      if (debtRes.data && debtRes.data.length > 0) debts = debtRes.data;
      if (accRes.data && accRes.data.length > 0) accounts = accRes.data;
    }

    // Filter by period
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const filteredTxs = transactions.filter((tx) => {
      const txTime = new Date(tx.transaction_date).getTime();
      if (period === "today") return txTime >= todayStart;
      if (period === "this_week") return txTime >= weekStart;
      return txTime >= monthStart;
    });

    const metrics = calculateDeterministicMetrics(filteredTxs, debts, accounts);

    return NextResponse.json({
      period,
      metrics,
      balance: {
        totalIn: metrics.totalRevenue,
        totalOut: metrics.totalCosts,
        netMovement: metrics.operatingProfit,
        currentBalance: metrics.liquidCash,
      },
      averageDailySpend: Math.round(metrics.totalCosts / 30),
    });
  } catch (err: any) {
    console.error("[MoniePay] Analytics GET error:", err);
    return NextResponse.json({ error: "Failed to compute analytics" }, { status: 500 });
  }
}
