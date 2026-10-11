// ─────────────────────────────────────────────────────────────────
// MoniePay — Live Informal Market Intelligence & Depot Radar
// Real-time wholesale depot prices & supply alerts across Nigerian markets:
// Mile 12, Daleko, Alaba, Balogun, Bodija, Onitsha Main Market, Ariaria Aba,
// Singer Market Kano, Dawanau Grains Depot, Apapa LPG Terminals, Ibese Cement Depot
// ─────────────────────────────────────────────────────────────────

import { TradeType } from "@/types/moniepay.types";

export type MarketRegion = "ALL" | "LAGOS" | "NORTH" | "EAST" | "DEPOTS";

export interface MarketCommodityItem {
  id: string;
  name: string;
  category: string;
  tradeTypes: TradeType[];
  currentPrice: number;
  previousPrice: number;
  unit: string;
  hub: string; // e.g. "Iddo / Mile 12 Wholesale Depot, Lagos"
  region: "LAGOS" | "NORTH" | "EAST" | "DEPOTS";
  depotArrivals: string; // e.g. "14 Trailers arrived overnight"
  supplyStatus: "SURPLUS" | "NORMAL" | "SCARCE";
  supplyStatusPidgin: string; // e.g. "Plenty Goods" | "Supply Normal" | "E Scarce Small"
  trend: "UP" | "DOWN" | "STABLE";
  changePercent: number;
  informalHeadline: string; // Vivid Pidgin headline
  informalAdvice: string; // Actionable trader advice in Pidgin
  decisionImpact: string; // How this impacts trader's profit & cash
  recommendedAction: "RESTOCK_NOW" | "HOLD_BUYING" | "ADJUST_SELLING_PRICE" | "STOCK_SURPLUS";
  updatedAt: string;
}

