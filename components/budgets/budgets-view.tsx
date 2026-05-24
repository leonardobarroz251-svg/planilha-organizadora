"use client";

import { ChevronLeft, ChevronRight, Compass, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertBudget } from "@/lib/actions/budgets";
import type { BudgetsResult, BudgetRow } from "@/lib/data/budgets";
import { brl, monthBR } from "@/lib/format";

function shiftMonth(monthISO: string, delta: number): string {
  const [y, m] = monthISO.split("-").map(Number);
  const d = new Date(y, (m - 1) + delta, 1);
  const ny = d.getFullYear();
  const nm = String(d.getMonth() + 1).padStart(2, "0");
  return `${ny}-${nm}-01`;
}

export function BudgetsView({ data }: { data: BudgetsResult }) {
  const router = useRouter();
  const remaining = data.totalPlanned - data.totalSpent;
  const overallPct =
    data.totalPlanned > 0 ? (data.totalSpent / data.totalPlanned) * 100 : 0;

  function goToMonth(monthISO: string) {
    router.push(`/planejamento?m=${monthISO}`);
  }

  const hasAnyPlan = data.rows.some((r) => r.planned > 0);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToMonth(shiftMonth(data.month, -1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="min-w-[120px] text-center capitalize tabular text-[13.5px]">
            {monthBR(data.month)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToMonth(shiftMonth(data.month, 1))}
            aria-label="Próximo mês"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="flex items-baseline gap-6 text-right">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Planejado
            </p>
            <p className="tabular text-[15px]">{brl(data.totalPlanned)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Gasto
            </p>
            <p className="tabular text-[15px]">{brl(data.totalSpent)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Saldo
            </p>
            <p
              className={`tabular text-[15px] ${
                remaining < 0 ? "text-[var(--danger)]" : "text-foreground"
              }`}
            >
              {brl(remaining)}
            </p>
          </div>
        </div>
      </div>

      {data.totalPlanned > 0 ? (
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full transition-all"
            style={{
              width: `${Math.min(100, overallPct)}%`,
              background:
                overallPct > 100 ? "var(--danger)" : "var(--accent)",
            }}
          />
        </div>
      ) : null}

      {!hasAnyPlan ? (
        <div className="mb-6 rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)]/40 px-6 py-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Compass size={20} strokeWidth={1.8} />
          </span>
          <h2 className="mt-3 text-base tracking-tight">
            Nenhum orçamento neste mês
          </h2>
          <p className="mx-auto mt-1 max-w-md text-[13px] text-[var(--ink-2)]">
            Digite quanto você quer gastar em cada categoria abaixo. Salva
            automaticamente quando você sai do campo.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] shadow-card">
        <div className="grid grid-cols-[1fr_120px_120px_140px] gap-3 border-b border-[var(--line)] px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] sm:grid-cols-[1fr_140px_140px_180px]">
          <span>Categoria</span>
          <span className="text-right">Planejado</span>
          <span className="text-right">Gasto</span>
          <span className="text-right">Progresso</span>
        </div>
        {data.rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
            Você ainda não tem categorias de despesa.{" "}
            <Link href="/configuracoes" className="underline">
              Crie em Configurações
            </Link>
            .
          </div>
        ) : (
          data.rows.map((row) => (
            <BudgetRowEditor key={row.category.id} row={row} month={data.month} />
          ))
        )}
      </div>
    </>
  );
}

function BudgetRowEditor({ row, month }: { row: BudgetRow; month: string }) {
  const [value, setValue] = useState(String(row.planned || ""));
  const [pending, startTransition] = useTransition();

  const planned = Number(value.replace(",", ".")) || 0;
  const pct = planned > 0 ? (row.spent / planned) * 100 : 0;
  const over = pct > 100;

  function save() {
    if (planned === row.planned) return;
    startTransition(async () => {
      const r = await upsertBudget({
        category_id: row.category.id,
        month,
        planned_amount: planned,
      });
      if (!r.ok) toast.error(r.error);
    });
  }

  return (
    <div className="grid grid-cols-[1fr_120px_120px_140px] items-center gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_140px_140px_180px]">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="size-7 shrink-0 rounded-md"
          style={{ background: row.category.color ?? "var(--accent-soft)" }}
        />
        <span className="truncate text-[13.5px]">{row.category.name}</span>
      </div>
      <Input
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        placeholder="0,00"
        className="h-9 text-right tabular"
        disabled={pending}
      />
      <div className="tabular text-right text-[13.5px] text-[var(--ink-2)]">
        {brl(row.spent)}
      </div>
      <div className="flex items-center justify-end gap-2">
        {planned > 0 ? (
          <>
            <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-[var(--surface-2)] sm:block">
              <div
                className="h-full transition-all"
                style={{
                  width: `${Math.min(100, pct)}%`,
                  background: over ? "var(--danger)" : "var(--accent)",
                }}
              />
            </div>
            <span
              className={`tabular text-[12px] ${
                over ? "text-[var(--danger)]" : "text-[var(--ink-2)]"
              }`}
            >
              {pct.toFixed(0)}%
            </span>
          </>
        ) : (
          <span className="text-[12px] text-[var(--muted)]">—</span>
        )}
        {pending ? <Loader2 className="animate-spin" size={12} /> : null}
      </div>
    </div>
  );
}
