import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TripsView } from "@/components/trips/trips-view";
import { listTrips } from "@/lib/data/trips";

export const metadata: Metadata = { title: "Viagens" };

export default async function ViagensPage() {
  const trips = await listTrips();
  if (trips === null) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-7 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Planejamento de viagens
        </p>
        <h1 className="text-3xl tracking-tight">
          Suas <span className="font-serif-italic">viagens</span>
        </h1>
        <p className="max-w-prose text-sm text-[var(--ink-2)]">
          Crie um plano com orçamento, datas e itens (voo, hospedagem, atrações).
          Acompanhe o quanto já está reservado.
        </p>
      </header>

      <TripsView trips={trips} />
    </div>
  );
}