export const BASE_MARKET_FEED: MarketCommodityItem[] = [
  // ── 1. PROVISIONS & FMCG (LAGOS / NATIONWIDE) ──
  {
    id: "mkt_rice_50kg",
    name: "Foreign Parboiled Rice (50kg Bag)",
    category: "Foodstuff & Grains",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 84500,
    previousPrice: 78000,
    unit: "50kg Bag",
    hub: "Iddo / Mile 12 Wholesale Depot, Lagos",
    region: "LAGOS",
    depotArrivals: "14 Northern & Border Trailers Arrived",
    supplyStatus: "SCARCE",
    supplyStatusPidgin: "E Scarce Small (Border Delay)",
    trend: "UP",
    changePercent: 8.3,
    informalHeadline: "Rice depot price don jump up by ₦6,500 this morning!",
    informalAdvice: "Customs border delay and dollar rate don push foreign rice up for Iddo. If you get cash for hand, buy 2-3 bags today before Friday rush push am reach ₦88,000.",
    decisionImpact: "Increases retail bag margin by ₦4,000 if bought before weekend price hike.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "Just now",
  },
  {
    id: "mkt_veg_oil_25l",
    name: "Kings / Grand Vegetable Oil (25L Jerrycan)",
    category: "Provisions & FMCG",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 48500,
    previousPrice: 52000,
    unit: "25 Litres",
    hub: "Daleko Wholesale Market, Mushin / Bodija",
    region: "LAGOS",
    depotArrivals: "Fresh Refiner Tankers Discharging",
    supplyStatus: "SURPLUS",
    supplyStatusPidgin: "Plenty Supply for Depot",
    trend: "DOWN",
    changePercent: -6.7,
    informalHeadline: "Vegetable oil don drop small from ₦52k go ₦48.5k!",
    informalAdvice: "Fresh supply don enter Daleko depot from local crushers. Price drop small. No rush buy too much, just buy wetin you fit sell finish inside 2 weeks.",
    decisionImpact: "Saves ₦3,500 per jerrycan. Frees up cash flow for other fast movers.",
    recommendedAction: "STOCK_SURPLUS",
    updatedAt: "8 mins ago",
  },
  {
    id: "mkt_indomie_carton",
    name: "Indomie Super Pack (40 x 120g Carton)",
    category: "Provisions & FMCG",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 16800,
    previousPrice: 16800,
    unit: "Carton of 40",
    hub: "Trade Fair Complex / Balogun, Lagos",
    region: "LAGOS",
    depotArrivals: "Direct Factory Trailers Rolling In",
    supplyStatus: "NORMAL",
    supplyStatusPidgin: "Depot Warehouse Full",
    trend: "STABLE",
    changePercent: 0.0,
    informalHeadline: "Noodles wholesale price dey steady at ₦16,800.",
    informalAdvice: "Distributors get plenty carton for warehouse. Price dey balance. Keep selling retail at ₦500 per piece, your ₦3,200 profit per carton dey intact.",
    decisionImpact: "Reliable daily revenue turnover with 19% gross margin.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "15 mins ago",
  },
  {
    id: "mkt_sugar_50kg",
    name: "Dangote Refined Sugar (50kg Bag)",
    category: "Provisions & FMCG",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 89000,
    previousPrice: 83500,
    unit: "50kg Bag",
    hub: "Singer Market, Kano / Daleko, Lagos",
    region: "NORTH",
    depotArrivals: "Interstate Rail & Heavy Trucks",
    supplyStatus: "SCARCE",
    supplyStatusPidgin: "Transport Cost Add Small",
    trend: "UP",
    changePercent: 6.6,
    informalHeadline: "Sugar factory price don rise ₦5,500 due to transport cost.",
    informalAdvice: "Wholesalers for Kano and Lagos don add transport money. Immediately adjust your small cup selling price from ₦350 go ₦400 make your profit no suffer loss.",
    decisionImpact: "Adjust retail prices immediately to prevent hidden capital shrinkage.",
    recommendedAction: "ADJUST_SELLING_PRICE",
    updatedAt: "22 mins ago",
  },
  {
    id: "mkt_beans_olooyin",
    name: "Honey Beans / Oloyin (100kg Bag)",
    category: "Foodstuff & Grains",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 115000,
    previousPrice: 109000,
    unit: "100kg Bag",
    hub: "Dawanau International Grains Depot, Kano",
    region: "NORTH",
    depotArrivals: "18 Heavy Trucks Offloaded",
    supplyStatus: "NORMAL",
    supplyStatusPidgin: "Grains Harvest Active",
    trend: "UP",
    changePercent: 5.5,
    informalHeadline: "Honey beans bag move to ₦115k for Dawanau Kano Depot.",
    informalAdvice: "Beans demand high from Southern buyers. If you get customer wey dey buy in bulk, take deposit before price jump again next week.",
    decisionImpact: "Secure customer pre-payments to lock in reliable ₦12k markup per bag.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "31 mins ago",
  },
  {
    id: "mkt_garri_white",
    name: "White Garri / Ijebu Garri (50kg Bag)",
    category: "Foodstuff & Grains",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 34000,
    previousPrice: 37000,
    unit: "50kg Bag",
    hub: "Ijebu Depot / Mile 12 Food Terminal, Lagos",
    region: "LAGOS",
    depotArrivals: "Local Processing Farm Vans Flowing",
    supplyStatus: "SURPLUS",
    supplyStatusPidgin: "Cassava Harvest Plenty",
    trend: "DOWN",
    changePercent: -8.1,
    informalHeadline: "Garri depot price crash by ₦3,000 as new cassava flood in!",
    informalAdvice: "Local farmers don bring plenty cassava go mills. Garri price drop sharp-sharp. Buy only wetin you fit sell within 10 days.",
    decisionImpact: "Prevents tying down heavy shop capital in falling produce.",
    recommendedAction: "STOCK_SURPLUS",
    updatedAt: "38 mins ago",
  },
  {
    id: "mkt_semovita_10kg",
    name: "Golden Penny Semovita (10kg x 2 Pack)",
    category: "Provisions & FMCG",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 26500,
    previousPrice: 26500,
    unit: "Pack of 20kg",
    hub: "Onitsha Relief Market / Daleko Lagos",
    region: "EAST",
    depotArrivals: "Flour Mill Trailers Docked",
    supplyStatus: "NORMAL",
    supplyStatusPidgin: "Steady Factory Supply",
    trend: "STABLE",
    changePercent: 0.0,
    informalHeadline: "Semovita depot price firm & steady across Onitsha & Lagos.",
    informalAdvice: "Stock level balanced. Wholesalers dey sell at uniform rate. Keep your normal ₦1,500 mark-up per pack.",
    decisionImpact: "Safe, consistent working capital asset.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "45 mins ago",
  },
  {
    id: "mkt_fresh_tomatoes",
    name: "Fresh Jos Tomatoes (Large Raffia Basket)",
    category: "Foodstuff & Grains",
    tradeTypes: ["food_canteen", "retail_provisions", "general_merchant"],
    currentPrice: 42000,
    previousPrice: 48000,
    unit: "Large Basket",
    hub: "Mile 12 Perishable Terminal, Lagos",
    region: "LAGOS",
    depotArrivals: "22 Jos & Kano Trailers Arrived Dawn",
    supplyStatus: "SURPLUS",
    supplyStatusPidgin: "Plenty Fresh Baskets for Market",
    trend: "DOWN",
    changePercent: -12.5,
    informalHeadline: "Jos tomato basket drop from ₦48k to ₦42k for Mile 12 this morning!",
    informalAdvice: "Heavy trailers from Jos arrive Mile 12 overnight. Supply plenty well-well. Good day for food canteens to buy in volume for weekend stew prep.",
    decisionImpact: "Saves ₦6,000 per basket for canteens and caterers.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "12 mins ago",
  },

  // ── 2. ELECTRONICS & GADGETS (ALABA / COMPUTER VILLAGE) ──
  {
    id: "mkt_charger_fast",
    name: "Fast Charging 65W PD Type-C Adapters (Pack of 10)",
    category: "Phones & Gadgets",
    tradeTypes: ["electronics_phone", "general_merchant"],
    currentPrice: 32000,
    previousPrice: 28000,
    unit: "Pack of 10",
    hub: "Alaba International / Computer Village, Ikeja",
    region: "LAGOS",
    depotArrivals: "Container Offloading at Ojo Warehouse",
    supplyStatus: "SCARCE",
    supplyStatusPidgin: "Port Clearing Duty Increase",
    trend: "UP",
    changePercent: 14.3,
    informalHeadline: "Type-C Fast Charger carton price don climb 14% for Alaba!",
    informalAdvice: "New clearing tariff for port don affect all phone accessories carton. Sell retail at minimum ₦5,500 each so you fit get money restock new carton next week.",
    decisionImpact: "Protects profit margin from being eaten by new import replacement cost.",
    recommendedAction: "ADJUST_SELLING_PRICE",
    updatedAt: "5 mins ago",
  },
  {
    id: "mkt_powerbank_20k",
    name: "Oraimo / Itel 20,000mAh Power Banks (Carton of 6)",
    category: "Phones & Gadgets",
    tradeTypes: ["electronics_phone", "general_merchant"],
    currentPrice: 88000,
    previousPrice: 94000,
    unit: "Carton of 6",
    hub: "Alaba International Market, Ojo",
    region: "LAGOS",
    depotArrivals: "Official Importer Clearance Promo",
    supplyStatus: "SURPLUS",
    supplyStatusPidgin: "Importer Promo Active",
    trend: "DOWN",
    changePercent: -6.4,
    informalHeadline: "Power bank wholesale promo don drop carton price by ₦6,000!",
    informalAdvice: "Major importer dey clear stock before new model arrive. Sweet chance to buy 2 cartons cash-down and sell ₦21,000 each for shop.",
    decisionImpact: "Net profit gain of ₦38,000 across 2 cartons inside 10 days.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "18 mins ago",
  },

  // ── 3. FASHION & TEXTILES (BALOGUN / ABA ARIARIA) ──
  {
    id: "mkt_ankara_bundle",
    name: "Quality Hitarget Ankara (6 Yards x 6 Pieces Bundle)",
    category: "Fabrics & Fashion",
    tradeTypes: ["boutique_fashion", "artisan_tailor", "general_merchant"],
    currentPrice: 56000,
    previousPrice: 51000,
    unit: "Bundle (6 Pcs)",
    hub: "Balogun Market, Lagos Island / Ariaria, Aba",
    region: "EAST",
    depotArrivals: "Textile Shipments from Cotonou & Onitsha",
    supplyStatus: "SCARCE",
    supplyStatusPidgin: "Party Season Demand Fast",
    trend: "UP",
    changePercent: 9.8,
    informalHeadline: "Hitarget Ankara bundle don add ₦5,000 ahead of party season!",
    informalAdvice: "Owanbe party season dey near, wholesalers dey hold fabric. Lock in 3 bundles now with wholesaler before fabric reach ₦62,000 by month end.",
    decisionImpact: "Saves ₦18,000 bulk purchase discount before peak demand.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "30 mins ago",
  },

  // ── 4. ENERGY, DEPOTS & BUILDING (APAPA / IBESE) ──
  {
    id: "mkt_cooking_gas_12kg",
    name: "LPG Cooking Gas Refill (12.5kg Cylinder)",
    category: "Energy & Utilities",
    tradeTypes: ["food_canteen", "retail_provisions", "general_merchant"],
    currentPrice: 14200,
    previousPrice: 15500,
    unit: "12.5kg Refill",
    hub: "Depot Terminals, Apapa / Port Harcourt",
    region: "DEPOTS",
    depotArrivals: "Gas Tanker Vessel Discharged at Apapa",
    supplyStatus: "SURPLUS",
    supplyStatusPidgin: "Vessel Discharged 12,000MT",
    trend: "DOWN",
    changePercent: -8.4,
    informalHeadline: "Cooking gas depot refill drop from ₦15.5k to ₦14.2k!",
    informalAdvice: "Vessel don discharge gas for Apapa terminal. Refill all empty shop and kitchen cylinders today before depot crowd pile up tomorrow.",
    decisionImpact: "Cuts canteen daily cooking expense by ₦1,300 per cylinder.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "2 mins ago",
  },
  {
    id: "mkt_cement_50kg",
    name: "Dangote / BUA Portland Cement (50kg)",
    category: "Building & Hardware",
    tradeTypes: ["general_merchant"],
    currentPrice: 8500,
    previousPrice: 8500,
    unit: "50kg Bag",
    hub: "Ibese Factory Depot / Trade Fair Depot",
    region: "DEPOTS",
    depotArrivals: "Plant Direct Loading Normal",
    supplyStatus: "NORMAL",
    supplyStatusPidgin: "Depot Loading Smooth",
    trend: "STABLE",
    changePercent: 0.0,
    informalHeadline: "Cement depot price stable at ₦8,500 factory price.",
    informalAdvice: "Supply dey flow smoothly from plants. No panic buy with high-interest loan. Buy trailer or half-trailer on normal schedule.",
    decisionImpact: "Steady cash planning with zero inventory holding loss.",
    recommendedAction: "HOLD_BUYING",
    updatedAt: "1 hour ago",
  },
  {
    id: "mkt_frozen_chicken",
    name: "Orobo / Local Frozen Chicken (10kg Carton)",
    category: "Foodstuff & Grains",
    tradeTypes: ["food_canteen", "retail_provisions", "general_merchant"],
    currentPrice: 54000,
    previousPrice: 50500,
    unit: "10kg Carton",
    hub: "Ijora Cold Stores / Mile 2 Terminals, Lagos",
    region: "LAGOS",
    depotArrivals: "Cold Room Generators on Diesel 24/7",
    supplyStatus: "SCARCE",
    supplyStatusPidgin: "Cold Chain Costs Up",
    trend: "UP",
    changePercent: 6.9,
    informalHeadline: "Cold store frozen chicken add ₦3,500 due to generator diesel cost.",
    informalAdvice: "Ijora cold rooms don adjust carton price. Adjust your canteen food portion or chicken price from ₦2,000 go ₦2,400 per piece immediately.",
    decisionImpact: "Keeps food cost ratio strictly below 45% of canteen sales.",
    recommendedAction: "ADJUST_SELLING_PRICE",
    updatedAt: "19 mins ago",
  },
];

