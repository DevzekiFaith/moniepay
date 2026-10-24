import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Zap,
  Mic,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Clock,
  QrCode,
  ArrowDownLeft,
  Building2,
  Copy,
  Users,
  Gift,
  Share2,
  Check,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from "lucide-react";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { generateUserReferralCode } from "@/lib/referral/referralStore";
import { getCachedDebts } from "@/lib/offline/offlineQueue";

interface WelcomeIntroScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface SlideData {
  id: string;
  badge: string;
  badgeColor: string;
  badgeIcon: React.ReactNode;
  title: string;
  highlight: string;
  highlightColor?: string;
  description: string;
  icon: React.ReactNode;
  themeColor: string;
  gradient: string;
  visualElement: React.ReactNode;
}

export function WelcomeIntroScreen({ onComplete, onSkip }: WelcomeIntroScreenProps) {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic user-derived identity
  const traderName = user?.name?.trim() || "Shop Trader";
  const businessName =
    user?.businessName?.trim() ||
    (user?.name ? `${user.name}'s Provisions` : "My Business Store");

  // Dynamic virtual account
  const bankName = "Providus Bank";
  const accountNumber = user?.id
    ? `99${user.id.replace(/\D/g, "").slice(-8).padStart(8, "20192381")}`
    : "9920192381";
  const accountTag = user?.businessName
    ? `MoniePay / ${user.businessName}`
    : (user?.name ? `MoniePay / ${user.name}` : "MoniePay Virtual Account");

  // Dynamic referral code
  const referralCode = generateUserReferralCode(
    user?.businessName,
    user?.phone || user?.email
  );

  // Dynamic customer debt simulation
  const [debtSample, setDebtSample] = useState<{
    customerName: string;
    amountFormatted: string;
    daysText: string;
  }>({
    customerName: "Chukwuma O.",
    amountFormatted: "₦25,000",
    daysText: "3 days",
  });

  // Interactive micro-states
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [accountCopied, setAccountCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  // Safe timeout & unmount tracking to prevent memory leaks
  const isMounted = useRef(true);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const safeSetTimeout = (fn: () => void, delayMs: number) => {
    const id = setTimeout(() => {
      if (isMounted.current) fn();
    }, delayMs);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  // Populate realistic debt sample from real cached merchant records if available
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = getCachedDebts(user?.id);
      const activeDebts = cached.filter(
        (d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED" && d.balance_due > 0
      );
      if (activeDebts.length > 0) {
        const top = [...activeDebts].sort((a, b) => b.balance_due - a.balance_due)[0];
        setDebtSample({
          customerName: top.person_name || "Customer Account",
          amountFormatted: `₦${top.balance_due.toLocaleString()}`,
          daysText: "Pending debt",
        });
      }
    } catch {}
  }, [user?.id]);

  // Voice recording simulation samples
  const voiceSamples = [
    {
      input: '"I sell 2 carton Indomie ₦18,000"',
      status: "Voice understood ⚡",
      type: "Recorded as Sale",
      amount: "+₦18,000",
      isSale: true,
    },
    {
      input: '"Sold 3 bags of rice for ₦90,000 cash"',
      status: "Voice understood ⚡",
      type: "Recorded as Sale",
      amount: "+₦90,000",
      isSale: true,
    },
    {
      input: '"Customer pay ₦35,000 transfer"',
      status: "Instant record ⚡",
      type: "Recorded as Sale",
      amount: "+₦35,000",
      isSale: true,
    },
    {
      input: '"Bought diesel for generator ₦6,000"',
      status: "Expense tracked ⛽",
      type: "Recorded as Expense",
      amount: "-₦6,000",
      isSale: false,
    },
  ];

  const currentVoice = voiceSamples[voiceIndex];

  const handleNextVoice = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVoiceIndex((prev) => (prev + 1) % voiceSamples.length);
  };

  const handleCopyAccount = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
    }
    setAccountCopied(true);
    safeSetTimeout(() => setAccountCopied(false), 2200);
  };

  const handleCopyReferral = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
    }
    setReferralCopied(true);
    safeSetTimeout(() => setReferralCopied(false), 2200);
  };

  const handleSendReminderPing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReminderSent(true);
    safeSetTimeout(() => setReminderSent(false), 3000);
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("moniepay_seen_intro", "true");
      } catch {}
    }
    onComplete();
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("moniepay_seen_intro", "true");
      } catch {}
    }
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const slides: SlideData[] = [
    {
      id: "welcome",
      badge: "Welcome to MoniePay 🇳🇬",
      badgeColor: "bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      badgeIcon: <Store className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
      title: "Your Sharp-Sharp",
      highlight: "Shop Intelligence Partner",
      highlightColor: "text-[#1d4ed8] dark:text-blue-400",
      description:
        "Understand your money, no be just to record am. Track your true daily profit, protect drawer cash, and run your shop with confidence.",
      icon: <Store className="h-7 w-7 text-blue-600 dark:text-blue-400" />,
      themeColor: "#1d4ed8",
      gradient: "from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb]",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Pulsing Concentric Ripple Rings */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.1, 0.35] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-44 w-44 sm:h-52 sm:w-52 rounded-full border-2 border-blue-400/40 bg-blue-100/20 dark:bg-blue-900/20"
          />
          <motion.div
            animate={{ scale: [1, 1.45, 1], opacity: [0.25, 0.05, 0.25] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute h-56 w-56 sm:h-64 sm:w-64 rounded-full border border-sky-400/30"
          />

          {/* Central 3D Storefront Card */}
          <motion.div
            initial={{ scale: 0.8, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 p-5 rounded-[28px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_16px_40px_rgba(29,78,216,0.18)] dark:shadow-2xl flex flex-col items-center text-center space-y-2 max-w-[260px]"
          >
            <div className="h-16 w-16 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-md">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div className="w-full">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                {user?.businessName || "MoniePay Trader OS"}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1 justify-center mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Offline Ready
              </p>
            </div>
          </motion.div>

          {/* Floating Pill Left: Daily Profit */}
          <motion.div
            animate={{ y: [-4, 6, -4], rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 sm:left-2 top-4 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-emerald-200 dark:border-emerald-800 shadow-md flex items-center gap-1.5"
          >
            <div className="h-6 w-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Today Profit</p>
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">+₦35,400</p>
            </div>
          </motion.div>

          {/* Floating Pill Right: 7-Day Free Trial */}
          <motion.div
            animate={{ y: [6, -5, 6], rotate: [2, -2, 2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -right-2 sm:right-2 bottom-4 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-blue-200 dark:border-blue-800 shadow-md flex items-center gap-1.5"
          >
            <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Free Test-Run</p>
              <p className="text-xs font-black text-blue-800 dark:text-blue-300">7 Days Free</p>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "recording",
      badge: "Fast Record • 2 Seconds 🎙️",
      badgeColor: "bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      badgeIcon: <Mic className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
      title: "Talk Am or Type Am",
      highlight: "Sharp-Sharp Recording",
      highlightColor: "text-amber-600 dark:text-amber-400",
      description:
        "No stopping your market flow. Press mic or type fast: 'Sold 3 bags of rice for ₦90k' — MoniePay updates your cash drawer instantly.",
      icon: <Zap className="h-7 w-7 text-amber-600 dark:text-amber-400" />,
      themeColor: "#d97706",
      gradient: "from-amber-700 via-amber-600 to-yellow-500",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Animated Audio Frequency Waves */}
          <div className="absolute inset-x-8 top-6 flex items-center justify-center gap-1.5 z-0 opacity-60">
            {[16, 28, 44, 24, 52, 36, 60, 40, 20, 48, 30, 18].map((height, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [height * 0.4, height * 1.1, height * 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
                className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 to-blue-500"
                style={{ height }}
              />
            ))}
          </div>

          {/* Central Voice & Ledger Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-64 p-4 rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_16px_40px_rgba(217,119,6,0.18)] dark:shadow-2xl space-y-3 cursor-pointer select-none"
            onClick={handleNextVoice}
            title="Click to try another recording sample"
          >
            {/* Sim Voice Input Bar */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800 transition-all hover:bg-amber-100/80 dark:hover:bg-amber-900/60">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0"
              >
                <Mic className="h-4 w-4" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-black text-amber-950 dark:text-amber-100 truncate">
                  {currentVoice.input}
                </p>
                <p className="text-[9.5px] font-bold text-amber-700 dark:text-amber-300">
                  {currentVoice.status} • Tap to switch
                </p>
              </div>
            </div>

            {/* Instant Receipt Generated Tag */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`h-3.5 w-3.5 ${currentVoice.isSale ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`} />
                <span className="text-[10.5px] font-black text-slate-800 dark:text-slate-100">{currentVoice.type}</span>
              </div>
              <span className={`text-[11px] font-black ${currentVoice.isSale ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                {currentVoice.amount}
              </span>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "wallet",
      badge: "Auto-Record Payments • QR & Transfer ⚡",
      badgeColor: "bg-cyan-50 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
      badgeIcon: <Wallet className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />,
      title: "Direct Shop Wallet",
      highlight: "Auto-Records Every Transfer",
      highlightColor: "text-cyan-600 dark:text-cyan-400",
      description:
        "Customer transfer or scan QR, MoniePay go record the sale sharp-sharp—zero typing!",
      icon: <Wallet className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />,
      themeColor: "#0891b2",
      gradient: "from-cyan-800 via-cyan-600 to-blue-500",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Animated Scanning Wave Ripples */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.08, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-44 w-44 sm:h-52 sm:w-52 rounded-full border-2 border-cyan-400/40 bg-cyan-100/20 dark:bg-cyan-900/20"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.03, 0.2] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute h-56 w-56 sm:h-64 sm:w-64 rounded-full border border-teal-400/30"
          />

          {/* Floating QR Pill Left with Laser Scanning Animation */}
          <motion.div
            animate={{ y: [-4, 5, -4], rotate: [-2, 2, -2] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 sm:left-1 top-2 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-cyan-200 dark:border-cyan-800 shadow-lg flex items-center gap-2"
          >
            <div className="relative h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center overflow-hidden">
              <QrCode className="h-4 w-4" />
              {/* Scan laser sweep */}
              <motion.div
                animate={{ y: [-14, 14, -14] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-0.5 bg-cyan-500 shadow-[0_0_6px_#06b6d4]"
              />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Shop QR Code</p>
              <p className="text-[11px] font-black text-cyan-800 dark:text-cyan-300">Scan to Pay</p>
            </div>
          </motion.div>

          {/* Floating Pill Right: Available Wallet Balance */}
          <motion.div
            animate={{ y: [5, -5, 5], rotate: [2, -2, 2] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute -right-2 sm:right-1 bottom-1 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-emerald-200 dark:border-emerald-800 shadow-lg flex items-center gap-1.5"
          >
            <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Wallet Balance</p>
              </div>
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">₦125,000</p>
            </div>
          </motion.div>

          {/* Central 3D Payment Detection Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-[270px] sm:w-72 p-3.5 rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_16px_40px_rgba(8,145,178,0.18)] dark:shadow-2xl space-y-2.5"
          >
            {/* Merchant Dedicated Virtual Account Bar (Dynamic & Clickable to Copy) */}
            <div
              onClick={handleCopyAccount}
              className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 cursor-pointer hover:border-cyan-400/80 transition-all select-none group"
              title="Click to copy account number"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-900 dark:text-white truncate">
                    {bankName} • {accountNumber}
                  </p>
                  <p className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 truncate">
                    {accountTag}
                  </p>
                </div>
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black shrink-0 transition-all ${
                accountCopied
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 group-hover:bg-cyan-200"
              }`}>
                {accountCopied ? "Copied! ✓" : "Active"}
              </span>
            </div>

            {/* Live Incoming Transfer Alert (Simulated Real-time webhook) */}
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 380, damping: 24 }}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/80 dark:to-teal-950/80 border border-emerald-300/80 dark:border-emerald-700/80 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-black text-emerald-950 dark:text-emerald-100 truncate">
                      +₦20,000 Transfer In
                    </p>
                    <p className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                      From: Verified Customer (Bank App)
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 shrink-0">+₦20,000</span>
              </div>
            </motion.div>

            {/* Auto-Record Ledger Status Chip */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[9.5px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                Auto-saved in Sales Ledger
              </span>
              <span className="text-[9px] font-black text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-200/80 dark:border-cyan-800">
                0 Manual Clicks
              </span>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "gbese",
      badge: "Zero Wahala Recovery 💬",
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      badgeIcon: <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
      title: "Collect Your Money",
      highlight: "Without Fight or Quarrel",
      highlightColor: "text-emerald-600 dark:text-emerald-400",
      description:
        "Customer dey owe you? Send polite 1-tap WhatsApp payment reminders with receipt details. Recover cash directly into your shop account.",
      icon: <MessageSquare className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />,
      themeColor: "#059669",
      gradient: "from-emerald-800 via-emerald-600 to-teal-500",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Simulated WhatsApp Chat Bubble */}
          <motion.div
            initial={{ scale: 0.85, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="relative z-10 w-72 p-3.5 rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_16px_40px_rgba(5,150,105,0.18)] dark:shadow-2xl space-y-2.5"
          >
            {/* WhatsApp Header Mock */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                  WA
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                    {debtSample.customerName}
                  </p>
                  <p className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-300 truncate">
                    Owing {debtSample.amountFormatted} ({debtSample.daysText})
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black shrink-0">
                Gbese Sheet
              </span>
            </div>

            {/* Simulated Message Bubble (Dynamically references the merchant's business name) */}
            <div className="p-2.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-[10.5px] leading-relaxed font-medium">
              Good day! Friendly reminder from <strong className="font-black text-emerald-900 dark:text-emerald-200">{businessName}</strong> on your balance of <span className="font-black text-emerald-900 dark:text-emerald-200 underline decoration-emerald-400/50">{debtSample.amountFormatted}</span> for the goods. Thank you for your patronage! 🙏
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                1-Tap WhatsApp Ping
              </span>
              <button
                type="button"
                onClick={handleSendReminderPing}
                className={`text-[10.5px] font-black border px-2.5 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  reminderSent
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950 border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                }`}
              >
                {reminderSent ? (
                  <>
                    <Check className="h-3 w-3" />
                    Sent! 🚀
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3" />
                    Send Ping
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "pulse",
      badge: "Real Shop Intelligence 📈",
      badgeColor: "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      badgeIcon: <TrendingUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />,
      title: "Know Wetin to Do Next",
      highlight: "Daily Pulse & Decisions",
      highlightColor: "text-indigo-600 dark:text-indigo-400",
      description:
        "Know your safe personal chop money withdrawal, real net profit, and wholesale stock price alerts so you never lose market capital.",
      icon: <TrendingUp className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />,
      themeColor: "#4338ca",
      gradient: "from-indigo-800 via-indigo-600 to-sky-500",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Central 3-Step Decision Cards */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-72 p-4 rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_16px_40px_rgba(67,56,202,0.18)] dark:shadow-2xl space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">Today's Safe Chop Money</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                Safe to take
              </span>
            </div>

            <div className="flex items-baseline justify-between p-2.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800">
              <div>
                <p className="text-xl font-black text-indigo-950 dark:text-indigo-100">₦15,000</p>
                <p className="text-[9.5px] font-bold text-indigo-700 dark:text-indigo-300">Capital stays 100% protected</p>
              </div>
              <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex items-center gap-2 text-[10.5px] font-bold text-slate-700 dark:text-slate-200">
              <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Restock Staples: <strong className="text-amber-600 dark:text-amber-300 font-black">Depot price alert updated daily!</strong></span>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "referral",
      badge: "Community Rewards • Free Days 🤝",
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      badgeIcon: <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
      title: "Invite Shop Neighbors",
      highlight: "Earn +14 Days Free MoniePay Plus",
      highlightColor: "text-emerald-600 dark:text-emerald-400",
      description:
        "Share your invite code with shop neighbors. When they record for 7 active days, you both unlock +14 days of free MoniePay Plus!",
      icon: <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />,
      themeColor: "#059669",
      gradient: "from-emerald-800 via-emerald-600 to-teal-500",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Animated Connecting Wave Ripples */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.1, 0.35] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-44 w-44 sm:h-52 sm:w-52 rounded-full border-2 border-emerald-400/40 bg-emerald-100/20 dark:bg-emerald-900/20"
          />

          {/* Floating WhatsApp Pill Left */}
          <motion.div
            animate={{ y: [-4, 5, -4], rotate: [-2, 2, -2] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 sm:left-1 top-2 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-emerald-200 dark:border-emerald-800 shadow-lg flex items-center gap-2"
          >
            <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-[10px]">
              WA
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">1-Tap WhatsApp</p>
              <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-300">Invite Code Ready</p>
            </div>
          </motion.div>

          {/* Floating Reward Pill Right */}
          <motion.div
            animate={{ y: [5, -5, 5], rotate: [2, -2, 2] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute -right-2 sm:right-1 bottom-1 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-amber-200 dark:border-amber-800 shadow-lg flex items-center gap-1.5"
          >
            <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Bonus Days</p>
              <p className="text-xs font-black text-amber-800 dark:text-amber-300">+14 Days Free</p>
            </div>
          </motion.div>

          {/* Central 3D Referral Card (Dynamic Code) */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-72 p-4 rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_16px_40px_rgba(5,150,105,0.18)] dark:shadow-2xl space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">Shop Neighbor Referral</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                Win-Win 🎁
              </span>
            </div>

            {/* Dynamic Code Display with Click to Copy */}
            <div
              onClick={handleCopyReferral}
              className="p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 space-y-1 cursor-pointer hover:border-emerald-400 transition-all group select-none"
              title="Click to copy your invite code"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-emerald-950 dark:text-emerald-100 tracking-wider">
                  Your Code: {referralCode}
                </p>
                <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded transition-all ${
                  referralCopied ? "bg-emerald-600 text-white" : "bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                }`}>
                  {referralCopied ? "Copied! ✓" : "Copy"}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                Both of you get +14 days free when they record for 7 days
              </p>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={handleCopyReferral}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[10.5px] font-black border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  referralCopied
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200"
                }`}
              >
                {referralCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{referralCopied ? "Code Copied! ✓" : "Copy Code"}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Join me on MoniePay! Use my shop invite code ${referralCode} to get 14 days of free MoniePay Plus: https://moniepay.app/login?ref=${referralCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="py-1.5 px-3 rounded-xl text-[10.5px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Share2 className="h-3 w-3" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5">
              <span>Zero wahala sharing</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black">Instant Activation ✓</span>
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // Keyboard Navigation with leak-free cleanup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlide, slides.length]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-blue-950 dark:selection:text-white transition-colors">
      {/* ── AMBIENT 3D BACKGROUND GLOWS ── */}
      <div className="pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/30 dark:from-blue-900/20 to-indigo-200/20 dark:to-indigo-950/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-gradient-to-tl from-blue-400/25 dark:from-blue-900/20 to-sky-200/20 dark:to-sky-950/20 blur-3xl" />

      {/* ── TOP UTILITY ROW (Logo + ThemeToggle + Skip Button) ── */}
      <header className="relative w-full max-w-md flex items-center justify-between z-20 pt-2 px-1">
        <div className="flex items-center gap-2.5">
          <MoniePayMark size={36} />
          <div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">MoniePay</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 block leading-none">Trader Intro</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleSkip}
            className="px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-black border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md active:scale-95 transition-all cursor-pointer"
          >
            Skip Intro &rarr;
          </button>
        </div>
      </header>

      {/* ── MAIN ANIMATED SLIDE CARD CONTAINER WITH SWIPE SUPPORT ── */}
      <main className="relative w-full max-w-md my-auto py-4 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 35, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -35, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -45 || info.velocity.x < -250) {
                handleNext();
              } else if (info.offset.x > 45 || info.velocity.x > 250) {
                handlePrev();
              }
            }}
            className="clay-card p-5 sm:p-7 space-y-4 text-center relative overflow-hidden bg-white/90 dark:bg-slate-900/90 border border-white/80 dark:border-white/10 shadow-2xl touch-pan-y"
          >
            {/* Top Micro Tag with dynamic slide-specific icon */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border shadow-2xs ${current.badgeColor}`}
              >
                {current.badgeIcon}
                <span>{current.badge}</span>
              </span>
            </div>

            {/* Dynamic Visual Element Stage */}
            <div className="py-1">{current.visualElement}</div>

            {/* Typography Hierarchy */}
            <div className="space-y-1.5 pt-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {current.title}{" "}
                <span className={`${current.highlightColor || "text-[#1d4ed8] dark:text-sky-400"} block sm:inline`}>{current.highlight}</span>
              </h2>

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xs mx-auto">
                {current.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── BOTTOM CONTROLS & NAVIGATION STRIP ── */}
      <footer className="relative w-full max-w-md z-20 pb-4 space-y-4">
        {/* Progress Dot Capsules */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((s, idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${isActive
                  ? "w-8 bg-[#1d4ed8] dark:bg-blue-500 shadow-[0_0_10px_rgba(29,78,216,0.5)]"
                  : "w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                  }`}
              />
            );
          })}
        </div>

        {/* Primary Next / Get Started Action Button */}
        <div className="flex items-center gap-2.5">
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-black shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-4 px-6 rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-black tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_20px_rgba(29,78,216,0.35)] active:scale-98 transition-all"
          >
            <span>
              {currentSlide === slides.length - 1 ? "Open Shop / Sign In" : "Continue"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Footer Security Note */}
        <p className="text-[10px] text-center font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          MoniePay • 100% Offline Capable • Built for Nigerian Traders
        </p>
      </footer>
    </div>
  );
}
