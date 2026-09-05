"use client";

// ─────────────────────────────────────────────
// RecurringMoney Component
// Subscriptions & regular recurring financial obligations
// ─────────────────────────────────────────────

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { Repeat, Calendar } from "lucide-react";

export interface RecurringItem {
  id: string;
  name: string;
  merchantName?: string | null;
  amount: number;
  frequency: string;
  nextExpectedDate?: string | Date | null;
  category?: {
    name: string;
  } | null;
}

interface RecurringMoneyProps {
  recurring: RecurringItem[];
}

export function RecurringMoney({ recurring }: RecurringMoneyProps) {
  const totalMonthly = recurring.reduce((acc, r) => {
    if (r.frequency === "MONTHLY") return acc + r.amount;
    if (r.frequency === "WEEKLY") return acc + r.amount * 4.3;
    if (r.frequency === "ANNUAL") return acc + r.amount / 12;
    return acc + r.amount;
  }, 0);

  return (
    <Card className="border-zinc-800/80 bg-zinc-950/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-900">
        <div>
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Repeat className="w-4 h-4 text-purple-400" />
            Recurring & Subscriptions
          </CardTitle>
          <p className="text-xs text-zinc-400 mt-0.5">
            Auto-detected recurring commitments
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-zinc-400 block">Est. Monthly</span>
          <span className="text-xs font-mono font-bold text-zinc-200">
            {formatNaira(totalMonthly)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {recurring.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No active recurring commitments detected yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {recurring.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 px-1 hover:bg-zinc-900/30 rounded-xl transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200">
                      {item.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {item.frequency}
                    </Badge>
                  </div>
                  {item.nextExpectedDate && (
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due ~{new Date(item.nextExpectedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-zinc-200">
                    {formatNaira(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
