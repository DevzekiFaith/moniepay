// ─────────────────────────────────────────────────────────────────
// MoniePay — Smart Voice & Auto-Stock Directory Ledger Engine
// Auto-Extracts Items, Quantities, Prices & Reconciles Stock Automatically
// ─────────────────────────────────────────────────────────────────

import { TransactionType } from "@/types/moniepay.types";
import { parseSpokenMarketAmount } from "@/lib/voice/spokenParser";
import { sendHandsOffSystemAlert } from "@/lib/alerts/hapticSoundService";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string; // Bags, Cartons, Pcs, Jerrycans, Cylinders, Crates, Rubbers
  current_stock: number;
  reorder_threshold: number;
  cost_price: number;
  selling_price: number;
  last_restocked_at: string;
  updated_at: string;
}

export interface VoiceTypedEntry {
  id: string;
  method: "VOICE" | "TYPED";
  raw_transcript: string;
  detected_item: string;
  quantity: number;
  unit: string;
  amount: number;
  type: TransactionType;
  stock_delta: number; // e.g. -3 on sale, +5 on restock
  stock_balance_after: number;
  timestamp: string;
  counterparty?: string;
  payment_method: string;
}

const INVENTORY_STORAGE_KEY = "moniepay_inventory_items";
const VOICE_ENTRIES_STORAGE_KEY = "moniepay_voice_typed_entries";

// ── Baseline Market Inventory (Empty Default Amounts Ready for Real Traders) ──
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv_rice_50kg",
    name: "50kg Rice (Mama Gold)",
    category: "Provisions & Grains",
    unit: "Bags",
    current_stock: 0,
    reorder_threshold: 0,
    cost_price: 0,
    selling_price: 0,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_indomie_ctn",
    name: "Indomie Super Pack (Carton)",
    category: "Provisions & FMCG",
    unit: "Cartons",
    current_stock: 0,
    reorder_threshold: 0,
    cost_price: 0,
    selling_price: 0,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_oil_25l",
    name: "Kings Vegetable Oil (25L)",
    category: "Provisions & FMCG",
    unit: "Jerrycans",
    current_stock: 0,
    reorder_threshold: 0,
    cost_price: 0,
    selling_price: 0,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_charger_65w",
    name: "Fast Charger Type-C (65W)",
    category: "Phones & Gadgets",
    unit: "Pcs",
    current_stock: 0,
    reorder_threshold: 0,
    cost_price: 0,
    selling_price: 0,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_gas_12kg",
    name: "Cooking Gas (12.5kg Refill)",
    category: "Energy & Kitchen",
    unit: "Cylinders",
    current_stock: 0,
    reorder_threshold: 0,
    cost_price: 0,
    selling_price: 0,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_palm_oil",
    name: "Palm Oil (25L Yellow Jerrycan)",
    category: "Food & Canteen",
    unit: "Jerrycans",
    current_stock: 0,
    reorder_threshold: 0,
    cost_price: 0,
    selling_price: 0,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_sugar_bag",
    name: "Dangote Sugar (50kg Bag)",
    category: "Provisions & Grains",
    unit: "Bags",
    current_stock: 0,
    reorder_threshold: 0,
    cost_price: 0,
    selling_price: 0,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ── Baseline Initial Spoken / Typed Entry Records (Clean Zero State) ──
export const INITIAL_VOICE_ENTRIES: VoiceTypedEntry[] = [];

function getScopedKey(baseKey: string, businessId?: string): string {
  if (!businessId || businessId === "biz_mamachidi_01" || businessId === "user_owner_01") {
    return baseKey;
  }
  return `${baseKey}_${businessId}`;
}

