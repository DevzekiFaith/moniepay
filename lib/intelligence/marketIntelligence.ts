// ─────────────────────────────────────────────────────────────────
// MoniePay — Live Informal Market Intelligence & Price Index
// Real-time wholesale depot prices & supply alerts across Nigerian markets:
// Mile 12, Alaba, Balogun, Bodija, Onitsha Main Market, Ariaria Aba, Singer Kano
// ─────────────────────────────────────────────────────────────────

import { TradeType } from "@/types/moniepay.types";

export interface MarketCommodityItem {
  id: string;
  name: string;
  category: string;
  tradeTypes: TradeType[];
  currentPrice: number;
  previousPrice: number;
  unit: string;
  hub: string; // e.g., "Mile 12 Depot, Lagos", "Alaba Int'l", "Balogun Market", "Onitsha Main Market"
  trend: "UP" | "DOWN" | "STABLE";
  changePercent: number;
  informalHeadline: string; // Vivid Pidgin headline
  informalAdvice: string; // Actionable trader advice in Pidgin
  decisionImpact: string; // How this impacts trader's profit & cash
  recommendedAction: "RESTOCK_NOW" | "HOLD_BUYING" | "ADJUST_SELLING_PRICE" | "STOCK_SURPLUS";
  updatedAt: string;
}

