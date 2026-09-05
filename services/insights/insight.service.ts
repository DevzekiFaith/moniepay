// ─────────────────────────────────────────────
// Insight Service
// Rules-based insight generation from transaction data
// ─────────────────────────────────────────────

import type { Transaction } from "@/types/transaction.types";
import type { InsightCandidate, InsightType } from "@/types/insight.types";
import { startOfMonth, subMonths, startOfWeek } from "date-fns";

const LARGE_TRANSACTION_THRESHOLD = 50_000; // ₦50,000
const HIGH_CATEGORY_PERCENT = 0.4; // >40% of total spend in one category

export class InsightService {
  /**
   * Evaluate all insight rules against recent transactions.
   * Returns a list of insight candidates to be stored.
   */
  generate(
    transactions: Transaction[],
    currentBalance: number,
    userId: string
  ): InsightCandidate[] {
    const candidates: InsightCandidate[] = [];

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });

    // Filter to posted non-transfer transactions
    const active = transactions.filter(
      (tx) => !tx.isTransfer && (tx.status === "POSTED" || tx.status === "PENDING")
    );

    const thisMonth = active.filter((tx) => new Date(tx.transactionDate) >= thisMonthStart);
    const lastMonth = active.filter(
      (tx) =>
        new Date(tx.transactionDate) >= lastMonthStart &&
        new Date(tx.transactionDate) < thisMonthStart
    );
    const thisWeek = active.filter((tx) => new Date(tx.transactionDate) >= thisWeekStart);
    const thisMonthExpenses = thisMonth.filter((tx) => tx.transactionType === "EXPENSE");
    const lastMonthExpenses = lastMonth.filter((tx) => tx.transactionType === "EXPENSE");

    // ── Rule: INCOME_RECEIVED ───────────────────
    const recentIncome = thisWeek.filter((tx) => tx.transactionType === "INCOME");
    for (const income of recentIncome.slice(0, 1)) {
      candidates.push({
        type: "INCOME_RECEIVED",
        title: "Money received",
        body: `₦${this.fmt(income.amount)} was credited to your account${income.normalizedMerchantName ? ` from ${income.normalizedMerchantName}` : ""}.`,
        importance: "NORMAL",
        data: { amount: income.amount, transactionId: income.id },
      });
    }

    // ── Rule: LARGE_TRANSACTION ─────────────────
    const largeExpenses = thisMonth.filter(
      (tx) => tx.transactionType === "EXPENSE" && tx.amount >= LARGE_TRANSACTION_THRESHOLD
    );
    for (const tx of largeExpenses.slice(0, 2)) {
      candidates.push({
        type: "LARGE_TRANSACTION",
        title: "Large transaction detected",
        body: `₦${this.fmt(tx.amount)} was spent${tx.normalizedMerchantName ? ` at ${tx.normalizedMerchantName}` : ""} — one of your bigger expenses this month.`,
        importance: "HIGH",
        data: { amount: tx.amount, transactionId: tx.id },
      });
    }

    // ── Rule: SPENDING_INCREASE ─────────────────
    if (thisMonthExpenses.length > 0 && lastMonthExpenses.length > 0) {
      const thisTotal = thisMonthExpenses.reduce((s, tx) => s + tx.amount, 0);
      const lastTotal = lastMonthExpenses.reduce((s, tx) => s + tx.amount, 0);
      const changePercent = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;

      if (changePercent >= 20) {
        candidates.push({
          type: "SPENDING_INCREASE",
          title: "Spending is up this month",
          body: `You've spent ₦${this.fmt(thisTotal)} so far this month — ${Math.round(changePercent)}% more than last month's ₦${this.fmt(lastTotal)}.`,
          importance: "HIGH",
          data: { thisTotal, lastTotal, changePercent },
        });
      } else if (changePercent <= -15) {
        candidates.push({
          type: "SPENDING_DECREASE",
          title: "Great — spending is down",
          body: `You've spent ₦${this.fmt(thisTotal)} this month, which is ${Math.abs(Math.round(changePercent))}% less than last month.`,
          importance: "NORMAL",
          data: { thisTotal, lastTotal, changePercent },
        });
      }
    }

    // ── Rule: HIGH_CATEGORY_SPENDING ────────────
    const categoryTotals = this.groupByCategory(thisMonthExpenses);
    const totalMonthSpend = thisMonthExpenses.reduce((s, tx) => s + tx.amount, 0);
    for (const [categoryName, amount] of categoryTotals.entries()) {
      const pct = totalMonthSpend > 0 ? amount / totalMonthSpend : 0;
      if (pct >= HIGH_CATEGORY_PERCENT) {
        candidates.push({
          type: "HIGH_CATEGORY_SPENDING",
          title: `${categoryName} is your top spend`,
          body: `${categoryName} accounts for ${Math.round(pct * 100)}% of your spending this month (₦${this.fmt(amount)}).`,
          importance: "NORMAL",
          data: { categoryName, amount, percentage: pct * 100 },
        });
        break; // only one high-category insight per run
      }
    }

    // ── Rule: RECURRING_PAYMENT ─────────────────
    const recurring = thisMonth.filter((tx) => tx.isRecurring);
    if (recurring.length > 0) {
      const total = recurring.reduce((s, tx) => s + tx.amount, 0);
      candidates.push({
        type: "RECURRING_PAYMENT",
        title: `${recurring.length} recurring payment${recurring.length !== 1 ? "s" : ""} this month`,
        body: `You've made ${recurring.length} recurring payment${recurring.length !== 1 ? "s" : ""} totalling ₦${this.fmt(total)} this month.`,
        importance: "LOW",
        data: { count: recurring.length, total },
      });
    }

    // ── Rule: MONTHLY_SUMMARY (first of month) ──
    if (now.getDate() <= 3 && lastMonthExpenses.length > 0) {
      const lastTotal = lastMonthExpenses.reduce((s, tx) => s + tx.amount, 0);
      const lastIncome = lastMonth.filter((tx) => tx.transactionType === "INCOME");
      const lastTotalIn = lastIncome.reduce((s, tx) => s + tx.amount, 0);
      candidates.push({
        type: "MONTHLY_SUMMARY",
        title: "Last month's summary",
        body: `Last month you received ₦${this.fmt(lastTotalIn)} and spent ₦${this.fmt(lastTotal)}.`,
        importance: "NORMAL",
        data: { income: lastTotalIn, expenses: lastTotal, net: lastTotalIn - lastTotal },
      });
    }

    return candidates;
  }

  private groupByCategory(transactions: Transaction[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      const key = tx.category?.name ?? "Other";
      map.set(key, (map.get(key) ?? 0) + tx.amount);
    }
    return map;
  }

  private fmt(amount: number): string {
    return new Intl.NumberFormat("en-NG").format(Math.round(amount));
  }
}
