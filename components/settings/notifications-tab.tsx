"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { updatePreferences } from "@/lib/actions/preferences";
import type { UserPreferences } from "@/types/database";

type Toggle =
  | "weekly_summary_email"
  | "budget_alerts"
  | "goal_milestones"
  | "ai_insights_email";

const rows: Array<{ key: Toggle; title: string; description: string }> = [
  {
    key: "weekly_summary_email",
    title: "Resumo semanal",
    description: "Toda segunda às 8h: receita, despesas e destaques.",
  },
  {
    key: "budget_alerts",
    title: "Alertas de orçamento",
    description: "Avisar quando uma categoria ultrapassar 90% do plano.",
  },
  {
    key: "goal_milestones",
    title: "Marcos de meta",
    description: "Celebrar quando você atingir 25, 50, 75 e 100%.",
  },
  {
    key: "ai_insights_email",
    title: "Insights por email",
    description: "Receber insights detalhados além do dashboard.",
  },
];

export function NotificationsTab({ prefs }: { prefs: UserPreferences }) {
  const [, start] = useTransition();
  function toggle(key: Toggle, next: boolean) {
    start(async () => {
      const result = await updatePreferences({ [key]: next });
      if (!result.ok) toast.error(result.error);
    });
  }
  return (
    <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-[var(--radius)] border bg-[var(--surface)] shadow-card">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="space-y-0.5">
            <p className="text-[14px]">{row.title}</p>
            <p className="text-[12.5px] text-[var(--muted)]">{row.description}</p>
          </div>
          <Switch
            defaultChecked={prefs[row.key]}
            onCheckedChange={(v) => toggle(row.key, v)}
          />
        </li>
      ))}
    </ul>
  );
}
