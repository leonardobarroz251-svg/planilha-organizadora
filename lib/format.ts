const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export function brl(value: number, options?: { signed?: boolean }) {
  if (!Number.isFinite(value)) return "—";
  const formatted = brlFormatter.format(Math.abs(value));
  if (options?.signed) {
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `−${formatted}`;
  }
  return value < 0 ? `−${formatted}` : formatted;
}

export function brlCompact(value: number) {
  return compactFormatter.format(value);
}

export function pct(value: number, fractionDigits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(fractionDigits).replace(".", ",")}%`;
}

export function dateBR(input: Date | string | number) {
  const d = input instanceof Date ? input : new Date(input);
  return dateFormatter.format(d);
}

export function longDateBR(input: Date | string | number) {
  const d = input instanceof Date ? input : new Date(input);
  return longDateFormatter.format(d);
}

export function monthBR(input: Date | string | number) {
  const d = input instanceof Date ? input : new Date(input);
  return monthFormatter.format(d);
}

export function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function mask(value: number | string, hidden: boolean) {
  if (!hidden) return typeof value === "number" ? brl(value) : value;
  return "••••••";
}
