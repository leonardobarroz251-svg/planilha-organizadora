"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TransactionSchema = z.object({
  merchant: z.string().trim().min(1, "Informe um estabelecimento").max(120),
  amount: z
    .number()
    .refine((n) => Number.isFinite(n) && n !== 0, { message: "Informe um valor" }),
  kind: z.enum(["income", "expense"]),
  category_id: z.string().uuid().nullable(),
  subcategory_id: z.string().uuid().nullable().optional(),
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  is_recurring: z.boolean().optional().default(false),
  notes: z.string().max(400).optional().nullable(),
});

export type TransactionInput = z.input<typeof TransactionSchema>;

export async function createTransaction(input: TransactionInput) {
  const parsed = TransactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Transação inválida",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { data: account } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const signedAmount =
    parsed.data.kind === "income"
      ? Math.abs(parsed.data.amount)
      : -Math.abs(parsed.data.amount);

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    account_id: account?.id ?? null,
    merchant: parsed.data.merchant,
    amount: signedAmount,
    category_id: parsed.data.category_id,
    subcategory_id: parsed.data.subcategory_id ?? null,
    occurred_at: parsed.data.occurred_at,
    is_recurring: parsed.data.is_recurring ?? false,
    notes: parsed.data.notes ?? null,
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function deleteTransaction(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
