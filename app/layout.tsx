import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeBootstrap } from "@/components/theme/theme-bootstrap";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { type Accent, type Density, type Theme, themeCookieName } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cofre — Planejamento financeiro pessoal",
    template: "%s · Cofre",
  },
  description:
    "Organize sua vida financeira com clareza editorial. Dashboard, transações, planejamento e metas — tudo em um cofre só.",
  applicationName: "Cofre",
  authors: [{ name: "Cofre" }],
  metadataBase: new URL("https://cofre.app"),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a22" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const stored = cookieStore.get(themeCookieName)?.value;
  let initialTheme: Theme = "light";
  let initialAccent: Accent = "sage";
  let initialDensity: Density = "comfortable";
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<{
        theme: Theme;
        accent: Accent;
        density: Density;
      }>;
      if (parsed.theme) initialTheme = parsed.theme;
      if (parsed.accent) initialAccent = parsed.accent;
      if (parsed.density) initialDensity = parsed.density;
    } catch {
      /* ignore malformed cookie */
    }
  }

  return (
    <html
      lang="pt-BR"
      data-theme={initialTheme}
      data-accent={initialAccent}
      data-density={initialDensity}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <ThemeBootstrap />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider
          initialTheme={initialTheme}
          initialAccent={initialAccent}
          initialDensity={initialDensity}
        >
          <TooltipProvider delay={120}>{children}</TooltipProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
