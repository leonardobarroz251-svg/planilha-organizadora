"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { updatePreferences } from "@/lib/actions/preferences";
import type { UserPreferences } from "@/types/database";

type Toggle = "hide_amounts" | "pin_lock" | "local_ai";

const rows: Array<{ key: Toggle; title: string; description: string }> = [
  {
    key: "hide_amounts",
    title: "Ocultar valores ao abrir",
    description: "Esconde valores até você clicar no ícone de olho.",
  },
  {
    key: "pin_lock",
    title: "Proteger com PIN",
    description: "Solicitar um PIN sempre que abrir o app.",
  },
  {
    key: "local_ai",
    title: "Processamento de IA local",
    description: "Insights gerados no seu dispositivo, sem enviar dados.",
  },
];

export function PrivacyTab({ prefs }: { prefs: UserPreferences }) {
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
