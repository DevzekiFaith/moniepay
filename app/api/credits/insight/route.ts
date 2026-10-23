import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getUserCreditBalance,
  deductCredits,
  analyzeBusinessFinances,
} from "@/lib/credits";
import { INSIGHT_CREDIT_COST, PaidInsightResult } from "@/types/credit.types";
import {
  DEFAULT_TRANSACTIONS,
  DEFAULT_DEBTS,
  DEFAULT_ACCOUNTS,
  DEFAULT_BUSINESS,
} from "@/lib/data/initialBusinessData";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json().catch(() => ({}));

    const userId = body.userId || user?.id || "user_owner_01";
    const userEmail = body.email || user?.email;
    const businessName = body.businessName || user?.businessName || DEFAULT_BUSINESS.name;
    const idempotencyKey = body.idempotencyKey || `ins_${userId}_${Date.now()}`;

    // 1. Idempotency Check: Was this exact insight report already generated & paid?
    try {
      const existingReport = await (prisma as any).paidInsightReport.findUnique({
        where: { id: idempotencyKey },
      });

      if (existingReport) {
        const parsedReport: PaidInsightResult = {
          id: existingReport.id,
          status: existingReport.status,
          title: existingReport.title,
          summary: existingReport.summary,
          generatedAt: existingReport.createdAt ? new Date(existingReport.createdAt).toISOString() : new Date().toISOString(),
          creditsCost: existingReport.creditsCost,
          spendingPatterns: JSON.parse(existingReport.spendingPatterns || "[]"),
          cashLeaks: JSON.parse(existingReport.cashLeaks || "[]"),
          improvements: JSON.parse(existingReport.improvements || "[]"),
          metricsSnapshot: JSON.parse(existingReport.metricsSnapshot || "{}"),
        };

        const { balance } = await getUserCreditBalance(userId);

        return NextResponse.json({
          success: true,
          report: parsedReport,
          alreadyGenerated: true,
          creditsDeducted: 0,
          newBalance: balance,
        });
      }
    } catch {}

    // 2. Resolve input data
    let transactions = body.transactions;
    let debts = body.debts;
    let accounts = body.accounts;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      if (userId === "user_owner_01" || !user) {
        transactions = DEFAULT_TRANSACTIONS;
        debts = DEFAULT_DEBTS;
        accounts = DEFAULT_ACCOUNTS;
      } else {
        transactions = [];
        debts = debts || [];
        accounts = accounts || [];
      }
    }

    // 3. Pre-run analysis to verify data sufficiency
    // Rule: Never invent insights. If data is insufficient, tell trader clearly and charge 0 credits!
    const preliminaryAnalysis = analyzeBusinessFinances({
      transactions,
      debts: debts || [],
      accounts: accounts || [],
      businessName,
      idOverride: idempotencyKey,
    });

    if (preliminaryAnalysis.status === "INSUFFICIENT_DATA") {
      const { balance } = await getUserCreditBalance(userId);
      return NextResponse.json({
        success: true,
        report: preliminaryAnalysis,
        creditsDeducted: 0,
        newBalance: balance,
        message: "Notice: Insufficient transactions recorded. No credits were deducted.",
      });
    }

    // 4. Verify Credit Balance
    const { balance } = await getUserCreditBalance(userId);
    if (balance < INSIGHT_CREDIT_COST) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient Insight Credits. This full business diagnosis costs ${INSIGHT_CREDIT_COST} credits, but your current balance is ${balance}. Purchase a credit pack (starting from ₦100) to proceed.`,
          requiredCredits: INSIGHT_CREDIT_COST,
          currentBalance: balance,
        },
        { status: 402 }
      );
    }

    // 5. Deduct Credits Atomically
    // Rule: Deduct credits only after the requested insight is successfully generated.
    const deduction = await deductCredits({
      userId,
      cost: INSIGHT_CREDIT_COST,
      idempotencyKey,
      description: `Business Diagnostic Report — ${businessName}`,
      metadata: {
        reportId: idempotencyKey,
        transactionCount: transactions.length,
      },
      userEmail,
    });

    if (!deduction.success) {
      return NextResponse.json(
        { success: false, error: deduction.error || "Could not process credit deduction." },
        { status: 400 }
      );
    }

    // 6. Save Report to Database
    try {
      await (prisma as any).paidInsightReport.create({
        data: {
          id: idempotencyKey,
          userId,
          creditsCost: INSIGHT_CREDIT_COST,
          status: "COMPLETED",
          title: preliminaryAnalysis.title,
          summary: preliminaryAnalysis.summary,
          spendingPatterns: JSON.stringify(preliminaryAnalysis.spendingPatterns),
          cashLeaks: JSON.stringify(preliminaryAnalysis.cashLeaks),
          improvements: JSON.stringify(preliminaryAnalysis.improvements),
          metricsSnapshot: JSON.stringify(preliminaryAnalysis.metricsSnapshot),
        },
      });
    } catch (saveErr) {
      console.warn("Could not save paidInsightReport to DB:", saveErr);
    }

    return NextResponse.json({
      success: true,
      report: preliminaryAnalysis,
      creditsDeducted: INSIGHT_CREDIT_COST,
      newBalance: deduction.newBalance,
      message: `Diagnostic successfully generated! ${INSIGHT_CREDIT_COST} credits deducted.`,
    });
  } catch (error: any) {
    console.error("Generate insight report error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate business diagnostic." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id || "user_owner_01";

    const reports = await (prisma as any).paidInsightReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const parsed = reports.map((r: any) => ({
      id: r.id,
      status: r.status,
      title: r.title,
      summary: r.summary,
      creditsCost: r.creditsCost,
      generatedAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      spendingPatterns: JSON.parse(r.spendingPatterns || "[]"),
      cashLeaks: JSON.parse(r.cashLeaks || "[]"),
      improvements: JSON.parse(r.improvements || "[]"),
      metricsSnapshot: JSON.parse(r.metricsSnapshot || "{}"),
    }));

    return NextResponse.json({
      success: true,
      reports: parsed,
    });
  } catch (error: any) {
    console.error("GET /api/credits/insight error:", error);
    return NextResponse.json({ success: true, reports: [] });
  }
}