export const LIVE_MARKET_FEED: MarketCommodityItem[] = BASE_MARKET_FEED;

const MARKET_FEED_STORAGE_KEY = "moniepay_live_market_feed_v2";

/**
 * Get active market feed from memory/localStorage
 */
export function getStoredMarketFeed(): MarketCommodityItem[] {
  if (typeof window === "undefined") return BASE_MARKET_FEED;
  try {
    const raw = localStorage.getItem(MARKET_FEED_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MARKET_FEED_STORAGE_KEY, JSON.stringify(BASE_MARKET_FEED));
      return BASE_MARKET_FEED;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : BASE_MARKET_FEED;
  } catch {
    return BASE_MARKET_FEED;
  }
}

/**
 * Filter live market items by Region, Trade Type, or Search Keyword
 */
export function getMarketReadingsForTrade(
  tradeType: TradeType = "retail_provisions",
  keyword = "",
  region: MarketRegion = "ALL"
): MarketCommodityItem[] {
  const items = getStoredMarketFeed();

  return items.filter((item) => {
    // 1. Region filter
    if (region !== "ALL" && item.region !== region) {
      return false;
    }

    // 2. Trade type filter
    const matchesTrade =
      tradeType === "general_merchant" ||
      item.tradeTypes.includes(tradeType) ||
      item.tradeTypes.includes("general_merchant");

    if (!matchesTrade && keyword.trim() === "") return false;

    // 3. Keyword search
    if (!keyword.trim()) return true;
    const q = keyword.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(q) ||
      item.hub.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.informalHeadline.toLowerCase().includes(q)
    );
  });
}

