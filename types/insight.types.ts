// ─────────────────────────────────────────────
// Insight Types
// ─────────────────────────────────────────────

export type InsightType =
  | "UNUSUAL_SPENDING"
  | "LARGE_TRANSACTION"
  | "SPENDING_INCREASE"
  | "SPENDING_DECREASE"
  | "RECURRING_PAYMENT"
  | "NEW_MERCHANT"
  | "HIGH_CATEGORY_SPENDING"
  | "INCOME_RECEIVED"
  | "MONTHLY_SUMMARY"
  | "WEEKLY_SUMMARY"
  | "LOW_BALANCE"
  | "TRANSFER_DETECTED";

export type InsightImportance = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface Insight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  importance: InsightImportance;
  createdAt: Date;
  expiresAt?: Date | null;
}

export interface InsightRule {
  type: InsightType;
  name: string;
  evaluate: (context: InsightContext) => InsightCandidate | null;
}

export interface InsightContext {
  userId: string;
  recentTransactions: import("./transaction.types").Transaction[];
  previousPeriodTransactions?: import("./transaction.types").Transaction[];
  currentBalance?: number;
}

export interface InsightCandidate {
  type: InsightType;
  title: string;
  body: string;
  importance: InsightImportance;
  data?: Record<string, unknown>;
  expiresAt?: Date;
}
