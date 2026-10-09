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

// ── Baseline Market Inventory (Realistic Nigerian Informal Shop) ──
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv_rice_50kg",
    name: "50kg Rice (Mama Gold)",
    category: "Provisions & Grains",
    unit: "Bags",
    current_stock: 22,
    reorder_threshold: 5,
    cost_price: 72000,
    selling_price: 78000,
    last_restocked_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_indomie_ctn",
    name: "Indomie Super Pack (Carton)",
    category: "Provisions & FMCG",
    unit: "Cartons",
    current_stock: 36,
    reorder_threshold: 8,
    cost_price: 8500,
    selling_price: 9500,
    last_restocked_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_oil_25l",
    name: "Kings Vegetable Oil (25L)",
    category: "Provisions & FMCG",
    unit: "Jerrycans",
    current_stock: 14,
    reorder_threshold: 3,
    cost_price: 42000,
    selling_price: 46500,
    last_restocked_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_charger_65w",
    name: "Fast Charger Type-C (65W)",
    category: "Phones & Gadgets",
    unit: "Pcs",
    current_stock: 28,
    reorder_threshold: 6,
    cost_price: 2200,
    selling_price: 3500,
    last_restocked_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_gas_12kg",
    name: "Cooking Gas (12.5kg Refill)",
    category: "Energy & Kitchen",
    unit: "Cylinders",
    current_stock: 18,
    reorder_threshold: 4,
    cost_price: 13500,
    selling_price: 15000,
    last_restocked_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_palm_oil",
    name: "Palm Oil (25L Yellow Jerrycan)",
    category: "Food & Canteen",
    unit: "Jerrycans",
    current_stock: 8,
    reorder_threshold: 3,
    cost_price: 34000,
    selling_price: 38000,
    last_restocked_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inv_sugar_bag",
    name: "Dangote Sugar (50kg Bag)",
    category: "Provisions & Grains",
    unit: "Bags",
    current_stock: 11,
    reorder_threshold: 4,
    cost_price: 68000,
    selling_price: 74000,
    last_restocked_at: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ── Baseline Initial Spoken / Typed Entry Records ──
export const INITIAL_VOICE_ENTRIES: VoiceTypedEntry[] = [
  {
    id: "entry_1",
    method: "VOICE",
    raw_transcript: "Sold 3 bags of Mama Gold Rice for ₦234,000 via bank transfer",
    detected_item: "50kg Rice (Mama Gold)",
    quantity: 3,
    unit: "Bags",
    amount: 234000,
    type: "SALE",
    stock_delta: -3,
    stock_balance_after: 22,
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    counterparty: "Chief Emeka",
    payment_method: "TRANSFER",
  },
  {
    id: "entry_2",
    method: "VOICE",
    raw_transcript: "Customer bought 4 cartons of Indomie for ₦38,000 cash",
    detected_item: "Indomie Super Pack (Carton)",
    quantity: 4,
    unit: "Cartons",
    amount: 38000,
    type: "SALE",
    stock_delta: -4,
    stock_balance_after: 36,
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    counterparty: "Madam Blessing",
    payment_method: "CASH",
  },
  {
    id: "entry_3",
    method: "TYPED",
    raw_transcript: "Bought 10 cartons Indomie from wholesaler ₦85,000",
    detected_item: "Indomie Super Pack (Carton)",
    quantity: 10,
    unit: "Cartons",
    amount: 85000,
    type: "STOCK_PURCHASE",
    stock_delta: 10,
    stock_balance_after: 40,
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    counterparty: "Alaba Wholesaler",
    payment_method: "TRANSFER",
  },
  {
    id: "entry_4",
    method: "VOICE",
    raw_transcript: "Chidi took 2 Type-C chargers on credit ₦7,000",
    detected_item: "Fast Charger Type-C (65W)",
    quantity: 2,
    unit: "Pcs",
    amount: 7000,
    type: "SALE",
    stock_delta: -2,
    stock_balance_after: 28,
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    counterparty: "Chidi Electronics",
    payment_method: "CREDIT",
  },
  {
    id: "entry_5",
    method: "VOICE",
    raw_transcript: "Filled 3 cooking gas cylinders for ₦45,000 cash",
    detected_item: "Cooking Gas (12.5kg Refill)",
    quantity: 3,
    unit: "Cylinders",
    amount: 45000,
    type: "SALE",
    stock_delta: -3,
    stock_balance_after: 18,
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    counterparty: "Mama Nkechi Canteen",
    payment_method: "CASH",
  },
];

// ── GET INVENTORY ITEMS ──
export function getInventoryItems(): InventoryItem[] {
  if (typeof window === "undefined") return INITIAL_INVENTORY;
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVENTORY;
  }
}

// ── SAVE INVENTORY ITEMS ──
export function saveInventoryItems(items: InventoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("moniepay:stock-updated", { detail: { items } }));
  } catch {}
}

