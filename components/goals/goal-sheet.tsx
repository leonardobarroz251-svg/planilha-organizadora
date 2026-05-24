"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createGoal, updateGoal } from "@/lib/actions/goals";
import type { Goal } from "@/types/database";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Goal | null;
};

const COLORS = [
  { value: "oklch(0.7 0.13 145)", label: "Verde" },
  { value: "oklch(0.7 0.13 245)", label: "Azul" },
  { value: "oklch(0.72 0.13 70)", label: "Mostarda" },
  { value: "oklch(0.7 0.14 320)", label: "Rosa" },
  { value: "oklch(0.68 0.13 25)", label: "Coral" },
];

export function GoalSheet({ open, onOpenChange, editing }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {editing ? "Editar objetivo" : "Novo objetivo"}
          </SheetTitle>
          <SheetDescription>
            {editing
              ? "Atualize os dados deste objetivo."
              : "Defina uma meta concreta e o quanto vai guardar por mês."}
          </SheetDescription>
        </SheetHeader>
        <GoalForm
          key={editing?.id ?? "new"}
          editing={editing}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function GoalForm({ editing, onDone }: { editing: Goal | null; onDone: () => void }) {
  const [name, setName] = useState(editing?.name ?? "");
  const [target, setTarget] = useState(
    editing ? String(editing.target_amount ?? "") : "",
  );
  const [saved, setSaved] = useState(
    editing ? String(editing.saved_amount ?? "") : "",
  );
  const [monthly, setMonthly] = useState(
    editing ? String(editing.monthly_contribution ?? "") : "",
  );
  const [rate, setRate] = useState(
    editing ? String(editing.interest_rate ?? "") : "",
  );
  const [deadline, setDeadline] = useState(editing?.deadline ?? "");
  const [color, setColor] = useState(editing?.color ?? COLORS[0].value);
  const [pending, setPending] = useState(false);

  function parseNum(s: string): number {
    return Number(s.replace(",", ".")) || 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = parseNum(target);
    if (t <= 0) {
      toast.error("Informe a meta total");
      return;
    }
    setPending(true);
    const payload = {
      name: name.trim(),
      target_amount: t,
      saved_amount: parseNum(saved),
      monthly_contribution: parseNum(monthly),
      interest_rate: parseNum(rate),
      deadline: deadline.length ? deadline : null,
      color,
    };
    const r = editing
      ? await updateGoal(editing.id, payload)
      : await createGoal(payload);
    setPending(false);
    if (r.ok) {
      toast.success(editing ? "Objetivo atualizado" : "Objetivo criado");
      onDone();
    } else {
      toast.error(r.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-5 px-4 pb-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Reserva de emergência"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="target">Meta total (R$)</Label>
          <Input
            id="target"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="10.000,00"
            className="tabular"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="saved">Já guardado (R$)</Label>
          <Input
            id="saved"
            inputMode="decimal"
            value={saved}
            onChange={(e) => setSaved(e.target.value)}
            placeholder="0,00"
            className="tabular"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="monthly">Contribuição mensal (R$)</Label>
          <Input
            id="monthly"
            inputMode="decimal"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            placeholder="500,00"
            className="tabular"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rate">Rendimento anual (%)</Label>
          <Input
            id="rate"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="12"
            className="tabular"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deadline">Prazo (opcional)</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={c.label}
              className={`size-8 rounded-full border-2 transition-transform ${
                color === c.value
                  ? "border-foreground scale-110"
                  : "border-transparent"
              }`}
              style={{ background: c.value }}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto flex gap-2 pt-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" size={14} /> : null}
          {pending ? "Salvando…" : editing ? "Salvar" : "Criar objetivo"}
        </Button>
      </div>
    </form>
  );
}
