import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Budget, Category } from "@/types/database";

export type BudgetRow = {
  category: Category;
  planned: number;
  spent: number;
  budget_id: string | null;
};

export type BudgetsResult = {
  month: string;
  rows: BudgetRow[];
  totalPlanned: number;
  totalSpent: number;
};

function firstOfMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function lastOfMonth(date: Date): string {
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const last = new Date(next.getTime() - 86_400_000);
  const y = last.getFullYear();
  const m = String(last.getMonth() + 1).padStart(2, "0");
  const d = String(last.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getBudgets(monthISO?: string): Promise<BudgetsResult | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const refDate = monthISO ? new Date(`${monthISO}T00:00:00`) : new Date();
  const start = firstOfMonth(refDate);
  const end = lastOfMonth(refDate);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("kind", "expense")
    .order("position", { ascending: true });
  const cats = (categories ?? []) as Category[];

  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", start);
  const buds = (budgets ?? []) as Budget[];
  const budByCat = new Map(buds.map((b) => [b.category_id, b]));

  const { data: txs } = await supabase
    .from("transactions")
    .select("category_id, amount")
    .eq("user_id", user.id)
    .gte("occurred_at", start)
    .lte("occurred_at", end);

  const spentByCat = new Map<string, number>();
  for (const t of (txs ?? []) as { category_id: string | null; amount: number }[]) {
    if (!t.category_id) continue;
    if (t.amount >= 0) continue; // ignora receitas
    spentByCat.set(t.category_id, (spentByCat.get(t.category_id) ?? 0) + Math.abs(Number(t.amount)));
  }

  const rows: BudgetRow[] = cats.map((c) => {
    const b = budByCat.get(c.id);
    return {
      category: c,
      planned: b ? Number(b.planned_amount) : 0,
      spent: spentByCat.get(c.id) ?? 0,
      budget_id: b?.id ?? null,
    };
  });

  const totalPlanned = rows.reduce((s, r) => s + r.planned, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);

  return { month: start, rows, totalPlanned, totalSpent };
}
