"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Schema = z.object({
  category_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, "Mês inválido (use YYYY-MM-01)"),
  planned_amount: z.number().min(0, "Valor inválido"),
});

export type UpsertBudgetInput = z.input<typeof Schema>;

export async function upsertBudget(input: UpsertBudgetInput) {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      category_id: parsed.data.category_id,
      month: parsed.data.month,
      planned_amount: parsed.data.planned_amount,
    },
    { onConflict: "user_id,category_id,month" },
  );

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/planejamento");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