// ── GET INVENTORY ITEMS ──
export function getInventoryItems(businessId?: string): InventoryItem[] {
  if (typeof window === "undefined") {
    if (!businessId || businessId === "biz_mamachidi_01" || businessId === "user_owner_01") {
      return INITIAL_INVENTORY;
    }
    return [];
  }
  const key = getScopedKey(INVENTORY_STORAGE_KEY, businessId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: InventoryItem[] = JSON.parse(raw);
      // Migrate: If legacy demo items had non-zero demo stock (e.g. 22 bags Mama Gold), reset amounts to zero
      const hasOldDemoStock = parsed.some((item) => item.id === "inv_rice_50kg" && item.current_stock === 22);
      if (hasOldDemoStock) {
        const zeroed = parsed.map((item) => ({
          ...item,
          current_stock: 0,
          cost_price: 0,
          selling_price: 0,
          reorder_threshold: 0,
        }));
        localStorage.setItem(key, JSON.stringify(zeroed));
        return zeroed;
      }
      return parsed;
    }
    if (!businessId || businessId === "biz_mamachidi_01" || businessId === "user_owner_01") {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    return [];
  } catch {
    return (!businessId || businessId === "biz_mamachidi_01" || businessId === "user_owner_01") ? INITIAL_INVENTORY : [];
  }
}

// ── SAVE INVENTORY ITEMS ──
export function saveInventoryItems(items: InventoryItem[], businessId?: string) {
  if (typeof window === "undefined") return;
  const key = getScopedKey(INVENTORY_STORAGE_KEY, businessId);
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("moniepay:stock-updated", { detail: { items, businessId } }));
  } catch {}
}

