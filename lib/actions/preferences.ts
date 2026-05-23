"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accents, densities, themes } from "@/lib/theme";

const PreferencesSchema = z.object({
  theme: z.enum(themes).optional(),
  accent: z.enum(accents).optional(),
  density: z.enum(densities).optional(),
  hide_amounts: z.boolean().optional(),
  weekly_summary_email: z.boolean().optional(),
  budget_alerts: z.boolean().optional(),
  goal_milestones: z.boolean().optional(),
  ai_insights_email: z.boolean().optional(),
  pin_lock: z.boolean().optional(),
  local_ai: z.boolean().optional(),
});

export async function updatePreferences(
  input: z.infer<typeof PreferencesSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = PreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Preferências inválidas" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: user.id, ...parsed.data, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

const ProfileSchema = z.object({
  full_name: z.string().trim().min(1).max(80).optional(),
  city: z.string().trim().max(80).nullable().optional(),
});

export async function updateProfile(input: z.infer<typeof ProfileSchema>) {
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Dados inválidos" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/configuracoes");
  return { ok: true as const };
}
