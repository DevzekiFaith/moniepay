// ─────────────────────────────────────────────────────────────────
// MoniePay — Insight Credits & Paid Business Diagnostics Types
// Simple Prepaid Monetisation Engine
// ─────────────────────────────────────────────────────────────────

export interface CreditPack {
  id: "pack_10" | "pack_60" | "pack_140";
  credits: number;
  priceNgn: number;
  label: string;
  badge?: string;
  description: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "pack_10",
    credits: 10,
    priceNgn: 100,
    label: "Starter Pack",
    description: "10 credits • Good for 2 full business diagnostics",
  },
  {
    id: "pack_60",
    credits: 60,
    priceNgn: 500,
    label: "Trader Pack",
    badge: "POPULAR",
    description: "60 credits (20% bonus) • Good for 12 diagnostics",
  },
  {
    id: "pack_140",
    credits: 140,
    priceNgn: 1000,
    label: "Market Leader",
    badge: "BEST VALUE",
    description: "140 credits (40% bonus) • Good for 28 diagnostics",
  },
];

export const INSIGHT_CREDIT_COST = 5; // 5 credits per in-depth diagnostic analysis
export const WELCOME_BONUS_CREDITS = 10; // Free starter balance for immediate trial

export interface CreditTransactionRecord {
  id: string;
  userId: string;
  type: "PURCHASE" | "USAGE" | "BONUS" | "REFUND";
  credits: number; // positive for addition, negative for deduction
  balanceAfter: number;
  description: string;
  referenceId?: string | null;
  amountPaid?: number | null;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CreditBalanceResponse {
  success: boolean;
  balance: number;
  costPerInsight: number;
  transactions: CreditTransactionRecord[];
}

export interface SpendingPattern {
  category: string;
  amount: number;
  percentageOfExpenses: number;
  observation: string;
}

export interface CashLeak {
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  amountTiedUp: number;
  description: string;
  fixAction: string;
}

export interface PracticalImprovement {
  step: number;
  title: string;
  recommendation: string;
  expectedOutcome: string;
}

export interface PaidInsightResult {
  id: string;
  status: "COMPLETED" | "INSUFFICIENT_DATA";
  title: string;
  summary: string;
  generatedAt: string;
  creditsCost: number;
  insufficientReason?: string;
  spendingPatterns: SpendingPattern[];
  cashLeaks: CashLeak[];
  improvements: PracticalImprovement[];
  metricsSnapshot: {
    totalRevenue: number;
    totalCosts: number;
    operatingProfit: number;
    profitMarginPercent: number;
    customerDebtTotal: number;
    liquidCash: number;
    safeWithdrawalAmount: number;
    transactionCount: number;
  };
}
