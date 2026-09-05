// ─────────────────────────────────────────────
// Analytics Service
// Centralized financial analytics calculations
// All monetary metrics are computed HERE, not in UI components
// ─────────────────────────────────────────────

import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  subWeeks, subMonths, subDays, format, eachDayOfInterval,
  eachMonthOfInterval, parseISO,
} from "date-fns";
import type {
  TimePeriod, DateRange, BalanceSummary, CategoryBreakdown,
  MerchantSpend, DailySpend, WeeklySpend, MonthlySpend,
  AnalyticsSummary, AnalyticsQueryOptions,
} from "@/types/analytics.types";
import type { Transaction } from "@/types/transaction.types";

export class AnalyticsService {
  /**
   * Resolve a TimePeriod to an actual date range.
   */
  resolveDateRange(period: TimePeriod, customRange?: DateRange): DateRange {
    const now = new Date();
    switch (period) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "yesterday": {
        const y = subDays(now, 1);
        return { start: startOfDay(y), end: endOfDay(y) };
      }
      case "this_week":
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case "last_week": {
        const lw = subWeeks(now, 1);
        return { start: startOfWeek(lw, { weekStartsOn: 1 }), end: endOfWeek(lw, { weekStartsOn: 1 }) };
      }
      case "this_month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "last_month": {
        const lm = subMonths(now, 1);
        return { start: startOfMonth(lm), end: endOfMonth(lm) };
      }
      case "last_3_months":
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      case "last_6_months":
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
      case "this_year":
        return { start: startOfYear(now), end: endOfYear(now) };
      case "custom":
        return customRange ?? { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }

  /**
   * Filter transactions to a date range, optionally excluding transfers.
   */
  filterTransactions(
    transactions: Transaction[],
    dateRange: DateRange,
    excludeTransfers = true
  ): Transaction[] {
    return transactions.filter((tx) => {
      const d = new Date(tx.transactionDate);
      const inRange = d >= dateRange.start && d <= dateRange.end;
      if (!inRange) return false;
      if (excludeTransfers && tx.isTransfer) return false;
      return !tx.status || tx.status === "POSTED" || tx.status === "PENDING";
    });
  }

  /**
   * Calculate balance summary (in, out, net).
   */
  calculateBalanceSummary(
    transactions: Transaction[],
    currentBalance: number,
    period: TimePeriod,
    dateRange: DateRange
  ): BalanceSummary {
    const relevant = this.filterTransactions(transactions, dateRange);

    let totalIn = 0;
    let totalOut = 0;

    for (const tx of relevant) {
      if (tx.transactionType === "INCOME" || tx.transactionType === "REFUND") {
        totalIn += tx.amount;
      } else if (tx.transactionType === "EXPENSE") {
        totalOut += tx.amount;
      }
    }

    return {
      currentBalance,
      totalIn,
      totalOut,
      netMovement: totalIn - totalOut,
      currency: "NGN",
      period,
      dateRange,
    };
  }

