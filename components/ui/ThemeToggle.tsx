"use client";

import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill" | "segmented";
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({
  className = "",
  variant = "icon",
  size = "md",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center w-full rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 p-1 border border-slate-300/60 dark:border-slate-700/60 backdrop-blur-md ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
            theme === "light"
              ? "bg-white text-blue-950 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Light Mode (Daylight)"
        >
          <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
            theme === "dark"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Dark Mode (Night Market)"
        >
          <Moon className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span className="truncate">Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
            theme === "system"
              ? "bg-white dark:bg-slate-900 text-blue-950 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Auto / System"
        >
          <Laptop className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="truncate">Auto</span>
        </button>
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer backdrop-blur-md ${className}`}
        aria-label="Toggle Theme"
      >
        {resolvedTheme === "dark" ? (
          <>
            <Moon className="h-4 w-4 text-sky-400" />
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Light Mode</span>
          </>
        )}
      </button>
    );
  }

  // Default Icon Button
  const sizeClasses =
    size === "sm"
      ? "h-8 w-8"
      : size === "lg"
      ? "h-11 w-11"
      : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center justify-center rounded-2xl bg-white/15 dark:bg-white/10 hover:bg-white/25 dark:hover:bg-white/20 text-white backdrop-blur-md border border-white/20 dark:border-white/10 active:scale-90 transition-all cursor-pointer shadow-xs ${sizeClasses} ${className}`}
      title={resolvedTheme === "dark" ? "Switch to Daylight Mode" : "Switch to Night Market Dark Mode"}
      aria-label="Toggle light / dark mode"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-300 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="h-4 w-4 text-sky-200 animate-in fade-in zoom-in duration-200" />
      )}
    </button>
  );
}
