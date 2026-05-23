import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Transaction } from "@/types/database";

export type TransactionRow = Transaction & {
  category: Pick<Category, "name" | "icon" | "color" | "kind"> | null;
};

export async function listTransactions(opts: {
  search?: string;
  categorySlug?: string | null;
  limit?: number;
}): Promise<{ items: TransactionRow[]; categories: Category[] } | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const limit = Math.min(opts.limit ?? 200, 500);

  const { data: categories = [] } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });
  const cats = (categories ?? []) as Category[];

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.search && opts.search.trim().length > 0) {
    const term = opts.search.trim().replace(/[%_]/g, "");
    query = query.ilike("merchant", `%${term}%`);
  }
  if (opts.categorySlug) {
    const cat = cats.find((c) => c.slug === opts.categorySlug);
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) return { items: [], categories: cats };

  const catById = new Map(cats.map((c) => [c.id, c]));
  const items = (data ?? []).map((t) => {
    const txn = t as Transaction;
    return {
      ...txn,
      category: txn.category_id
        ? (() => {
            const c = catById.get(txn.category_id);
            if (!c) return null;
            return { name: c.name, icon: c.icon, color: c.color, kind: c.kind };
          })()
        : null,
    } satisfies TransactionRow;
  });

  return { items, categories: cats };
}
