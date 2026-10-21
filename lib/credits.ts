// ─────────────────────────────────────────────────────────────────
// MoniePay — Insight Credits Engine & Paid Business Diagnostic Service
// Rule 1: Free basic access — never charge users to record or view records.
// Rule 2: Server-verified prepaid credit balance.
// Rule 3: Deduct credits ONLY after successful insight generation.
// Rule 4: Idempotency & duplicate deduction prevention.
// Rule 5: Zero hallucinations — strictly data-backed conclusions or insufficient data notice.
// ─────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import {
  CREDIT_PACKS,
  INSIGHT_CREDIT_COST,
  WELCOME_BONUS_CREDITS,
  CreditPack,
  CreditTransactionRecord,
  PaidInsightResult,
  SpendingPattern,
  CashLeak,
  PracticalImprovement,
} from "@/types/credit.types";
import { calculateDeterministicMetrics } from "@/lib/intelligence/deterministicEngine";
import type { BusinessTransaction, Debt, BusinessAccount } from "@/types/moniepay.types";

/**
 * Get current user credit balance and recent audit history.
 */
export async function getUserCreditBalance(userId: string): Promise<{
  balance: number;
  transactions: CreditTransactionRecord[];
}> {
  if (!userId) {
    return { balance: WELCOME_BONUS_CREDITS, transactions: [] };
  }

  try {
    let user = await (prisma.user as any).findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }],
      },
      include: {
        creditTransactions: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (user) {
      // If user has no balance recorded yet, grant welcome bonus credits
      if (user.creditBalance === undefined || user.creditBalance === null) {
        user = await (prisma.user as any).update({
          where: { id: user.id },
          data: { creditBalance: WELCOME_BONUS_CREDITS },
          include: {
            creditTransactions: {
              orderBy: { createdAt: "desc" },
              take: 30,
            },
          },
        });
      }

      const txs: CreditTransactionRecord[] = (user.creditTransactions || []).map((t: any) => ({
        id: t.id,
        userId: t.userId,
        type: t.type,
        credits: t.credits,
        balanceAfter: t.balanceAfter,
        description: t.description,
        referenceId: t.referenceId,
        amountPaid: t.amountPaid,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
        metadata: t.metadata ? JSON.parse(t.metadata) : undefined,
      }));

      return {
        balance: user.creditBalance ?? WELCOME_BONUS_CREDITS,
        transactions: txs,
      };
    }
  } catch (err) {
    console.warn("Could not fetch user credit balance from database:", err);
  }

  // Graceful fallback for demo or unseeded user
  return {
    balance: WELCOME_BONUS_CREDITS,
    transactions: [
      {
        id: `bonus_welcome_${userId}`,
        userId,
        type: "BONUS",
        credits: WELCOME_BONUS_CREDITS,
        balanceAfter: WELCOME_BONUS_CREDITS,
        description: "Welcome Trader Bonus (Trial Insight Credits)",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Add credits to user's balance following server-verified payment.
 * Prevents duplicate allocations via unique referenceId (txRef).
 */
export async function addCredits(params: {
  userId: string;
  packId: CreditPack["id"];
  amountPaid: number;
  txRef: string;
  paymentType?: string;
  customerEmail?: string;
}): Promise<{
  success: boolean;
  newBalance: number;
  creditsAdded: number;
  error?: string;
  alreadyProcessed?: boolean;
}> {
  const { userId, packId, amountPaid, txRef, paymentType, customerEmail } = params;
  const pack = CREDIT_PACKS.find((p) => p.id === packId);

  if (!pack) {
    return { success: false, newBalance: 0, creditsAdded: 0, error: "Invalid credit pack selected." };
  }

  try {
    // 1. Check if this payment reference has already been credited (Idempotent Guard)
    const existingTx = await (prisma as any).creditTransaction.findUnique({
      where: { referenceId: txRef },
    });

    if (existingTx) {
      const user = await (prisma.user as any).findUnique({
        where: { id: existingTx.userId },
        select: { creditBalance: true },
      });
      return {
        success: true,
        newBalance: user?.creditBalance ?? existingTx.balanceAfter,
        creditsAdded: existingTx.credits,
        alreadyProcessed: true,
      };
    }

    // 2. Fetch or locate user
    let user = await (prisma.user as any).findFirst({
      where: {
        OR: [
          { id: userId },
          { email: customerEmail || userId },
          { email: "demo@moniepay.app" },
        ],
      },
    });

    if (!user) {
      return { success: false, newBalance: 0, creditsAdded: 0, error: "User account not found." };
    }

    const currentBalance = user.creditBalance ?? 0;
    const newBalance = currentBalance + pack.credits;

    // 3. Atomically update user balance and record credit transaction
    await prisma.$transaction(async (tx) => {
      await (tx.user as any).update({
        where: { id: user.id },
        data: { creditBalance: newBalance },
      });

      await (tx as any).creditTransaction.create({
        data: {
          userId: user.id,
          type: "PURCHASE",
          credits: pack.credits,
          balanceAfter: newBalance,
          description: `Purchased ${pack.credits} Insight Credits (${pack.label})`,
          referenceId: txRef,
          amountPaid,
          metadata: JSON.stringify({
            packId: pack.id,
            paymentType: paymentType || "flutterwave",
            txRef,
          }),
        },
      });
    });

    return {
      success: true,
      newBalance,
      creditsAdded: pack.credits,
    };
  } catch (err: any) {
    console.error("Error adding credits:", err);
    return {
      success: false,
      newBalance: 0,
      creditsAdded: 0,
      error: err?.message || "Failed to update credit balance.",
    };
  }
}

/**
 * Deduct credits atomically for a generated insight.
 * Prevents duplicate deduction if idempotencyKey is retried.
 */
export async function deductCredits(params: {
  userId: string;
  cost: number;
  idempotencyKey: string;
  description: string;
  metadata?: Record<string, any>;
}): Promise<{
  success: boolean;
  newBalance: number;
  alreadyDeducted?: boolean;
  error?: string;
}> {
  const { userId, cost, idempotencyKey, description, metadata } = params;

  try {
    // 1. Check idempotency: If this insight ID was already deducted, do not charge again!
    const existing = await (prisma as any).creditTransaction.findUnique({
      where: { referenceId: idempotencyKey },
    });

    if (existing) {
      return {
        success: true,
        newBalance: existing.balanceAfter,
        alreadyDeducted: true,
      };
    }

    // 2. Fetch user and verify balance
    const user = await (prisma.user as any).findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }],
      },
    });

    if (!user) {
      return { success: false, newBalance: 0, error: "User not found." };
    }

    const currentBalance = user.creditBalance ?? 0;
    if (currentBalance < cost) {
      return {
        success: false,
        newBalance: currentBalance,
        error: `Insufficient Insight Credits. This diagnosis costs ${cost} credits, but your available balance is ${currentBalance}.`,
      };
    }

    const newBalance = currentBalance - cost;

    // 3. Atomically deduct balance and record transaction
    await prisma.$transaction(async (tx) => {
      await (tx.user as any).update({
        where: { id: user.id },
        data: { creditBalance: newBalance },
      });

      await (tx as any).creditTransaction.create({
        data: {
          userId: user.id,
          type: "USAGE",
          credits: -cost,
          balanceAfter: newBalance,
          description,
          referenceId: idempotencyKey,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    });

    return {
      success: true,
      newBalance,
    };
  } catch (err: any) {
    console.error("Deduct credits error:", err);
    return {
      success: false,
      newBalance: 0,
      error: err?.message || "Could not process credit deduction.",
    };
  }
}

/**
 * Perform Paid Business Insight Analysis on user's income and expenses.
 * - Explains spending patterns
 * - Identifies potential cash leaks
 * - Recommends practical areas for improvement
 * - Refuses to invent data if records are insufficient (< 3 transactions)
 */
export function analyzeBusinessFinances(params: {
  transactions: BusinessTransaction[];
  debts: Debt[];
  accounts: BusinessAccount[];
  businessName?: string;
  idOverride?: string;
}): PaidInsightResult {
  const { transactions, debts, accounts, businessName = "Your Business", idOverride } = params;
  const reportId = idOverride || `insight_rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Data Sufficiency Check
  // Rule: Clearly identify insufficient data rather than inventing financial insights.
  if (!transactions || transactions.length < 3) {
    return {
      id: reportId,
      status: "INSUFFICIENT_DATA",
      title: "Insufficient Transaction Records",
      summary: `You have recorded only ${transactions?.length || 0} transaction(s). MoniePay requires at least 3-5 sales and expense records to accurately detect your spending patterns, margin trends, and cash leaks without making blind guesses.`,
      generatedAt: new Date().toISOString(),
      creditsCost: 0, // No credits charged for insufficient data!
      insufficientReason: `Please record a few cash sales, stock purchases, or shop expenses first. Once you have active records, run this insight again.`,
      spendingPatterns: [],
      cashLeaks: [],
      improvements: [
        {
          step: 1,
          title: "Record Today's Sales",
          recommendation: "Use the Sharp-Sharp or Voice recorder on your dashboard to log 2-3 sales you made today.",
          expectedOutcome: "Builds the baseline for your shop revenue profile.",
        },
        {
          step: 2,
          title: "Record Shop Expenses",
          recommendation: "Log your stock purchases, generator fuel, or market transport fees.",
          expectedOutcome: "Enables accurate calculation of your true operating profit margin.",
        },
      ],
      metricsSnapshot: {
        totalRevenue: 0,
        totalCosts: 0,
        operatingProfit: 0,
        profitMarginPercent: 0,
        customerDebtTotal: 0,
        liquidCash: 0,
        safeWithdrawalAmount: 0,
        transactionCount: transactions?.length || 0,
      },
    };
  }

  // 2. Deterministic Arithmetic Computation
  const metrics = calculateDeterministicMetrics(transactions, debts, accounts);

  // 3. Spending Patterns Analysis
  const spendingPatterns: SpendingPattern[] = [];
  const totalExpenses = metrics.directStockCost + metrics.operatingExpenses + metrics.staffWages + metrics.ownerWithdrawals;

  if (totalExpenses > 0) {
    if (metrics.directStockCost > 0) {
      const pct = Math.round((metrics.directStockCost / totalExpenses) * 100);
      spendingPatterns.push({
        category: "Stock & Goods Inventory",
        amount: metrics.directStockCost,
        percentageOfExpenses: pct,
        observation:
          pct > 60
            ? "Stock purchases consume the vast majority of your shop cash flow. Wholesale price shifts impact you quickly."
            : "Inventory restocking is within normal operating proportions.",
      });
    }

    if (metrics.operatingExpenses > 0) {
      const pct = Math.round((metrics.operatingExpenses / totalExpenses) * 100);
      spendingPatterns.push({
        category: "Shop Overhead & Logistics",
        amount: metrics.operatingExpenses,
        percentageOfExpenses: pct,
        observation:
          pct > 25
            ? "Daily operating overhead (fuel, transport, shop levies) is eating into profit margins."
            : "Operating expenses are maintained at a lean, healthy level.",
      });
    }

    if (metrics.staffWages > 0) {
      const pct = Math.round((metrics.staffWages / totalExpenses) * 100);
      spendingPatterns.push({
        category: "Staff & Apprentice Allowances",
        amount: metrics.staffWages,
        percentageOfExpenses: pct,
        observation: "Staff remuneration and daily shop assistant support.",
      });
    }

    if (metrics.ownerWithdrawals > 0) {
      const pct = Math.round((metrics.ownerWithdrawals / totalExpenses) * 100);
      spendingPatterns.push({
        category: "Owner Personal Chop Money",
        amount: metrics.ownerWithdrawals,
        percentageOfExpenses: pct,
        observation:
          metrics.ownerWithdrawals > metrics.operatingProfit
            ? "Personal withdrawals currently exceed net shop profit, draining capital directly from future restock."
            : "Chop money withdrawals remain safely within realized shop profits.",
      });
    }
  }

  // 4. Potential Cash Leaks Identification
  const cashLeaks: CashLeak[] = [];

  // Leak A: Customer Unpaid Debts (Gbese)
  const activeDebts = debts.filter((d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED" && d.balance_due > 0);
  if (metrics.customerDebtTotal > 0 || activeDebts.length > 0) {
    cashLeaks.push({
      title: "Trapped Capital in Customer Debts (Gbese)",
      severity: metrics.customerDebtTotal > 30000 ? "HIGH" : "MEDIUM",
      amountTiedUp: metrics.customerDebtTotal,
      description: `₦${metrics.customerDebtTotal.toLocaleString()} is currently locked in ${activeDebts.length} customer credit balances. This is liquid cash you need for fresh market restock.`,
      fixAction: "Send WhatsApp payment reminders to top debtors today before extending any new credit.",
    });
  }

  // Leak B: Over-Withdrawal of Chop Money
  if (metrics.ownerWithdrawals > metrics.operatingProfit && metrics.operatingProfit > 0) {
    const leakAmount = metrics.ownerWithdrawals - metrics.operatingProfit;
    cashLeaks.push({
      title: "Chop Money Exceeding Operating Profit",
      severity: "HIGH",
      amountTiedUp: leakAmount,
      description: `You withdrew ₦${metrics.ownerWithdrawals.toLocaleString()} for personal use, which is ₦${leakAmount.toLocaleString()} higher than your realized shop profit of ₦${metrics.operatingProfit.toLocaleString()}.`,
      fixAction: `Cap personal weekly withdrawals to your Safe Chop Money threshold of ₦${metrics.safeWithdrawalAmount.toLocaleString()}.`,
    });
  }

  // Leak C: Wholesale Margin Erosion
  if (metrics.totalRevenue > 0 && metrics.directStockCost / metrics.totalRevenue > 0.7) {
    cashLeaks.push({
      title: "Low Gross Margin on Stock",
      severity: "MEDIUM",
      amountTiedUp: Math.round(metrics.directStockCost * 0.1),
      description: `Stock purchasing takes ${Math.round((metrics.directStockCost / metrics.totalRevenue) * 100)}% of sales revenue. Carton prices may have increased without matching retail price adjustments.`,
      fixAction: "Review selling prices on your fastest-moving items and add ₦200-₦500 to protect markup.",
    });
  }

  // Leak D: Unbanked Cash Drawer Risk
  if (metrics.liquidCash > 50000 && accounts.length > 0) {
    const cashAcct = accounts.find((a) => a.account_type === "CASH");
    if (cashAcct && cashAcct.current_balance > 40000) {
      cashLeaks.push({
        title: "Excess Physical Cash in Shop Drawer",
        severity: "LOW",
        amountTiedUp: cashAcct.current_balance,
        description: `₦${cashAcct.current_balance.toLocaleString()} is sitting in physical cash, which has higher risk of misplacement or untracked petty spending.`,
        fixAction: "Deposit or transfer surplus drawer cash above daily change requirements to your business bank account.",
      });
    }
  }

  // If no critical leaks detected
  if (cashLeaks.length === 0) {
    cashLeaks.push({
      title: "No Major Cash Leaks Detected",
      severity: "LOW",
      amountTiedUp: 0,
      description: "Your revenue, expenses, and withdrawals are currently well-balanced.",
      fixAction: "Continue recording every transaction to keep early warning signals active.",
    });
  }

  // 5. Practical Areas for Improvement
  const improvements: PracticalImprovement[] = [];

  if (activeDebts.length > 0) {
    improvements.push({
      step: 1,
      title: "Recover Active Customer Balances",
      recommendation: `Target your ${activeDebts.length} owing customers. Collecting even 50% recovers ₦${Math.round(metrics.customerDebtTotal * 0.5).toLocaleString()} in instant cash.`,
      expectedOutcome: "Boosts immediate cash at hand without taking expensive loan or overdraft.",
    });
  }

  if (metrics.profitMarginPercent < 20 && metrics.totalRevenue > 0) {
    improvements.push({
      step: improvements.length + 1,
      title: "Adjust Markups on Fast-Moving Goods",
      recommendation: "Conduct a quick 5-minute price review on your top 5 selling items and apply modest price increases.",
      expectedOutcome: `Expands your profit margin from ${metrics.profitMarginPercent}% toward the healthy 25-30% benchmark.`,
    });
  }

  improvements.push({
    step: improvements.length + 1,
    title: "Respect the Safe Chop Money Limit",
    recommendation: `Your calculated Safe Chop Money is ₦${metrics.safeWithdrawalAmount.toLocaleString()}. Treat your business as a separate entity and pay yourself within this limit.`,
    expectedOutcome: "Guarantees 100% preservation of your core market restock capital.",
  });

  improvements.push({
    step: improvements.length + 1,
    title: "Daily Evening Cash Reconciliation",
    recommendation: "Spend 2 minutes each evening before closing the stall to confirm drawer cash matches recorded sales.",
    expectedOutcome: "Eliminates unaccounted petty leaks and reinforces financial discipline.",
  });

  return {
    id: reportId,
    status: "COMPLETED",
    title: `Financial Diagnostic: ${businessName}`,
    summary: `Based on ${transactions.length} recorded transactions, your business has generated ₦${metrics.totalRevenue.toLocaleString()} in revenue with ₦${metrics.operatingProfit.toLocaleString()} in operating profit (${metrics.profitMarginPercent}% margin). ${
      cashLeaks.some((l) => l.severity === "HIGH")
        ? "Action is needed to seal identified cash leaks."
        : "Your shop finances are showing solid operating discipline."
    }`,
    generatedAt: new Date().toISOString(),
    creditsCost: INSIGHT_CREDIT_COST,
    spendingPatterns,
    cashLeaks,
    improvements,
    metricsSnapshot: {
      totalRevenue: metrics.totalRevenue,
      totalCosts: metrics.directStockCost + metrics.operatingExpenses + metrics.staffWages,
      operatingProfit: metrics.operatingProfit,
      profitMarginPercent: metrics.profitMarginPercent,
      customerDebtTotal: metrics.customerDebtTotal,
      liquidCash: metrics.liquidCash,
      safeWithdrawalAmount: metrics.safeWithdrawalAmount,
      transactionCount: transactions.length,
    },
  };
}
