/**
 * Cofre — variáveis de ambiente.
 * NEXT_PUBLIC_* são inlined pelo Next; o resto é runtime-only.
 * Use getters para que o erro só aconteça no primeiro acesso (build não quebra).
 */

function read(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Defina em .env.local (veja .env.example).`,
    );
  }
  return value;
}

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return read("NEXT_PUBLIC_SUPABASE_URL");
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get NEXT_PUBLIC_SITE_URL() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return read("SUPABASE_SERVICE_ROLE_KEY");
  },
};
