"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function ensureAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { ok: false, error: "Apenas administradores podem executar esta ação" };
  }
  return { ok: true, userId: user.id };
}

export async function setUserRole(
  targetUserId: string,
  role: "user" | "admin",
): Promise<ActionResult> {
  const auth = await ensureAdmin();
  if (!auth.ok) return auth;
  if (auth.userId === targetUserId) {
    return { ok: false, error: "Você não pode alterar o próprio papel" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

const InviteSchema = z.object({
  email: z.email("Email inválido").trim().toLowerCase(),
  role: z.enum(["user", "admin"]),
  full_name: z.string().trim().max(120).optional(),
});

export type InviteInput = z.input<typeof InviteSchema>;

export async function inviteUser(input: InviteInput): Promise<ActionResult> {
  const auth = await ensureAdmin();
  if (!auth.ok) return auth;

  const parsed = InviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const admin = createSupabaseAdminClient();
  const meta: Record<string, string> = { role: parsed.data.role };
  if (parsed.data.full_name?.length) {
    meta.full_name = parsed.data.full_name;
  }

  const { error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    email_confirm: true,
    user_metadata: meta,
  });

  if (createError) {
    const msg = createError.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return { ok: false, error: "Já existe um usuário com este email" };
    }
    return { ok: false, error: createError.message };
  }

  // dispara OTP pra esse email — o usuário vai entrar pelo /login normalmente
  const supabase = await createSupabaseServerClient();
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false },
  });
  // se o OTP falhar (rate limit, etc), o user já foi criado — admin pode reenviar depois
  if (otpError) {
    console.warn("[inviteUser] OTP send failed:", otpError.message);
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
