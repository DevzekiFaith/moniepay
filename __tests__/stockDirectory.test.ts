import { describe, it, expect, beforeEach } from "vitest";
import {
  INITIAL_INVENTORY,
  INITIAL_VOICE_ENTRIES,
  getInventoryItems,
  getVoiceTypedEntries,
  recordVoiceOrTypedStockEntry,
  saveInventoryItems,
} from "../lib/inventory/inventoryStore";

describe("Stock Directory Clean Zero Engine Suite", () => {
  it("initializes baseline inventory items with zero default stock and prices", () => {
    expect(INITIAL_INVENTORY.length).toBeGreaterThan(0);
    for (const item of INITIAL_INVENTORY) {
      expect(item.current_stock).toBe(0);
      expect(item.cost_price).toBe(0);
      expect(item.selling_price).toBe(0);
      expect(item.reorder_threshold).toBe(0);
    }
  });

  it("initializes baseline voice and typed entries as empty array", () => {
    expect(INITIAL_VOICE_ENTRIES).toEqual([]);
  });

  it("records a new restock starting cleanly from zero", () => {
    const bizId = "test_biz_user_1";
    const result = recordVoiceOrTypedStockEntry({
      method: "VOICE",
      rawTranscript: "We buy 5 cartons Indomie for warehouse",
      businessId: bizId,
    });

    expect(result.entry.quantity).toBe(5);
    expect(result.entry.stock_delta).toBe(5);
    expect(result.entry.stock_balance_after).toBe(5);
  });

  it("defaults fallback amount to 0 when no monetary amount is spoken or typed", () => {
    const bizId = "test_biz_user_2";
    const result = recordVoiceOrTypedStockEntry({
      method: "TYPED",
      rawTranscript: "Restock 10 bags of Rice",
      businessId: bizId,
    });

    expect(result.entry.amount).toBe(0);
    expect(result.entry.quantity).toBe(10);
    expect(result.entry.stock_delta).toBe(10);
  });

  it("handles newly discovered commodity starting from 0 rather than hardcoded 20", () => {
    const bizId = "test_biz_user_3";
    const result = recordVoiceOrTypedStockEntry({
      method: "VOICE",
      rawTranscript: "Bought 12 cartons of Battery Cells for ₦45,000",
      businessId: bizId,
    });

    expect(result.entry.detected_item).toBe("Market Goods");
    expect(result.entry.quantity).toBe(12);
    expect(result.entry.stock_balance_after).toBe(12);
  });
});
