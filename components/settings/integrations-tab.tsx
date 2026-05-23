import { CheckCircle2, Plug, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type Bank = {
  name: string;
  provider: string;
  status: "synced" | "error" | "off";
};

const banks: Bank[] = [
  { name: "Nubank", provider: "nubank", status: "synced" },
  { name: "Banco Inter", provider: "inter", status: "synced" },
  { name: "Banco do Brasil", provider: "bb", status: "error" },
  { name: "XP Investimentos", provider: "xp", status: "off" },
];

const statusMeta: Record<Bank["status"], { label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  synced: { label: "Sincronizado", color: "var(--accent)", icon: CheckCircle2 },
  error: { label: "Falha na sincronização", color: "var(--danger)", icon: TriangleAlert },
  off: { label: "Desativado", color: "var(--muted)", icon: Plug },
};

export function IntegrationsTab() {
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-[var(--ink-2)]">
        Conexões via Open Finance ficarão disponíveis em breve. Por enquanto, importe
        extratos manualmente em <span className="italic">Configurações → Conta → Exportar/Importar</span>.
      </p>
      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-[var(--radius)] border bg-[var(--surface)] shadow-card">
        {banks.map((b) => {
          const meta = statusMeta[b.status];
          const Icon = meta.icon;
          return (
            <li key={b.provider} className="flex items-center gap-4 px-4 py-4">
              <span
                className="inline-grid h-10 w-10 place-items-center rounded-[12px] border border-[var(--line)] bg-[var(--surface-2)] text-[14px] font-medium"
                aria-hidden
              >
                {b.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px]">{b.name}</p>
                <p className="flex items-center gap-1.5 text-[12px]" style={{ color: meta.color }}>
                  <Icon size={12} />
                  {meta.label}
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                {b.status === "off" ? "Conectar" : "Gerenciar"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