  /**
   * Break down spending by category.
   */
  calculateCategoryBreakdown(transactions: Transaction[], dateRange: DateRange): CategoryBreakdown[] {
    const expenses = this.filterTransactions(transactions, dateRange).filter(
      (tx) => tx.transactionType === "EXPENSE"
    );

    const totalSpend = expenses.reduce((s, tx) => s + tx.amount, 0);

    const categoryMap = new Map<
      string,
      { amount: number; count: number; name: string; slug: string; icon?: string | null; color?: string | null }
    >();

    for (const tx of expenses) {
      const key = tx.categoryId ?? "uncategorized";
      const current = categoryMap.get(key) ?? {
        amount: 0,
        count: 0,
        name: tx.category?.name ?? "Other",
        slug: tx.category?.slug ?? "other",
        icon: tx.category?.icon ?? null,
        color: tx.category?.color ?? null,
      };
      current.amount += tx.amount;
      current.count += 1;
      categoryMap.set(key, current);
    }

    return Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        categorySlug: data.slug,
        categoryIcon: data.icon ?? undefined,
        categoryColor: data.color ?? undefined,
        amount: data.amount,
        transactionCount: data.count,
        percentage: totalSpend > 0 ? (data.amount / totalSpend) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Top merchants by spend.
   */
  calculateTopMerchants(
    transactions: Transaction[],
    dateRange: DateRange,
    limit = 5
  ): MerchantSpend[] {
    const expenses = this.filterTransactions(transactions, dateRange).filter(
      (tx) => tx.transactionType === "EXPENSE"
    );

    const merchantMap = new Map<string, { amount: number; count: number; normalized: string }>();

    for (const tx of expenses) {
      const key = tx.normalizedMerchantName ?? tx.merchantName ?? tx.description;
      const current = merchantMap.get(key) ?? { amount: 0, count: 0, normalized: key };
      current.amount += tx.amount;
      current.count += 1;
      merchantMap.set(key, current);
    }

    return Array.from(merchantMap.entries())
      .map(([merchantName, data]) => ({
        merchantName,
        normalizedName: data.normalized,
        amount: data.amount,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  /**
   * Daily spending for chart data.
   */
  calculateDailySpend(transactions: Transaction[], dateRange: DateRange): DailySpend[] {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayTxns = this.filterTransactions(transactions, { start: dayStart, end: dayEnd });

      let totalIn = 0;
      let totalOut = 0;
      for (const tx of dayTxns) {
        if (tx.transactionType === "INCOME" || tx.transactionType === "REFUND") totalIn += tx.amount;
        else if (tx.transactionType === "EXPENSE") totalOut += tx.amount;
      }

      return {
        date: format(day, "yyyy-MM-dd"),
        totalIn,
        totalOut,
        net: totalIn - totalOut,
        transactionCount: dayTxns.length,
      };
    });
  }

  /**
   * Monthly spend summary for trend charts.
   */
  calculateMonthlySpend(transactions: Transaction[], dateRange: DateRange): MonthlySpend[] {
    const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });

    return months.map((month) => {
      const mStart = startOfMonth(month);
      const mEnd = endOfMonth(month);
      const mTxns = this.filterTransactions(transactions, { start: mStart, end: mEnd });

      let totalIn = 0;
      let totalOut = 0;
      for (const tx of mTxns) {
        if (tx.transactionType === "INCOME" || tx.transactionType === "REFUND") totalIn += tx.amount;
        else if (tx.transactionType === "EXPENSE") totalOut += tx.amount;
      }

      return {
        month: format(month, "yyyy-MM"),
        totalIn,
        totalOut,
        net: totalIn - totalOut,
        transactionCount: mTxns.length,
      };
    });
  }

  /**
   * Full analytics summary for dashboard.
   */
  calculateSummary(
    transactions: Transaction[],
    currentBalance: number,
    options: AnalyticsQueryOptions
  ): AnalyticsSummary {
    const dateRange = this.resolveDateRange(options.period, options.customRange);

    const balanceSummary = this.calculateBalanceSummary(transactions, currentBalance, options.period, dateRange);
    const categoryBreakdown = this.calculateCategoryBreakdown(transactions, dateRange);
    const topMerchants = this.calculateTopMerchants(transactions, dateRange);
    const dailySpend = this.calculateDailySpend(transactions, dateRange);
    const monthlySpend = this.calculateMonthlySpend(transactions, this.resolveDateRange("last_6_months"));

    const relevantExpenses = this.filterTransactions(transactions, dateRange).filter(
      (tx) => tx.transactionType === "EXPENSE"
    );

    const totalDays = Math.max(
      1,
      Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    );
    const averageDailySpend = balanceSummary.totalOut / totalDays;
    const averageTransactionAmount =
      relevantExpenses.length > 0
        ? relevantExpenses.reduce((s, tx) => s + tx.amount, 0) / relevantExpenses.length
        : 0;

    const sorted = [...relevantExpenses].sort((a, b) => b.amount - a.amount);
    const largest = sorted[0];

    // Compare to previous period
    const prevRange = this.getPreviousPeriodRange(dateRange);
    const prevExpenses = this.filterTransactions(transactions, prevRange).filter(
      (tx) => tx.transactionType === "EXPENSE"
    );
    const prevTotal = prevExpenses.reduce((s, tx) => s + tx.amount, 0);
    const currentTotal = balanceSummary.totalOut;
    const changePercent =
      prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    return {
      balance: balanceSummary,
      categoryBreakdown,
      topMerchants,
      dailySpend,
      weeklySpend: [],
      monthlySpend,
      averageDailySpend,
      averageTransactionAmount,
      largestTransaction: largest
        ? {
            amount: largest.amount,
            description: largest.description,
            date: largest.transactionDate,
            merchant: largest.normalizedMerchantName ?? largest.merchantName ?? undefined,
          }
        : undefined,
      recurringTotal: transactions
        .filter((tx) => tx.isRecurring && new Date(tx.transactionDate) >= dateRange.start)
        .reduce((s, tx) => s + tx.amount, 0),
      spendingVsLastPeriod:
        prevTotal > 0
          ? {
              current: currentTotal,
              previous: prevTotal,
              changePercent,
              changeDirection:
                changePercent > 2 ? "up" : changePercent < -2 ? "down" : "flat",
            }
          : undefined,
    };
  }

  private getPreviousPeriodRange(current: DateRange): DateRange {
    const duration = current.end.getTime() - current.start.getTime();
    return {
      start: new Date(current.start.getTime() - duration),
      end: new Date(current.end.getTime() - duration),
    };
  }
}