/**
 * Simulate a fresh live depot price tick / sync across Nigerian markets
 */
export function refreshMarketFeedPrices(): MarketCommodityItem[] {
  const current = getStoredMarketFeed();
  
  // Apply minor realistic fluctuations (within 1% - 3%) with updated timestamps
  const updated = current.map((item, idx) => {
    // Alternate occasional small changes
    const shouldJitter = idx % 3 === 0;
    const delta = shouldJitter ? (idx % 2 === 0 ? 500 : -500) : 0;
    const newPrice = Math.max(500, item.currentPrice + delta);
    const newTrend = newPrice > item.previousPrice ? "UP" : newPrice < item.previousPrice ? "DOWN" : "STABLE";
    const change = Number((((newPrice - item.previousPrice) / item.previousPrice) * 100).toFixed(1));

    return {
      ...item,
      currentPrice: newPrice,
      trend: newTrend as "UP" | "DOWN" | "STABLE",
      changePercent: change,
      updatedAt: idx === 0 ? "Just now" : `${(idx * 2) + 1} mins ago`,
    };
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MARKET_FEED_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("moniepay:market-feed-updated", { detail: { items: updated } }));
    } catch {}
  }

  return updated;
}

export interface DepotTickerItem {
  id: string;
  hub: string;
  product: string;
  price: string;
  unit: string;
  trend: "UP" | "DOWN" | "STABLE";
  change: string;
  headline: string;
  label: string;
}

