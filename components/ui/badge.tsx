import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20":
            variant === "success" || variant === "default",
          "bg-zinc-800 text-zinc-300 border border-zinc-700/50":
            variant === "secondary",
          "bg-amber-500/10 text-amber-400 border border-amber-500/20":
            variant === "warning",
          "bg-red-500/10 text-red-400 border border-red-500/20":
            variant === "danger",
          "border border-zinc-700 text-zinc-300":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
