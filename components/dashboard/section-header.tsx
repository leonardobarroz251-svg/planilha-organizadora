import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "between";
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, action, align = "between", className }: Props) {
  return (
    <div className={cn("mb-3 flex flex-wrap items-end gap-3", align === "between" && "justify-between", className)}>
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">{eyebrow}</p>
        ) : null}
        <h2 className="text-xl tracking-tight">
          <span dangerouslySetInnerHTML={{ __html: title }} />
        </h2>
        {description ? (
          <p className="max-w-prose text-[13px] text-[var(--ink-2)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
