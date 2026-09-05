// ─────────────────────────────────────────────
// Categorization Service
// Assigns a spending category to a classified transaction
// ─────────────────────────────────────────────

import type { NormalizedTransaction, TransactionType } from "@/types/transaction.types";
import { CATEGORIES, type CategoryConfig } from "@/config/categories.config";
import { findMerchantRule } from "@/config/merchants.config";

export interface CategorizationResult {
  categorySlug: string;
  categoryName: string;
  confidence: number; // 0-1
  method: "user_rule" | "merchant_rule" | "keyword" | "type_fallback" | "default";
}

export class CategorizationService {
  /**
   * Layered categorization:
   * L1: Known merchant rules (highest confidence)
   * L2: Keyword match on description/merchant
   * L3: Transaction type fallback
   * L4: Default "Other"
   */
  categorize(
    tx: Pick<NormalizedTransaction, "description" | "merchantName" | "normalizedMerchantName" | "transactionType">,
    userRules?: Map<string, string>
  ): CategorizationResult {
    const desc = tx.description ?? "";
    const merchant = tx.merchantName ?? tx.normalizedMerchantName ?? "";
    const combined = `${desc} ${merchant}`.toLowerCase();

    // L0: User custom learned rules (highest priority override)
    if (userRules) {
      for (const [key, categorySlug] of userRules.entries()) {
        if (combined.includes(key.toLowerCase())) {
          return {
            categorySlug,
            categoryName: this.getNameBySlug(categorySlug),
            confidence: 1.0,
            method: "user_rule",
          };
        }
      }
    }

    // L1: Merchant rule lookup (most specific)
    const merchantRule = findMerchantRule(combined);
    if (merchantRule) {
      return {
        categorySlug: merchantRule.categorySlug,
        categoryName: this.getNameBySlug(merchantRule.categorySlug),
        confidence: 0.95,
        method: "merchant_rule",
      };
    }

    // L2: Keyword scan across all categories
    const keywordMatch = this.matchByKeywords(combined, tx.transactionType);
    if (keywordMatch) {
      return {
        categorySlug: keywordMatch.slug,
        categoryName: keywordMatch.name,
        confidence: 0.75,
        method: "keyword",
      };
    }

    // L3: Type-based fallback
    const typeFallback = this.fallbackByType(tx.transactionType);
    if (typeFallback) {
      return {
        categorySlug: typeFallback.slug,
        categoryName: typeFallback.name,
        confidence: 0.4,
        method: "type_fallback",
      };
    }

    // L4: Default
    return {
      categorySlug: "other",
      categoryName: "Other",
      confidence: 0.1,
      method: "default",
    };
  }

  private matchByKeywords(
    text: string,
    type: TransactionType
  ): CategoryConfig | null {
    const lower = text.toLowerCase();

    // Filter to relevant categories based on type
    const candidates = CATEGORIES.filter((c) => {
      if (type === "INCOME" || type === "REFUND") return c.isIncome;
      if (type === "TRANSFER") return c.slug === "transfers";
      return !c.isIncome && c.slug !== "transfers";
    });

    for (const category of candidates) {
      if (category.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
        return category;
      }
    }
    return null;
  }

  private fallbackByType(type: TransactionType): CategoryConfig | null {
    switch (type) {
      case "INCOME":
        return CATEGORIES.find((c) => c.slug === "income-other") ?? null;
      case "TRANSFER":
        return CATEGORIES.find((c) => c.slug === "transfers") ?? null;
      case "REFUND":
        return CATEGORIES.find((c) => c.slug === "income-other") ?? null;
      default:
        return null;
    }
  }

  private getNameBySlug(slug: string): string {
    return CATEGORIES.find((c) => c.slug === slug)?.name ?? "Other";
  }
}