// ── GET VOICE & TYPED ENTRIES ──
export function getVoiceTypedEntries(): VoiceTypedEntry[] {
  if (typeof window === "undefined") return INITIAL_VOICE_ENTRIES;
  try {
    const raw = localStorage.getItem(VOICE_ENTRIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VOICE_ENTRIES_STORAGE_KEY, JSON.stringify(INITIAL_VOICE_ENTRIES));
      return INITIAL_VOICE_ENTRIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_VOICE_ENTRIES;
  }
}

// ── SAVE VOICE & TYPED ENTRIES ──
export function saveVoiceTypedEntries(entries: VoiceTypedEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VOICE_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent("moniepay:voice-entry-logged", { detail: { entries } }));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────
// Natural Language Item & Quantity Extractor (Hands-Off NLP Engine)
// ─────────────────────────────────────────────────────────────────
export function extractStockDetailsFromText(rawText: string): {
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
    // Check standalone number before item
    const standaloneNum = lower.match(/\b(\d+)\b/);
    if (standaloneNum) {
      const parsedNum = parseInt(standaloneNum[1], 10);
      if (parsedNum > 0 && parsedNum < 1000) {
        quantity = parsedNum;
      }
    }
  }

  // 2. Match with Existing Inventory Catalog
  const inventory = getInventoryItems();
  let matchedItem = inventory.find((item) => {
    const itemWords = item.name.toLowerCase().split(/[\s(),]+/);
    return itemWords.some((word) => word.length >= 3 && lower.includes(word));
  });

  // Common Aliases
  if (!matchedItem) {
    if (lower.includes("rice")) {
      matchedItem = inventory.find((i) => i.id === "inv_rice_50kg");
    } else if (lower.includes("indomie") || lower.includes("noodles")) {
      matchedItem = inventory.find((i) => i.id === "inv_indomie_ctn");
    } else if (lower.includes("vegetable oil") || lower.includes("kings oil") || lower.includes("groundnut oil")) {
      matchedItem = inventory.find((i) => i.id === "inv_oil_25l");
    } else if (lower.includes("charger") || lower.includes("cable") || lower.includes("usb") || lower.includes("type-c")) {
      matchedItem = inventory.find((i) => i.id === "inv_charger_65w");
    } else if (lower.includes("gas") || lower.includes("cylinder")) {
      matchedItem = inventory.find((i) => i.id === "inv_gas_12kg");
    } else if (lower.includes("palm oil") || lower.includes("red oil")) {
      matchedItem = inventory.find((i) => i.id === "inv_palm_oil");
    } else if (lower.includes("sugar")) {
      matchedItem = inventory.find((i) => i.id === "inv_sugar_bag");
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
  } = params;

  const lower = rawTranscript.toLowerCase();

  // 1. Determine Transaction Type
  let type: TransactionType = explicitType || "SALE";
  if (!explicitType) {
    if (lower.includes("bought") || lower.includes("restock") || lower.includes("purchase") || lower.includes("wholesaler")) {
      type = "STOCK_PURCHASE";
    } else if (lower.includes("credit") || lower.includes("owe") || lower.includes("gbese")) {
      type = lower.includes("paid") || lower.includes("settled") ? "DEBT_COLLECTION" : "SALE";
    } else if (lower.includes("withdraw") || lower.includes("personal") || lower.includes("chop moni")) {
      type = "OWNER_WITHDRAWAL";
    } else if (lower.includes("fuel") || lower.includes("transport") || lower.includes("expense") || lower.includes("bill")) {
      type = "EXPENSE";
    }
  }

  // 2. Extract Amount
  const amount = explicitAmount ?? (parseSpokenMarketAmount(rawTranscript) || 15000);

  // 3. Extract Item & Quantity Details
  const extracted = extractStockDetailsFromText(rawTranscript);
  const itemName = explicitItem || extracted.detectedItem;
  const qty = explicitQty ?? extracted.quantity;
  const unit = extracted.unit;

  // 4. Calculate Stock Movement Delta
  let stockDelta = 0;
  if (type === "SALE") {
    stockDelta = -Math.abs(qty); // Sold goods leave shop
  } else if (type === "STOCK_PURCHASE") {
    stockDelta = Math.abs(qty); // Fresh restock enters shop
  }

  // 5. Update Inventory Item Balance
  const inventory = getInventoryItems();
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
    // Automatically create new catalog entry for newly discovered goods!
    newBalance = Math.max(0, type === "STOCK_PURCHASE" ? qty : 20 - qty);
    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: itemName,
      category: "General Market Goods",
      unit: unit,
      current_stock: newBalance,
      reorder_threshold: 4,
      cost_price: Math.round(amount / (qty || 1) * 0.88),
      selling_price: Math.round(amount / (qty || 1)),
      last_restocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inventory.unshift(newItem);
  }

  saveInventoryItems(inventory);

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

  const existingEntries = getVoiceTypedEntries();
  const updatedEntries = [newEntry, ...existingEntries];
  saveVoiceTypedEntries(updatedEntries);

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
