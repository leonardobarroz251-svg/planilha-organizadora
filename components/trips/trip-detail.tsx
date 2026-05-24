"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createTripItem, deleteTrip, deleteTripItem } from "@/lib/actions/trips";
import type { TripItem } from "@/lib/data/trips";
import { brl, dateBR } from "@/lib/format";
import type { Trip } from "@/types/database";
import { TripSheet } from "./trip-sheet";

const COVERS = [
  "oklch(0.7 0.13 245)",
  "oklch(0.7 0.13 145)",
  "oklch(0.72 0.13 70)",
  "oklch(0.7 0.14 320)",
  "oklch(0.68 0.13 25)",
];

const KIND_OPTIONS = [
  "Voo",
  "Hospedagem",
  "Transporte local",
  "Passeio",
  "Alimentação",
  "Seguro",
  "Outro",
];

const STATUS_LABELS = {
  planned: "Planejado",
  reserved: "Reservado",
  purchased: "Pago",
} as const;

type Props = {
  trip: Trip;
  items: TripItem[];
};

export function TripDetail({ trip, items }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  const budget = Number(trip.total_budget ?? 0);
  const saved = Number(trip.saved_amount ?? 0);
  const totalPlanned = items.reduce((s, i) => s + Number(i.planned_amount), 0);
  const totalActual = items.reduce(
    (s, i) => s + Number(i.actual_amount ?? 0),
    0,
  );
  const cover = trip.cover_color ?? COVERS[0];

  function onDeleteTrip() {
    if (!confirm(`Excluir viagem "${trip.name}"? Itens também serão removidos.`)) return;
    startTransition(async () => {
      const r = await deleteTrip(trip.id);
      if (r.ok) {
        toast.success("Viagem excluída");
        router.push("/viagens");
      } else toast.error(r.error);
    });
  }

  function onDeleteItem(id: string) {
    if (!confirm("Remover este item?")) return;
    startTransition(async () => {
      const r = await deleteTripItem(id, trip.id);
      if (!r.ok) toast.error(r.error);
    });
  }

  return (
    <>
      <header
        className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] shadow-card"
        style={{
          background: `linear-gradient(135deg, ${cover}, color-mix(in oklch, ${cover} 50%, var(--surface)))`,
        }}
      >
        <div className="space-y-4 p-6 text-[var(--bg)] sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.22em] opacity-80">
                {trip.destination ?? "Destino livre"}
              </p>
              <h1
                className="text-3xl tracking-tight"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {trip.name}
              </h1>
              <p className="text-[12.5px] opacity-80">
                {trip.starts_on && trip.ends_on
                  ? `${dateBR(trip.starts_on)} → ${dateBR(trip.ends_on)}`
                  : "Sem datas definidas"}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditing(true)}
                aria-label="Editar viagem"
                className="bg-[var(--bg)]/15 text-[var(--bg)] hover:bg-[var(--bg)]/25"
              >
                <Pencil size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onDeleteTrip}
                aria-label="Excluir viagem"
                disabled={pending}
                className="bg-[var(--bg)]/15 text-[var(--bg)] hover:bg-[var(--bg)]/25"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-[var(--bg)]/20 pt-4 text-[var(--bg)]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">Orçamento</p>
              <p className="tabular text-base">{brl(budget)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">Reservado</p>
              <p className="tabular text-base">{brl(saved)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">Mensal</p>
              <p className="tabular text-base">{brl(Number(trip.monthly_contribution))}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg tracking-tight">Itens da viagem</h2>
            <p className="text-[12.5px] text-[var(--muted)]">
              {items.length === 0
                ? "Nenhum item ainda"
                : `${items.length} ${items.length === 1 ? "item" : "itens"} · planejado ${brl(
                    totalPlanned,
                  )} · pago ${brl(totalActual)}`}
            </p>
          </div>
          <Button size="sm" onClick={() => setAdding(true)} className="gap-2">
            <Plus size={14} /> Novo item
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)]/40 px-6 py-12 text-center text-sm text-[var(--ink-2)]">
            Comece pelos maiores gastos: voo, hospedagem, transfer.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] shadow-card">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0 sm:grid-cols-[140px_1fr_120px_100px_auto]"
              >
                <div className="hidden text-[12px] uppercase tracking-[0.14em] text-[var(--muted)] sm:block">
                  {item.kind}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px]">{item.description}</p>
                  <p className="text-[11.5px] text-[var(--muted)] sm:hidden">
                    {item.kind} · {STATUS_LABELS[item.status]}
                  </p>
                </div>
                <div className="hidden tabular text-right text-[13px] text-[var(--ink-2)] sm:block">
                  {brl(Number(item.planned_amount))}
                </div>
                <div className="hidden text-right text-[12px] text-[var(--ink-2)] sm:block">
                  {STATUS_LABELS[item.status]}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remover"
                  onClick={() => onDeleteItem(item.id)}
                  disabled={pending}
                  className="text-[var(--danger)] hover:text-[var(--danger)]"
                >
                  {pending ? <Loader2 className="animate-spin" size={13} /> : <Trash2 size={13} />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <TripSheet open={editing} onOpenChange={setEditing} editing={trip} covers={COVERS} />
      <ItemSheet open={adding} onOpenChange={setAdding} tripId={trip.id} />
    </>
  );
}

function ItemSheet({
  open,
  onOpenChange,
  tripId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tripId: string;
}) {
  const [kind, setKind] = useState(KIND_OPTIONS[0]);
  const [desc, setDesc] = useState("");
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [status, setStatus] = useState<"planned" | "reserved" | "purchased">("planned");
  const [occurredAt, setOccurredAt] = useState("");
  const [pending, setPending] = useState(false);

  function n(s: string): number {
    return Number(s.replace(",", ".")) || 0;
  }

  function reset() {
    setKind(KIND_OPTIONS[0]);
    setDesc("");
    setPlanned("");
    setActual("");
    setStatus("planned");
    setOccurredAt("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!desc.trim()) {
      toast.error("Descreva o item");
      return;
    }
    setPending(true);
    const r = await createTripItem({
      trip_id: tripId,
      kind,
      description: desc.trim(),
      planned_amount: n(planned),
      actual_amount: actual.length ? n(actual) : null,
      status,
      occurred_at: occurredAt.length ? occurredAt : null,
    });
    setPending(false);
    if (r.ok) {
      toast.success("Item adicionado");
      reset();
      onOpenChange(false);
    } else {
      toast.error(r.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Novo item</SheetTitle>
          <SheetDescription>
            Voo, hospedagem, passeio… o que for compor essa viagem.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-5 px-4 pb-4">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={kind} onValueChange={(v) => setKind(v ?? KIND_OPTIONS[0])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Descrição</Label>
            <Input
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="ex: Voo GRU → LIS"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="planned">Planejado (R$)</Label>
              <Input
                id="planned"
                inputMode="decimal"
                value={planned}
                onChange={(e) => setPlanned(e.target.value)}
                placeholder="0,00"
                className="tabular"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="actual">Pago (R$)</Label>
              <Input
                id="actual"
                inputMode="decimal"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                placeholder="0,00"
                className="tabular"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v as typeof status) ?? "planned")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planejado</SelectItem>
                  <SelectItem value="reserved">Reservado</SelectItem>
                  <SelectItem value="purchased">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="when">Quando</Label>
              <Input
                id="when"
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-auto flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" size={14} /> : null}
              {pending ? "Salvando…" : "Adicionar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
