"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Shop Profile & Intelligence Settings
// Light & Dark Mode • Mobile Responsive • Modern Navigation
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  ShieldCheck,
  Lock,
  Bell,
  SlidersHorizontal,
  CheckCircle2,
  Building2,
  LogOut,
  ArrowRight,
  Store,
  MapPin,
  SunMoon,
  Coins,
  KeyRound,
  X,
} from "lucide-react";
import { useCredits } from "@/context/CreditContext";
import { SubscriptionBannerCard } from "@/components/dashboard/SubscriptionBannerCard";
import { ReferralDashboardBanner } from "@/components/dashboard/ReferralDashboardBanner";
import { InviteShopModal } from "@/components/referral/InviteShopModal";
import { hasOwnerPin, setOwnerPin, getOwnerPin } from "@/lib/security/ownerPinService";

export default function ProfilePage() {
  const { notify } = useNotification();
  const { user, logout } = useAuth();
  const { balance, openPurchaseModal } = useCredits();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [pinModalError, setPinModalError] = useState<string | null>(null);

  // Settings
  const [currency, setCurrency] = useState("NGN (₦)");
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [autoCategorization, setAutoCategorization] = useState(true);
  const [notifyTransactions, setNotifyTransactions] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isPinActive = hasOwnerPin(user?.id);

  const handleSavePin = () => {
    if (newPin.length !== 4) {
      setPinModalError("Oga, PIN must be exactly 4 digits o!");
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinModalError("The two PINs no match o! Type am again.");
      return;
    }
    setOwnerPin(newPin, user?.id);
    setIsPinModalOpen(false);
    setNewPin("");
    setConfirmNewPin("");
    setPinModalError(null);
    notify("Oga PIN Saved Successfully! 🛡️", "Your 4-digit secret PIN is now active for all bank exports and profit protection.", {
      type: "success",
    });
  };

  const handleSave = () => {
    setSavedSuccess(true);
    notify("Preferences Saved", "Your shop settings have been updated.", {
      type: "success",
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-blue-950 transition-colors">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        <AppMobileHeader />

        <main className="w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Shop Profile &amp; Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your trader profile, display theme, and decision engine settings.
            </p>
          </div>

          {/* User Card */}
          <div className="rounded-[28px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-blue-700 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                {(user?.name?.[0] || "M").toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                  {user?.name || "Mama Chidi"}
                </h2>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 truncate">
                  {user?.businessName || "Mama Chidi Super Provisions"}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user?.marketLocation || (!user || user.id === "user_owner_01" ? "Balogun Market, Lagos" : "Commercial Trading Shop, Nigeria")}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 text-xs font-bold cursor-pointer active:scale-95 transition-all shrink-0"
            >
              Sign Out
            </button>
          </div>

          {/* Theme Display Card */}
          <div className="rounded-[28px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SunMoon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Display Appearance
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Choose Daylight mode or Night Market dark theme
                  </p>
                </div>
              </div>

              <ThemeToggle variant="segmented" />
            </div>
          </div>

          {/* Oga Secret PIN Security Card */}
          <div className="rounded-[28px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Oga Secret PIN Security
                  </h3>
                  <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full ${
                    isPinActive
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                  }`}>
                    {isPinActive ? "PIN Active ✓" : "Default PIN (1234)"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  4-digit security code wey dey lock your profit, turnover, and certified bank statements so apprentice or sales boy no go fit view am.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPinModalError(null);
                setNewPin("");
                setConfirmNewPin("");
                setIsPinModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-black text-xs cursor-pointer active:scale-95 transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              {isPinActive ? "Change Oga PIN" : "Set 4-Digit PIN"}
            </button>
          </div>

          {/* Insight Credits Balance Card */}
          <div className="rounded-[28px] bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-200 dark:border-amber-900/60 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  Prepaid Business Intelligence
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Insight Credits
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Affordable pay-as-you-go financial diagnosis. No compulsory subscription.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openPurchaseModal}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer active:scale-95 transition-all shadow-xs shrink-0"
            >
              Top Up / History
            </button>
          </div>

          {/* MoniePay Plus Subscription & Free Trial Section (Optional) */}
          <SubscriptionBannerCard />

          {/* Referral & Invite Rewards Section */}
          <ReferralDashboardBanner
            onOpenInviteModal={() => setIsInviteOpen(true)}
            businessName={user?.businessName || user?.name || "My Shop"}
            userPhone={user?.phone || ""}
          />

          {/* Engine Settings */}
          <div className="rounded-[28px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Decision Engine Preferences
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <div>
                  <span className="font-black text-slate-900 dark:text-white block">Smart Shorthand Categorization</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Auto-classify “Sold 45k”, “Bought stock 20k”, “Chop money”</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCategorization}
                  onChange={(e) => setAutoCategorization(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <div>
                  <span className="font-black text-slate-900 dark:text-white block">Margin &amp; Leakage Alerts</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Notify when wholesaler prices spike or customer credit is overdue</span>
                </div>
                <input
                  type="checkbox"
                  checked={anomalyDetection}
                  onChange={(e) => setAnomalyDetection(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                {savedSuccess ? "Saved ✓" : "Save Preferences"}
              </button>
            </div>
          </div>
        </main>

        <AppBottomBar />
      </div>

      <InviteShopModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        businessName={user?.businessName || user?.name || "My Shop"}
        ownerName={user?.name || "Shop Owner"}
        userPhone={user?.phone || ""}
      />

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        userName={user?.name || "Trader"}
        businessName={user?.businessName || "Shop"}
        onConfirm={async () => {
          setIsLogoutOpen(false);
          await logout();
        }}
      />
      {/* ── OGA PIN UPDATE MODAL (PIDGIN LOCAL LANGUAGE) ── */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Set Your Oga PIN</h3>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">
                    Anti-Theft Protection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 font-medium leading-relaxed">
              Oga, enter <strong>4 secret numbers</strong> wey only you know. You go dey use am authorize certified turnover statements for banks.
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  New 4-Digit Secret PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="e.g. 1984"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm 4-Digit Secret PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Repeat your PIN"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {pinModalError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                {pinModalError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePin}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-black text-xs shadow-xs"
              >
                Save Oga PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
