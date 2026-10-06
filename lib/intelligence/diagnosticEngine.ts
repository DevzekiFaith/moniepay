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
      `Good day ${topDebtor.person_name}, hope work is going well. Kindly remember your balance of ₦${topDebtor.balance_due.toLocaleString()} with ${businessName}. We need to reconcile for restocking. Thank you!`
    );

    recommendations.push({
      id: "rec_debt_collection",
      business_id: "default",
      priority_rank: 1,
      action_type: "COLLECT_DEBT",
      title: `${debtorCount} customers owe you ₦${metrics.customerDebtTotal.toLocaleString()}. Collect these before restocking.`,
      description: `Your working capital is trapped in customer credit. Recovering this will give you immediate liquid cash for fresh inventory without borrowing.`,
      impact_summary: `Unlocks ₦${metrics.customerDebtTotal.toLocaleString()} cash immediately.`,
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
      title: "Your sales are active, but profit is tight because stock costs increased.",
      description: `Your purchase costs took ${Math.round((metrics.directStockCost / metrics.totalRevenue) * 100)}% of your sales this period. Increase your unit prices slightly or negotiate supplier bulk discount.`,
      impact_summary: `Protects your ₦${metrics.operatingProfit.toLocaleString()} profit margin.`,
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
      title: `You can safely withdraw ₦${metrics.safeWithdrawalAmount.toLocaleString()} this week.`,
      description: `After setting aside funds for restocking, shop running costs, and supplier payments, this amount can be taken for personal/household use without straining your shop.`,
      impact_summary: `Guarantees shop working capital remains intact.`,
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
      title: `Withdrawals (₦${metrics.ownerWithdrawals.toLocaleString()}) exceeded your real profit (₦${metrics.operatingProfit.toLocaleString()}).`,
      description: `Taking out more than you made in profit is eating directly into your shop's capital. Pause personal withdrawals until the next sales cycle.`,
      impact_summary: `Prevents capital depletion.`,
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
        title: `Supplier ${topSupplier.person_name} is owed ₦${topSupplier.balance_due.toLocaleString()}. Protect cash.`,
        description: `Your available cash is close to what you owe this supplier. Prioritize cash collections today before making non-essential purchases.`,
        impact_summary: `Preserves supplier trust and credit line.`,
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
      title: "Your business rhythm is balanced. Focus on high-margin fast movers.",
      description: `Profit margin is ${metrics.profitMarginPercent}%, and cash in drawer/bank covers all current operating requirements. Keep recording every sale and expense.`,
      impact_summary: "Maintains positive business health.",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    });
  }

  // Ensure priority ranking order: rank 1 is top
  return recommendations.sort((a, b) => a.priority_rank - b.priority_rank);
}
