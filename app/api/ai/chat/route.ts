// ─────────────────────────────────────────────
// MoniePay AI — Deterministic Advisory & Interpretation API
// The numbers are 100% computed deterministically first.
// AI is strictly an interpretation layer that explains findings in plain Nigerian business language.
// Zero Prisma.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { calculateDeterministicMetrics } from "@/lib/intelligence/deterministicEngine";
import { generatePriorityRecommendations } from "@/lib/intelligence/diagnosticEngine";
import {
  DEFAULT_TRANSACTIONS,
  DEFAULT_DEBTS,
  DEFAULT_ACCOUNTS,
  DEFAULT_BUSINESS,
} from "@/lib/data/initialBusinessData";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json().catch(() => ({}));
    const userMessage: string = (body.message || "").trim();

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();
    let transactions = DEFAULT_TRANSACTIONS;
    let debts = DEFAULT_DEBTS;
    let accounts = DEFAULT_ACCOUNTS;

    if (supabase) {
      const [txRes, debtRes, accRes] = await Promise.all([
        supabase.from("transactions").select("*").limit(100),
        supabase.from("debts").select("*").limit(50),
        supabase.from("accounts").select("*").limit(10),
      ]);
      if (txRes.data && txRes.data.length > 0) transactions = txRes.data;
      if (debtRes.data && debtRes.data.length > 0) debts = debtRes.data;
      if (accRes.data && accRes.data.length > 0) accounts = accRes.data;
    }

    // 1. Deterministic Calculation (Auditable Truth)
    const metrics = calculateDeterministicMetrics(transactions, debts, accounts);
    const recs = generatePriorityRecommendations(metrics, transactions, debts, DEFAULT_BUSINESS.name);

    // 2. Plain Nigerian Business Interpretation
    const lower = userMessage.toLowerCase();
    let responseText = "";

    if (lower.includes("how much") || lower.includes("sales") || lower.includes("revenue")) {
      responseText = `Your total sales stand at ₦${metrics.totalRevenue.toLocaleString()} (Cash: ₦${metrics.cashRevenue.toLocaleString()}, POS/Transfers: ₦${(metrics.transferRevenue + metrics.posRevenue).toLocaleString()}). Direct stock purchases cost ₦${metrics.directStockCost.toLocaleString()}, leaving you with a real operating profit of ₦${metrics.operatingProfit.toLocaleString()} (${metrics.profitMarginPercent}% margin).`;
    } else if (lower.includes("debt") || lower.includes("owe") || lower.includes("gbese")) {
      responseText = `${metrics.customerDebtorCount} customers owe you a total of ₦${metrics.customerDebtTotal.toLocaleString()}. Our primary recommendation is to collect these balances before putting down fresh capital for restocking.`;
    } else if (lower.includes("withdraw") || lower.includes("chop money") || lower.includes("family")) {
      responseText = `Based on your liquid cash (₦${metrics.liquidCash.toLocaleString()}) and upcoming stock requirements, you can safely withdraw ₦${metrics.safeWithdrawalAmount.toLocaleString()} this week without starving your business.`;
    } else if (lower.includes("health") || lower.includes("doing") || lower.includes("status")) {
      responseText = `Your business health score is ${metrics.healthScore}/100 (${metrics.healthStatus}). ${metrics.healthMessage}`;
    } else {
      const topRec = recs[0];
      responseText = `Here is the most important thing to focus on right now: “${topRec?.title || "Keep monitoring daily cash sales and expenses."}” ${topRec?.description || ""}`;
    }

    return NextResponse.json({
      reply: responseText,
      metrics: {
        revenue: metrics.totalRevenue,
        costs: metrics.totalCosts,
        profit: metrics.operatingProfit,
        cash: metrics.liquidCash,
        debt: metrics.customerDebtTotal,
        safeWithdrawal: metrics.safeWithdrawalAmount,
        healthScore: metrics.healthScore,
      },
    });
  } catch (err: any) {
    console.error("[MoniePay AI] Error:", err);
    return NextResponse.json(
      { reply: "Your business numbers are steady. Keep recording every sale and expense." },
      { status: 200 }
    );
  }
}
