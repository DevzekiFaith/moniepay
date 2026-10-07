"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Logout Transition Screen
// Clean Session Termination • Daylight Theme
// ─────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      logout();
    }, 600);
    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xl text-center flex flex-col items-center gap-4"
      >
        <MoniePayMark size={42} />

        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Signing Out of MoniePay…
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Securing your local shop records.
          </p>
        </div>

        <Loader2 className="h-6 w-6 text-blue-600 dark:text-sky-400 animate-spin" />
      </motion.div>
    </div>
  );
}
