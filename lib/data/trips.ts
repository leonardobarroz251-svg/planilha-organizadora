import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trip } from "@/types/database";

export type TripItem = {
  id: string;
  trip_id: string;
  kind: string;
  description: string;
  planned_amount: number;
  actual_amount: number | null;
  status: "planned" | "reserved" | "purchased";
  occurred_at: string | null;
};

export async function listTrips(): Promise<Trip[] | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Trip[];
}

export async function getTrip(
  id: string,
): Promise<{ trip: Trip; items: TripItem[] } | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!trip) return null;

  const { data: items } = await supabase
    .from("trip_items")
    .select("*")
    .eq("trip_id", id)
    .order("occurred_at", { ascending: true, nullsFirst: true });

  return { trip: trip as Trip, items: (items ?? []) as TripItem[] };
}
