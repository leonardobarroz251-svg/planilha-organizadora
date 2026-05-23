"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const disabled = item.comingSoon;
        const Icon = item.icon;
        const content = (
          <span
            className={cn(
              "group flex h-9 items-center gap-3 rounded-[10px] px-2.5 text-[13.5px] transition-colors",
              active
                ? "bg-[var(--surface)] text-foreground shadow-card border border-[var(--line)]"
                : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-foreground",
              disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
            )}
          >
            <Icon size={16} strokeWidth={1.75} />
            <span className="flex-1 truncate">{item.label}</span>
            {item.shortcut ? (
              <kbd className="hidden text-[10px] uppercase tracking-wider text-[var(--muted)] sm:inline">
                {item.shortcut}
              </kbd>
            ) : null}
          </span>
        );
        if (disabled) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={<span aria-disabled />}>{content}</TooltipTrigger>
              <TooltipContent side="right">Em breve</TooltipContent>
            </Tooltip>
          );
        }
        return (
          <Link key={item.href} href={item.href} onClick={onItemClick}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
