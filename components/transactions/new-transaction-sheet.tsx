"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { createTransaction } from "@/lib/actions/transactions";
import type { Category } from "@/types/database";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export function NewTransactionSheet({ open, onOpenChange, categories }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nova transação</SheetTitle>
          <SheetDescription>
            Registre uma receita ou despesa. Você ainda pode editar depois.
          </SheetDescription>
        </SheetHeader>
        {/* key={open} ensures form state resets on each open. */}
        <NewTransactionForm
          key={String(open)}
          categories={categories}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function NewTransactionForm({
  categories,
  onDone,
}: {
  categories: Category[];
  onDone: () => void;
}) {
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  const visibleCategories = categories.filter((c) => c.kind === kind);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setPending(true);
    const result = await createTransaction({
      merchant,
      amount: parsedAmount,
      kind,
      category_id: categoryId.length ? categoryId : null,
      occurred_at: date,
      is_recurring: recurring,
      notes: notes.trim().length ? notes : null,
    });
    setPending(false);
    if (result.ok) {
      toast.success("Transação adicionada");
      onDone();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-5 px-4 pb-4">
      <div className="flex rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] p-1 text-sm">
        <button
          type="button"
          className={`flex-1 rounded-[8px] py-1.5 transition-colors ${
            kind === "expense" ? "bg-[var(--surface)] shadow-card" : "text-[var(--muted)]"
          }`}
          onClick={() => setKind("expense")}
        >
          Despesa
        </button>
        <button
          type="button"
          className={`flex-1 rounded-[8px] py-1.5 transition-colors ${
            kind === "income" ? "bg-[var(--surface)] shadow-card" : "text-[var(--muted)]"
          }`}
          onClick={() => setKind("income")}
        >
          Receita
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="merchant">Estabelecimento</Label>
        <Input
          id="merchant"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="ex: Posto Shell, Uber, Mercado…"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="tabular"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Categoria</Label>
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {visibleCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observação (opcional)</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotação curta"
        />
      </div>

      <label className="flex items-center justify-between rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
        <div className="space-y-0.5">
          <p className="text-sm">Recorrente</p>
          <p className="text-[12px] text-[var(--muted)]">Repetir todo mês</p>
        </div>
        <Switch checked={recurring} onCheckedChange={setRecurring} />
      </label>

      <div className="mt-auto flex gap-2 pt-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" size={14} /> : null}
          {pending ? "Salvando…" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
