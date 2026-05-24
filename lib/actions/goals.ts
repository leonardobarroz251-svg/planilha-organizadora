"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const GoalSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do objetivo").max(120),
  target_amount: z.number().positive("Informe a meta total"),
  saved_amount: z.number().min(0).default(0),
  monthly_contribution: z.number().min(0).default(0),
  interest_rate: z.number().min(0).max(100).default(0),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .nullable()
    .optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export type GoalInput = z.input<typeof GoalSchema>;

export async function createGoal(input: GoalInput) {
  const parsed = GoalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name: parsed.data.name,
    target_amount: parsed.data.target_amount,
    saved_amount: parsed.data.saved_amount,
    monthly_contribution: parsed.data.monthly_contribution,
    interest_rate: parsed.data.interest_rate,
    deadline: parsed.data.deadline ?? null,
    color: parsed.data.color ?? null,
    icon: parsed.data.icon ?? null,
  });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/objetivos");
  return { ok: true as const };
}

export async function updateGoal(id: string, input: Partial<GoalInput>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase
    .from("goals")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/objetivos");
  return { ok: true as const };
}

export async function deleteGoal(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/objetivos");
  return { ok: true as const };
}

export async function addContribution(id: string, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false as const, error: "Valor inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { data: goal, error: fetchErr } = await supabase
    .from("goals")
    .select("saved_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (fetchErr || !goal) return { ok: false as const, error: "Objetivo não encontrado" };

  const next = Number(goal.saved_amount ?? 0) + amount;
  const { error } = await supabase
    .from("goals")
    .update({ saved_amount: next })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/objetivos");
  return { ok: true as const };
}
