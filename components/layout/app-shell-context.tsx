"use client";

import { createContext, useContext } from "react";

export type AppShellContextValue = {
  hideAmounts: boolean;
  toggleHideAmounts: () => void;
  openNewTransaction: () => void;
};

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell precisa estar dentro de <AppShell>");
  return ctx;
}
