import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BudgetsView } from "@/components/budgets/budgets-view";
import { getBudgets } from "@/lib/data/budgets";

export const metadata: Metadata = { title: "Planejamento" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default async function PlanejamentoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const monthParam = pickString(params.m);
  const isValidMonth = monthParam && /^\d{4}-\d{2}-01$/.test(monthParam);

  const result = await getBudgets(isValidMonth ? monthParam : undefined);
  if (result === null) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-7 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Orçamento mensal
        </p>
        <h1 className="text-3xl tracking-tight">
          Seu <span className="font-serif-italic">planejamento</span>
        </h1>
        <p className="max-w-prose text-sm text-[var(--ink-2)]">
          Defina quanto pode gastar em cada categoria por mês. O Cofre compara com
          os gastos reais e mostra o que está dentro ou estourando.
        </p>
      </header>

      <BudgetsView data={result} />
    </div>
  );
}