/**
 * Returns formatted ticker items for calm, readable depot price display
 */
export function getMarketDepotTickerItems(): DepotTickerItem[] {
  const items = getStoredMarketFeed();
  return items.map((i) => {
    const hubShort = i.hub.split("/")[0].split(",")[0].trim();
    const sign = i.changePercent > 0 ? `+${i.changePercent}%` : i.changePercent < 0 ? `${i.changePercent}%` : "Steady";
    return {
      id: i.id,
      hub: hubShort,
      product: i.name.split("(")[0].trim(),
      price: `₦${i.currentPrice.toLocaleString()}`,
      unit: i.unit.split(" ")[0],
      trend: i.trend,
      change: sign,
      headline: i.informalHeadline,
      label: `[${hubShort}] ${i.name.split("(")[0].trim()}: ₦${i.currentPrice.toLocaleString()}/${i.unit.split(" ")[0]}`,
    };
  });
}

/**
 * Generate an authentic Nigerian market morning audio briefing script in warm market Pidgin
 */
export function getAudioMarketBriefingScript(): string {
  const items = getStoredMarketFeed();
  const upItem = items.find((i) => i.trend === "UP");
  const downItem = items.find((i) => i.trend === "DOWN");

  return (
    `Market greetings! Wetin dey happen for market and depots across Nigeria today: ` +
    (upItem
      ? `For ${upItem.hub.split(",")[0]}, ${upItem.name.split("(")[0]} don rise reach ₦${upItem.currentPrice.toLocaleString()}. Wholesalers dey cite border and transport delay. `
      : "") +
    (downItem
      ? `Good news for ${downItem.hub.split(",")[0]}: ${downItem.name.split("(")[0]} drop to ₦${downItem.currentPrice.toLocaleString()} because fresh trailers don discharge supply. `
      : "") +
    `Gas vessel don land for Apapa terminal, while noodles and cement dey steady. Check all your depot readings sharp-sharp before you buy goods today!`
  );
}

