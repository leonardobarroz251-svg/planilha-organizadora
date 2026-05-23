"use client";

import { Check } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { updatePreferences } from "@/lib/actions/preferences";
import {
  accentLabels,
  accents,
  type Accent,
  densities,
  densityLabels,
  type Density,
  themeLabels,
  themes,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AppearanceTab() {
  const { theme, accent, density, setTheme, setAccent, setDensity } = useTheme();

  function chooseTheme(value: Theme) {
    setTheme(value);
    void updatePreferences({ theme: value });
  }
  function chooseAccent(value: Accent) {
    setAccent(value);
    void updatePreferences({ accent: value });
  }
  function chooseDensity(value: Density) {
    setDensity(value);
    void updatePreferences({ density: value });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <header>
          <h3 className="text-[15px]">Tema</h3>
          <p className="text-[12.5px] text-[var(--muted)]">
            A interface respeita o seu humor. Sépia evoca o conforto de uma página impressa.
          </p>
        </header>
        <div className="grid grid-cols-3 gap-2 sm:max-w-md">
          {themes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => chooseTheme(t)}
              className={cn(
                "relative overflow-hidden rounded-[12px] border bg-[var(--surface)] p-3 text-left transition-colors",
                theme === t ? "border-[var(--ink)] shadow-card" : "border-[var(--line)] hover:border-[var(--line-strong)]",
              )}
            >
              <ThemeSwatch theme={t} />
              <p className="mt-2 text-[12.5px]">{themeLabels[t]}</p>
              {theme === t ? (
                <span className="absolute right-2 top-2 inline-grid h-5 w-5 place-items-center rounded-full bg-foreground text-background">
                  <Check size={11} />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <header>
          <h3 className="text-[15px]">Cor de destaque</h3>
          <p className="text-[12.5px] text-[var(--muted)]">
            Define gráficos, botões primários e marcações de meta.
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          {accents.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => chooseAccent(a)}
              data-accent={a}
              className={cn(
                "group flex items-center gap-2 rounded-full border bg-[var(--surface)] px-3 py-1.5 text-[12.5px] transition-colors",
                accent === a
                  ? "border-[var(--ink)] text-foreground"
                  : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--line-strong)]",
              )}
            >
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              {accentLabels[a]}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <header>
          <h3 className="text-[15px]">Densidade</h3>
          <p className="text-[12.5px] text-[var(--muted)]">
            Ajusta o espaçamento das listas e tabelas.
          </p>
        </header>
        <div className="flex gap-2">
          {densities.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => chooseDensity(d)}
              className={cn(
                "rounded-full border bg-[var(--surface)] px-4 py-1.5 text-[12.5px] transition-colors",
                density === d
                  ? "border-[var(--ink)] text-foreground"
                  : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--line-strong)]",
              )}
            >
              {densityLabels[d]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ThemeSwatch({ theme }: { theme: Theme }) {
  const palettes: Record<Theme, { bg: string; surface: string; ink: string; accent: string }> = {
    light: { bg: "oklch(0.985 0.004 85)", surface: "#fff", ink: "oklch(0.18 0.01 270)", accent: "oklch(0.58 0.12 150)" },
    dark: { bg: "oklch(0.18 0.005 270)", surface: "oklch(0.24 0.006 270)", ink: "oklch(0.96 0.005 90)", accent: "oklch(0.78 0.14 150)" },
    sepia: { bg: "oklch(0.94 0.025 75)", surface: "oklch(0.98 0.02 78)", ink: "oklch(0.26 0.02 60)", accent: "oklch(0.6 0.14 40)" },
  };
  const p = palettes[theme];
  return (
    <div
      className="aspect-[16/10] w-full overflow-hidden rounded-[8px] border border-[var(--line)]"
      style={{ background: p.bg }}
    >
      <div className="flex h-full">
        <div className="w-7" style={{ background: p.surface, borderRight: `1px solid ${p.bg}` }} />
        <div className="flex-1 p-2">
          <div className="h-1.5 w-8 rounded-full" style={{ background: p.ink, opacity: 0.7 }} />
          <div className="mt-1.5 h-1 w-12 rounded-full" style={{ background: p.ink, opacity: 0.3 }} />
          <div
            className="mt-2 h-3 w-10 rounded-[4px]"
            style={{ background: p.accent }}
          />
        </div>
      </div>
    </div>
  );
}
