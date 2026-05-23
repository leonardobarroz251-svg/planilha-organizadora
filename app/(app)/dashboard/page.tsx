import type { Metadata } from "next";
import { Sparkles, Target } from "lucide-react";
import { CategoryBars } from "@/components/dashboard/category-bars";
import { IncomeMix } from "@/components/dashboard/income-mix";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MonthlyArea } from "@/components/charts/monthly-area";
import { getDashboardData } from "@/lib/data/dashboard";
import { brl, monthBR, pct } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) return null;

  const today = new Date();
  const monthLabel = monthBR(today);
  const incomeSpark = data.daily.map((d) => ({ date: d.date, value: d.income }));
  const expenseSpark = data.daily.map((d) => ({ date: d.date, value: d.expense }));
  const balanceSpark = data.daily.map((d) => ({
    date: d.date,
    value: d.income - d.expense,
  }));

  const balanceDelta =
    data.prevMonthBalance !== 0
      ? ((data.monthBalance - data.prevMonthBalance) / Math.abs(data.prevMonthBalance)) * 100
      : null;

  const savingsRate =
    data.monthIncome > 0 ? (data.monthBalance / data.monthIncome) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Visão geral · <span className="capitalize">{monthLabel}</span>
          </p>
          <h1 className="text-3xl tracking-tight">
            Seu <span className="font-serif-italic">panorama</span> do mês
          </h1>
        </div>
        <p className="text-sm text-[var(--ink-2)]">
          Taxa de poupança&nbsp;
          <span className="font-medium text-foreground">{pct(savingsRate)}</span>
          &nbsp;· {balanceDelta != null ? `${pct(balanceDelta)} vs. mês anterior` : "primeiro mês de registros"}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Saldo do mês"
          value={data.monthBalance}
          delta={balanceDelta}
          spark={balanceSpark}
          variant="neutral"
        />
        <KpiCard
          label="Receitas (30d)"
          value={data.income30d}
          spark={incomeSpark}
          variant="income"
        />
        <KpiCard
          label="Despesas (30d)"
          value={data.expense30d}
          spark={expenseSpark}
          variant="expense"
        />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <article className="rounded-[var(--radius)] border bg-[var(--surface)] p-5 shadow-card">
          <SectionHeader
            eyebrow="Evolução"
            title='Receitas vs. <span class="font-serif-italic">despesas</span> · 30 dias'
            description="Acompanhe se o ritmo das despesas vem aumentando ou recuando."
          />
          <MonthlyArea data={data.daily} />
        </article>

        <article className="rounded-[var(--radius)] border bg-[var(--surface)] p-5 shadow-card">
          <SectionHeader
            eyebrow="Composição"
            title='Origem da <span class="font-serif-italic">renda</span>'
          />
          <IncomeMix uber99={data.incomeComposition.uber99} extra={data.incomeComposition.extra} />
          <div className="mt-6 border-t border-[var(--line)] pt-4">
            <SectionHeader
              eyebrow="Próximas metas"
              title='Top <span class="font-serif-italic">3</span>'
            />
            {data.topGoals.length === 0 ? (
              <div className="flex items-start gap-3 rounded-[12px] border border-dashed border-[var(--line)] p-4 text-[12.5px] text-[var(--muted)]">
                <Target size={16} className="mt-0.5" />
                <span>Crie sua primeira meta no menu Objetivos.</span>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.topGoals.map((g) => {
                  const p = Math.min(100, (g.saved / g.target) * 100);
                  return (
                    <li key={g.id}>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span>{g.name}</span>
                        <span className="text-[var(--muted)] tabular">
                          {brl(g.saved)} / {brl(g.target)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p}%`,
                            background: g.color ?? "var(--accent)",
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </article>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <article className="rounded-[var(--radius)] border bg-[var(--surface)] p-5 shadow-card">
          <SectionHeader
            eyebrow="Gastos"
            title='Por <span class="font-serif-italic">categoria</span>'
            description="Compare gastos do mês com o orçamento planejado."
          />
          <CategoryBars rows={data.byCategory} />
        </article>

        <article className="space-y-4">
          <div>
            <SectionHeader
              eyebrow="Últimas movimentações"
              title='Atividade <span class="font-serif-italic">recente</span>'
            />
            <RecentTransactions items={data.recentTransactions} />
          </div>

          <aside className="rounded-[var(--radius)] border bg-[var(--accent-soft)] p-5 shadow-card">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface)] text-[var(--accent)]">
                <Sparkles size={16} />
              </span>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--accent-ink)]/80">
                  Insight da semana
                </p>
                <p className="text-[14px] text-foreground">
                  Você economizou{" "}
                  <span className="font-serif-italic">12% a mais</span> em combustível
                  vs. a média de 4 semanas — mantenha o ritmo para alcançar a meta de
                  reserva mais cedo.
                </p>
              </div>
            </div>
          </aside>
        </article>
      </section>
    </div>
  );
}
