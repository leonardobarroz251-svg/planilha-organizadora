import { ArrowDownToLine, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrandMark } from "@/components/shared/brand-mark";
import { SidebarNav } from "./sidebar-nav";
import { initials } from "@/lib/format";

type Props = {
  user: { name: string | null; email: string };
};

export function Sidebar({ user }: Props) {
  const display = user.name?.trim().length ? user.name : user.email;
  return (
    <aside className="hidden h-svh w-[var(--sidebar-w)] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface-2)] lg:flex">
      <div className="px-5 pt-5 pb-3">
        <Link href="/dashboard" className="inline-flex">
          <BrandMark size={26} withWordmark />
        </Link>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-2 text-left shadow-card hover:border-[var(--line-strong)]"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-[var(--accent-soft)] text-[11px] text-[var(--accent-ink)]">
              {initials(display)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[12.5px]">{display}</div>
            <div className="truncate text-[11px] text-[var(--muted)]">conta pessoal</div>
          </div>
        </button>
      </div>

      <SidebarNav />

      <div className="mt-auto space-y-3 px-3 pb-5">
        <p className="px-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Atalhos
        </p>
        <div className="space-y-0.5">
          <SidebarShortcut icon={<Plus size={14} strokeWidth={1.75} />} label="Nova transação" />
          <SidebarShortcut icon={<ArrowDownToLine size={14} strokeWidth={1.75} />} label="Importar extrato" />
          <SidebarShortcut icon={<FileText size={14} strokeWidth={1.75} />} label="Relatório do mês" />
        </div>
        <div className="mx-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-card">
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span className="uppercase tracking-[0.12em]">Plano Pro</span>
            <span>22 dias</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: "68%" }} />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-[var(--ink-2)]">
            68% do ciclo restante
          </p>
        </div>
      </div>
    </aside>
  );
}

function SidebarShortcut({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[12.5px] text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-foreground"
    >
      <span className="text-[var(--muted)]">{icon}</span>
      {label}
    </button>
  );
}
