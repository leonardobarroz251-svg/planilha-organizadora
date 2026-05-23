import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "@/components/settings/account-tab";
import { AppearanceTab } from "@/components/settings/appearance-tab";
import { IntegrationsTab } from "@/components/settings/integrations-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { PrivacyTab } from "@/components/settings/privacy-tab";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, city, created_at, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
  ]);

  if (!profile || !prefs) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-sm text-[var(--muted)]">
        Não foi possível carregar suas configurações. Tente recarregar a página.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-7 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Cofre · ajustes
        </p>
        <h1 className="text-3xl tracking-tight">
          Suas <span className="font-serif-italic">configurações</span>
        </h1>
      </header>

      <Tabs defaultValue="account">
        <TabsList className="mb-6 h-auto w-full justify-start gap-1 overflow-x-auto rounded-[12px] border bg-[var(--surface-2)] p-1">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab profile={profile} />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab prefs={prefs} />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacyTab prefs={prefs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