/**
 * Returns contextual dynamic decision prompts generated from live market conditions
 */
export function getLiveMarketDecisionInsight(tradeType: TradeType = "retail_provisions") {
  const items = getMarketReadingsForTrade(tradeType);
  const upItems = items.filter((i) => i.trend === "UP");
  const downItems = items.filter((i) => i.trend === "DOWN");

  if (upItems.length > 0) {
    const topUp = upItems[0];
    return {
      title: `⚡ Price Hike Alert for ${topUp.name.split(" ")[0] || "Goods"}!`,
      headline: topUp.informalHeadline,
      verdict: `RESTOCK FAST: Price up +${topUp.changePercent}% for ${topUp.hub.split(",")[0]}`,
      explanation: topUp.informalAdvice,
      actionText: "Check Wholesaler Stock & Buy",
      hub: topUp.hub,
      currentPrice: topUp.currentPrice,
      unit: topUp.unit,
      trend: "UP" as const,
    };
  }

  if (downItems.length > 0) {
    const topDown = downItems[0];
    return {
      title: `📉 Price Drop Alert for ${topDown.name.split(" ")[0]}!`,
      headline: topDown.informalHeadline,
      verdict: `BARGAIN WINDOW: Price dropped ${Math.abs(topDown.changePercent)}% at ${topDown.hub.split(",")[0]}`,
      explanation: topDown.informalAdvice,
      actionText: "Take Advantage of Price Drop",
      hub: topDown.hub,
      currentPrice: topDown.currentPrice,
      unit: topDown.unit,
      trend: "DOWN" as const,
    };
  }

  return {
    title: "Market Prices Dey Balance Today",
    headline: "Wholesale goods prices dey steady across major markets.",
    verdict: "STEADY MARKET: Keep selling at standard margins.",
    explanation: "No major price spike recorded today. Focus on fast cash collection and prompt customer debt recovery.",
    actionText: "View All Market Prices",
    hub: "Lagos & Regional Depots",
    currentPrice: 0,
    unit: "Standard",
    trend: "STABLE" as const,
  };
}
