// ─────────────────────────────────────────────
// Analytics Types
// ─────────────────────────────────────────────

export type TimePeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year"
  | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BalanceSummary {
  currentBalance: number;
  totalIn: number;
  totalOut: number;
  netMovement: number;
  currency: string;
  period: TimePeriod;
  dateRange: DateRange;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  transactionCount: number;
  percentage: number;
}

export interface MerchantSpend {
  merchantName: string;
  normalizedName: string;
  amount: number;
  transactionCount: number;
}

export interface DailySpend {
  date: string; // ISO date string YYYY-MM-DD
  totalIn: number;
  totalOut: number;
  net: number;
  transactionCount: number;
}

export interface WeeklySpend {
  weekStart: string;
  weekEnd: string;
  totalIn: number;
  totalOut: number;
  net: number;
}

export interface MonthlySpend {
  month: string; // YYYY-MM
  totalIn: number;
  totalOut: number;
  net: number;
  transactionCount: number;
}

export interface SpendingTrend {
  period: string;
  amount: number;
  changePercent?: number;
  changeDirection?: "up" | "down" | "flat";
}

export interface AnalyticsSummary {
  balance: BalanceSummary;
  categoryBreakdown: CategoryBreakdown[];
  topMerchants: MerchantSpend[];
  dailySpend: DailySpend[];
  weeklySpend: WeeklySpend[];
  monthlySpend: MonthlySpend[];
  averageDailySpend: number;
  averageTransactionAmount: number;
  largestTransaction?: {
    amount: number;
    description: string;
    date: Date;
    merchant?: string;
  };
  recurringTotal: number;
  spendingVsLastPeriod?: {
    current: number;
    previous: number;
    changePercent: number;
    changeDirection: "up" | "down" | "flat";
  };
}

export interface AnalyticsQueryOptions {
  userId: string;
  period: TimePeriod;
  customRange?: DateRange;
  accountIds?: string[];
  excludeTransfers?: boolean;
}
