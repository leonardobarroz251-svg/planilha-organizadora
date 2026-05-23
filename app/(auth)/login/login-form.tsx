"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const emailSchema = z.string().trim().email("Digite um email válido");

type Status = "idle" | "sending" | "sent";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email inválido");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;
      const { error: sbError } = await supabase.auth.signInWithOtp({
        email: parsed.data,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (sbError) throw sbError;
      setStatus("sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao enviar o link";
      toast.error(message);
      setStatus("idle");
    }
  }

  async function onGoogle() {
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;
      const { error: sbError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (sbError) throw sbError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao iniciar OAuth";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-[var(--radius)] border bg-[var(--surface)] p-5 shadow-card"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-grid h-8 w-8 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <CheckCircle2 size={16} />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium">Link enviado</p>
                <p className="text-sm text-[var(--ink-2)]">
                  Verifique <span className="text-foreground">{email}</span> — o link
                  expira em 10 minutos.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              className="mt-4 -ml-2"
            >
              Usar outro email
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={onSubmit}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
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
                  if (error) setError(null);
                }}
                aria-invalid={!!error}
                className="h-11"
              />
              {error ? (
                <p className="text-xs text-[var(--danger)]">{error}</p>
              ) : null}
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full"
              disabled={status === "sending"}
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Enviando…
                </>
              ) : (
                <>
                  Enviar link mágico
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          ou
        </span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <Button type="button" variant="outline" size="lg" className="h-11 w-full" onClick={onGoogle}>
        <GoogleMark />
        Continuar com Google
      </Button>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.61z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.92v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.05l3.05-2.33z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .92 4.95l3.05 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
