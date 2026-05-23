import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: prefs }, { data: categories }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true }),
  ]);

  return (
    <div className="flex min-h-svh w-full">
      <Sidebar
        user={{
          name: profile?.full_name ?? null,
          email: profile?.email ?? user.email ?? "",
        }}
      />
      <div className="min-w-0 flex-1">
        <AppShell
          user={{
            name: profile?.full_name ?? null,
            email: profile?.email ?? user.email ?? "",
          }}
          initialHideAmounts={prefs?.hide_amounts ?? false}
          categories={categories ?? []}
        >
          {children}
        </AppShell>
      </div>
    </div>
  );
}
