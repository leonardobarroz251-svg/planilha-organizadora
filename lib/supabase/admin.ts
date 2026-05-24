import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase com service_role — ignora RLS.
 * Use APENAS em server actions/server components, nunca exporte para o client.
 * Reservado a operações administrativas (convidar usuário, listar todos).
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
