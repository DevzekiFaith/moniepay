import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger" | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-emerald-500 text-black hover:bg-emerald-400 font-semibold shadow-lg shadow-emerald-500/20":
              variant === "emerald" || variant === "default",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/60":
              variant === "secondary",
            "border border-zinc-800 text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700":
              variant === "outline",
            "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900":
              variant === "ghost",
            "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20":
              variant === "danger",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
