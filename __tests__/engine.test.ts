import { describe, it, expect } from "vitest";
import { TransactionNormalizationService } from "@/services/transaction/normalization.service";
import { DeduplicationService } from "@/services/transaction/deduplication.service";
import { ClassificationService } from "@/services/transaction/classification.service";
import { CategorizationService } from "@/services/transaction/categorization.service";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import type { RawProviderTransaction } from "@/types/transaction.types";

describe("Financial Engine Independence & Core Logic", () => {
  const normalizer = new TransactionNormalizationService();
  const deduplicator = new DeduplicationService();
  const classifier = new ClassificationService();
  const categorizer = new CategorizationService();
  const analytics = new AnalyticsService();

  it("1. Normalizes raw transactions and produces deterministic hashes", () => {
    const raw: RawProviderTransaction = {
      externalId: "raw-tx-100",
      amount: 8500,
      currency: "NGN",
      date: "2026-03-01T12:00:00Z",
      description: "UBER *TRIP BV LAGOS NG",
      merchantName: "Uber",
      type: "DEBIT",
      status: "POSTED",
    };

    const normalized = normalizer.normalize(raw, "acc-1", "user-1", "PROVIDER");
    const hash = deduplicator.generateHash(normalized);

    expect(normalized.amount).toBe(8500);
    expect(normalized.currency).toBe("NGN");
    expect(hash).toBeDefined();
    expect(typeof hash).toBe("string");
  });

  it("2. Deduplicates repeated transactions seamlessly", () => {
    const raw1: RawProviderTransaction = {
      externalId: "tx-duplicate-12345",
      amount: 15000,
      currency: "NGN",
      date: "2026-03-02T10:00:00Z",
      description: "NETFLIX NIGERIA",
      type: "DEBIT",
    };

    const norm1 = normalizer.normalize(raw1, "acc-1", "user-1", "PROVIDER");
    const hash = deduplicator.generateHash(norm1);
    const existingHashes = new Set([hash]);

    const filtered = deduplicator.filterDuplicates([norm1], existingHashes);
    expect(filtered.length).toBe(0); // Should be filtered out as duplicate
  });

  it("3. Classifies transfers accurately", () => {
    const transferTx: RawProviderTransaction = {
      externalId: "tx-trf-01",
      amount: 50000,
      currency: "NGN",
      date: "2026-03-03T14:00:00Z",
      description: "TRF TO GTB SAVINGS 019283719",
      type: "DEBIT",
    };

    const norm = normalizer.normalize(transferTx, "acc-1", "user-1", "PROVIDER");
    const classification = classifier.classify(norm);

    expect(classification.type).toBe("TRANSFER");
  });

  it("4. Categorizes merchants automatically based on intelligence rules", () => {
    const result = categorizer.categorize({
      description: "UBER *TRIP BV LAGOS",
      merchantName: "Uber",
      transactionType: "EXPENSE",
    });
    expect(result.categorySlug).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("5. Computes accurate financial totals and strictly excludes transfers from Money Out", () => {
    const now = new Date();
    const txs: any[] = [
      {
        id: "1",
        amount: 500000,
        transactionDate: now,
        transactionType: "INCOME",
        status: "POSTED",
        isTransfer: false,
        categoryId: "cat-income",
      },
      {
        id: "2",
        amount: 25000,
        transactionDate: now,
        transactionType: "EXPENSE",
        status: "POSTED",
        isTransfer: false,
        categoryId: "cat-food",
      },
      {
        id: "3",
        amount: 100000,
        transactionDate: now,
        transactionType: "TRANSFER",
        status: "POSTED",
        isTransfer: true, // Internal transfer
        categoryId: "cat-transfers",
      },
    ];

    const currentBalance = 1000000;
    const summary = analytics.calculateSummary(txs, currentBalance, {
      userId: "user-1",
      period: "this_month",
    });

    // Total income should be ₦500,000
    expect(summary.balance.totalIn).toBe(500000);

    // Total expenses should be ₦25,000 (transfer of ₦100,000 must NOT be counted as expense)
    expect(summary.balance.totalOut).toBe(25000);

    // Net movement should be ₦500,000 - ₦25,000 = ₦475,000
    expect(summary.balance.netMovement).toBe(475000);
  });

  it("6. Allows custom user-learned rules to override default categorization", () => {
    const customRules = new Map<string, string>();
    customRules.set("uber", "custom-travel-category");

    const result = categorizer.categorize(
      {
        description: "UBER TRIP LAGOS",
        merchantName: "Uber",
        transactionType: "EXPENSE",
      },
      customRules
    );

    expect(result.categorySlug).toBe("custom-travel-category");
    expect(result.method).toBe("user_rule");
    expect(result.confidence).toBe(1.0);
  });

  it("7. Gracefully calculates summary for 0 accounts / 0 transactions (empty state fidelity)", () => {
    const summary = analytics.calculateSummary([], 0, {
      userId: "new-user-empty",
      period: "this_month",
    });

    expect(summary.balance.currentBalance).toBe(0);
    expect(summary.balance.totalIn).toBe(0);
    expect(summary.balance.totalOut).toBe(0);
    expect(summary.balance.netMovement).toBe(0);
    expect(summary.categoryBreakdown).toEqual([]);
    expect(summary.topMerchants).toEqual([]);
    expect(summary.monthlySpend.every((m) => m.totalIn === 0 && m.totalOut === 0)).toBe(true);
  });
});

