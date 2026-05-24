import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InviteForm } from "./invite-form";
import { type AdminUserRow, UsersTable } from "./users-table";

export const metadata: Metadata = { title: "Administração · Usuários" };

export default async function AdminUsuariosPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const users = (data ?? []) as AdminUserRow[];
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-7 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Cofre · administração
        </p>
        <h1 className="text-3xl tracking-tight">
          Gestão de <span className="font-serif-italic">usuários</span>
        </h1>
        <p className="text-sm text-[var(--ink-2)]">
          {users.length} {users.length === 1 ? "conta" : "contas"} · {adminCount}{" "}
          {adminCount === 1 ? "admin" : "admins"}
        </p>
      </header>

      <InviteForm />

      {error ? (
        <div className="rounded-[var(--radius)] border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]">
          Não foi possível carregar os usuários: {error.message}
        </div>
      ) : (
        <UsersTable users={users} currentUserId={user.id} />
      )}
    </div>
  );
}
