import type { Metadata } from "next";
import { FiltersBar } from "@/components/transactions/filters-bar";
import { TransactionList } from "@/components/transactions/transaction-list";
import { listTransactions } from "@/lib/data/transactions";

export const metadata: Metadata = { title: "Transações" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = pickString(params.q) ?? "";
  const cat = pickString(params.cat);

  const result = await listTransactions({ search, categorySlug: cat });
  if (!result) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-7 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Lançamentos
        </p>
        <h1 className="text-3xl tracking-tight">
          Suas <span className="font-serif-italic">transações</span>
        </h1>
        <p className="max-w-prose text-sm text-[var(--ink-2)]">
          Filtre por categoria ou estabelecimento. Receitas aparecem em verde, despesas em neutro.
        </p>
      </header>

      <div className="mb-6">
        <FiltersBar
          categories={result.categories}
          initialSearch={search}
          initialCategory={cat}
        />
      </div>

      <TransactionList items={result.items} />
    </div>
  );
}
