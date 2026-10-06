"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Package,
  Users,
  Wallet,
  Mic,
  MicOff,
  ClipboardPaste,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Banknote,
  CreditCard,
  Building2,
} from "lucide-react";
import type {
  TransactionType,
  PaymentMethod,
  BusinessAccount,
  BusinessTransaction,
} from "@/types/moniepay.types";
import { recordOptimisticTransaction } from "@/lib/offline/offlineQueue";

interface InstantRecordSheetProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BusinessAccount[];
  businessId: string;
  initialType?: TransactionType;
  onSuccess?: (tx: BusinessTransaction) => void;
}

export function InstantRecordSheet({
  isOpen,
  onClose,
  accounts,
  businessId,
  initialType = "SALE",
  onSuccess,
}: InstantRecordSheetProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("General");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [debtorName, setDebtorName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justRecorded, setJustRecorded] = useState<string | null>(null);

  // Natural Language & Voice
  const [isListening, setIsListening] = useState(false);
  const [showPasteAlert, setShowPasteAlert] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialType) setType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => amountInputRef.current?.focus(), 150);
      if (accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [isOpen, accounts, selectedAccountId]);

  // Set default category and payment method based on transaction type
  useEffect(() => {
    if (type === "SALE") {
      setCategory("Goods Sold");
      if (paymentMethod === "CREDIT") setPaymentMethod("CASH");
    } else if (type === "EXPENSE") {
      setCategory("Shop Gen Fuel");
      setPaymentMethod("CASH");
    } else if (type === "STOCK_PURCHASE") {
      setCategory("Restock Goods");
      setPaymentMethod("TRANSFER");
    } else if (type === "OWNER_WITHDRAWAL") {
      setCategory("Owner Chop Money");
      setPaymentMethod("CASH");
    } else if (type === "STAFF_PAYMENT") {
      setCategory("Staff Wage");
      setPaymentMethod("CASH");
    }
  }, [type]);

  // Web Speech API Voice Recognition
  const toggleVoice = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type directly.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-NG";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        parseNaturalLanguage(transcript);
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const parseNaturalLanguage = (text: string) => {
    const lower = text.toLowerCase();

    // 1. Amount Extraction
    let extractedAmount = "";
    const kMatch = lower.match(/(?:₦\s*|ngn\s*)?(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      extractedAmount = String(Math.round(parseFloat(kMatch[1]) * 1000));
    } else {
      const numMatch = lower.match(/(?:₦\s*|ngn\s*)?(\d{1,3}(?:,\d{3})*|\d+)/i);
      if (numMatch) {
        extractedAmount = numMatch[1].replace(/,/g, "");
      }
    }

    if (extractedAmount) setAmount(extractedAmount);

    // 2. Type Extraction
    if (lower.includes("sold") || lower.includes("sale") || lower.includes("customer pay")) {
      setType("SALE");
    } else if (
      lower.includes("fuel") ||
      lower.includes("expense") ||
      lower.includes("rent") ||
      lower.includes("transport") ||
      lower.includes("light bill")
    ) {
      setType("EXPENSE");
      if (lower.includes("fuel")) setCategory("Generator Fuel");
    } else if (lower.includes("restock") || lower.includes("bought") || lower.includes("carton")) {
      setType("STOCK_PURCHASE");
      setCategory("Restock Goods");
    } else if (lower.includes("chop money") || lower.includes("withdraw") || lower.includes("feeding")) {
      setType("OWNER_WITHDRAWAL");
      setCategory("Owner Chop Money");
    } else if (lower.includes("credit") || lower.includes("gbese") || lower.includes("owe")) {
      setType("SALE");
      setPaymentMethod("CREDIT");
    }

    if (lower.includes("cash")) setPaymentMethod("CASH");
    else if (lower.includes("transfer")) setPaymentMethod("TRANSFER");
    else if (lower.includes("pos") || lower.includes("card")) setPaymentMethod("POS");
    else if (lower.includes("credit") || lower.includes("owe")) setPaymentMethod("CREDIT");

    setDescription(text);
  };

  const parseBankAlert = (text: string) => {
    const amountMatch = text.match(/(?:Amt|Amount|NGN|₦|CR|DR)[:\s]*([0-9,]+\.[0-9]{2}|[0-9,]+)/i);
    const isCredit = /credit|credited|cr|received/i.test(text);
    const isDebit = /debit|debited|dr|paid|purchase/i.test(text);

    if (amountMatch) {
      const cleanAmount = amountMatch[1].replace(/,/g, "").split(".")[0];
      setAmount(cleanAmount);
    }

    if (isCredit) {
      setType("SALE");
      setPaymentMethod("TRANSFER");
      setCategory("Bank / POS Payment");
      setDescription("Bank transfer alert received");
    } else if (isDebit) {
      setType("EXPENSE");
      setPaymentMethod("TRANSFER");
      setCategory("Supplier / Business Transfer");
      setDescription("Bank transfer debit");
    }

    setShowPasteAlert(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }

    const txDesc =
      paymentMethod === "CREDIT"
        ? debtorName.trim() || description.trim() || "Credit Customer"
        : description.trim() || category;

    const newTx = recordOptimisticTransaction({
      business_id: businessId,
      account_id: selectedAccountId || undefined,
      type,
      amount: numAmount,
      payment_method: paymentMethod,
      category,
      description: txDesc,
    });

    const label =
      type === "SALE"
        ? "Sale recorded ✓"
        : type === "EXPENSE"
        ? "Expense recorded ✓"
        : type === "STOCK_PURCHASE"
        ? "Restock recorded ✓"
        : type === "OWNER_WITHDRAWAL"
        ? "Chop money recorded ✓"
        : "Recorded ✓";

    setJustRecorded(label);
    if (onSuccess) onSuccess(newTx);

    setTimeout(() => {
      setJustRecorded(null);
      setAmount("");
      setDescription("");
      setDebtorName("");
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white border border-slate-200 p-5 sm:p-6 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-slate-900">Record Business Activity</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Instant Sync
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1-Tap Category Tabs */}
        <div className="mt-4 grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setType("SALE")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              type === "SALE"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plus className="h-4 w-4 mb-0.5 stroke-[2.5]" />
            <span>Sale</span>
          </button>

          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              type === "EXPENSE"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Minus className="h-4 w-4 mb-0.5 stroke-[2.5]" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => setType("STOCK_PURCHASE")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              type === "STOCK_PURCHASE"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="h-4 w-4 mb-0.5 stroke-[2.5]" />
            <span>Stock</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType("SALE");
              setPaymentMethod("CREDIT");
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              type === "SALE" && paymentMethod === "CREDIT"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4 mb-0.5 stroke-[2.5]" />
            <span>Credit</span>
          </button>

          <button
            type="button"
            onClick={() => setType("OWNER_WITHDRAWAL")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
              type === "OWNER_WITHDRAWAL"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Wallet className="h-4 w-4 mb-0.5 stroke-[2.5]" />
            <span>Chop</span>
          </button>
        </div>

        {/* Natural Voice & Paste Triggers */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              isListening
                ? "border-red-500 bg-red-50 text-red-700 animate-pulse"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-emerald-600" />}
            <span>{isListening ? "Listening... speak now" : "Voice / Pidgin"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPasteAlert(!showPasteAlert)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100"
          >
            <ClipboardPaste className="h-4 w-4 text-blue-600" />
            <span>Paste Bank SMS</span>
          </button>
        </div>

        {/* Bank Alert Paste Drawer */}
        {showPasteAlert && (
          <div className="mt-2.5 p-3 rounded-2xl border border-blue-200 bg-blue-50/70">
            <span className="text-[11px] text-blue-900 font-bold block mb-1">
              Paste SMS or WhatsApp bank alert
            </span>
            <textarea
              rows={2}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="e.g. Acct: 1029*** Amt: NGN 35,000.00 CR Desc: TRF FROM..."
              className="w-full rounded-xl bg-white border border-blue-200 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
            <button
              type="button"
              onClick={() => parseBankAlert(pastedText)}
              className="mt-1.5 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
            >
              Extract & Fill
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Amount (₦)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-black text-slate-400">₦</span>
              <input
                ref={amountInputRef}
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-3.5 pl-10 pr-4 text-3xl font-black text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-600 focus:bg-white shadow-inner"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["CASH", "TRANSFER", "POS", "CREDIT"] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === method
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {method === "CASH" && "Cash"}
                  {method === "TRANSFER" && "Transfer"}
                  {method === "POS" && "POS"}
                  {method === "CREDIT" && "Credit"}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "CREDIT" && (
            <div>
              <label className="block text-xs font-bold text-amber-800 mb-1">
                Customer Name (Who owes this?)
              </label>
              <input
                type="text"
                value={debtorName}
                onChange={(e) => setDebtorName(e.target.value)}
                placeholder="e.g. Bro Segun (Tailor) or Mama Ngozi"
                className="w-full rounded-xl bg-amber-50/50 border border-amber-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm"
                required
              />
            </div>
          )}

          {/* Description & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                {type === "SALE" && (
                  <>
                    <option value="Provisions & Groceries">Provisions & Groceries</option>
                    <option value="Drinks & Beverages">Drinks & Beverages</option>
                    <option value="Frozen Foods">Frozen Foods</option>
                    <option value="General Goods">General Goods</option>
                  </>
                )}
                {type === "EXPENSE" && (
                  <>
                    <option value="Generator Fuel">Generator Fuel</option>
                    <option value="Shop Rent & Levy">Shop Rent & Levy</option>
                    <option value="Transport & Logistics">Transport & Logistics</option>
                    <option value="Security & Waste">Security & Waste</option>
                  </>
                )}
                {type === "STOCK_PURCHASE" && (
                  <>
                    <option value="Restock Goods">Restock Goods</option>
                    <option value="Packaging & Bags">Packaging & Bags</option>
                    <option value="Supplier Settlement">Supplier Settlement</option>
                  </>
                )}
                {type === "OWNER_WITHDRAWAL" && (
                  <>
                    <option value="Owner Chop Money">Owner Chop Money</option>
                    <option value="Family Feeding">Family Feeding</option>
                    <option value="Personal Emergency">Personal Emergency</option>
                  </>
                )}
                {type === "STAFF_PAYMENT" && (
                  <>
                    <option value="Staff Wage">Shop Assistant Wage</option>
                    <option value="Apprentice Allowance">Apprentice Allowance</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Note / Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 3 cartons Indomie"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !!justRecorded}
              className={`w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                justRecorded
                  ? "bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/30"
                  : type === "SALE"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                  : type === "EXPENSE"
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
                  : type === "OWNER_WITHDRAWAL"
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
              }`}
            >
              {justRecorded ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{justRecorded}</span>
                </>
              ) : (
                <>
                  <span>
                    Record{" "}
                    {type === "SALE"
                      ? "Sale"
                      : type === "EXPENSE"
                      ? "Expense"
                      : type === "STOCK_PURCHASE"
                      ? "Stock"
                      : type === "OWNER_WITHDRAWAL"
                      ? "Chop Money"
                      : "Activity"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
