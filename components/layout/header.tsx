"use client";

import { Bell, Eye, EyeOff, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "./mobile-sidebar";
import { CommandPalette } from "./command-palette";
import { navItems } from "@/lib/nav";
import { initials } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  user: { name: string | null; email: string };
  role?: "user" | "admin";
  hideAmounts: boolean;
  onToggleHideAmounts: () => void;
  onNewTransaction: () => void;
};

export function Header({
  user,
  role = "user",
  hideAmounts,
  onToggleHideAmounts,
  onNewTransaction,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const current =
    navItems.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))?.label ??
    "Cofre";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const display = user.name?.trim().length ? user.name : user.email;

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-2 border-b border-[var(--line)] bg-[var(--bg)]/85 px-3 backdrop-blur-md sm:px-5"
      style={{ height: "var(--header-h)" }}
    >
      <MobileSidebar role={role} />

      <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-[12.5px] text-[var(--muted)] sm:flex">
        <span>Workspace</span>
        <span className="text-[var(--line-strong)]">/</span>
        <span className="text-foreground">{current}</span>
      </nav>

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="ml-auto inline-flex h-9 w-full max-w-xs items-center gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 text-left text-[13px] text-[var(--muted)] shadow-card hover:border-[var(--line-strong)] sm:max-w-sm"
      >
        <Search size={15} />
        <span className="flex-1 truncate">Buscar ou navegar…</span>
        <kbd className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] tracking-wider">
          ⌘K
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        aria-label={hideAmounts ? "Mostrar valores" : "Ocultar valores"}
        onClick={onToggleHideAmounts}
      >
        {hideAmounts ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
      <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
        <Bell size={16} />
        <span className="absolute right-2 top-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
      </Button>

      <Button size="sm" className="hidden sm:inline-flex" onClick={onNewTransaction}>
        <Plus size={14} />
        Nova transação
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Conta"
          className="rounded-full ring-offset-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[var(--accent-soft)] text-[12px] text-[var(--accent-ink)]">
              {initials(display)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span className="truncate text-sm">{display}</span>
            <span className="truncate text-[11px] font-normal text-[var(--muted)]">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/configuracoes")}>
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleHideAmounts}>
            {hideAmounts ? "Mostrar valores" : "Ocultar valores"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-[var(--danger)] focus:text-[var(--danger)]">
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNewTransaction={() => {
          setPaletteOpen(false);
          onNewTransaction();
        }}
        onToggleHideAmounts={() => {
          setPaletteOpen(false);
          onToggleHideAmounts();
        }}
      />
    </header>
  );
}
