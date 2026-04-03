import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getCityFromAddress } from "@/lib/event-utils";
import { HostCard } from "@/components/HostCard";
import { HostFilters } from "@/components/HostFilters";
import type { Host } from "@/lib/types";

interface AnbieterPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ searchParams }: AnbieterPageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = params.city?.trim();
  const title = city
    ? `Anbieter:innen in ${city} | Das Portal`
    : "Anbieter:innen | Das Portal";
  return {
    title,
    description:
      "Finde Coaches, Heiler:innen und Facilitators in deiner Nähe. Entdecke Profile, Angebote und bewusste Events auf Das Portal.",
    alternates: { canonical: "/anbieter" },
  };
}

export default async function AnbieterPage({ searchParams }: AnbieterPageProps) {
  const supabase = getSupabaseServerClient();
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const cityFilter = params.city?.trim() || "";
  const sortBy = params.sort?.trim() || "events";

  // Load all hosts
  const { data: hostsRaw } = await supabase
    .from("hosts")
    .select("id, name, slug, description, avatar_url, created_at");

  const allHosts = (hostsRaw || []) as Host[];

  // Load all future public events for counts, tags, cities
  const { data: eventsRaw } = await supabase
    .from("events")
    .select("id, host_id, tags, address")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString());

  type EventSlim = { id: string; host_id: string | null; tags: string[] | null; address: string | null };
  const events = (eventsRaw || []) as EventSlim[];

  // Build per-host data
  const hostMeta = new Map<
    string,
    { count: number; tags: Map<string, number>; cities: Map<string, number> }
  >();
  for (const e of events) {
    if (!e.host_id) continue;
    let meta = hostMeta.get(e.host_id);
    if (!meta) {
      meta = { count: 0, tags: new Map(), cities: new Map() };
      hostMeta.set(e.host_id, meta);
    }
    meta.count++;
    for (const t of e.tags || []) {
      meta.tags.set(t, (meta.tags.get(t) || 0) + 1);
    }
    const city = getCityFromAddress(e.address);
    if (city) meta.cities.set(city, (meta.cities.get(city) || 0) + 1);
  }

  // Derive top tags and primary city per host
  type EnrichedHost = Host & {
    upcomingCount: number;
    topTags: string[];
    primaryCity: string | null;
  };

  let enriched: EnrichedHost[] = allHosts.map((h) => {
    const meta = hostMeta.get(h.id);
    const topTags = meta
      ? [...meta.tags.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tag]) => tag)
      : [];
    const primaryCity = meta
      ? [...meta.cities.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
      : null;
    return { ...h, upcomingCount: meta?.count || 0, topTags, primaryCity };
  });

  // Filters
  if (query) {
    const q = query.toLowerCase();
    enriched = enriched.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.description && h.description.toLowerCase().includes(q))
    );
  }
  if (cityFilter) {
    enriched = enriched.filter((h) => h.primaryCity === cityFilter);
  }

  // Sort
  if (sortBy === "alpha") {
    enriched.sort((a, b) => a.name.localeCompare(b.name, "de"));
  } else if (sortBy === "newest") {
    enriched.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  } else {
    // Default: by event count desc
    enriched.sort((a, b) => b.upcomingCount - a.upcomingCount);
  }

  // All distinct cities for the filter dropdown
  const allCities = [
    ...new Set(enriched.map((h) => h.primaryCity).filter(Boolean)),
  ].sort((a, b) => a!.localeCompare(b!, "de")) as string[];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-6 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-8">
        <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Finde Anbieter:innen in deiner Nähe
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Coaches, Heiler:innen, Yogalehrer:innen und Facilitators —
          entdecke, wer in deiner Region bewusste Erlebnisse anbietet.
        </p>
      </section>

      {/* Filters */}
      <Suspense>
        <HostFilters cities={allCities} />
      </Suspense>

      {/* Host Grid */}
      {enriched.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {enriched.map((h) => (
            <HostCard
              key={h.id}
              host={h}
              upcomingCount={h.upcomingCount}
              topTags={h.topTags}
              primaryCity={h.primaryCity}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-bg-secondary p-8 text-center">
          <p className="text-lg text-text-primary">
            Noch keine Anbieter:innen{cityFilter ? ` in ${cityFilter}` : ""} gefunden?
          </p>
          <p className="mt-2 text-text-secondary">Werde die Erste / der Erste!</p>
          <Link
            href="/fuer-facilitators#registrierung"
            className="mt-4 inline-flex items-center rounded-xl bg-accent-primary px-6 py-3 text-base font-semibold text-white transition hover:brightness-95"
          >
            Jetzt registrieren
          </Link>
        </div>
      )}
    </div>
  );
}
