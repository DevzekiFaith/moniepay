"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription & Trial Intelligence Context
// 7-day Free Trial • ₦1,500/Month Flutterwave Payments
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SubscriptionDetails } from "@/types/subscription.types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/NotificationContext";

interface SubscriptionContextType {
  subscription: SubscriptionDetails | null;
  isLoading: boolean;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;
  modalReason: string | null;
  trialDaysLeft: number;
  isTrialActive: boolean;
  isSubscribed: boolean;
  isExpired: boolean;
  canAccessFullFeatures: boolean;
  initializePayment: (phone?: string) => Promise<{ success: boolean; paymentLink?: string; error?: string }>;
  verifyPayment: (transactionId: string | number, txRef?: string) => Promise<{ success: boolean; message?: string }>;
  refreshSubscription: () => Promise<void>;
  requireSubscription: (onProceed: () => void, featureName?: string) => boolean;
  simulateTestPayment: (action?: "activate" | "expire_trial" | "reset_trial") => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const DEFAULT_SUBSCRIPTION: SubscriptionDetails = {
  status: "trialing",
  planType: "FREE_TRIAL",
  planName: "Free Trial (7 days)",
  amount: 1500,
  currency: "NGN",
  isTrialActive: true,
  isSubscriptionActive: false,
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  trialDaysLeft: 7,
  subscriptionEndsAt: null,
  canAccessFullFeatures: true,
  hasUsedTrial: false,
  lastPayment: null,
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
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
        } catch {}
      }

      const res = await fetch("/api/subscription/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.subscription) {
          setSubscription(data.subscription);
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
  const initializePayment = useCallback(async (phone?: string) => {
    try {
      const res = await fetch("/api/subscription/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          name: user?.name,
          phone: phone || "08000000000",
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
  }, [user?.id, user?.email, user?.name]);

  // 3. Verify Payment
  const verifyPayment = useCallback(async (transactionId: string | number, txRef?: string) => {
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
  }, [toast]);

  // 4. Feature Gate Helper
  // Allows existing records to ALWAYS be viewed, but gates creation if expired
  const requireSubscription = useCallback(
    (onProceed: () => void, featureName?: string): boolean => {
      const canProceed = subscription?.canAccessFullFeatures ?? true;

      if (canProceed) {
        onProceed();
        return true;
      }

      // If expired, open upgrade modal with clear Pidgin prompt
      openUpgradeModal(
        featureName
          ? `Your 7-day free trial don finish. Subscribe to MoniePay Plus (₦1,500/mo) make you continue using ${featureName}.`
          : "Your 7-day free trial don finish. Subscribe to MoniePay Plus (₦1,500/month) make you keep recording and growing your market profit."
      );
      return false;
    },
    [subscription?.canAccessFullFeatures, openUpgradeModal]
  );

  // 5. Simulate Test Payment for Developer / Demo Mode
  const simulateTestPayment = useCallback(async (action: "activate" | "expire_trial" | "reset_trial" = "activate") => {
    try {
      const res = await fetch("/api/subscription/simulate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: user?.id }),
      });
      const data = await res.json();
      if (data?.success && data?.subscription) {
        setSubscription(data.subscription);
        if (typeof window !== "undefined") {
          localStorage.setItem("moniepay_subscription", JSON.stringify(data.subscription));
        }
        toast(
          action === "activate"
            ? "MoniePay Plus Activated! ⭐"
            : action === "expire_trial"
            ? "Simulated Trial Expired ⚠️"
            : "7-Day Trial Reset 🔄",
          data.message,
          { type: action === "activate" ? "success" : "info" }
        );
      }
    } catch (err) {
      console.warn("Simulate test error:", err);
    }
  }, [user?.id, toast]);

  const currentSub = subscription || DEFAULT_SUBSCRIPTION;
  const isTrialActive = currentSub.isTrialActive;
  const isSubscribed = currentSub.isSubscriptionActive;
  const isExpired = currentSub.status === "expired" || (!isTrialActive && !isSubscribed);
  const canAccessFullFeatures = currentSub.canAccessFullFeatures;
  const trialDaysLeft = currentSub.trialDaysLeft;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription: currentSub,
        isLoading,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        modalReason,
        trialDaysLeft,
        isTrialActive,
        isSubscribed,
        isExpired,
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
