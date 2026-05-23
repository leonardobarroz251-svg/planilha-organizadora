"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useAppShell } from "@/components/layout/app-shell-context";
import { Sparkline } from "@/components/charts/sparkline";
import { AnimNumber } from "@/components/shared/anim-number";
import { brl, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  delta?: number | null;
  color?: string;
  spark?: Array<{ date: string; value: number }>;
  variant?: "neutral" | "income" | "expense";
};

export function KpiCard({ label, value, delta, color, spark, variant = "neutral" }: Props) {
  const { hideAmounts } = useAppShell();
  const accentColor =
    color ??
    (variant === "income"
      ? "var(--accent)"
      : variant === "expense"
        ? "var(--danger)"
        : "var(--info)");

  const isPositive = (delta ?? 0) >= 0;

  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] border bg-[var(--surface)] p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
        {delta != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px]",
              isPositive
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]",
            )}
          >
            {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {pct(Math.abs(delta))}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[28px] leading-tight tracking-tight tabular">
        {hideAmounts ? (
          "•••••"
        ) : (
          <AnimNumber value={value} format={(n) => brl(n)} />
        )}
      </p>
      {spark && spark.length > 0 ? (
        <div className="-mx-2 mt-2">
          <Sparkline data={spark} color={accentColor} height={44} />
        </div>
      ) : null}
    </div>
  );
}
