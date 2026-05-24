"use client";

import { Plane, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

export function TripsView({ trips }: { trips: Trip[] }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);

  function onNew() {
    setEditing(null);
    setSheetOpen(true);
  }

  if (trips.length === 0) {
    return (
      <>
        <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)]/40 px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Plane size={20} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 text-lg tracking-tight">Nenhuma viagem ainda</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--ink-2)]">
            Planeje a próxima — destino, orçamento e itens. O Cofre ajuda a chegar
            lá sem comprometer o resto do mês.
          </p>
          <Button onClick={onNew} className="mt-5 gap-2">
            <Plus size={14} /> Planejar primeira viagem
          </Button>
        </div>
        <TripSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} covers={COVERS} />
      </>
    );
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--ink-2)]">
          {trips.length} {trips.length === 1 ? "viagem" : "viagens"} planejadas
        </p>
        <Button size="sm" onClick={onNew} className="gap-2">
          <Plus size={14} /> Nova viagem
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {trips.map((t) => (
          <TripCard key={t.id} trip={t} />
        ))}
      </div>
      <TripSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} covers={COVERS} />
    </>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const budget = Number(trip.total_budget ?? 0);
  const saved = Number(trip.saved_amount ?? 0);
  const pct = budget > 0 ? Math.min(100, (saved / budget) * 100) : 0;
  const cover = trip.cover_color ?? COVERS[0];

  return (
    <Link
      href={`/viagens/${trip.id}`}
      className="group block overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] shadow-card transition-all hover:border-[var(--line-strong)]"
    >
      <div
        aria-hidden
        className="relative h-24 w-full"
        style={{
          background: `linear-gradient(135deg, ${cover}, color-mix(in oklch, ${cover} 50%, var(--surface)))`,
        }}
      >
        <div className="absolute inset-x-4 bottom-3 text-[var(--bg)]">
          <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">
            {trip.destination ?? "Destino livre"}
          </p>
          <p className="text-lg tracking-tight">{trip.name}</p>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="tabular text-xl tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
            {brl(saved)}
          </span>
          <span className="tabular text-[12px] text-[var(--muted)]">
            de {brl(budget)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: cover }}
          />
        </div>
        <div className="flex items-center justify-between text-[12px] text-[var(--ink-2)]">
          <span>
            {trip.starts_on && trip.ends_on
              ? `${dateBR(trip.starts_on)} → ${dateBR(trip.ends_on)}`
              : "Sem datas"}
          </span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      </div>
    </Link>
  );
}
