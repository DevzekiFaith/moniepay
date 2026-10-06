// ─────────────────────────────────────────────────────────────────
// MoniePay — Core Domain Types
// Business Decision Intelligence Platform for Nigeria's Informal Economy
// ─────────────────────────────────────────────────────────────────

export type TradeType =
  | "retail_provisions"
  | "boutique_fashion"
  | "food_canteen"
  | "electronics_phone"
  | "pos_agency"
  | "artisan_tailor"
  | "general_merchant";

export type AccountType = "CASH" | "POS" | "BANK" | "WALLET";

export type TransactionType =
  | "SALE"               // Revenue in: goods/services sold
  | "EXPENSE"            // Operating cost: generator fuel, rent, transport, shop levy
  | "STOCK_PURCHASE"     // Direct cost: purchasing inventory to resell
  | "STAFF_PAYMENT"      // Wage for shop assistant / apprentice
  | "OWNER_WITHDRAWAL"   // "Chop money", household feeding, personal allowance
  | "DEBT_COLLECTION"    // Customer paid back debt owed
  | "SUPPLIER_PAYMENT";  // Paid supplier for stock bought on credit

export type PaymentMethod = "CASH" | "TRANSFER" | "POS" | "CREDIT";

export type TrustRating = "GOOD" | "FAIR" | "RISKY";

export type DebtType = "CUSTOMER_CREDIT" | "SUPPLIER_OBLIGATION";

export type DebtStatus = "PENDING" | "PARTIAL" | "SETTLED" | "OVERDUE";

export type ActionType =
  | "COLLECT_DEBT"
  | "SAFE_WITHDRAWAL"
  | "PRICE_ADJUSTMENT"
  | "REDUCE_STOCK_ORDER"
  | "FUEL_ALERT"
  | "SUPPLIER_DUE"
  | "MARGIN_ALERT"
  | "GENERAL";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  trade_type: TradeType;
  currency: string;
  daily_sales_target: number;
  operating_city?: string;
  market_location?: string;
  created_at: string;
}

export interface BusinessAccount {
  id: string;
  business_id: string;
  name: string;
  account_type: AccountType;
  current_balance: number;
  is_primary: boolean;
  account_number?: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone?: string;
  trust_rating: TrustRating;
  total_credit_taken: number;
  total_credit_paid: number;
  current_debt_balance: number;
  notes?: string;
}

export interface BusinessTransaction {
  id: string;
  client_tx_id: string;
  business_id: string;
  account_id?: string;
  type: TransactionType;
  amount: number;
  payment_method: PaymentMethod;
  category: string;
  description?: string;
  customer_id?: string;
  debt_id?: string;
  is_reconciled?: boolean;
  metadata?: Record<string, any>;
  transaction_date: string;
  created_at?: string;
  // Offline sync metadata
  sync_status?: "synced" | "pending" | "failed";
}

export interface Debt {
  id: string;
  business_id: string;
  debt_type: DebtType;
  person_name: string;
  phone?: string;
  customer_id?: string;
  original_amount: number;
  amount_paid: number;
  balance_due: number;
  due_date?: string;
  status: DebtStatus;
  last_reminder_sent_at?: string;
  notes?: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  business_id: string;
  priority_rank: number;
  action_type: ActionType;
  title: string;
  description: string;
  impact_summary: string;
  action_payload?: {
    customer_id?: string;
    debt_id?: string;
    phone?: string;
    person_name?: string;
    suggested_message?: string;
    safe_amount?: number;
    recommended_price?: number;
    supplier_name?: string;
  };
  status: "ACTIVE" | "DISMISSED" | "COMPLETED";
  created_at: string;
}

export interface BusinessEvent {
  id: string;
  business_id: string;
  event_type: string;
  details: Record<string, any>;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────
// Deterministic Metrics & Health
// ─────────────────────────────────────────────────────────────────
export interface DeterministicMetrics {
  // Revenue
  totalRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  posRevenue: number;
  creditRevenue: number; // Given out on credit

  // Costs
  directStockCost: number;     // COGS
  operatingExpenses: number;   // Fuel, rent, levy, transport
  staffWages: number;
  totalCosts: number;

  // Real Operating Profit
  operatingProfit: number;
  profitMarginPercent: number;

  // Cash Position
  liquidCash: number;          // Total cash in drawer + POS/Bank accounts
  cashAtHand: number;          // Physical currency
  bankAndPosBalance: number;   // Electronic balances

  // Debt Position
  customerDebtTotal: number;   // What customers owe you (Gbese)
  customerDebtorCount: number;
  supplierDebtTotal: number;   // What you owe suppliers

  // Owner Withdrawals (Chop Money)
  ownerWithdrawals: number;
  retainedCash: number;        // Profit minus withdrawals

  // Business Health (0-100)
  healthScore: number;
  healthStatus: "Thriving" | "Stable" | "Cash Pressure" | "At Risk";
  healthMessage: string;

  // Safe Withdrawal Calculation
  safeWithdrawalAmount: number;

  // Comparative Trends (What Changed & Why)
  trends: {
    salesGrowthPercent: number;
    profitGrowthPercent: number;
    stockCostGrowthPercent: number;
    fuelCostGrowthPercent: number;
    summaryHeadline: string;
    rootCauseExplanation: string;
    impactSeverity: "POSITIVE" | "NEUTRAL" | "WARNING" | "CRITICAL";
  };
}

// ─────────────────────────────────────────────────────────────────
// The 4 Daily Core Questions
// ─────────────────────────────────────────────────────────────────
export interface FourQuestionsDiagnosis {
  howAmIDoing: {
    headline: string;
    detail: string;
    healthScore: number;
    healthStatus: "Thriving" | "Stable" | "Cash Pressure" | "At Risk";
  };
  whatChanged: {
    headline: string;
    metricComparison: string;
    trendType: "POSITIVE" | "NEGATIVE" | "CAUTION";
  };
  whyItChanged: {
    primaryReason: string;
    contributingFactors: string[];
  };
  whatToDoNow: {
    actionTitle: string;
    actionDetail: string;
    primaryActionLabel: string;
    actionType: ActionType;
    payload?: Record<string, any>;
  };
}

// ─────────────────────────────────────────────────────────────────
// Living Business Model — The 8 Core Pillars
// ─────────────────────────────────────────────────────────────────
export interface LivingBusinessPillars {
  revenue: { amount: number; description: string; breakdown: string };
  cost: { amount: number; description: string; breakdown: string };
  profit: { amount: number; marginPercent: number; verdict: string };
  cash: { total: number; drawerCash: number; bankPos: number };
  obligations: { amount: number; supplierCount: number; urgency: string };
  customerMoney: { amount: number; debtorCount: number; highestDebtor: string };
  ownerMoney: { withdrawn: number; safeAllowance: number; status: string };
  businessHealth: { score: number; status: string; advice: string };
}

// ─────────────────────────────────────────────────────────────────
// Decision Memory & Learning Loop
// ─────────────────────────────────────────────────────────────────
export interface DecisionMemoryItem {
  id: string;
  recommendationTitle: string;
  actionTaken: string;
  recommendedAt: string;
  actionTakenAt?: string;
  verifiedAt?: string;
  expectedOutcome: string;
  actualOutcome?: string;
  status: "LEARNING" | "PROVEN" | "MISSED";
  metricImpactSummary?: string;
  learningLesson: string;
}
