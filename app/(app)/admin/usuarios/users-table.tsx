"use client";

import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";
import { setUserRole } from "./actions";

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  created_at: string;
};

type Props = {
  users: AdminUserRow[];
  currentUserId: string;
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function UsersTable({ users, currentUserId }: Props) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            <th className="px-4 py-3 text-left font-normal">Usuário</th>
            <th className="hidden px-4 py-3 text-left font-normal sm:table-cell">Email</th>
            <th className="px-4 py-3 text-left font-normal">Papel</th>
            <th className="hidden px-4 py-3 text-left font-normal md:table-cell">
              Entrou em
            </th>
            <th className="px-4 py-3 text-right font-normal">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <Row key={u.id} user={u} isSelf={u.id === currentUserId} />
          ))}
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">
                Nenhum usuário encontrado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function Row({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const display = user.full_name?.trim().length ? user.full_name : user.email;
  const isAdmin = user.role === "admin";

  function onToggle() {
    const nextRole: "user" | "admin" = isAdmin ? "user" : "admin";
    startTransition(async () => {
      const result = await setUserRole(user.id, nextRole);
      if (result.ok) {
        toast.success(
          nextRole === "admin" ? "Usuário promovido a admin" : "Usuário rebaixado",
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <tr className="border-b border-[var(--line)] last:border-b-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[var(--accent-soft)] text-[11px] text-[var(--accent-ink)]">
              {initials(display)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[13.5px]">{display}</div>
            <div className="truncate text-[11px] text-[var(--muted)] sm:hidden">
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 text-[var(--ink-2)] sm:table-cell">{user.email}</td>
      <td className="px-4 py-3">
        {isAdmin ? (
          <Badge
            variant="outline"
            className="border-[var(--accent)] text-[var(--accent-ink)]"
          >
            <ShieldCheck size={10} />
            Admin
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[var(--ink-2)]">
            Usuário
          </Badge>
        )}
      </td>
      <td className="hidden px-4 py-3 text-[var(--ink-2)] md:table-cell">
        {dateFmt.format(new Date(user.created_at))}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          type="button"
          variant={isAdmin ? "outline" : "default"}
          size="sm"
          disabled={isSelf || pending}
          onClick={onToggle}
          title={isSelf ? "Você não pode alterar o próprio papel" : undefined}
        >
          {pending ? (
            <Loader2 className="animate-spin" size={14} />
          ) : isAdmin ? (
            <>
              <ShieldOff size={14} />
              Rebaixar
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              Promover
            </>
          )}
        </Button>
      </td>
    </tr>
  );
}
