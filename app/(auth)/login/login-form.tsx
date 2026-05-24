"use client";

import { ArrowRight, Loader2, Mail, MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const emailSchema = z.email("Digite um e-mail válido").trim();
const codeSchema = z
  .string()
  .regex(/^\d{6}$/, "Digite os 6 dígitos do código");

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
    const errParam = searchParams.get("error");
    if (errParam) toast.error(errParam);
  }, [searchParams]);

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
      setError(parsed.error.issues[0]?.message ?? "E-mail inválido");
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
      const message =
        err instanceof Error ? err.message : "Falha ao enviar o código";
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
      const message =
        err instanceof Error ? err.message : "Código inválido ou expirado";
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
      const message =
        err instanceof Error ? err.message : "Falha ao reenviar";
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

  function handleSocial(provider: "google" | "apple") {
    toast.message(`Login com ${provider === "google" ? "Google" : "Apple"}`, {
      description: "Em breve — estamos finalizando a integração.",
    });
  }

  if (step === "code") {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)]/60 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <MailCheck size={18} strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-[14px] text-foreground">
              Código enviado para{" "}
              <span className="font-medium">{email}</span>.
            </p>
            <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
              Digite os 6 dígitos abaixo — o código expira em 10 minutos.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmitCode} className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="code"
              className="text-[12px] text-[var(--ink-2)]"
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
              className="h-12 rounded-xl border-[var(--line)] bg-[var(--surface)]/40 text-center text-xl font-medium tracking-[0.6em] tabular placeholder:text-[var(--muted)]/60"
            />
            {error ? (
              <p className="text-[12px] text-[var(--danger)]">{error}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={status === "verifying" || code.length !== 6}
            className="h-11 w-full gap-2 rounded-xl bg-foreground px-4 text-[14px] font-medium text-background hover:bg-foreground/90"
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Verificando…
              </>
            ) : (
              <>
                Entrar
                <ArrowRight size={16} strokeWidth={2.2} />
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-between text-[12.5px] text-[var(--muted)]">
          <button
            type="button"
            onClick={onChangeEmail}
            className="underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--ink-2)]"
          >
            Usar outro e-mail
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={cooldown > 0 || status !== "idle"}
            className="underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--ink-2)] disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmitEmail} className="space-y-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-[12px] text-[var(--ink-2)]"
          >
            E-mail
          </Label>
          <div className="relative">
            <Mail
              size={15}
              strokeWidth={2}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <Input
              id="email"
              type="email"
              autoFocus
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={!!error}
              className="h-11 rounded-xl border-[var(--line)] bg-[var(--surface)]/40 pl-10 text-[14px] placeholder:text-[var(--muted)]/80"
            />
          </div>
          {error ? (
            <p className="text-[12px] text-[var(--danger)]">{error}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={status === "sending"}
          className="h-11 w-full gap-2 rounded-xl bg-foreground px-4 text-[14px] font-medium text-background hover:bg-foreground/90"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Enviando código…
            </>
          ) : (
            <>
              Continuar com e-mail
              <ArrowRight size={16} strokeWidth={2.2} />
            </>
          )}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--line)]" />
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
          Ou continue com
        </span>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          onClick={() => handleSocial("google")}
          className="h-11 gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)]/40 px-3 text-[13.5px] font-medium text-foreground hover:bg-[var(--surface)]"
        >
          <GoogleIcon />
          Google
        </Button>
        <Button
          type="button"
          onClick={() => handleSocial("apple")}
          className="h-11 gap-2 rounded-xl bg-white px-3 text-[13.5px] font-medium text-black hover:bg-white/90"
        >
          <AppleIcon />
          Apple
        </Button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
