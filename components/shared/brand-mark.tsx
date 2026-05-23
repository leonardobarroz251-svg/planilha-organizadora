import { cn } from "@/lib/utils";

export function BrandMark({
  size = 28,
  className,
  withWordmark = false,
}: {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <span
        aria-hidden
        className="grid place-items-center rounded-[10px] bg-foreground text-background"
        style={{ width: size, height: size }}
      >
        <span
          className="font-serif-italic leading-none"
          style={{ fontSize: size * 0.72, transform: "translateY(-1px)" }}
        >
          c
        </span>
      </span>
      {withWordmark ? (
        <span className="text-[15px] font-medium tracking-tight">Cofre</span>
      ) : null}
    </span>
  );
}
