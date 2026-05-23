"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/preferences";
import type { Profile } from "@/types/database";

type Props = { profile: Pick<Profile, "id" | "email" | "full_name" | "city" | "created_at"> };

export function AccountTab({ profile }: Props) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfile({
        full_name: fullName.trim(),
        city: city.trim().length ? city.trim() : null,
      });
      if (result.ok) toast.success("Perfil atualizado");
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="ex: São Paulo, SP"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Membro desde</Label>
          <Input
            value={new Date(profile.created_at).toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
            disabled
            className="capitalize"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" size={14} /> : null}
          {pending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
