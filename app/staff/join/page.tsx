"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Staff & Apprentice Join Terminal Page
// Connects an apprentice/cashier phone to shop with 6-digit code or QR
// Zero password or master PIN required • Protected Staff Register Mode
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Smartphone,
  Lock,
} from "lucide-react";
import { pairStaffDeviceWithCode } from "@/lib/staff/staffDeviceService";

function StaffJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prefilledCode = searchParams?.get("code") || "";
  const prefilledShop = searchParams?.get("shop") || "";

  const [shopCode, setShopCode] = useState(prefilledCode);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("Sales Boy / Cashier");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledCode) {
      setShopCode(prefilledCode.toUpperCase());
    }
  }, [prefilledCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!shopCode.trim()) {
      setErrorMsg("Please enter the 6-digit Shop Code from your shop owner.");
      return;
    }
    if (!staffName.trim()) {
      setErrorMsg("Please enter your name (e.g. Emeka).");
      return;
    }

    setIsSubmitting(true);

    try {
      // Detect simple user-agent model e.g. "Android" or "iPhone"
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const deviceModel = ua.includes("iPhone")
        ? "iPhone"
        : ua.includes("Android")
        ? "Android Device"
        : "Mobile Browser";

      const res = pairStaffDeviceWithCode(shopCode, staffName, staffRole, deviceModel);

      if (res.success && res.session) {
        setSuccessMsg(`Connected successfully to ${res.session.businessName}! Opening register…`);
        setTimeout(() => {
          // Force reload to dashboard so AuthContext picks up the new staff session immediately
          window.location.href = "/";
        }, 800);
      } else {
        setErrorMsg(res.error || "Could not connect to this shop. Check the code and try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while connecting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-950/90 border border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-500/20 mb-1">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Join Shop as Staff
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {prefilledShop
              ? `Connect your phone as a cashier/attendant for ${prefilledShop}`
              : "Connect your phone to record sales and issue WhatsApp receipts for your shop."}
          </p>
        </div>

        {/* Anti-Theft Trust Notice */}
        <div className="p-3 rounded-2xl bg-blue-950/50 border border-blue-800/80 text-blue-200 text-xs font-medium flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong>Staff Protection Active:</strong> You do not need any password or master PIN. Once connected, your phone operates as an anti-theft sales register.
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Join Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              6-Digit Shop Code
            </label>
            <input
              type="text"
              value={shopCode}
              onChange={(e) => setShopCode(e.target.value.toUpperCase())}
              placeholder="e.g. SHOP-8492"
              className="w-full h-13 px-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-mono text-lg font-black placeholder:text-slate-600 focus:outline-none focus:border-blue-500 uppercase tracking-wider"
              required
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Ask your shop owner/oga for the 6-digit code shown on their phone.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Your Name (Staff / Apprentice)
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. Emeka, Chinedu, or Fatima"
              className="w-full h-12 px-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              required
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              This name will show as &ldquo;Recorded by&rdquo; on customer receipts.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Your Role in Shop
            </label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
            >
              <option value="Sales Boy / Cashier">Sales Boy / Cashier</option>
              <option value="Shop Apprentice">Shop Apprentice</option>
              <option value="Attendant">Shop Attendant</option>
              <option value="Store Keeper">Store Keeper</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting to Shop…</span>
              </>
            ) : (
              <>
                <span>Connect Staff Device ⚡</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Owner Sign In */}
        <div className="pt-2 text-center border-t border-slate-800">
          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-white font-bold transition-colors"
          >
            Are you the Shop Owner? Sign In with Password →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StaffJoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading…</div>}>
      <StaffJoinContent />
    </Suspense>
  );
}

