import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // RSC contexts can't set cookies — quietly ignore; proxy refreshes them.
      }
    },
  };
  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: cookieMethods,
  });
}
