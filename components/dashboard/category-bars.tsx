"use client";

import { useAppShell } from "@/components/layout/app-shell-context";
import { brl, pct } from "@/lib/format";

type Props = {
  rows: Array<{ name: string; color: string; spent: number; budget: number }>;
};

export function CategoryBars({ rows }: Props) {
  const { hideAmounts } = useAppShell();
  const max = Math.max(
    ...rows.map((r) => Math.max(r.spent, r.budget || 0)),
    1,
  );

  if (rows.length === 0) {
    return (
      <p className="rounded-[var(--radius)] border bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
        Nenhum gasto categorizado este mês.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.slice(0, 6).map((row) => {
        const percent = Math.min(120, (row.spent / max) * 100);
        const used = row.budget > 0 ? (row.spent / row.budget) * 100 : null;
        const over = used != null && used > 100;
        return (
          <li key={row.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-[var(--ink-2)]">{row.name}</span>
              <span className="tabular text-foreground">
                {hideAmounts ? "•••" : brl(row.spent)}
                {row.budget > 0 ? (
                  <span className="text-[var(--muted)]"> / {hideAmounts ? "•••" : brl(row.budget)}</span>
                ) : null}
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percent}%`,
                  background: over ? "var(--danger)" : row.color,
                }}
              />
            </div>
            {used != null ? (
              <p className="text-[11px] text-[var(--muted)]">
                {over ? (
                  <span className="text-[var(--danger)]">Acima do plano · {pct(used)}</span>
                ) : (
                  <>Gasto · {pct(used)}</>
                )}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
