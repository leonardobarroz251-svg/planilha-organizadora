"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TripSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(120),
  destination: z.string().trim().max(120).nullable().optional(),
  starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  total_budget: z.number().min(0).default(0),
  saved_amount: z.number().min(0).default(0),
  monthly_contribution: z.number().min(0).default(0),
  cover_color: z.string().nullable().optional(),
});

export type TripInput = z.input<typeof TripSchema>;

export async function createTrip(input: TripInput) {
  const parsed = TripSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase.from("trips").insert({
    user_id: user.id,
    name: parsed.data.name,
    destination: parsed.data.destination ?? null,
    starts_on: parsed.data.starts_on ?? null,
    ends_on: parsed.data.ends_on ?? null,
    total_budget: parsed.data.total_budget,
    saved_amount: parsed.data.saved_amount,
    monthly_contribution: parsed.data.monthly_contribution,
    cover_color: parsed.data.cover_color ?? null,
  });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/viagens");
  return { ok: true as const };
}

export async function updateTrip(id: string, input: Partial<TripInput>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase
    .from("trips")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/viagens");
  revalidatePath(`/viagens/${id}`);
  return { ok: true as const };
}

export async function deleteTrip(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase.from("trips").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/viagens");
  return { ok: true as const };
}

const ItemSchema = z.object({
  trip_id: z.string().uuid(),
  kind: z.string().trim().min(1).max(40),
  description: z.string().trim().min(1, "Descreva o item").max(160),
  planned_amount: z.number().min(0).default(0),
  actual_amount: z.number().min(0).nullable().optional(),
  status: z.enum(["planned", "reserved", "purchased"]).default("planned"),
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export type TripItemInput = z.input<typeof ItemSchema>;

export async function createTripItem(input: TripItemInput) {
  const parsed = ItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  // garante que a trip é do usuário (via RLS por parent)
  const { error } = await supabase.from("trip_items").insert({
    trip_id: parsed.data.trip_id,
    kind: parsed.data.kind,
    description: parsed.data.description,
    planned_amount: parsed.data.planned_amount,
    actual_amount: parsed.data.actual_amount ?? null,
    status: parsed.data.status,
    occurred_at: parsed.data.occurred_at ?? null,
  });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath(`/viagens/${parsed.data.trip_id}`);
  return { ok: true as const };
}

export async function deleteTripItem(id: string, tripId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado" };

  const { error } = await supabase.from("trip_items").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath(`/viagens/${tripId}`);
  return { ok: true as const };
}
