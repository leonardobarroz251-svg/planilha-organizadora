"use client";

import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const emailSchema = z.string().trim().email("Digite um email válido");
const codeSchema = z.string().regex(/^\d{6}$/, "Digite os 6 dígitos do código");

type Step = "email" | "code";
type Status = "idle" | "sending" | "verifying";

const RESEND_COOLDOWN_SEC = 30;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") ?? "/dashboard";

  const [step, setStep] = useState<Step>("email");
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeInputRef.current?.focus();
  }, [step]);

  async function sendCode(target: string) {
    const supabase = createSupabaseBrowserClient();
    const { error: sbError } = await supabase.auth.signInWithOtp({
      email: target,
      options: { shouldCreateUser: true },
    });
    if (sbError) throw sbError;
  }

  async function onSubmitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email inválido");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      await sendCode(parsed.data);
      setStep("code");
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      console.error("[login] sendCode", err);
      const message = err instanceof Error ? err.message : "Falha ao enviar o código";
      toast.error(message);
    } finally {
      setStatus("idle");
    }
  }

  async function onSubmitCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Código inválido");
      return;
    }
    setError(null);
    setStatus("verifying");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: sbError } = await supabase.auth.verifyOtp({
        email,
        token: parsed.data,
        type: "email",
      });
      if (sbError) throw sbError;
      router.refresh();
      router.replace(redirectTarget);
    } catch (err) {
      console.error("[login] verifyOtp", err);
      const message = err instanceof Error ? err.message : "Código inválido ou expirado";
      toast.error(message);
      setCode("");
      setStatus("idle");
      codeInputRef.current?.focus();
    }
  }

  async function onResend() {
    if (cooldown > 0 || status !== "idle") return;
    setStatus("sending");
    try {
      await sendCode(email);
      setCooldown(RESEND_COOLDOWN_SEC);
      toast.success("Enviamos um novo código");
    } catch (err) {
      console.error("[login] resend", err);
      const message = err instanceof Error ? err.message : "Falha ao reenviar";
      toast.error(message);
    } finally {
      setStatus("idle");
    }
  }

  function onChangeEmail() {
    setStep("email");
    setCode("");
    setError(null);
    setCooldown(0);
  }

  if (step === "email") {
    return (
      <form onSubmit={onSubmitEmail} className="space-y-3">
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
              if (error) setError(null);
            }}
            aria-invalid={!!error}
            className="h-11"
          />
          {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
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
              Enviar código
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitCode} className="space-y-4">
      <div className="flex items-start gap-3 rounded-[var(--radius)] border bg-[var(--surface)] p-4 shadow-card">
        <span className="mt-0.5 inline-grid h-8 w-8 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <MailCheck size={16} />
        </span>
        <div className="space-y-1 text-sm">
          <p className="font-medium">Código enviado</p>
          <p className="text-[var(--ink-2)]">
            Digite os 6 dígitos enviados para{" "}
            <span className="text-foreground">{email}</span>. O código expira em 10
            minutos.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="code"
          className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]"
        >
          Código de verificação
        </Label>
        <Input
          ref={codeInputRef}
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(next);
            if (error) setError(null);
          }}
          aria-invalid={!!error}
          className="h-12 text-center text-xl font-medium tracking-[0.6em] tabular"
        />
        {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full"
        disabled={status === "verifying" || code.length !== 6}
      >
        {status === "verifying" ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Verificando…
          </>
        ) : (
          <>
            Entrar
            <ArrowRight size={16} />
          </>
        )}
      </Button>

      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <button
          type="button"
          onClick={onChangeEmail}
          className="underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-foreground"
        >
          Usar outro email
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || status !== "idle"}
          className="underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
        </button>
      </div>
    </form>
  );
}
