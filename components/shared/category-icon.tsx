import { categoryIcons } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Props = {
  icon: keyof typeof categoryIcons | string | null | undefined;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { box: "h-7 w-7", icon: 14 },
  md: { box: "h-9 w-9", icon: 16 },
  lg: { box: "h-11 w-11", icon: 18 },
} as const;

export function CategoryIcon({ icon, color, size = "md", className }: Props) {
  const key = (icon ?? "wallet") as keyof typeof categoryIcons;
  const Icon = categoryIcons[key] ?? categoryIcons.wallet;
  const dims = sizeMap[size];
  const tint = color ?? "var(--accent)";
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-[10px] border border-[var(--line)]",
        dims.box,
        className,
      )}
      style={{
        background: `color-mix(in oklch, ${tint} 14%, var(--surface))`,
        color: tint,
      }}
    >
      <Icon size={dims.icon} strokeWidth={1.75} />
    </span>
  );
}
