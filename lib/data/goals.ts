import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Goal } from "@/types/database";

export async function listGoals(): Promise<Goal[] | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as Goal[];
}
