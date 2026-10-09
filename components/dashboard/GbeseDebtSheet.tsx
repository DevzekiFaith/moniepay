"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Credit & Debt Book (Gbese Ledger)
// Proactive 4-Day Due Date Alert • 1-Tap Presets • Informal Market Language
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Store,
  Send,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Clock,
  ArrowRight,
  Phone,
  ShieldAlert,
  BellRing,
  Bell,
  Calendar,
  Layers,
  Check,
} from "lucide-react";
import type { Debt } from "@/types/moniepay.types";
import { recordOptimisticTransaction } from "@/lib/offline/offlineQueue";
import { useNotifications } from "@/context/NotificationContext";
import { triggerCashHapticVibration, playCashChime } from "@/lib/alerts/hapticSoundService";

interface GbeseDebtSheetProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  businessName: string;
  businessId: string;
  onDebtSettled?: (debtId: string, amount: number) => void;
  onDebtCreated?: (debt: Debt) => void;
}

export function getDueStatus(dueDateStr?: string) {
  if (!dueDateStr) return { days: null, label: "No due date set", status: "NONE" };
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const due = new Date(dueDateStr);
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const diffTime = dueStart - todayStart;
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { days: Math.abs(days), label: `Overdue by ${Math.abs(days)}d`, status: "OVERDUE" };
  } else if (days === 0) {
    return { days: 0, label: "Due Today!", status: "TODAY" };
  } else if (days <= 4) {
    return { days, label: `Due in ${days}d (4-Day Alert Active 🔔)`, status: "WARNING_4_DAYS" };
  } else {
    return { days, label: `Due in ${days}d`, status: "NORMAL" };
  }
}

