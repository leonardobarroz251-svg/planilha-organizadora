"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type Accent,
  type Density,
  type Theme,
  type ThemePreferences,
  themeCookieName,
} from "@/lib/theme";

type ThemeContextValue = ThemePreferences & {
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setDensity: (density: Density) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function writeCookie(prefs: ThemePreferences) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(prefs));
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${themeCookieName}=${value}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}

export function ThemeProvider({
  initialTheme,
  initialAccent,
  initialDensity,
  children,
}: {
  initialTheme: Theme;
  initialAccent: Accent;
  initialDensity: Density;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [accent, setAccentState] = useState<Accent>(initialAccent);
  const [density, setDensityState] = useState<Density>(initialDensity);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    html.setAttribute("data-accent", accent);
    html.setAttribute("data-density", density);
    writeCookie({ theme, accent, density });
  }, [theme, accent, density]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const setAccent = useCallback((next: Accent) => setAccentState(next), []);
  const setDensity = useCallback((next: Density) => setDensityState(next), []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, accent, density, setTheme, setAccent, setDensity }),
    [theme, accent, density, setTheme, setAccent, setDensity],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}
