"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Insight Credits Context & Client State Manager
// Live Balance, Purchase Flow, Audit History & Insight Generation
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CreditPack,
  CREDIT_PACKS,
  INSIGHT_CREDIT_COST,
  WELCOME_BONUS_CREDITS,
  CreditTransactionRecord,
  PaidInsightResult,
} from "@/types/credit.types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/NotificationContext";

interface CreditContextType {
  balance: number;
  costPerInsight: number;
  packs: CreditPack[];
  transactions: CreditTransactionRecord[];
  isLoading: boolean;
  isPurchaseModalOpen: boolean;
  openPurchaseModal: () => void;
  closePurchaseModal: () => void;
  refreshCredits: () => Promise<void>;
  purchasePack: (packId: CreditPack["id"], phone?: string) => Promise<{ success: boolean; paymentLink?: string; error?: string }>;
  verifyCreditPayment: (transactionId?: string | number, txRef?: string, packId?: string, status?: string) => Promise<{ success: boolean; message?: string }>;
  simulateCreditPurchase: (packId?: CreditPack["id"]) => Promise<{ success: boolean; message?: string }>;
  useCreditsAction: (params: {
    cost: number;
    description: string;
    metadata?: Record<string, any>;
  }) => Promise<{ success: boolean; error?: string; newBalance?: number }>;
  requestPaidInsight: (params: {
    transactions: any[];
    debts: any[];
    accounts: any[];
    businessName?: string;
  }) => Promise<{ success: boolean; report?: PaidInsightResult; error?: string; creditsDeducted?: number }>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

const LOCAL_STORAGE_CREDITS_KEY = "moniepay_insight_credits_v1";
const LOCAL_STORAGE_TXS_KEY = "moniepay_insight_credit_txs_v1";

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [balance, setBalance] = useState<number>(WELCOME_BONUS_CREDITS);
  const [transactions, setTransactions] = useState<CreditTransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);

  // 1. Refresh credit balance from server API with local offline fallback
  const refreshCredits = useCallback(async () => {
    try {
      // Local fast-read from localStorage
      if (typeof window !== "undefined") {
        const cachedBal = localStorage.getItem(LOCAL_STORAGE_CREDITS_KEY);
        if (cachedBal !== null) {
          const num = parseInt(cachedBal, 10);
          if (!isNaN(num)) setBalance(num);
        }
        const cachedTxs = localStorage.getItem(LOCAL_STORAGE_TXS_KEY);
        if (cachedTxs) {
          try {
            setTransactions(JSON.parse(cachedTxs));
          } catch {}
        }
      }

      const res = await fetch("/api/credits/balance", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          setBalance(data.balance);
          setTransactions(data.transactions || []);
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_CREDITS_KEY, String(data.balance));
            localStorage.setItem(LOCAL_STORAGE_TXS_KEY, JSON.stringify(data.transactions || []));
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote credit balance:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCredits();
  }, [user?.id, refreshCredits]);

  const openPurchaseModal = useCallback(() => setIsPurchaseModalOpen(true), []);
  const closePurchaseModal = useCallback(() => setIsPurchaseModalOpen(false), []);

  // 2. Initialize Flutterwave Checkout for Credit Pack
  const purchasePack = useCallback(
    async (packId: CreditPack["id"], phone?: string) => {
      try {
        const res = await fetch("/api/credits/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            email: user?.email,
            name: user?.name,
            phone: phone || "08000000000",
            packId,
          }),
        });

        const data = await res.json();
        if (data?.success && data?.paymentLink) {
          return { success: true, paymentLink: data.paymentLink };
        }
        return { success: false, error: data?.error || "Could not initialize credit checkout." };
      } catch (err: any) {
        return { success: false, error: err?.message || "Network error." };
      }
    },
    [user?.id, user?.email, user?.name]
  );

  // 3. Verify Credit Payment
  const verifyCreditPayment = useCallback(
    async (transactionId?: string | number, txRef?: string, packId?: string, status?: string) => {
      // Immediate cancellation / failure rejection - zero balance update
      const normalizedStatus = (status || "").toLowerCase();
      if (normalizedStatus === "cancelled" || normalizedStatus === "failed") {
        toast(
          normalizedStatus === "cancelled" ? "Payment Cancelled" : "Payment Failed",
          normalizedStatus === "cancelled"
            ? "You cancelled the payment on Flutterwave. Your account was not charged and no credits were allocated."
            : "Flutterwave reported this transaction as failed. No credits were allocated.",
          { type: normalizedStatus === "cancelled" ? "info" : "error" }
        );
        return { success: false, message: `Payment was ${normalizedStatus}. No credits were allocated.` };
      }

      try {
        const url = `/api/credits/verify?${new URLSearchParams({
          ...(transactionId ? { transaction_id: String(transactionId) } : {}),
          ...(txRef ? { tx_ref: txRef } : {}),
          ...(packId ? { pack_id: packId } : {}),
          ...(status ? { status } : {}),
        }).toString()}`;

        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success) {
          if (typeof data.newBalance === "number") {
            setBalance(data.newBalance);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_CREDITS_KEY, String(data.newBalance));
            }
          }
          await refreshCredits();
          toast("Credits Added! 🎉", data.message || "Your Insight Credits have been added to your balance.", {
            type: "success",
          });
          return { success: true, message: data.message };
        }

        const errorMsg = data?.error || "Credit verification could not be confirmed on Flutterwave.";
        toast("Payment Notice", errorMsg, { type: "info" });
        return { success: false, message: errorMsg };
      } catch (err: any) {
        return { success: false, message: err?.message || "Verification network error." };
      }
    },
    [refreshCredits, toast]
  );

  // 4. Simulate Credit Purchase (Dev & Offline Demo Mode)
  const simulateCreditPurchase = useCallback(
    async (packId: CreditPack["id"] = "pack_15") => {
      try {
        const res = await fetch("/api/credits/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.id, packId }),
        });

        const data = await res.json();
        if (data?.success) {
          if (typeof data.newBalance === "number") {
            setBalance(data.newBalance);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_CREDITS_KEY, String(data.newBalance));
            }
          }
          await refreshCredits();
          toast("Credits Purchased (Test Mode)", data.message, { type: "success" });
          return { success: true, message: data.message };
        }
        return { success: false, message: data?.error || "Simulation failed." };
      } catch (err: any) {
        return { success: false, message: err?.message || "Network error." };
      }
    },
    [user?.id, refreshCredits, toast]
  );

  // 5. Request Paid Business Diagnostic Insight
  const requestPaidInsight = useCallback(
    async (params: {
      transactions: any[];
      debts: any[];
      accounts: any[];
      businessName?: string;
    }): Promise<{
      success: boolean;
      report?: PaidInsightResult;
      error?: string;
      creditsDeducted?: number;
    }> => {
      const { transactions, debts, accounts, businessName } = params;
      const idempotencyKey = `ins_${user?.id || "demo"}_${Date.now()}`;

      try {
        const res = await fetch("/api/credits/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            businessName,
            idempotencyKey,
            transactions,
            debts,
            accounts,
          }),
        });

        const data = await res.json();

        if (res.status === 402) {
          // Insufficient credits prompt
          openPurchaseModal();
          return {
            success: false,
            error: data.error || "Insufficient credits. Please top up your balance.",
          };
        }

        if (data?.success && data?.report) {
          if (typeof data.newBalance === "number") {
            setBalance(data.newBalance);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_CREDITS_KEY, String(data.newBalance));
            }
          }
          await refreshCredits();

          if (data.report.status === "INSUFFICIENT_DATA") {
            toast("Notice", "Insufficient transaction records to diagnose. 0 credits were deducted.", {
              type: "info",
            });
          } else {
            toast("Diagnostic Ready", `Business analysis generated! ${data.creditsDeducted} credits deducted.`, {
              type: "success",
            });
          }

          return {
            success: true,
            report: data.report,
            creditsDeducted: data.creditsDeducted,
          };
        }

        return {
          success: false,
          error: data?.error || "Could not generate business diagnostic.",
        };
      } catch (err: any) {
        console.error("requestPaidInsight error:", err);
        return { success: false, error: err?.message || "Failed to communicate with diagnostic service." };
      }
    },
    [user?.id, openPurchaseModal, refreshCredits, toast]
  );

  // 5. Deduct credits for arbitrary value actions (debt notice, statements, price alerts)
  const useCreditsAction = useCallback(
    async (params: { cost: number; description: string; metadata?: Record<string, any> }) => {
      const { cost, description, metadata } = params;
      if (balance < cost) {
        openPurchaseModal();
        return { success: false, error: "INSUFFICIENT_CREDITS" };
      }

      try {
        const res = await fetch("/api/credits/use", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            cost,
            description,
            metadata,
          }),
        });

        const data = await res.json();
        if (res.status === 402) {
          openPurchaseModal();
          return { success: false, error: "INSUFFICIENT_CREDITS" };
        }

        if (data?.success) {
          if (typeof data.newBalance === "number") {
            setBalance(data.newBalance);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_CREDITS_KEY, String(data.newBalance));
            }
          }
          await refreshCredits();
          return { success: true, newBalance: data.newBalance };
        }

        return { success: false, error: data?.error || "Credit action could not be completed." };
      } catch (err: any) {
        return { success: false, error: err?.message || "Network error." };
      }
    },
    [balance, openPurchaseModal, refreshCredits, user?.id]
  );

  return (
    <CreditContext.Provider
      value={{
        balance,
        costPerInsight: INSIGHT_CREDIT_COST,
        packs: CREDIT_PACKS,
        transactions,
        isLoading,
        isPurchaseModalOpen,
        openPurchaseModal,
        closePurchaseModal,
        refreshCredits,
        purchasePack,
        verifyCreditPayment,
        simulateCreditPurchase,
        requestPaidInsight,
        useCreditsAction,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
}
