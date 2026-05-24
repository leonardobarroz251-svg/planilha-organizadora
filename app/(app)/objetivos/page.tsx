import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GoalsView } from "@/components/goals/goals-view";
import { listGoals } from "@/lib/data/goals";

export const metadata: Metadata = { title: "Objetivos" };

export default async function ObjetivosPage() {
  const goals = await listGoals();
  if (goals === null) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-7 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Metas de longo prazo
        </p>
        <h1 className="text-3xl tracking-tight">
          Seus <span className="font-serif-italic">objetivos</span>
        </h1>
        <p className="max-w-prose text-sm text-[var(--ink-2)]">
          Reserva de emergência, entrada do carro, viagem dos sonhos. Crie um por
          vez e veja o progresso mês a mês.
        </p>
      </header>

      <GoalsView goals={goals} />
    </div>
  );
}
