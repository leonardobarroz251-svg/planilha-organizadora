"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Digite um email válido"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
});

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "email" | "password" | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) throw error;
      router.refresh();
      router.replace(redirectTarget);
    } catch (err) {
      console.error("[login] signInWithPassword", err);
      const message =
        err instanceof Error ? err.message : "Email ou senha inválidos";
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoFocus
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          aria-invalid={!!errors.email}
          className="h-11"
        />
        {errors.email ? (
          <p className="text-xs text-[var(--danger)]">{errors.email}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]"
        >
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password)
              setErrors((p) => ({ ...p, password: undefined }));
          }}
          aria-invalid={!!errors.password}
          className="h-11"
        />
        {errors.password ? (
          <p className="text-xs text-[var(--danger)]">{errors.password}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Entrando…
          </>
        ) : (
          <>
            Entrar
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </form>
  );
}