export function GbeseDebtSheet({
  isOpen,
  onClose,
  debts,
  businessName,
  businessId,
  onDebtSettled,
  onDebtCreated,
}: GbeseDebtSheetProps) {
  const { sendDebtReminderNotification, toast } = useNotifications();
  const [tab, setTab] = useState<"CUSTOMERS" | "SUPPLIERS">("CUSTOMERS");
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [remindedDebtIds, setRemindedDebtIds] = useState<Record<string, boolean>>({});
  
  // New Debt Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });

  if (!isOpen) return null;

  const customerDebts = debts.filter(
    (d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED"
  );
  const supplierDebts = debts.filter(
    (d) => d.debt_type === "SUPPLIER_OBLIGATION" && d.status !== "SETTLED"
  );

  const totalCustomerDebt = customerDebts.reduce((sum, d) => sum + Number(d.balance_due), 0);
  const totalSupplierDebt = supplierDebts.reduce((sum, d) => sum + Number(d.balance_due), 0);

  // Quick Date Preset Handler
  const handleApplyDatePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setNewDueDate(d.toISOString().split("T")[0]);
  };

  const handleCreateNewDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    const parsedAmount = parseInt(newAmount.replace(/[^0-9]/g, ""), 10) || 0;
    if (parsedAmount <= 0) return;

    const newDebtObj: Debt = {
      id: `debt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      business_id: businessId,
      debt_type: tab === "CUSTOMERS" ? "CUSTOMER_CREDIT" : "SUPPLIER_OBLIGATION",
      person_name: newName,
      phone: newPhone || undefined,
      original_amount: parsedAmount,
      amount_paid: 0,
      balance_due: parsedAmount,
      due_date: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      status: "PENDING",
      notes: newNotes || undefined,
      created_at: new Date().toISOString(),
    };

    // Save to local storage debts list
    try {
      const existing = JSON.parse(localStorage.getItem("moniepay_debts") || "[]");
      const updated = [newDebtObj, ...existing];
      localStorage.setItem("moniepay_debts", JSON.stringify(updated));
    } catch {}

    if (onDebtCreated) {
      onDebtCreated(newDebtObj);
    }

    playCashChime();
    triggerCashHapticVibration("cash");

    toast(
      tab === "CUSTOMERS" ? "Customer Credit Logged 📋" : "Supplier Debt Recorded 📦",
      `${newName}: ₦${parsedAmount.toLocaleString()} due on ${new Date(newDueDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}. 4-day alert set!`,
      { type: "success" }
    );

    setIsAddingNew(false);
    setNewName("");
    setNewPhone("");
    setNewAmount("");
    setNewNotes("");
  };

  const handleScheduleReminder = (debt: Debt) => {
    const dueInfo = getDueStatus(debt.due_date);
    sendDebtReminderNotification({
      personName: debt.person_name,
      amount: Number(debt.balance_due),
      dueDate: debt.due_date ? new Date(debt.due_date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : undefined,
      phone: debt.phone,
      notes: debt.notes,
      debtType: debt.debt_type,
      isOverdue: dueInfo.status === "OVERDUE",
    });

    playCashChime();
    triggerCashHapticVibration("cash");

    setRemindedDebtIds((prev) => ({ ...prev, [debt.id]: true }));
    setTimeout(() => {
      setRemindedDebtIds((prev) => ({ ...prev, [debt.id]: false }));
    }, 3000);
  };

  const handleRemindAllOverdue = () => {
    const targetList = tab === "CUSTOMERS" ? customerDebts : supplierDebts;
    if (targetList.length === 0) return;

    targetList.forEach((d) => {
      const dueInfo = getDueStatus(d.due_date);
      sendDebtReminderNotification({
        personName: d.person_name,
        amount: Number(d.balance_due),
        dueDate: d.due_date ? new Date(d.due_date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : undefined,
        phone: d.phone,
        notes: d.notes,
        debtType: d.debt_type,
        isOverdue: dueInfo.status === "OVERDUE",
      });
    });

    playCashChime();
    triggerCashHapticVibration("cash");

    toast(
      "All 4-Day & Due Alerts Scheduled 🔔",
      `Created alerts for ${targetList.length} ${tab === "CUSTOMERS" ? "customer credit records" : "supplier payments"}.`,
      { type: "success" }
    );
  };

  const handleSendReminder = (debt: Debt) => {
    const phone = (debt.phone || "").replace(/[^0-9]/g, "");
    const dueInfo = getDueStatus(debt.due_date);
    const formattedAmount = `₦${Number(debt.balance_due).toLocaleString()}`;
    const dueDateStr = debt.due_date
      ? new Date(debt.due_date).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          weekday: "short",
        })
      : "soon";

    let messageText = `Good day ${debt.person_name}, hope work dey go well. Abeg kindly remember your balance of ${formattedAmount} with ${businessName} due on ${dueDateStr}. We need am for fresh market restock. Thank you well-well and God bless your hustle!`;

    if (dueInfo.status === "OVERDUE") {
      messageText = `Good day ${debt.person_name}, hope hustle dey go smooth. Gentle reminder say your balance of ${formattedAmount} with ${businessName} don pass the agreed due date (${dueDateStr}). Abeg help us pay so we fit restock goods. Thank you and God bless!`;
    } else if (dueInfo.status === "TODAY") {
      messageText = `Good day ${debt.person_name}! Quick reminder say your balance of ${formattedAmount} with ${businessName} is due today (${dueDateStr}). Thank you well-well and God bless your market!`;
    } else if (dueInfo.status === "WARNING_4_DAYS") {
      messageText = `Good day ${debt.person_name}! Just a friendly heads-up from ${businessName} say your balance of ${formattedAmount} will be due in ${dueInfo.days} days on ${dueDateStr}. Thank you for your custom and God bless!`;
    }

    const msg = encodeURIComponent(messageText);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const handleSettle = (debt: Debt) => {
    setSettlingId(debt.id);

    recordOptimisticTransaction({
      business_id: businessId,
      type: debt.debt_type === "CUSTOMER_CREDIT" ? "DEBT_COLLECTION" : "SUPPLIER_PAYMENT",
      amount: Number(debt.balance_due),
      payment_method: "CASH",
      category: debt.debt_type === "CUSTOMER_CREDIT" ? "Debt Paid" : "Supplier Paid",
      description: `${debt.person_name} settled ₦${Number(debt.balance_due).toLocaleString()}`,
    });

    playCashChime();
    triggerCashHapticVibration("cash");

    setTimeout(() => {
      setSettlingId(null);
      if (onDebtSettled) {
        onDebtSettled(debt.id, Number(debt.balance_due));
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-md">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[92vh] flex flex-col transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Credit &amp; Debt Book (Gbese)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">4-day proactive due alert &amp; WhatsApp reminders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector & Add Button */}
        <div className="mt-3.5 flex items-center gap-2 shrink-0">
          <div className="flex-1 flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-white/10">
            <button
              onClick={() => setTab("CUSTOMERS")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === "CUSTOMERS"
                  ? "bg-amber-500 text-white shadow-sm font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Who Owes Me (₦{totalCustomerDebt.toLocaleString()})
            </button>
            <button
              onClick={() => setTab("SUPPLIERS")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === "SUPPLIERS"
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              What I Owe (₦{totalSupplierDebt.toLocaleString()})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record</span>
          </button>
        </div>

        {/* New Debt Form Drawer */}
        <AnimatePresence>
          {isAddingNew && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateNewDebt}
              className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-2.5 text-xs shrink-0 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-2">
                <span className="font-black text-slate-900 dark:text-white">
                  {tab === "CUSTOMERS" ? "Log New Customer Credit" : "Log New Supplier Obligation"}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  4-Day Alert Auto-Enabled 🔔
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    {tab === "CUSTOMERS" ? "Customer Name" : "Supplier / Wholesaler"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Emeka"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    placeholder="080..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    Items / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 bags rice"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Promised Due Date with 1-Tap Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-500" />
                    Promised Payback Due Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    Quick:
                  </span>
                  {[
                    { label: "+3 Days", days: 3 },
                    { label: "+7 Days (1 Wk)", days: 7 },
                    { label: "+14 Days (2 Wks)", days: 14 },
                    { label: "+30 Days (Month)", days: 30 },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handleApplyDatePreset(preset.days)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-500 transition-colors cursor-pointer shrink-0"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-xs active:scale-98 transition-all"
                >
                  Save to Ledger &amp; Set 4-Day Alert
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Remind All 4-Day Due Banner */}
        {((tab === "CUSTOMERS" && customerDebts.length > 0) ||
          (tab === "SUPPLIERS" && supplierDebts.length > 0)) && (
          <div className="mt-3 flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs font-semibold shrink-0">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Send 4-day &amp; due date reminders to phone?</span>
            </div>
            <button
              onClick={handleRemindAllOverdue}
              className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              Alert All
            </button>
          </div>
        )}

        {/* Debt Cards List */}
        <div className="mt-3 overflow-y-auto space-y-3 flex-1 pr-1">
          {tab === "CUSTOMERS" ? (
            customerDebts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                No active customer debts! All customers have paid.
              </div>
            ) : (
              customerDebts.map((d) => {
                const isReminded = remindedDebtIds[d.id];
                const dueInfo = getDueStatus(d.due_date);

                return (
                  <div
                    key={d.id}
                    className="rounded-[20px] bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{d.person_name}</h4>
                        {d.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.notes}</p>}
                        
                        {/* Due Date & 4-Day Urgency Badge */}
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {d.due_date && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                              Due: {new Date(d.due_date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                            </span>
                          )}

                          {dueInfo.status === "OVERDUE" && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-black text-[10px] border border-rose-200 dark:border-rose-900">
                              🚨 {dueInfo.label}
                            </span>
                          )}

                          {dueInfo.status === "TODAY" && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse">
                              ⏰ Due Today!
                            </span>
                          )}

                          {dueInfo.status === "WARNING_4_DAYS" && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px] border border-amber-300 dark:border-amber-800 animate-pulse flex items-center gap-1">
                              <Bell className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                              <span>{dueInfo.label}</span>
                            </span>
                          )}

                          {dueInfo.status === "NORMAL" && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px]">
                              📅 {dueInfo.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-amber-900 dark:text-amber-300">
                          ₦{Number(d.balance_due).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Original: ₦{Number(d.original_amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                      {/* 1. Schedule In-App & Phone Alert */}
                      <button
                        type="button"
                        onClick={() => handleScheduleReminder(d)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isReminded
                            ? "bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-black scale-95"
                            : "bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-amber-800"
                        }`}
                        title="Set in-app & phone alert reminder for this debt"
                      >
                        <BellRing className={`h-3.5 w-3.5 ${isReminded ? "text-amber-600 dark:text-amber-400 animate-bounce" : "text-amber-600 dark:text-amber-400"}`} />
                        <span className="truncate">{isReminded ? "Alerted 🔔" : "Phone Alert"}</span>
                      </button>

                      {/* 2. Send 1-Tap WhatsApp Nudge */}
                      <button
                        type="button"
                        onClick={() => handleSendReminder(d)}
                        className="py-2 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                      >
                        <Send className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>WhatsApp</span>
                      </button>

                      {/* 3. Mark as Paid */}
                      <button
                        type="button"
                        onClick={() => handleSettle(d)}
                        disabled={settlingId === d.id}
                        className="py-2 px-2 rounded-xl bg-slate-900 dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 dark:text-white" />
                        <span>{settlingId === d.id ? "Paying..." : "Paid"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : supplierDebts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No supplier debts outstanding. You are clean with suppliers!
            </div>
          ) : (
            supplierDebts.map((d) => {
              const isReminded = remindedDebtIds[d.id];
              const dueInfo = getDueStatus(d.due_date);

              return (
                <div
                  key={d.id}
                  className="rounded-[20px] bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{d.person_name}</h4>
                      {d.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.notes}</p>}
                      
                      {/* Supplier Due Date & 4-Day Urgency Badge */}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {d.due_date && (
                          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                            Payment Due: {new Date(d.due_date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                          </span>
                        )}

                        {dueInfo.status === "OVERDUE" && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-black text-[10px] border border-rose-200 dark:border-rose-900">
                            🚨 {dueInfo.label}
                          </span>
                        )}

                        {dueInfo.status === "TODAY" && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse">
                            ⏰ Settle Supplier Today!
                          </span>
                        )}

                        {dueInfo.status === "WARNING_4_DAYS" && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px] border border-amber-300 dark:border-amber-800 animate-pulse flex items-center gap-1">
                            <Bell className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                            <span>{dueInfo.label}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        ₦{Number(d.balance_due).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => handleScheduleReminder(d)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isReminded
                          ? "bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-black scale-95"
                          : "bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-amber-800"
                      }`}
                    >
                      <BellRing className={`h-3.5 w-3.5 ${isReminded ? "text-amber-600 dark:text-amber-400 animate-bounce" : "text-amber-600 dark:text-amber-400"}`} />
                      <span className="truncate">{isReminded ? "Alert Scheduled ⏰" : "4-Day Alert"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSettle(d)}
                      disabled={settlingId === d.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{settlingId === d.id ? "Paying..." : "Record Payment"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
