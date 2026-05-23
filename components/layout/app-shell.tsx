"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShellContext, type AppShellContextValue } from "./app-shell-context";
import { Header } from "./header";
import { NewTransactionSheet } from "@/components/transactions/new-transaction-sheet";
import { updatePreferences } from "@/lib/actions/preferences";
import type { Category } from "@/types/database";

type Props = {
  user: { name: string | null; email: string };
  initialHideAmounts: boolean;
  categories: Category[];
  children: React.ReactNode;
};

export function AppShell({ user, initialHideAmounts, categories, children }: Props) {
  const [hideAmounts, setHideAmounts] = useState(initialHideAmounts);
  const [newTxOpen, setNewTxOpen] = useState(false);
  const router = useRouter();

  const toggleHideAmounts = useCallback(() => {
    setHideAmounts((prev) => {
      const next = !prev;
      void updatePreferences({ hide_amounts: next });
      return next;
    });
  }, []);

  const openNewTransaction = useCallback(() => setNewTxOpen(true), []);

  const value = useMemo<AppShellContextValue>(
    () => ({ hideAmounts, toggleHideAmounts, openNewTransaction }),
    [hideAmounts, toggleHideAmounts, openNewTransaction],
  );

  function handleSheetChange(open: boolean) {
    setNewTxOpen(open);
    if (!open) router.refresh();
  }

  return (
    <AppShellContext.Provider value={value}>
      <div className="flex min-h-svh flex-col">
        <Header
          user={user}
          hideAmounts={hideAmounts}
          onToggleHideAmounts={toggleHideAmounts}
          onNewTransaction={openNewTransaction}
        />
        <main className="flex-1 animate-view-enter">{children}</main>
      </div>
      <NewTransactionSheet
        open={newTxOpen}
        onOpenChange={handleSheetChange}
        categories={categories}
      />
    </AppShellContext.Provider>
  );
}
