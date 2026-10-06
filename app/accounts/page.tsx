"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Cash & Accounts Management
// Daylight Fluid Architecture • Single Green Market Theme
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { formatNaira } from "@/lib/utils";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeTransactions, dispatchRealtimeUpdate } from "@/hooks/useRealtimeTransactions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Trash2,
  AlertCircle,
  ExternalLink,
  X,
  Wallet,
  Coins,
  Store,
} from "lucide-react";
import Link from "next/link";

interface Account {
  id: string;
  name: string;
  accountType: string;
  currency: string;
  currentBalance: number;
  availableBalance?: number | null;
  syncStatus: string;
  isPrimary: boolean;
  mask?: string | null;
  lastSyncedAt?: string | Date | null;
}

export default function AccountsPage() {
  const { user } = useAuth();
  const { notify, error } = useNotification();

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "acc_cash_drawer",
      name: "Shop Physical Cash Drawer",
      accountType: "CASH",
      currency: "NGN",
      currentBalance: 120000,
      isPrimary: true,
      syncStatus: "ACTIVE",
    },
    {
      id: "acc_opay_pos",
      name: "OPay Merchant POS",
      accountType: "POS",
      currency: "NGN",
      currentBalance: 65000,
      isPrimary: false,
      syncStatus: "ACTIVE",
    },
    {
      id: "acc_gtb_bank",
      name: "GTBank Business Account",
      accountType: "BANK",
      currency: "NGN",
      currentBalance: 145000,
      isPrimary: false,
      syncStatus: "ACTIVE",
      mask: "9042",
    },
  ]);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<"CASH" | "POS" | "BANK">("POS");
  const [newAccBalance, setNewAccBalance] = useState("");

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    const parsedBal = parseFloat(newAccBalance.replace(/,/g, "")) || 0;
    const newAcc: Account = {
      id: `acc_${Date.now()}`,
      name: newAccName.trim(),
      accountType: newAccType,
      currency: "NGN",
      currentBalance: parsedBal,
      isPrimary: false,
      syncStatus: "ACTIVE",
    };

    setAccounts((prev) => [...prev, newAcc]);
    notify("Account Added", `${newAcc.name} added to your active money pool.`, { type: "success" });
    setIsConnectModalOpen(false);
    setNewAccName("");
    setNewAccBalance("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/20">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
        <AppMobileHeader />

        <main className="w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Cash Drawer &amp; Bank Accounts
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Track physical cash drawer, POS terminals, and bank balances.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Account</span>
            </button>
          </div>

          {/* Total Liquid Cash Banner */}
          <div className="rounded-[26px] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-5 text-white shadow-md space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200">
              Total Available Money Pool
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              ₦{totalBalance.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              Combined cash drawer, POS settlements &amp; bank balances.
            </p>
          </div>

          {/* Accounts List */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
              Active Accounts ({accounts.length})
            </h2>

            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="rounded-[22px] bg-white border border-emerald-900/10 p-4 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-500 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0">
                    {acc.accountType === "CASH" ? (
                      <Coins className="h-5 w-5" />
                    ) : acc.accountType === "POS" ? (
                      <Wallet className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {acc.name}
                      </h3>
                      {acc.isPrimary && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {acc.accountType} {acc.mask ? `•••• ${acc.mask}` : ""}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-slate-900 block">
                    ₦{acc.currentBalance.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">Active</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <AppBottomBar />
      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[28px] bg-white border border-emerald-900/10 p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Add New Money Account</h3>
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-3 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Account / Drawer Name</label>
                  <input
                    type="text"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="e.g. Moniepoint POS, Shop Cash Box"
                    required
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="POS">POS Terminal / Wallet (OPay, Moniepoint, PalmPay)</option>
                    <option value="CASH">Physical Cash Drawer</option>
                    <option value="BANK">Bank Account (GTBank, Access, Zenith)</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Current Balance (₦)</label>
                  <input
                    type="text"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    placeholder="e.g. 50,000"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm cursor-pointer active:scale-95 transition-all shadow-md shadow-emerald-900/20 mt-2"
                >
                  Save Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
