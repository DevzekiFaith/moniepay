// ─────────────────────────────────────────────
// Transaction Classification Service
// Determines: INCOME | EXPENSE | TRANSFER | REFUND | UNKNOWN
// ─────────────────────────────────────────────

import type { NormalizedTransaction, TransactionType } from "@/types/transaction.types";

// Keyword lists for each type
const INCOME_SIGNALS = [
  "salary", "payroll", "wages", "pay credit", "income",
  "dividend", "interest credit", "bonus", "commission",
  "nip credit", "inflow", "credit alert", "monthly pay",
];

const TRANSFER_SIGNALS = [
  "transfer to", "transfer from", "trf to", "trf from",
  "nip", "inter-bank", "intra-bank", "neft", "between accounts",
  "own account transfer", "savings transfer",
];

const REFUND_SIGNALS = [
  "reversal", "refund", "chargeback", "credit reversal",
  "return", "cashback", "rebate",
];

const EXPENSE_SIGNALS = [
  "purchase", "payment", "pos", "debit", "withdrawal",
  "bill payment", "direct debit", "standing order",
];

export interface ClassificationResult {
  type: TransactionType;
  confidence: number; // 0-1
  signals: string[]; // which signals triggered this
}

export class ClassificationService {
  /**
   * Classify a normalized transaction's type.
   * This re-evaluates even if a type was assigned during normalization,
   * because we may have more context available here (e.g. account linkage).
   */
  classify(tx: NormalizedTransaction): ClassificationResult {
    const desc = tx.description.toLowerCase();
    const merchant = (tx.merchantName ?? "").toLowerCase();
    const combined = `${desc} ${merchant}`;

    // Check refund first (highest priority override)
    const refundSignals = REFUND_SIGNALS.filter((s) => combined.includes(s));
    if (refundSignals.length > 0) {
      return { type: "REFUND", confidence: 0.9, signals: refundSignals };
    }

    // Transfer detection
    const transferSignals = TRANSFER_SIGNALS.filter((s) => combined.includes(s));
    if (transferSignals.length > 0) {
      return { type: "TRANSFER", confidence: 0.85, signals: transferSignals };
    }

    // If already classified as TRANSFER from normalization, keep it
    if (tx.transactionType === "TRANSFER") {
      return { type: "TRANSFER", confidence: 0.8, signals: ["normalization:transfer"] };
    }

    // Income detection
    const incomeSignals = INCOME_SIGNALS.filter((s) => combined.includes(s));
    if (incomeSignals.length > 0 || tx.transactionType === "INCOME") {
      return {
        type: "INCOME",
        confidence: incomeSignals.length > 0 ? 0.9 : 0.7,
        signals: incomeSignals.length > 0 ? incomeSignals : ["amount:positive"],
      };
    }

    // Expense detection
    const expenseSignals = EXPENSE_SIGNALS.filter((s) => combined.includes(s));
    if (expenseSignals.length > 0 || tx.transactionType === "EXPENSE") {
      return {
        type: "EXPENSE",
        confidence: expenseSignals.length > 0 ? 0.85 : 0.7,
        signals: expenseSignals.length > 0 ? expenseSignals : ["amount:negative"],
      };
    }

    // Return existing type with low confidence
    return {
      type: tx.transactionType,
      confidence: 0.5,
      signals: [],
    };
  }

  /**
   * Determine if two transactions represent opposite legs of an internal transfer.
   * (e.g. debit from Account A matching credit to Account B)
   */
  isTransferPair(
    tx1: NormalizedTransaction,
    tx2: NormalizedTransaction
  ): boolean {
    // Must be within 24 hours
    const timeDiff = Math.abs(
      tx1.transactionDate.getTime() - tx2.transactionDate.getTime()
    );
    const within24h = timeDiff < 24 * 60 * 60 * 1000;

    // Must be same amount
    const sameAmount = Math.abs(tx1.amount - tx2.amount) < 0.01;

    // Must be different types (one in, one out)
    const oppositeTypes =
      (tx1.transactionType === "INCOME" && tx2.transactionType === "EXPENSE") ||
      (tx1.transactionType === "EXPENSE" && tx2.transactionType === "INCOME") ||
      (tx1.transactionType === "TRANSFER" && tx2.transactionType === "TRANSFER");

    return within24h && sameAmount && oppositeTypes;
  }
}
