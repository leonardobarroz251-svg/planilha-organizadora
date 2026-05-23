"use client";

import { useAppShell } from "@/components/layout/app-shell-context";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/shared/category-icon";
import { brl, longDateBR } from "@/lib/format";
import type { TransactionRow } from "@/lib/data/transactions";

type Props = { items: TransactionRow[] };

function groupByDay(items: TransactionRow[]) {
  const map = new Map<string, TransactionRow[]>();
  for (const item of items) {
    const key = String(item.occurred_at).slice(0, 10);
    const arr = map.get(key) ?? [];
    arr.push(item);
    map.set(key, arr);
  }
  return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
}

export function TransactionList({ items }: Props) {
  const { hideAmounts } = useAppShell();
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border bg-[var(--surface-2)] p-10 text-center">
        <p className="text-sm text-[var(--muted)]">Nenhuma transação encontrada com esses filtros.</p>
      </div>
    );
  }
  const groups = groupByDay(items);
  return (
    <div className="space-y-8">
      {groups.map(([day, rows]) => {
        const total = rows.reduce((sum, t) => sum + Number(t.amount), 0);
        return (
          <section key={day}>
            <header className="mb-2 flex items-baseline justify-between">
              <h3 className="text-[12px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {longDateBR(day)}
              </h3>
              <span
                className="tabular text-[12px]"
                style={{ color: total >= 0 ? "var(--accent)" : "var(--ink-2)" }}
              >
                {hideAmounts ? "•••••" : brl(total, { signed: true })}
              </span>
            </header>
            <ul className="overflow-hidden rounded-[var(--radius)] border bg-[var(--surface)] shadow-card">
              {rows.map((t, idx) => {
                const isIncome = Number(t.amount) > 0;
                return (
                  <li
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      idx > 0 ? "border-t border-[var(--line)]" : ""
                    }`}
                  >
                    <CategoryIcon
                      icon={t.category?.icon ?? undefined}
                      color={t.category?.color ?? undefined}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px]">{t.merchant}</p>
                        {t.is_recurring ? (
                          <Badge variant="outline" className="text-[9.5px] uppercase tracking-wider">
                            Recorrente
                          </Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-[11.5px] text-[var(--muted)]">
                        {t.category?.name ?? "Sem categoria"}
                      </p>
                    </div>
                    <span
                      className="tabular text-[14px]"
                      style={{ color: isIncome ? "var(--accent)" : "var(--ink)" }}
                    >
                      {hideAmounts ? "•••••" : brl(Number(t.amount), { signed: true })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
