"use client";

import { Loader2, Pencil, PiggyBank, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addContribution, deleteGoal } from "@/lib/actions/goals";
import { brl, dateBR } from "@/lib/format";
import type { Goal } from "@/types/database";

type Props = {
  goal: Goal;
  onEdit: () => void;
};

export function GoalCard({ goal, onEdit }: Props) {
  const [pending, startTransition] = useTransition();
  const [contribOpen, setContribOpen] = useState(false);
  const [contribValue, setContribValue] = useState("");

  const target = Number(goal.target_amount);
  const saved = Number(goal.saved_amount);
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const remaining = Math.max(0, target - saved);
  const monthsLeft =
    goal.monthly_contribution > 0
      ? Math.ceil(remaining / Number(goal.monthly_contribution))
      : null;

  function onDelete() {
    if (!confirm(`Excluir objetivo "${goal.name}"?`)) return;
    startTransition(async () => {
      const r = await deleteGoal(goal.id);
      if (r.ok) toast.success("Objetivo removido");
      else toast.error(r.error);
    });
  }

  function onAddContribution(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = Number(contribValue.replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) {
      toast.error("Valor inválido");
      return;
    }
    startTransition(async () => {
      const r = await addContribution(goal.id, v);
      if (r.ok) {
        toast.success("Depósito registrado");
        setContribValue("");
        setContribOpen(false);
      } else {
        toast.error(r.error);
      }
    });
  }

  const accent = goal.color ?? "var(--accent)";

  return (
    <article className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-[15px] tracking-tight">{goal.name}</h3>
          {goal.deadline ? (
            <p className="text-[12px] text-[var(--muted)]">
              Prazo: {dateBR(goal.deadline)}
            </p>
          ) : (
            <p className="text-[12px] text-[var(--muted)]">Sem prazo definido</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Editar"
            onClick={onEdit}
            disabled={pending}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Excluir"
            onClick={onDelete}
            disabled={pending}
            className="text-[var(--danger)] hover:text-[var(--danger)]"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="tabular text-2xl tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {brl(saved)}
          </span>
          <span className="tabular text-[12.5px] text-[var(--muted)]">
            de {brl(target)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: accent }}
          />
        </div>
        <div className="flex items-center justify-between text-[12px] text-[var(--ink-2)]">
          <span>{pct.toFixed(0)}% concluído</span>
          {monthsLeft !== null ? (
            <span>
              ~{monthsLeft} {monthsLeft === 1 ? "mês" : "meses"} pra completar
            </span>
          ) : (
            <span>Defina contribuição mensal</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
        <div className="text-[12.5px] text-[var(--ink-2)]">
          Mensal:{" "}
          <span className="text-foreground">
            {brl(Number(goal.monthly_contribution))}
          </span>
        </div>
        <Popover open={contribOpen} onOpenChange={setContribOpen}>
          <PopoverTrigger
            render={
              <Button size="sm" variant="outline" className="gap-1.5">
                <PiggyBank size={13} /> Depositar
              </Button>
            }
          />
          <PopoverContent align="end" className="w-72">
            <form onSubmit={onAddContribution} className="space-y-2.5">
              <p className="text-[12.5px] text-[var(--ink-2)]">
                Quanto você adicionou agora?
              </p>
              <Input
                inputMode="decimal"
                autoFocus
                value={contribValue}
                onChange={(e) => setContribValue(e.target.value)}
                placeholder="0,00"
                className="tabular"
              />
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" size={14} /> : null}
                {pending ? "Salvando…" : "Confirmar"}
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>
    </article>
  );
}