// ── GET VOICE & TYPED ENTRIES ──
export function getVoiceTypedEntries(businessId?: string): VoiceTypedEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  const key = getScopedKey(VOICE_ENTRIES_STORAGE_KEY, businessId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: VoiceTypedEntry[] = JSON.parse(raw);
      // Migrate: If legacy demo entries exist (entry_1 with ₦234k), clear to empty array for fresh recording
      const hasOldDemoEntries = parsed.some((entry) => entry.id === "entry_1" && entry.amount === 234000);
      if (hasOldDemoEntries) {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

// ── SAVE VOICE & TYPED ENTRIES ──
export function saveVoiceTypedEntries(entries: VoiceTypedEntry[], businessId?: string) {
  if (typeof window === "undefined") return;
  const key = getScopedKey(VOICE_ENTRIES_STORAGE_KEY, businessId);
  try {
    localStorage.setItem(key, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent("moniepay:voice-entry-logged", { detail: { entries, businessId } }));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────
// Natural Language Item & Quantity Extractor (Hands-Off NLP Engine)
// ─────────────────────────────────────────────────────────────────
export function extractStockDetailsFromText(rawText: string, businessId?: string): {
  detectedItem: string;
  quantity: number;
  unit: string;
  matchedInventoryId?: string;
} {
  const lower = rawText.toLowerCase();

  // 1. Quantity Extraction Regex (e.g. "3 bags", "4 cartons", "2 pcs", "5 jerrycans", "10 bottles")
  const qtyMatch = lower.match(/(\d+)\s*(bags?|cartons?|ctns?|jerrycans?|cans?|pcs?|pieces?|cylinders?|bottles?|crates?|rubbers?|cups?|packets?|packs?|units?)/i);

  let quantity = 1;
  let unit = "Pcs";

  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10) || 1;
    const rawUnit = qtyMatch[2].toLowerCase();
    if (rawUnit.startsWith("bag")) unit = "Bags";
    else if (rawUnit.startsWith("carton") || rawUnit.startsWith("ctn")) unit = "Cartons";
    else if (rawUnit.startsWith("jerrycan") || rawUnit.startsWith("can")) unit = "Jerrycans";
    else if (rawUnit.startsWith("cylinder")) unit = "Cylinders";
    else if (rawUnit.startsWith("crate")) unit = "Crates";
    else if (rawUnit.startsWith("pack") || rawUnit.startsWith("packet")) unit = "Packs";
    else if (rawUnit.startsWith("rubber")) unit = "Rubbers";
    else unit = "Pcs";
  } else {
    // Check standalone number before item, ensuring it's not the monetary transaction amount
    const spokenAmount = parseSpokenMarketAmount(rawText);
    const standaloneNum = lower.match(/\b(\d+)\b/);
    if (standaloneNum) {
      const parsedNum = parseInt(standaloneNum[1], 10);
      const isMonetaryAmount = parsedNum === spokenAmount || parsedNum >= 100;
      if (!isMonetaryAmount && parsedNum > 0 && parsedNum < 100) {
        quantity = parsedNum;
      }
    }
  }

  // 2. Match with Existing Inventory Catalog (or default templates)
  const inventory = getInventoryItems(businessId);
  const catalog = inventory.length > 0 ? inventory : INITIAL_INVENTORY;
  const unitStopWords = new Set(["carton", "cartons", "bag", "bags", "pcs", "piece", "pack", "packs", "super", "item", "goods", "refill"]);
  let matchedItem = catalog.find((item) => {
    const itemWords = item.name.toLowerCase().split(/[\s(),]+/).filter((w) => w.length >= 3 && !unitStopWords.has(w));
    return itemWords.some((word) => lower.includes(word));
  });

  // Common Aliases
  if (!matchedItem) {
    if (lower.includes("rice")) {
      matchedItem = catalog.find((i) => i.id === "inv_rice_50kg");
    } else if (lower.includes("indomie") || lower.includes("noodles")) {
      matchedItem = catalog.find((i) => i.id === "inv_indomie_ctn");
    } else if (lower.includes("vegetable oil") || lower.includes("kings oil") || lower.includes("groundnut oil")) {
      matchedItem = catalog.find((i) => i.id === "inv_oil_25l");
    } else if (lower.includes("charger") || lower.includes("cable") || lower.includes("usb") || lower.includes("type-c")) {
      matchedItem = catalog.find((i) => i.id === "inv_charger_65w");
    } else if (lower.includes("gas") || lower.includes("cylinder")) {
      matchedItem = catalog.find((i) => i.id === "inv_gas_12kg");
    } else if (lower.includes("palm oil") || lower.includes("red oil")) {
      matchedItem = catalog.find((i) => i.id === "inv_palm_oil");
    } else if (lower.includes("sugar")) {
      matchedItem = catalog.find((i) => i.id === "inv_sugar_bag");
    }
  }

  if (matchedItem) {
    return {
      detectedItem: matchedItem.name,
      quantity,
      unit: qtyMatch ? unit : matchedItem.unit,
      matchedInventoryId: matchedItem.id,
    };
  }

  // Fallback: Infer general item from description
  let inferredItem = "Market Goods";
  if (lower.includes("fuel") || lower.includes("gen")) inferredItem = "Gen Fuel (PMS)";
  else if (lower.includes("transport") || lower.includes("fare")) inferredItem = "Transport Expense";
  else if (lower.includes("wage") || lower.includes("boy")) inferredItem = "Shop Boy Wage";
  else if (lower.includes("food") || lower.includes("chop")) inferredItem = "Feeding / Chop Money";

  return {
    detectedItem: inferredItem,
    quantity,
    unit,
  };
}

// ─────────────────────────────────────────────────────────────────
// Record Auto-Stock Voice/Typed Entry (Core Reconciler)
// ─────────────────────────────────────────────────────────────────
export function recordVoiceOrTypedStockEntry(params: {
  method: "VOICE" | "TYPED";
  rawTranscript: string;
  explicitType?: TransactionType;
  explicitAmount?: number;
  explicitItem?: string;
  explicitQty?: number;
  paymentMethod?: string;
  counterparty?: string;
  businessId?: string;
}): { entry: VoiceTypedEntry; updatedInventory: InventoryItem[] } {
  const {
    method,
    rawTranscript,
    explicitType,
    explicitAmount,
    explicitItem,
    explicitQty,
    paymentMethod = "CASH",
    counterparty,
    businessId,
  } = params;

  const lower = rawTranscript.toLowerCase();

  // 1. Determine Transaction Type
  let type: TransactionType = explicitType || "SALE";
  if (!explicitType) {
    if (/\b(bought|buy|buys|buying|restock|restocked|purchase|purchased|wholesaler|supplier)\b/i.test(lower)) {
      type = "STOCK_PURCHASE";
    } else if (lower.includes("credit") || lower.includes("owe") || lower.includes("gbese")) {
      type = lower.includes("paid") || lower.includes("settled") ? "DEBT_COLLECTION" : "SALE";
    } else if (lower.includes("withdraw") || lower.includes("personal") || lower.includes("chop moni")) {
      type = "OWNER_WITHDRAWAL";
    } else if (lower.includes("fuel") || lower.includes("transport") || lower.includes("expense") || lower.includes("bill")) {
      type = "EXPENSE";
    }
  }

  // 2. Extract Item & Quantity Details
  const extracted = extractStockDetailsFromText(rawTranscript, businessId);
  const itemName = explicitItem || extracted.detectedItem;
  const qty = explicitQty ?? extracted.quantity;
  const unit = extracted.unit;

  // 3. Extract Monetary Amount (Default to 0 if not explicitly stated)
  let amount = 0;
  if (explicitAmount !== undefined) {
    amount = explicitAmount;
  } else {
    // Check if there is an explicit monetary keyword or pattern
    const hasMonetaryIndicator = /(?:[₦#]|naira|\b\d+(?:\.\d+)?\s*(?:k|thousand|million|m|hundred)\b|\bfor\s+\d+|\bworth\s+\d+|\bcost\s+\d+)/i.test(rawTranscript);
    if (hasMonetaryIndicator) {
      amount = parseSpokenMarketAmount(rawTranscript) || 0;
    } else {
      // If there are multiple numbers (e.g. "5 bags 75000"), the other number might be the amount
      const allNums = Array.from(rawTranscript.matchAll(/\b(\d+)\b/g)).map((m) => parseInt(m[1], 10));
      const nonQtyNums = allNums.filter((n) => n !== qty && n >= 100);
      if (nonQtyNums.length > 0) {
        amount = nonQtyNums[nonQtyNums.length - 1];
      } else {
        amount = 0;
      }
    }
  }

  // 4. Calculate Stock Movement Delta
  let stockDelta = 0;
  if (type === "SALE") {
    stockDelta = -Math.abs(qty); // Sold goods leave shop
  } else if (type === "STOCK_PURCHASE") {
    stockDelta = Math.abs(qty); // Fresh restock enters shop
  }

  // 5. Update Inventory Item Balance
  const inventory = getInventoryItems(businessId);
  let itemIndex = inventory.findIndex(
    (i) => i.id === extracted.matchedInventoryId || i.name.toLowerCase() === itemName.toLowerCase()
  );

  let newBalance = 0;

  if (itemIndex >= 0) {
    const current = inventory[itemIndex];
    newBalance = Math.max(0, current.current_stock + stockDelta);
    inventory[itemIndex] = {
      ...current,
      current_stock: newBalance,
      last_restocked_at: type === "STOCK_PURCHASE" ? new Date().toISOString() : current.last_restocked_at,
      updated_at: new Date().toISOString(),
    };
  } else if (stockDelta !== 0) {
    // Automatically create new catalog entry for newly discovered goods starting cleanly from zero!
    newBalance = Math.max(0, type === "STOCK_PURCHASE" ? qty : 0);
    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: itemName,
      category: "General Market Goods",
      unit: unit,
      current_stock: newBalance,
      reorder_threshold: 0,
      cost_price: qty > 0 ? Math.round(amount / qty * 0.88) : 0,
      selling_price: qty > 0 ? Math.round(amount / qty) : 0,
      last_restocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inventory.unshift(newItem);
  }

  saveInventoryItems(inventory, businessId);

  // 6. Create Log Entry
  const newEntry: VoiceTypedEntry = {
    id: `vlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    method,
    raw_transcript: rawTranscript,
    detected_item: itemName,
    quantity: qty,
    unit: unit,
    amount,
    type,
    stock_delta: stockDelta,
    stock_balance_after: newBalance,
    timestamp: new Date().toISOString(),
    counterparty,
    payment_method: paymentMethod,
  };

  const existingEntries = getVoiceTypedEntries(businessId);
  const updatedEntries = [newEntry, ...existingEntries];
  saveVoiceTypedEntries(updatedEntries, businessId);

  // 7. 🔥 HANDS-OFF ALERT: Immediate Physical Phone Vibration + Cash Beep + Background Notification!
  const alertTitle =
    type === "SALE"
      ? `MoniePay: +₦${amount.toLocaleString()} Sale Recorded 🎙️`
      : type === "STOCK_PURCHASE"
      ? `MoniePay: Restocked ${qty} ${unit} (${itemName}) 📦`
      : `MoniePay: ₦${amount.toLocaleString()} Recorded`;

  const alertBody = `"${rawTranscript}" • Stock Balance: ${newBalance} ${unit}`;

  sendHandsOffSystemAlert(alertTitle, alertBody, {
    amount,
    item: itemName,
    url: "/directory",
  });

  return {
    entry: newEntry,
    updatedInventory: inventory,
  };
}
