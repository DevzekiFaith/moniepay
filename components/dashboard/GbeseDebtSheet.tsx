"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  Clock,
  ArrowRight,
  Phone,
  ShieldAlert,
  BellRing,
  Bell,
} from "lucide-react";
import type { Debt } from "@/types/moniepay.types";
import { recordOptimisticTransaction } from "@/lib/offline/offlineQueue";
import { useNotifications } from "@/context/NotificationContext";

interface GbeseDebtSheetProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  businessName: string;
  businessId: string;
  onDebtSettled?: (debtId: string, amount: number) => void;
}

export function GbeseDebtSheet({
  isOpen,
  onClose,
  debts,
  businessName,
  businessId,
  onDebtSettled,
}: GbeseDebtSheetProps) {
  const { sendDebtReminderNotification, toast } = useNotifications();
  const [tab, setTab] = useState<"CUSTOMERS" | "SUPPLIERS">("CUSTOMERS");
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [remindedDebtIds, setRemindedDebtIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const customerDebts = debts.filter(
    (d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED"
  );
  const supplierDebts = debts.filter(
    (d) => d.debt_type === "SUPPLIER_OBLIGATION" && d.status !== "SETTLED"
  );

  const totalCustomerDebt = customerDebts.reduce((sum, d) => sum + Number(d.balance_due), 0);
  const totalSupplierDebt = supplierDebts.reduce((sum, d) => sum + Number(d.balance_due), 0);

  const handleScheduleReminder = (debt: Debt) => {
    sendDebtReminderNotification({
      personName: debt.person_name,
      amount: Number(debt.balance_due),
      dueDate: debt.due_date ? new Date(debt.due_date).toLocaleDateString() : undefined,
      phone: debt.phone,
      notes: debt.notes,
      debtType: debt.debt_type,
      isOverdue: debt.status === "OVERDUE" || (debt.due_date ? new Date(debt.due_date) < new Date() : false),
    });

    setRemindedDebtIds((prev) => ({ ...prev, [debt.id]: true }));
    setTimeout(() => {
      setRemindedDebtIds((prev) => ({ ...prev, [debt.id]: false }));
    }, 3000);
  };

  const handleRemindAllOverdue = () => {
    const targetList = tab === "CUSTOMERS" ? customerDebts : supplierDebts;
    if (targetList.length === 0) return;

    targetList.forEach((d) => {
      sendDebtReminderNotification({
        personName: d.person_name,
        amount: Number(d.balance_due),
        dueDate: d.due_date ? new Date(d.due_date).toLocaleDateString() : undefined,
        phone: d.phone,
        notes: d.notes,
        debtType: d.debt_type,
        isOverdue: d.status === "OVERDUE" || (d.due_date ? new Date(d.due_date) < new Date() : false),
      });
    });

    toast(
      "All Debt Reminders Scheduled 🔔",
      `Created alerts for ${targetList.length} ${tab === "CUSTOMERS" ? "customer debts" : "supplier payments"}.`,
      { type: "success" }
    );
  };

  const handleSendReminder = (debt: Debt) => {
    const phone = (debt.phone || "").replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Good day ${debt.person_name}, hope work dey go well. Abeg kindly remember your balance of ₦${Number(
        debt.balance_due
      ).toLocaleString()} with ${businessName}. We need am for fresh market restock today. Thank you and God bless your hustle!`
    );
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
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Credit &amp; Debt Book</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track who owes you and who you owe</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-3.5 flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-white/10 shrink-0">
          <button
            onClick={() => setTab("CUSTOMERS")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === "CUSTOMERS"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Who Owes Me (₦{totalCustomerDebt.toLocaleString()})
          </button>
          <button
            onClick={() => setTab("SUPPLIERS")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === "SUPPLIERS"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            What I Owe (₦{totalSupplierDebt.toLocaleString()})
          </button>
        </div>

        {/* Remind All Banner */}
        {((tab === "CUSTOMERS" && customerDebts.length > 0) ||
          (tab === "SUPPLIERS" && supplierDebts.length > 0)) && (
          <div className="mt-3 flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs font-semibold shrink-0">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Send push &amp; in-app reminder for all due debts?</span>
            </div>
            <button
              onClick={handleRemindAllOverdue}
              className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              Alert All
            </button>
          </div>
        )}

        {/* List */}
        <div className="mt-3 overflow-y-auto space-y-3 flex-1 pr-1">
          {tab === "CUSTOMERS" ? (
            customerDebts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                No active customer debts! All customers have paid.
              </div>
            ) : (
              customerDebts.map((d) => {
                const isReminded = remindedDebtIds[d.id];
                return (
                  <div
                    key={d.id}
                    className="rounded-[20px] bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{d.person_name}</h4>
                        {d.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.notes}</p>}
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          {d.due_date && (
                            <span
                              className={
                                new Date(d.due_date) < new Date()
                                  ? "text-rose-600 dark:text-rose-400 font-bold"
                                  : "text-slate-500 dark:text-slate-400"
                              }
                            >
                              Due: {new Date(d.due_date).toLocaleDateString()}
                            </span>
                          )}
                          {d.status === "OVERDUE" && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                              Overdue
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
                      {/* 1. Schedule In-App & Push Reminder Notification */}
                      <button
                        type="button"
                        onClick={() => handleScheduleReminder(d)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isReminded
                            ? "bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-black scale-95"
                            : "bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-amber-800"
                        }`}
                        title="Set in-app reminder alert for this debt"
                      >
                        <BellRing className={`h-3.5 w-3.5 ${isReminded ? "text-amber-600 dark:text-amber-400 animate-bounce" : "text-amber-600 dark:text-amber-400"}`} />
                        <span className="truncate">{isReminded ? "Alerted 🔔" : "Remind Me"}</span>
                      </button>

                      {/* 2. Send WhatsApp Nudge */}
                      <button
                        type="button"
                        onClick={() => handleSendReminder(d)}
                        className="py-2 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>WhatsApp</span>
                      </button>

                      {/* 3. Mark as Paid */}
                      <button
                        type="button"
                        onClick={() => handleSettle(d)}
                        disabled={settlingId === d.id}
                        className="py-2 px-2 rounded-xl bg-slate-900 dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
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
              return (
                <div
                  key={d.id}
                  className="rounded-[20px] bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{d.person_name}</h4>
                      {d.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.notes}</p>}
                      {d.due_date && (
                        <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mt-1 block">
                          Payment Promised: {new Date(d.due_date).toLocaleDateString()}
                        </span>
                      )}
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
                      <span className="truncate">{isReminded ? "Alert Scheduled ⏰" : "Remind Me When Due"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSettle(d)}
                      disabled={settlingId === d.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
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
