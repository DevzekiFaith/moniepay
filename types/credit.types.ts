// ─────────────────────────────────────────────────────────────────
// MoniePay — Insight Credits & Paid Business Diagnostics Types
// Simple Prepaid Monetisation Engine
// ─────────────────────────────────────────────────────────────────

export interface CreditPack {
  id: "pack_10" | "pack_60" | "pack_140" | "pack_15" | "pack_50" | "pack_150" | "pack_350";
  credits: number;
  priceNgn: number;
  label: string;
  badge?: string;
  description: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "pack_15",
    credits: 15,
    priceNgn: 200,
    label: "Starter Test",
    description: "15 credits • Good for 1 full diagnosis + 5 debt recovery notices",
  },
  {
    id: "pack_60",
    credits: 60,
    priceNgn: 500,
    label: "Market Standard",
    badge: "POPULAR",
    description: "60 credits (20% bonus) • 12 diagnoses or 30 debt recovery notices",
  },
  {
    id: "pack_150",
    credits: 150,
    priceNgn: 1000,
    label: "Master Trader",
    badge: "BEST VALUE",
    description: "150 credits (50% bonus) • Unlocks certified statements & diagnostics",
  },
  {
    id: "pack_350",
    credits: 350,
    priceNgn: 2000,
    label: "Depot Merchant",
    badge: "MAX SAVINGS",
    description: "350 credits (75% bonus) • Full monthly shop intelligence coverage",
  },
];

export const INSIGHT_CREDIT_COST = 5; // 5 credits per in-depth diagnostic analysis
export const DEBT_NOTICE_CREDIT_COST = 2; // 2 credits to dispatch official stamped debt reminder
export const STATEMENT_EXPORT_CREDIT_COST = 15; // 15 credits to export certified financial turnover statement
export const DEPOT_ARBITRAGE_CREDIT_COST = 5; // 5 credits to unlock wholesale depot price comparison
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
