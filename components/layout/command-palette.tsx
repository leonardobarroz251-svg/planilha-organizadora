"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  Eye,
  FileText,
  Plus,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { navItems } from "@/lib/nav";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewTransaction: () => void;
  onToggleHideAmounts: () => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  onNewTransaction,
  onToggleHideAmounts,
}: Props) {
  const router = useRouter();

  function go(href: string) {
    router.push(href);
    onOpenChange(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Buscar" description="Buscar ou navegar">
      <CommandInput placeholder="Buscar ações, telas, transações…" />
      <CommandList>
        <CommandEmpty>Nada por aqui.</CommandEmpty>
        <CommandGroup heading="Ações">
          <CommandItem onSelect={onNewTransaction}>
            <Plus size={14} />
            <span>Nova transação</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onToggleHideAmounts}>
            <Eye size={14} />
            <span>Alternar visibilidade de valores</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/transacoes")}>
            <ArrowDownToLine size={14} />
            <span>Importar extrato</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard")}>
            <FileText size={14} />
            <span>Relatório do mês</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard")}>
            <Sparkles size={14} />
            <span>Perguntar ao Cofre (IA)</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navegação">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                disabled={item.comingSoon}
                onSelect={() => !item.comingSoon && go(item.href)}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Atalhos">
          <CommandItem onSelect={() => go("/transacoes")}>
            <ArrowLeftRight size={14} />
            <span>Ver últimas transações</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
