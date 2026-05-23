"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAppShell } from "@/components/layout/app-shell-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

type Props = {
  categories: Category[];
  initialSearch: string;
  initialCategory: string | null;
};

export function FiltersBar({ categories, initialSearch, initialCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { openNewTransaction } = useAppShell();
  const [searchKey, setSearchKey] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  if (initialSearch !== searchKey) {
    setSearchKey(initialSearch);
    setSearch(initialSearch);
  }

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value && value.length > 0) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateParam("q", search.trim() || null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={onSearchSubmit} className="relative min-w-[220px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por estabelecimento…"
            className="h-10 pl-9"
          />
        </form>
        <Button onClick={openNewTransaction} className="h-10">
          <Plus size={14} />
          Nova
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          href={pathname + buildQuery(params, { cat: null })}
          active={initialCategory == null}
        >
          Todas
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            href={pathname + buildQuery(params, { cat: c.slug })}
            active={initialCategory === c.slug}
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: c.color ?? "var(--accent)" }}
            />
            {c.name}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
        active
          ? "border-[var(--ink)] bg-foreground text-background"
          : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--line-strong)]",
      )}
    >
      {children}
    </Link>
  );
}

function buildQuery(
  current: URLSearchParams,
  patch: Record<string, string | null>,
) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value == null) next.delete(key);
    else next.set(key, value);
  }
  const s = next.toString();
  return s ? `?${s}` : "";
}
