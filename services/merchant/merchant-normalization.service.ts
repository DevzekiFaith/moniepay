// ─────────────────────────────────────────────
// Merchant Normalization Service
// ─────────────────────────────────────────────

import { MERCHANT_RULES, findMerchantRule, type MerchantRule } from "@/config/merchants.config";

export class MerchantNormalizationService {
  private cache = new Map<string, string>();

  /**
   * Normalize a raw merchant name / description to a clean merchant name.
   * Returns null if no match found (will use cleaned description instead).
   */
  normalize(rawName: string): string {
    if (!rawName) return rawName;

    // Check cache first
    const cached = this.cache.get(rawName);
    if (cached) return cached;

    // Find matching rule
    const rule = findMerchantRule(rawName);
    if (rule) {
      this.cache.set(rawName, rule.displayName);
      return rule.displayName;
    }

    // Fallback: clean up common bank statement noise
    const cleaned = this.cleanDescription(rawName);
    this.cache.set(rawName, cleaned);
    return cleaned;
  }

  /**
   * Get full merchant rule for a raw name (includes category hint).
   */
  getRule(rawName: string): MerchantRule | null {
    return findMerchantRule(rawName);
  }

  /**
   * Clean common noise from bank transaction descriptions.
   * e.g. "POS PURCHASE 12345 UBER *TRIP 123" → "Uber"
   */
  private cleanDescription(raw: string): string {
    let cleaned = raw;

    // Remove common bank prefixes
    const prefixes = [
      /^POS PURCHASE\s+\d+\s+/i,
      /^WEB PURCHASE\s+/i,
      /^ATM WITHDRAWAL\s+/i,
      /^TRANSFER TO\s+/i,
      /^TRANSFER FROM\s+/i,
      /^PAYMENT TO\s+/i,
      /^PAYMENT FROM\s+/i,
      /^NIP (CREDIT|DEBIT)\s+/i,
      /^NIBSS\s+/i,
    ];
    for (const prefix of prefixes) {
      cleaned = cleaned.replace(prefix, "");
    }

    // Remove trailing reference numbers (e.g. " - 12345678" or " REF:123")
    cleaned = cleaned
      .replace(/\s+-\s+\d+$/g, "")
      .replace(/\s+REF:?\s*\w+$/gi, "")
      .replace(/\s+\d{6,}$/g, "");

    // Title-case the result
    return cleaned
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
