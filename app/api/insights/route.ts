// ─────────────────────────────────────────────
// MoniePay — Decision Insights & Priority Recommendations API Route
// Zero Prisma — Pure Supabase & Deterministic Diagnostic Engine
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { calculateDeterministicMetrics } from "@/lib/intelligence/deterministicEngine";
import { generatePriorityRecommendations } from "@/lib/intelligence/diagnosticEngine";
import {
  DEFAULT_TRANSACTIONS,
  DEFAULT_DEBTS,
  DEFAULT_ACCOUNTS,
  DEFAULT_BUSINESS,
} from "@/lib/data/initialBusinessData";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
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

    const metrics = calculateDeterministicMetrics(transactions, debts, accounts);
    const recommendations = generatePriorityRecommendations(
      metrics,
      transactions,
      debts,
      DEFAULT_BUSINESS.name
    );

    return NextResponse.json({
      recommendations,
      metrics,
      primaryRecommendation: recommendations[0] || null,
    });
  } catch (error) {
    console.error("GET /api/insights error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
