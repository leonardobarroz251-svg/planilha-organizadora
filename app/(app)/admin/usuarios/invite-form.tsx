"use client";

import { Loader2, UserPlus } from "lucide-react";
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
import { inviteUser } from "./actions";

export function InviteForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [pending, setPending] = useState(false);

  function reset() {
    setEmail("");
    setFullName("");
    setRole("user");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Informe um email");
      return;
    }
    setPending(true);
    const r = await inviteUser({
      email: email.trim(),
      full_name: fullName.trim() || undefined,
      role,
    });
    setPending(false);
    if (r.ok) {
      toast.success(
        role === "admin"
          ? "Admin criado e código enviado por email"
          : "Usuário criado e código enviado por email",
      );
      reset();
      setOpen(false);
    } else {
      toast.error(r.error);
    }
  }

  if (!open) {
    return (
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <UserPlus size={14} /> Cadastrar usuário
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-5 space-y-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] tracking-tight">Cadastrar novo usuário</h2>
          <p className="text-[12.5px] text-[var(--ink-2)]">
            A conta é criada já com o papel escolhido. O usuário recebe um código
            de 8 dígitos por email pra entrar pela primeira vez.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          Cancelar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_160px]">
        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pessoa@email.com"
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-name">Nome (opcional)</Label>
          <Input
            id="invite-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ex: Maria"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Papel</Label>
          <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="gap-2">
          {pending ? (
            <>
              <Loader2 className="animate-spin" size={14} /> Criando…
            </>
          ) : (
            <>
              <UserPlus size={14} /> Cadastrar e enviar código
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
