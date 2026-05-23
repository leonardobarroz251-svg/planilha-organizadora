"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type NavItem, navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Props = {
  onItemClick?: () => void;
  role?: "user" | "admin";
};

const adminItem: NavItem = {
  href: "/admin/usuarios",
  label: "Administração",
  icon: ShieldCheck,
};

export function SidebarNav({ onItemClick, role = "user" }: Props) {
  const pathname = usePathname();
  const items: NavItem[] = role === "admin" ? [...navItems, adminItem] : navItems;
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
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
