"use client";

import { Plus, Target } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Goal } from "@/types/database";
import { GoalCard } from "./goal-card";
import { GoalSheet } from "./goal-sheet";

type Props = {
  goals: Goal[];
};

export function GoalsView({ goals }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  function onNew() {
    setEditing(null);
    setSheetOpen(true);
  }

  function onEdit(goal: Goal) {
    setEditing(goal);
    setSheetOpen(true);
  }

  if (goals.length === 0) {
    return (
      <>
        <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)]/40 px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Target size={20} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 text-lg tracking-tight">Nenhum objetivo ainda</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--ink-2)]">
            Comece com algo concreto: uma reserva, uma viagem, uma compra grande.
            O Cofre te ajuda a chegar lá.
          </p>
          <Button onClick={onNew} className="mt-5 gap-2">
            <Plus size={14} /> Criar primeiro objetivo
          </Button>
        </div>
        <GoalSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} />
      </>
    );
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--ink-2)]">
          {goals.length} {goals.length === 1 ? "objetivo" : "objetivos"} em andamento
        </p>
        <Button size="sm" onClick={onNew} className="gap-2">
          <Plus size={14} /> Novo objetivo
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {goals.map((g) => (
          <GoalCard key={g.id} goal={g} onEdit={() => onEdit(g)} />
        ))}
      </div>
      <GoalSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} />
    </>
  );
}
