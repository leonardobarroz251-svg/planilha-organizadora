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
import { createTrip, updateTrip } from "@/lib/actions/trips";
import type { Trip } from "@/types/database";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Trip | null;
  covers: string[];
};

export function TripSheet({ open, onOpenChange, editing, covers }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Editar viagem" : "Nova viagem"}</SheetTitle>
          <SheetDescription>
            {editing
              ? "Atualize os detalhes da viagem."
              : "Defina destino, datas e orçamento. Itens detalhados vêm na próxima tela."}
          </SheetDescription>
        </SheetHeader>
        <TripForm
          key={editing?.id ?? "new"}
          editing={editing}
          covers={covers}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function TripForm({
  editing,
  covers,
  onDone,
}: {
  editing: Trip | null;
  covers: string[];
  onDone: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [destination, setDestination] = useState(editing?.destination ?? "");
  const [startsOn, setStartsOn] = useState(editing?.starts_on ?? "");
  const [endsOn, setEndsOn] = useState(editing?.ends_on ?? "");
  const [budget, setBudget] = useState(
    editing ? String(editing.total_budget ?? "") : "",
  );
  const [saved, setSaved] = useState(
    editing ? String(editing.saved_amount ?? "") : "",
  );
  const [monthly, setMonthly] = useState(
    editing ? String(editing.monthly_contribution ?? "") : "",
  );
  const [cover, setCover] = useState(editing?.cover_color ?? covers[0]);
  const [pending, setPending] = useState(false);

  function n(s: string): number {
    return Number(s.replace(",", ".")) || 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe um nome");
      return;
    }
    setPending(true);
    const payload = {
      name: name.trim(),
      destination: destination.trim().length ? destination.trim() : null,
      starts_on: startsOn.length ? startsOn : null,
      ends_on: endsOn.length ? endsOn : null,
      total_budget: n(budget),
      saved_amount: n(saved),
      monthly_contribution: n(monthly),
      cover_color: cover,
    };
    const r = editing
      ? await updateTrip(editing.id, payload)
      : await createTrip(payload);
    setPending(false);
    if (r.ok) {
      toast.success(editing ? "Viagem atualizada" : "Viagem criada");
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
          placeholder="ex: Lisboa em outubro"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="destination">Destino</Label>
        <Input
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="ex: Lisboa, Portugal"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="starts">Início</Label>
          <Input
            id="starts"
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ends">Fim</Label>
          <Input
            id="ends"
            type="date"
            value={endsOn}
            onChange={(e) => setEndsOn(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="budget">Orçamento (R$)</Label>
          <Input
            id="budget"
            inputMode="decimal"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0,00"
            className="tabular"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="saved">Já reservado (R$)</Label>
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
        <Label>Cor da capa</Label>
        <div className="flex flex-wrap gap-2">
          {covers.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCover(c)}
              aria-label={c}
              className={`size-8 rounded-full border-2 transition-transform ${
                cover === c ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ background: c }}
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
          {pending ? "Salvando…" : editing ? "Salvar" : "Criar viagem"}
        </Button>
      </div>
    </form>
  );
}
