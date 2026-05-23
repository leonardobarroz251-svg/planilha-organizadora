import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { BrandMark } from "@/components/shared/brand-mark";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-svh grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Painel editorial */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--surface-2)] px-12 py-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(60% 50% at 25% 25%, color-mix(in oklch, var(--accent) 30%, transparent), transparent), radial-gradient(40% 40% at 80% 80%, color-mix(in oklch, var(--info) 22%, transparent), transparent)",
          }}
        />
        <div className="relative">
          <BrandMark size={32} withWordmark />
        </div>
        <div className="relative max-w-[36ch] space-y-7">
          <h1 className="text-5xl leading-[1.05] tracking-[-0.02em]">
            <span className="block text-foreground/70">um cofre para a sua</span>
            <span className="font-serif-italic text-foreground">vida financeira</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
            Organize receitas, planeje o mês e acompanhe metas com clareza
            editorial — sem planilhas dispersas, sem ruído visual.
          </p>
          <dl className="grid grid-cols-2 gap-6 pt-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Em planejamento
              </dt>
              <dd className="mt-1 text-2xl tabular tracking-tight">R$ 412,8M</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Motoristas ativos
              </dt>
              <dd className="mt-1 text-2xl tabular tracking-tight">+18 mil</dd>
            </div>
          </dl>
        </div>
        <p className="relative text-xs text-[var(--muted)]">
          Cofre Tecnologia Financeira · CNPJ 00.000.000/0001-00
        </p>
      </aside>

      {/* Formulário */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm space-y-8">
          <header className="space-y-2 lg:hidden">
            <BrandMark size={28} withWordmark />
          </header>
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Entrar
            </p>
            <h2 className="text-2xl tracking-tight">
              Acesse seu <span className="font-serif-italic">Cofre</span>
            </h2>
            <p className="text-sm text-[var(--ink-2)]">
              Enviamos um código de 6 dígitos para o seu email — sem senhas para esquecer.
            </p>
          </header>
          <Suspense fallback={<div className="h-[260px]" />}>
            <LoginForm />
          </Suspense>
          <p className="text-center text-[11px] leading-relaxed text-[var(--muted)]">
            Ao continuar você concorda com os{" "}
            <a className="underline decoration-[var(--line-strong)] underline-offset-4" href="#">
              Termos
            </a>{" "}
            e a{" "}
            <a className="underline decoration-[var(--line-strong)] underline-offset-4" href="#">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
