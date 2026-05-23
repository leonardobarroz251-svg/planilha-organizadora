"use client";

import { useAppShell } from "@/components/layout/app-shell-context";
import { brl, pct } from "@/lib/format";

type Props = {
  uber99: number;
  extra: number;
};

export function IncomeMix({ uber99, extra }: Props) {
  const { hideAmounts } = useAppShell();
  const total = uber99 + extra;
  if (total === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Adicione receitas (Uber, 99 ou renda extra) para visualizar a composição.
      </p>
    );
  }
  const pctUber = (uber99 / total) * 100;
  const pctExtra = 100 - pctUber;
  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div style={{ width: `${pctUber}%`, background: "var(--accent)" }} />
        <div style={{ width: `${pctExtra}%`, background: "var(--info)" }} />
      </div>
      <div className="flex items-center justify-between text-[12.5px]">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
          <span>Uber + 99</span>
        </div>
        <span className="tabular">
          {hideAmounts ? "•••" : brl(uber99)} · {pct(pctUber)}
        </span>
      </div>
      <div className="flex items-center justify-between text-[12.5px]">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--info)]" />
          <span>Renda extra</span>
        </div>
        <span className="tabular">
          {hideAmounts ? "•••" : brl(extra)} · {pct(pctExtra)}
        </span>
      </div>
    </div>
  );
}
