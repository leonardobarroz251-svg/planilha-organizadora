"use client";

import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  hidden?: boolean;
  signed?: boolean;
  className?: string;
};

export function MaskAmount({ value, hidden = false, signed = false, className }: Props) {
  return (
    <span className={cn("tabular", className)}>
      {hidden ? "•••••" : brl(value, { signed })}
    </span>
  );
}
