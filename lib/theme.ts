export const themes = ["light", "dark", "sepia"] as const;
export const accents = ["sage", "clay", "cobalt", "plum"] as const;
export const densities = ["compact", "comfortable"] as const;

export type Theme = (typeof themes)[number];
export type Accent = (typeof accents)[number];
export type Density = (typeof densities)[number];

export const themeCookieName = "cofre-theme";

export type ThemePreferences = {
  theme: Theme;
  accent: Accent;
  density: Density;
};

export const defaultThemePreferences: ThemePreferences = {
  theme: "light",
  accent: "sage",
  density: "comfortable",
};

export const accentLabels: Record<Accent, string> = {
  sage: "Sálvia",
  clay: "Argila",
  cobalt: "Cobalto",
  plum: "Ameixa",
};

export const themeLabels: Record<Theme, string> = {
  light: "Claro",
  dark: "Escuro",
  sepia: "Sépia",
};

export const densityLabels: Record<Density, string> = {
  compact: "Compacto",
  comfortable: "Confortável",
};