export const LIVE_MARKET_FEED: MarketCommodityItem[] = [
  // ── 1. PROVISIONS & FMCG ──
  {
    id: "mkt_rice_50kg",
    name: "Foreign Parboiled Rice (50kg Bag)",
    category: "Provisions & Grains",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 84500,
    previousPrice: 78000,
    unit: "50kg Bag",
    hub: "Iddo / Mile 12 Wholesale Depot, Lagos",
    trend: "UP",
    changePercent: 8.3,
    informalHeadline: "Rice depot price don jump up by ₦6,500 this morning!",
    informalAdvice: "Customs border delay and dollar rate don push foreign rice up for Iddo. If you get cash for hand, buy 2-3 bags today before Friday weekend rush push am reach ₦88,000.",
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
    hub: "Bodija Market, Ibadan / Daleko, Lagos",
    trend: "DOWN",
    changePercent: -6.7,
    informalHeadline: "Vegetable oil don drop small from ₦52k go ₦48.5k!",
    informalAdvice: "Fresh supply don enter Daleko depot from local crushers. Price drop small. No rush buy too much, just buy wetin you fit sell finish inside 2 weeks.",
    decisionImpact: "Saves ₦3,500 per jerrycan. Frees up cash flow for other fast movers.",
    recommendedAction: "STOCK_SURPLUS",
    updatedAt: "12 mins ago",
  },
  {
    id: "mkt_indomie_carton",
    name: "Indomie Super Pack (40 x 120g Carton)",
    category: "Provisions & FMCG",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 16800,
    previousPrice: 16800,
    unit: "Carton of 40",
    hub: "Trade Fair Complex, Lagos",
    trend: "STABLE",
    changePercent: 0.0,
    informalHeadline: "Noodles wholesale price dey steady at ₦16,800.",
    informalAdvice: "Distributors get plenty carton for warehouse. Price dey balance. Keep selling retail at ₦500 per piece, your ₦3,200 profit per carton dey intact.",
    decisionImpact: "Reliable daily revenue turnover with 19% gross margin.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "25 mins ago",
  },
  {
    id: "mkt_sugar_50kg",
    name: "Dangote Refined Sugar (50kg Bag)",
    category: "Provisions & Grains",
    tradeTypes: ["retail_provisions", "food_canteen", "general_merchant"],
    currentPrice: 89000,
    previousPrice: 83500,
    unit: "50kg Bag",
    hub: "Singer Market, Kano / Mile 12, Lagos",
    trend: "UP",
    changePercent: 6.6,
    informalHeadline: "Sugar factory price don rise ₦5,500 due to transport cost.",
    informalAdvice: "Wholesalers for Kano and Lagos don add transport money. Immediately adjust your small cup selling price from ₦350 go ₦400 make your profit no suffer loss.",
    decisionImpact: "Adjust retail prices immediately to prevent hidden capital shrinkage.",
    recommendedAction: "ADJUST_SELLING_PRICE",
    updatedAt: "40 mins ago",
  },

  // ── 2. ELECTRONICS & GADGETS ──
  {
    id: "mkt_charger_fast",
    name: "Fast Charging 65W PD Type-C Adapters (Pack of 10)",
    category: "Electronics & Accessories",
    tradeTypes: ["electronics_phone", "general_merchant"],
    currentPrice: 32000,
    previousPrice: 28000,
    unit: "Pack of 10",
    hub: "Alaba International / Computer Village, Ikeja",
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
    category: "Electronics & Accessories",
    tradeTypes: ["electronics_phone", "general_merchant"],
    currentPrice: 88000,
    previousPrice: 94000,
    unit: "Carton of 6",
    hub: "Alaba International Market, Ojo",
    trend: "DOWN",
    changePercent: -6.4,
    informalHeadline: "Power bank wholesale promo don drop carton price by ₦6,000!",
    informalAdvice: "Major importer dey clear stock before new model arrive. Sweet chance to buy 2 cartons cash-down and sell ₦21,000 each for shop.",
    decisionImpact: "Net profit gain of ₦38,000 across 2 cartons inside 10 days.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "18 mins ago",
  },

  // ── 3. FASHION & TEXTILES ──
  {
    id: "mkt_ankara_bundle",
    name: "Quality Hitarget Ankara (6 Yards x 6 Pieces Bundle)",
    category: "Fashion & Fabrics",
    tradeTypes: ["boutique_fashion", "artisan_tailor", "general_merchant"],
    currentPrice: 56000,
    previousPrice: 51000,
    unit: "Bundle (6 Pcs)",
    hub: "Balogun Market, Lagos Island / Ariaria, Aba",
    trend: "UP",
    changePercent: 9.8,
    informalHeadline: "Hitarget Ankara bundle don add ₦5,000 ahead of party season!",
    informalAdvice: "Owanbe party season dey near, wholesalers dey hold fabric. Lock in 3 bundles now with wholesaler before fabric reach ₦62,000 by month end.",
    decisionImpact: "Saves ₦18,000 bulk purchase discount before peak demand.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "30 mins ago",
  },

  // ── 4. FOOD CANTEEN & AGRO ──
  {
    id: "mkt_cooking_gas_12kg",
    name: "LPG Cooking Gas Refill (12.5kg Cylinder)",
    category: "Energy & Utilities",
    tradeTypes: ["food_canteen", "retail_provisions", "general_merchant"],
    currentPrice: 14200,
    previousPrice: 15500,
    unit: "12.5kg Refill",
    hub: "Depot Terminals, Apapa / Port Harcourt",
    trend: "DOWN",
    changePercent: -8.4,
    informalHeadline: "Cooking gas refill drop from ₦15.5k to ₦14.2k!",
    informalAdvice: "Vessel don discharge gas for Apapa terminal. Refill all empty shop and kitchen cylinders today before depot crowd pile up tomorrow.",
    decisionImpact: "Cuts canteen daily cooking expense by ₦1,300 per cylinder.",
    recommendedAction: "RESTOCK_NOW",
    updatedAt: "1 hour ago",
  },

  // ── 5. BUILDING MATERIALS & HARDWARE ──
  {
    id: "mkt_cement_50kg",
    name: "Dangote / BUA Portland Cement (50kg)",
    category: "Building Materials",
    tradeTypes: ["general_merchant"],
    currentPrice: 8500,
    previousPrice: 8500,
    unit: "50kg Bag",
    hub: "Ibese Factory Depot / Trade Fair Depot",
    trend: "STABLE",
    changePercent: 0.0,
    informalHeadline: "Cement depot price stable at ₦8,500 factory price.",
    informalAdvice: "Supply dey flow smoothly from plants. No panic buy with high-interest loan. Buy trailer or half-trailer on normal schedule.",
    decisionImpact: "Steady cash planning with zero inventory holding loss.",
    recommendedAction: "HOLD_BUYING",
    updatedAt: "2 hours ago",
  },
];

/**
 * Filter live market items by trader type or search keyword
 */
export function getMarketReadingsForTrade(tradeType: TradeType = "retail_provisions", keyword = ""): MarketCommodityItem[] {
  return LIVE_MARKET_FEED.filter((item) => {
    const matchesTrade = item.tradeTypes.includes(tradeType) || item.tradeTypes.includes("general_merchant");
    if (!keyword.trim()) return matchesTrade;
    const q = keyword.toLowerCase();
    return (
      (matchesTrade && (item.name.toLowerCase().includes(q) || item.hub.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))) ||
      item.name.toLowerCase().includes(q)
    );
  });
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
