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
} from "lucide-react";
import { SubscriptionBannerCard } from "@/components/dashboard/SubscriptionBannerCard";

export default function ProfilePage() {
  const { notify } = useNotification();
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Settings
  const [currency, setCurrency] = useState("NGN (₦)");
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [autoCategorization, setAutoCategorization] = useState(true);
  const [notifyTransactions, setNotifyTransactions] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
                  <span className="truncate">{user?.marketLocation || "Balogun Market, Lagos"}</span>
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

          {/* MoniePay Plus Subscription & Free Trial Section */}
          <SubscriptionBannerCard />

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
    </div>
  );
}
