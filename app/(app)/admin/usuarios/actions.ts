"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SetUserRoleResult = { ok: true } | { ok: false; error: string };

export async function setUserRole(
  targetUserId: string,
  role: "user" | "admin",
): Promise<SetUserRoleResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada" };
  if (user.id === targetUserId) {
    return { ok: false, error: "Você não pode alterar o próprio papel" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
