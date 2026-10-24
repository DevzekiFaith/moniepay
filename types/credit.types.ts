// ─────────────────────────────────────────────────────────────────
// MoniePay — Insight Credits & Paid Business Diagnostics Types
// Simple Prepaid Monetisation Engine
// ─────────────────────────────────────────────────────────────────

export interface CreditPack {
  id: "pack_10" | "pack_60" | "pack_140" | string;
  credits: number;
  priceNgn: number;
  label: string;
  badge?: string;
  description: string;
}

/**
 * Minimum purchase limits (Fintech Standard)
 * Least amount a user can buy on Flutterwave gateway is ₦100 (10 Coins)
 */
export const MIN_CREDIT_PURCHASE_AMOUNT_NGN = 100;
export const MIN_CREDITS_PER_PURCHASE = 10;

/**
 * Exactly 3 Tiered Packs (Fintech & SaaS Marketing Standard: Good, Better, Best)
 * Eliminates choice overload and analysis paralysis.
 */
export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "pack_10",
    credits: 10,
    priceNgn: 100,
    label: "Quick Starter",
    badge: "LEAST PACK",
    description: "10 coins • Minimum ₦100 pack (Good for 1-page bank statement or 2 diagnoses)",
  },
  {
    id: "pack_60",
    credits: 60,
    priceNgn: 500,
    label: "Market Standard",
    badge: "POPULAR",
    description: "60 credits (20% bonus) • 12 diagnoses, 4 certified statements, or 30 debt notices",
  },
  {
    id: "pack_140",
    credits: 140,
    priceNgn: 1000,
    label: "Master Trader",
    badge: "BEST VALUE",
    description: "140 credits (40% bonus) • Unlocks all certified statements & business diagnostics",
  },
];

export const INSIGHT_CREDIT_COST = 5; // 5 credits per in-depth diagnostic analysis
export const DEBT_NOTICE_CREDIT_COST = 2; // 2 credits to dispatch official stamped debt reminder
export const STATEMENT_PAGE_ONE_CREDIT_COST = 10; // 10 coins for 1-Page Official Bank Executive Summary (matches ₦100 pack!)
export const STATEMENT_MULTI_PAGE_CREDIT_COST = 15; // 15 coins for Multi-Page Comprehensive Audit Ledger
export const STATEMENT_EXPORT_CREDIT_COST = 10; // Default base cost (10 coins so 10 coins reaches!)
export const DEPOT_ARBITRAGE_CREDIT_COST = 5; // 5 credits to unlock wholesale depot price comparison
export const STAFF_MODE_CREDIT_COST = 20; // 20 credits to unlock 30-day Staff & Attendant Multi-Device Mode
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
