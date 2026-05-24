import {
  ArrowLeftRight,
  Compass,
  LayoutDashboard,
  type LucideIcon,
  Plane,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  comingSoon?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "D" },
  { href: "/transacoes", label: "Transações", icon: ArrowLeftRight, shortcut: "T" },
  { href: "/objetivos", label: "Objetivos", icon: Target, shortcut: "O" },
  { href: "/planejamento", label: "Planejamento", icon: Compass, shortcut: "P" },
  { href: "/viagens", label: "Viagens", icon: Plane, shortcut: "V" },
  { href: "/insights", label: "Insights", icon: Sparkles, shortcut: "I", comingSoon: true },
  { href: "/configuracoes", label: "Configurações", icon: Settings, shortcut: "," },
];
