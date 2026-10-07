"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription, Trial & Grace Period Context
// 7-day Free Trial • ₦1,500/Month or ₦15,000/Year
// 3-day Grace Period • Zero Data Deletion Guarantee
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SubscriptionDetails, BillingCycle } from "@/types/subscription.types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/NotificationContext";

interface SubscriptionContextType {
  subscription: SubscriptionDetails | null;
  isLoading: boolean;
  selectedPlan: BillingCycle;
  setSelectedPlan: (plan: BillingCycle) => void;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;
  modalReason: string | null;
  trialDaysLeft: number;
  graceDaysLeft: number;
  isTrialActive: boolean;
  isSubscribed: boolean;
  isGracePeriodActive: boolean;
  isExpired: boolean;
  isRenewalDueSoon: boolean;
  canAccessFullFeatures: boolean;
  initializePayment: (phone?: string, planOverride?: BillingCycle) => Promise<{ success: boolean; paymentLink?: string; error?: string }>;
  verifyPayment: (transactionId: string | number, txRef?: string) => Promise<{ success: boolean; message?: string }>;
  refreshSubscription: () => Promise<void>;
  requireSubscription: (onProceed: () => void, featureName?: string) => boolean;
  simulateTestPayment: (action?: "activate" | "activate_annual" | "enter_grace_period" | "expire_trial" | "reset_trial") => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const DEFAULT_SUBSCRIPTION: SubscriptionDetails = {
  status: "trialing",
  planType: "FREE_TRIAL",
  billingCycle: "monthly",
  planName: "Free Trial (7 days)",
  amount: 1500,
  currency: "NGN",
  isTrialActive: true,
  isSubscriptionActive: false,
  isGracePeriodActive: false,
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  trialDaysLeft: 7,
  graceDaysLeft: 0,
  subscriptionEndsAt: null,
  nextRenewalDate: null,
  isRenewalDueSoon: false,
  canAccessFullFeatures: true,
  hasUsedTrial: false,
  lastPayment: null,
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<BillingCycle>("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<string | null>(null);

  // 1. Fetch Subscription Status from Server
  const refreshSubscription = useCallback(async () => {
    try {
      // Local fast-cache check on initial load
      const cached = typeof window !== "undefined" ? localStorage.getItem("moniepay_subscription") : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSubscription((prev) => prev || parsed);
          if (parsed.billingCycle) {
            setSelectedPlan(parsed.billingCycle);
          }
        } catch {}
      }

      const res = await fetch("/api/subscription/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.subscription) {
          setSubscription(data.subscription);
          if (data.subscription.billingCycle) {
            setSelectedPlan(data.subscription.billingCycle);
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("moniepay_subscription", JSON.stringify(data.subscription));
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Could not refresh subscription status:", err);
    } finally {
      setIsLoading(false);
    }

    // Default to 7-day trial if offline/cached
    setSubscription((prev) => prev || DEFAULT_SUBSCRIPTION);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshSubscription();
  }, [user?.id, refreshSubscription]);

  const openUpgradeModal = useCallback((reason?: string) => {
    setModalReason(reason || null);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setModalReason(null);
  }, []);

  // 2. Initialize Flutterwave Checkout
  const initializePayment = useCallback(
    async (phone?: string, planOverride?: BillingCycle) => {
      try {
        const planToUse = planOverride || selectedPlan || "monthly";
        const res = await fetch("/api/subscription/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            email: user?.email,
            name: user?.name,
            phone: phone || "08000000000",
            planType: planToUse,
          }),
        });

        const data = await res.json();
        if (data?.success && data?.paymentLink) {
          return { success: true, paymentLink: data.paymentLink as string };
        }

        return { success: false, error: data?.error || "Could not initialize checkout." };
      } catch (err: any) {
        return { success: false, error: err?.message || "Network error." };
      }
    },
    [user?.id, user?.email, user?.name, selectedPlan]
  );

  // 3. Verify Payment
  const verifyPayment = useCallback(
    async (transactionId: string | number, txRef?: string) => {
      try {
        const res = await fetch(
          `/api/subscription/verify?transaction_id=${transactionId}${txRef ? `&tx_ref=${txRef}` : ""}`,
          { cache: "no-store" }
        );

        const data = await res.json();
        if (data?.success && data?.subscription) {
          setSubscription(data.subscription);
          if (typeof window !== "undefined") {
            localStorage.setItem("moniepay_subscription", JSON.stringify(data.subscription));
          }
          toast("Subscription Activated! 🎉", "Welcome to MoniePay Plus. All features unlocked!", {
            type: "success",
          });
          return { success: true, message: data.message };
        }

        return { success: false, message: data?.error || "Verification incomplete." };
      } catch (err: any) {
        return { success: false, message: err?.message || "Verification failed." };
      }
    },
    [toast]
  );

  // 4. Feature Gate Helper
  // Data stays 100% safe & read-only when expired, but actions requiring Plus are gated
  const requireSubscription = useCallback(
    (onProceed: () => void, featureName?: string): boolean => {
      const isTrial = subscription?.isTrialActive ?? true;
      const isSub = subscription?.isSubscriptionActive ?? false;
      const isGrace = subscription?.isGracePeriodActive ?? false;

      const canProceed = isTrial || isSub || isGrace;

      if (canProceed) {
        onProceed();
        return true;
      }

      // If expired beyond grace period, prompt user with explicit renewal message
      openUpgradeModal(
        featureName
          ? `Your MoniePay Plus has expired. Renew for ₦1,500/month or ₦15,000/year to continue using ${featureName}.`
          : "Your MoniePay Plus has expired. Renew for ₦1,500/month or ₦15,000/year to continue."
      );
      return false;
    },
    [subscription?.isTrialActive, subscription?.isSubscriptionActive, subscription?.isGracePeriodActive, openUpgradeModal]
  );

  // 5. Simulate Test Payment for Developer / Demo Mode
  const simulateTestPayment = useCallback(
    async (action: "activate" | "activate_annual" | "enter_grace_period" | "expire_trial" | "reset_trial" = "activate") => {
      try {
        const res = await fetch("/api/subscription/simulate-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.id, action }),
        });
        const data = await res.json();
        if (data?.success && data?.subscription) {
          setSubscription(data.subscription);
          if (typeof window !== "undefined") {
            localStorage.setItem("moniepay_subscription", JSON.stringify(data.subscription));
          }
          toast("Test Simulation", data.message || "Simulation applied successfully.", { type: "info" });
        }
      } catch (err) {
        console.warn("Could not simulate payment:", err);
      }
    },
    [user?.id, toast]
  );

  const isTrialActive = Boolean(subscription?.isTrialActive);
  const isSubscribed = Boolean(subscription?.isSubscriptionActive);
  const isGracePeriodActive = Boolean(subscription?.isGracePeriodActive);
  const isExpired = !isTrialActive && !isSubscribed && !isGracePeriodActive;
  const trialDaysLeft = subscription?.trialDaysLeft ?? 0;
  const graceDaysLeft = subscription?.graceDaysLeft ?? 0;
  const isRenewalDueSoon = Boolean(subscription?.isRenewalDueSoon);
  const canAccessFullFeatures = isTrialActive || isSubscribed || isGracePeriodActive;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        selectedPlan,
        setSelectedPlan,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        modalReason,
        trialDaysLeft,
        graceDaysLeft,
        isTrialActive,
        isSubscribed,
        isGracePeriodActive,
        isExpired,
        isRenewalDueSoon,
        canAccessFullFeatures,
        initializePayment,
        verifyPayment,
        refreshSubscription,
        requireSubscription,
        simulateTestPayment,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
