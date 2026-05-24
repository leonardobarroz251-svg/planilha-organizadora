import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LifeBuoy, TrendingUp } from "lucide-react";
import { LoginForm } from "./login-form";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/shared/brand-mark";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-svh grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* ===== Painel editorial ===== */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--line)] bg-[var(--bg)] px-10 py-8 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(55% 45% at 18% 18%, color-mix(in oklch, var(--accent) 22%, transparent) 0%, transparent 70%), radial-gradient(40% 38% at 8% 85%, color-mix(in oklch, var(--accent) 14%, transparent) 0%, transparent 75%)",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <BrandMark size={30} />
          <span className="text-[15px] font-medium tracking-tight text-foreground">
            Cofre
          </span>
          <span className="text-[var(--line-strong)]">/</span>
          <span className="text-[13px] text-[var(--muted)]">pessoal</span>
        </div>

        <div className="relative max-w-[46ch] space-y-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
            Manifesto
          </p>
          <h1
            className="text-[clamp(2.4rem,3.6vw,3.25rem)] leading-[1.04] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Dinheiro{" "}
            <span className="font-serif-italic text-[var(--accent)]">
              organizado
            </span>{" "}
            é dinheiro{" "}
            <span className="font-serif-italic text-[var(--accent)]">
              multiplicado
            </span>
            <span className="text-foreground/80">.</span>
          </h1>
          <p className="max-w-[44ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Cofre é uma plataforma de planejamento financeiro pessoal feita para
            quem dirige por app — controle seu fluxo de caixa, simule objetivos
            com juros reais e planeje viagens sem improviso.
          </p>

          <div className="max-w-[360px] rounded-2xl border border-[var(--line)] bg-[var(--surface)]/70 p-5 backdrop-blur-[2px] shadow-card">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                <TrendingUp size={14} strokeWidth={2.2} />
              </span>
              <span className="text-[12.5px] text-[var(--ink-2)]">
                Patrimônio dos clientes em maio
              </span>
            </div>
            <div className="mt-3">
              <p
                className="tabular text-[30px] leading-none tracking-[-0.02em] text-foreground"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                R$ 412,8M
              </p>
              <p className="mt-1.5 text-[12px] text-[var(--accent)]">
                +11,2% no mês
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2.5 border-t border-[var(--line)] pt-3.5">
              <div className="flex -space-x-1.5">
                {[
                  "oklch(0.7 0.16 40)",
                  "oklch(0.78 0.08 75)",
                  "oklch(0.6 0.12 30)",
                  "oklch(0.62 0.13 150)",
                ].map((c, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="size-5 rounded-full border-2 border-[var(--surface)]"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span className="text-[12px] text-[var(--muted)]">
                +18 mil pessoas planejando com o Cofre
              </span>
            </div>
          </div>
        </div>

        <p className="relative text-[11px] text-[var(--muted)]">
          Feito em São Paulo · v1.0
        </p>
      </aside>

      {/* ===== Formulário ===== */}
      <section className="relative flex min-h-svh flex-col bg-[var(--bg)] px-5 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] text-[var(--muted)]">
            Novo por aqui?{" "}
            <Link
              href="#email"
              className="text-foreground underline decoration-[var(--line-strong)] underline-offset-[5px] transition-colors hover:decoration-[var(--accent)]"
            >
              Crie sua conta
            </Link>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border-[var(--line)] bg-transparent px-3 text-[12.5px] text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-foreground"
            render={
              <a
                href="mailto:suporte@cofre.app"
                aria-label="Falar com o suporte"
              />
            }
          >
            <LifeBuoy size={14} strokeWidth={2} />
            Suporte
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px] space-y-7">
            <header className="space-y-3 lg:hidden">
              <BrandMark size={28} withWordmark />
            </header>
            <header className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                Bem-vindo de volta
              </p>
              <h2
                className="text-[clamp(2rem,3vw,2.6rem)] leading-[1.06] tracking-[-0.02em] text-foreground"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Entre no{" "}
                <span className="font-serif-italic">seu Cofre</span>
                <span className="text-foreground/80">.</span>
              </h2>
              <p className="text-[14px] leading-relaxed text-[var(--ink-2)]">
                Enviamos um código de 6 dígitos para o seu e-mail. Sem senhas,
                sem fricção.
              </p>
            </header>

            <Suspense fallback={<div className="h-[180px]" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <footer className="flex flex-col-reverse items-center justify-between gap-3 text-[11px] text-[var(--muted)] sm:flex-row">
          <span>© 2026 Cofre · CNPJ 47.291.054/0001-22</span>
          <nav className="flex items-center gap-5">
            <a
              href="#"
              className="transition-colors hover:text-[var(--ink-2)]"
            >
              Termos
            </a>
            <a
              href="#"
              className="transition-colors hover:text-[var(--ink-2)]"
            >
              Privacidade
            </a>
            <span>pt-BR</span>
          </nav>
        </footer>
      </section>
    </main>
  );
}
