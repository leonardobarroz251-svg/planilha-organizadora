"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAppShell } from "@/components/layout/app-shell-context";
import { CategoryIcon } from "@/components/shared/category-icon";
import { brl, dateBR } from "@/lib/format";
import type { Category, Transaction } from "@/types/database";

type Item = Transaction & {
  category: Pick<Category, "name" | "icon" | "color" | "kind"> | null;
};

export function RecentTransactions({ items }: { items: Item[] }) {
  const { hideAmounts } = useAppShell();

  if (items.length === 0) {
    return (
      <p className="rounded-[var(--radius)] border bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
        Nenhuma transação ainda. Adicione a primeira para ver o painel ganhar vida.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border bg-[var(--surface)] shadow-card">
      <ul className="divide-y divide-[var(--line)]">
        {items.map((t) => {
          const isIncome = Number(t.amount) > 0;
          return (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <CategoryIcon
                icon={t.category?.icon ?? undefined}
                color={t.category?.color ?? undefined}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px]">{t.merchant}</p>
                <p className="truncate text-[11.5px] text-[var(--muted)]">
                  {t.category?.name ?? "Sem categoria"} · {dateBR(t.occurred_at)}
                </p>
              </div>
              <span
                className="tabular text-[13.5px]"
                style={{ color: isIncome ? "var(--accent)" : "var(--ink)" }}
              >
                {hideAmounts ? "•••••" : brl(Number(t.amount), { signed: true })}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-[var(--line)] px-4 py-2 text-right">
        <Link
          href="/transacoes"
          className="inline-flex items-center gap-1 text-[12px] text-[var(--ink-2)] hover:text-foreground"
        >
          Ver todas <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
}
