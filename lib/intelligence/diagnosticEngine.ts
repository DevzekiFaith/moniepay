// ─────────────────────────────────────────────────────────────────
// MoniePay — Continuous Diagnostic & Recommendation Engine
// Identifies leaks, pressures & opportunities.
// Delivers ONE clear, practical next action for the business owner.
// ─────────────────────────────────────────────────────────────────

import type {
  BusinessTransaction,
  Debt,
  DeterministicMetrics,
  Recommendation,
} from "@/types/moniepay.types";
import { formatNaira } from "@/lib/utils";

export function generatePriorityRecommendations(
  metrics: DeterministicMetrics,
  transactions: BusinessTransaction[],
  debts: Debt[],
  businessName = "your business"
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Filter active customer debts
  const activeCustomerDebts = debts.filter(
    (d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED" && d.balance_due > 0
  );

  // 1. CONDITION: Customer Debt Trap (High gbese blocking cash flow)
  // If customer debts exceed 20% of revenue OR > ₦50,000 with 2+ debtors
  if (
    (metrics.customerDebtTotal >= 50000 && activeCustomerDebts.length > 0) ||
    (metrics.totalRevenue > 0 && metrics.customerDebtTotal / metrics.totalRevenue > 0.25)
  ) {
    const debtorCount = activeCustomerDebts.length;
    const topDebtor = [...activeCustomerDebts].sort((a, b) => b.balance_due - a.balance_due)[0];

    const suggestedWaMsg = encodeURIComponent(
      `Good day ${topDebtor.person_name}, hope work dey go well. Abeg kindly remember your balance of ₦${topDebtor.balance_due.toLocaleString()} with ${businessName}. We need am for fresh market restock tomorrow. Thank you and God bless your hustle!`
    );

    recommendations.push({
      id: "rec_debt_collection",
      business_id: "default",
      priority_rank: 1,
      action_type: "COLLECT_DEBT",
      title: `${debtorCount} customers dey owe you ₦${metrics.customerDebtTotal.toLocaleString()}. Collect this gbese before you restock.`,
      description: `Your shop working capital dey trapped inside customer gbese. Once you recover this money, you go get solid liquid cash to pay wholesale goods without borrowing.`,
      impact_summary: `Unlocks ₦${metrics.customerDebtTotal.toLocaleString()} cash drawer capital immediately.`,
      action_payload: {
        customer_id: topDebtor.customer_id,
        debt_id: topDebtor.id,
        phone: topDebtor.phone,
        person_name: topDebtor.person_name,
        suggested_message: decodeURIComponent(suggestedWaMsg),
      },
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    });
  }

  // 2. CONDITION: Rising Stock / Material Costs eroding Margin
  // If costs are high relative to revenue
  if (metrics.totalRevenue > 0 && metrics.directStockCost / metrics.totalRevenue > 0.65) {
    recommendations.push({
      id: "rec_margin_defense",
      business_id: "default",
      priority_rank: 2,
      action_type: "PRICE_ADJUSTMENT",
      title: "Market sales dey active, but profit tight because carton prices increased.",
      description: `Stock purchasing cost chop ${Math.round((metrics.directStockCost / metrics.totalRevenue) * 100)}% of your sales this period. Add small ₦200-₦500 on top unit prices or negotiate bulk discount with wholesaler.`,
      impact_summary: `Protects your ₦${metrics.operatingProfit.toLocaleString()} daily profit margin.`,
      action_payload: {
        recommended_price: 500,
      },
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    });
  }

  // 3. CONDITION: Safe Withdrawal Window (Chop money peace of mind)
  // When liquid cash is healthy and retained profit exists
  if (metrics.safeWithdrawalAmount >= 15000 && metrics.healthScore >= 65) {
    recommendations.push({
      id: "rec_safe_withdrawal",
      business_id: "default",
      priority_rank: recommendations.length === 0 ? 1 : 2,
      action_type: "SAFE_WITHDRAWAL",
      title: `You fit safely withdraw ₦${metrics.safeWithdrawalAmount.toLocaleString()} chop moni this week.`,
      description: `After setting aside money for tomorrow restock, generator fuel, and supplier payments, this amount na clean profit wey you fit take chop life without touching capital.`,
      impact_summary: `Guarantees your market restock capital remains 100% intact.`,
      action_payload: {
        safe_amount: metrics.safeWithdrawalAmount,
      },
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    });
  }

  // 4. CONDITION: Excessive Owner Withdrawals
  if (metrics.ownerWithdrawals > metrics.operatingProfit && metrics.operatingProfit > 0) {
    recommendations.push({
      id: "rec_over_withdrawal",
      business_id: "default",
      priority_rank: 1,
      action_type: "SAFE_WITHDRAWAL",
      title: `Chop money withdrawals (₦${metrics.ownerWithdrawals.toLocaleString()}) pass your real shop profit (₦${metrics.operatingProfit.toLocaleString()}).`,
      description: `Taking out more than wetin shop make in real profit dey eat directly into your capital. Pause personal withdrawals until fresh sales enter.`,
      impact_summary: `Prevents shop capital from draining.`,
      action_payload: {
        safe_amount: 0,
      },
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    });
  }

  // 5. CONDITION: Supplier Obligation Due
  const activeSupplierDebts = debts.filter(
    (d) => d.debt_type === "SUPPLIER_OBLIGATION" && d.status !== "SETTLED" && d.balance_due > 0
  );
  if (activeSupplierDebts.length > 0) {
    const topSupplier = activeSupplierDebts[0];
    if (metrics.liquidCash < topSupplier.balance_due * 1.2) {
      recommendations.push({
        id: "rec_supplier_pressure",
        business_id: "default",
        priority_rank: 1,
        action_type: "SUPPLIER_DUE",
        title: `Supplier ${topSupplier.person_name} dey expect ₦${topSupplier.balance_due.toLocaleString()}. Protect cash.`,
        description: `Your cash for hand close to wetin you owe this wholesaler. Prioritize collecting customer debt today before making extra purchases.`,
        impact_summary: `Protects your wholesale trust and continuous credit line.`,
        action_payload: {
          supplier_name: topSupplier.person_name,
          safe_amount: topSupplier.balance_due,
        },
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      });
    }
  }

  // 6. Default Fallback Recommendation if everything is balanced
  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec_steady_growth",
      business_id: "default",
      priority_rank: 1,
      action_type: "GENERAL",
      title: "Your shop rhythm dey balanced! Focus on high-margin fast movers.",
      description: `Profit margin dey at ${metrics.profitMarginPercent}%, and cash inside drawer/bank cover all current restock needs. Keep recording every sale and expense!`,
      impact_summary: "Maintains solid market momentum.",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    });
  }

  // Ensure priority ranking order: rank 1 is top
  return recommendations.sort((a, b) => a.priority_rank - b.priority_rank);
}
