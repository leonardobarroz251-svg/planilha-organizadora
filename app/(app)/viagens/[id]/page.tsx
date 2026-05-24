import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TripDetail } from "@/components/trips/trip-detail";
import { getTrip } from "@/lib/data/trips";

export const metadata: Metadata = { title: "Viagem" };

export default async function ViagemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getTrip(id);
  if (result === null) {
    redirect("/login");
  }
  if (!result) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
      <Link
        href="/viagens"
        className="mb-5 inline-flex items-center gap-1 text-[12.5px] text-[var(--muted)] transition-colors hover:text-foreground"
      >
        <ChevronLeft size={14} /> Voltar pra viagens
      </Link>
      <TripDetail trip={result.trip} items={result.items} />
    </div>
  );
}
