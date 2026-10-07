// ─────────────────────────────────────────────────────────────────
// MoniePay — Decision Memory & Adaptive Learning Engine
// Feedback Loop: Decision → Action → Outcome → Learning
// Tracks decisions over time, verifies market outcomes, and adapts
// ─────────────────────────────────────────────────────────────────

import type { DecisionMemoryItem } from "@/types/moniepay.types";

const DECISION_MEMORY_KEY = "moniepay_decision_memory";

// Seeded realistic market history for Balogun / Alaba Trader (Mama Chidi)
// Demonstrates that the system continuously learns and remembers outcomes
export const SEED_DECISION_MEMORY: DecisionMemoryItem[] = [
  {
    id: "mem_01",
    recommendationTitle: "Collect ₦35,000 gbese from Emeka before restocking",
    actionTaken: "Send WhatsApp reminder slip give Emeka on Tuesday afternoon",
    recommendedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    actionTakenAt: new Date(Date.now() - 3.8 * 24 * 3600 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 2.5 * 24 * 3600 * 1000).toISOString(),
    expectedOutcome: "Recover ₦35,000 working capital put back inside cash drawer",
    actualOutcome: "Emeka pay ₦30,000 via bank transfer Wednesday morning",
    status: "PROVEN",
    metricImpactSummary: "Cash drawer +₦30,000 • Supplier paid cash-down with 2% discount",
    learningLesson: "Emeka dey settle within 24h once you remind am on Tuesdays. No give am credit pass ₦40k.",
  },
  {
    id: "mem_02",
    recommendationTitle: "Buy extra ₦5,000 gen fuel for peak market heat",
    actionTaken: "Buy 10L petrol on Thursday morning before afternoon rush",
    recommendedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    actionTakenAt: new Date(Date.now() - 5.5 * 24 * 3600 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    expectedOutcome: "Keep cold drinks chiller running make soft drinks icy cold",
    actualOutcome: "Cold drinks sales jump 40% for Thursday afternoon heat",
    status: "PROVEN",
    metricImpactSummary: "+₦18,500 cold drinks gross profit • Zero spoiled drinks",
    learningLesson: "Thursday afternoon NEPA light dey always cut in Balogun. Pre-buying fuel protects drink margin.",
  },
  {
    id: "mem_03",
    recommendationTitle: "Hold chop money withdrawal below ₦25,000 this weekend",
    actionTaken: "Withdraw exactly ₦20,000 for family weekend feeding",
    recommendedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    actionTakenAt: new Date(Date.now() - 7.5 * 24 * 3600 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    expectedOutcome: "Leave ₦85,000 cash balance for Monday morning wholesale market cart",
    actualOutcome: "Fully restock 3 cartons of flour on Monday cash-down without taking gbese",
    status: "PROVEN",
    metricImpactSummary: "₦85,000 wholesale order cleared • Saved ₦4,200 supplier interest",
    learningLesson: "Capping weekend family chop money protects Monday morning wholesale purchasing power.",
  },
];

export function getDecisionMemory(): DecisionMemoryItem[] {
  if (typeof window === "undefined") return SEED_DECISION_MEMORY;
  try {
    const raw = localStorage.getItem(DECISION_MEMORY_KEY);
    if (!raw) {
      localStorage.setItem(DECISION_MEMORY_KEY, JSON.stringify(SEED_DECISION_MEMORY));
      return SEED_DECISION_MEMORY;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_DECISION_MEMORY;
  }
}

export function recordDecisionAction(
  decisionId: string,
  title: string,
  actionTakenText: string,
  expectedOutcome: string
): DecisionMemoryItem {
  const current = getDecisionMemory();
  const newItem: DecisionMemoryItem = {
    id: `mem_${Date.now()}`,
    recommendationTitle: title,
    actionTaken: actionTakenText,
    recommendedAt: new Date().toISOString(),
    actionTakenAt: new Date().toISOString(),
    expectedOutcome,
    status: "LEARNING",
    learningLesson: "MoniePay dey track wetin happen. We go verify the market result inside 24-48 hours.",
  };

  const updated = [newItem, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(DECISION_MEMORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("moniepay:decision-recorded", { detail: newItem }));
  }
  return newItem;
}
