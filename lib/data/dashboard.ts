import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Transaction } from "@/types/database";

export type DashboardData = {
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
  income30d: number;
  expense30d: number;
  prevMonthBalance: number;
  daily: Array<{ date: string; income: number; expense: number }>;
  byCategory: Array<{ name: string; color: string; spent: number; budget: number }>;
  recentTransactions: Array<Transaction & { category: Pick<Category, "name" | "icon" | "color" | "kind"> | null }>;
  incomeComposition: { uber99: number; extra: number };
  topGoals: Array<{ id: string; name: string; saved: number; target: number; color: string | null }>;
};

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date();
  const monthStart = startOfMonth(today);
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const since30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const since60 = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    { data: txMonth = [] },
    { data: txPrevMonth = [] },
    { data: tx30 = [] },
    { data: categories = [] },
    { data: budgets = [] },
    { data: recent = [] },
    { data: goals = [] },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("occurred_at", dateKey(monthStart)),
    supabase
      .from("transactions")
      .select("amount, occurred_at")
      .eq("user_id", user.id)
      .gte("occurred_at", dateKey(prevMonthStart))
      .lt("occurred_at", dateKey(monthStart)),
    supabase
      .from("transactions")
      .select("amount, occurred_at, category_id")
      .eq("user_id", user.id)
      .gte("occurred_at", dateKey(since60)),
    supabase.from("categories").select("*").eq("user_id", user.id),
    supabase
      .from("budgets")
      .select("category_id, planned_amount")
      .eq("user_id", user.id)
      .eq("month", dateKey(monthStart)),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("goals")
      .select("id, name, saved_amount, target_amount, color")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const txMonthArr = (txMonth ?? []) as Transaction[];
  const txPrevArr = (txPrevMonth ?? []) as Transaction[];
  const tx30Arr = (tx30 ?? []) as Pick<Transaction, "amount" | "occurred_at" | "category_id">[];
  const cats = (categories ?? []) as Category[];
  const budgetMap = new Map<string, number>(
    (budgets ?? []).map((b) => [b.category_id as string, Number(b.planned_amount)]),
  );

  const monthIncome = txMonthArr
    .filter((t) => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthExpense = txMonthArr
    .filter((t) => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
  const prevBalance = txPrevArr.reduce((sum, t) => sum + Number(t.amount), 0);

  // Last 30 days bucketed by date
  const dayMap = new Map<string, { income: number; expense: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    dayMap.set(dateKey(d), { income: 0, expense: 0 });
  }
  let income30 = 0;
  let expense30 = 0;
  for (const t of tx30Arr) {
    if (!t.occurred_at) continue;
    const key = String(t.occurred_at).slice(0, 10);
    const sinceCutoff = dateKey(since30);
    if (key < sinceCutoff) continue;
    const slot = dayMap.get(key);
    if (!slot) continue;
    if (Number(t.amount) > 0) {
      slot.income += Number(t.amount);
      income30 += Number(t.amount);
    } else {
      slot.expense += Math.abs(Number(t.amount));
      expense30 += Math.abs(Number(t.amount));
    }
  }
  const daily = Array.from(dayMap.entries()).map(([date, v]) => ({ date, ...v }));

  // Spent by category (current month) vs budget
  const spentByCat = new Map<string, number>();
  for (const t of txMonthArr) {
    if (!t.category_id) continue;
    if (Number(t.amount) >= 0) continue;
    spentByCat.set(
      t.category_id,
      (spentByCat.get(t.category_id) ?? 0) + Math.abs(Number(t.amount)),
    );
  }
  const byCategory = cats
    .filter((c) => c.kind === "expense")
    .map((c) => ({
      name: c.name,
      color: c.color ?? "var(--accent)",
      spent: spentByCat.get(c.id) ?? 0,
      budget: budgetMap.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.spent - a.spent);

  // Income composition (Uber+99 vs Extra)
  let uber99 = 0;
  let extra = 0;
  for (const t of txMonthArr) {
    if (Number(t.amount) <= 0) continue;
    const merchant = t.merchant.toLowerCase();
    if (merchant.includes("uber") || merchant.includes("99")) uber99 += Number(t.amount);
    else extra += Number(t.amount);
  }

  // Hydrate categories on recent
  const catById = new Map(cats.map((c) => [c.id, c]));
  const recentHydrated = ((recent ?? []) as Transaction[]).map((t) => ({
    ...t,
    category: t.category_id
      ? (() => {
          const c = catById.get(t.category_id);
          if (!c) return null;
          return { name: c.name, icon: c.icon, color: c.color, kind: c.kind };
        })()
      : null,
  }));

  return {
    monthIncome,
    monthExpense,
    monthBalance: monthIncome - monthExpense,
    income30d: income30,
    expense30d: expense30,
    prevMonthBalance: prevBalance,
    daily,
    byCategory,
    recentTransactions: recentHydrated,
    incomeComposition: { uber99, extra },
    topGoals: (goals ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      saved: Number(g.saved_amount),
      target: Number(g.target_amount),
      color: g.color,
    })),
  };
}
