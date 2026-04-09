import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase";
import { LocationCard } from "@/components/LocationCard";
import type { Location } from "@/lib/types";

export const metadata: Metadata = {
  title: "Orte",
  description:
    "Entdecke besondere Orte für ganzheitliche Events – Studios, Retreat-Zentren, Seminarräume und mehr.",
};

interface LocationsPageProps {
  searchParams: Promise<{
    type?: string;
    region?: string;
    q?: string;
  }>;
}

export default async function LocationsPage({ searchParams }: LocationsPageProps) {
  const supabase = getSupabaseServerClient();
  const params = await searchParams;

  let query = supabase
    .from("locations")
    .select("*")
    .order("event_count", { ascending: false });

  // Filter by type
  if (params.type) {
    query = query.eq("type", params.type);
  }

  // Filter by region
  if (params.region) {
    query = query.eq("region", params.region);
  }

  // Search
  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,city.ilike.%${params.q}%,address.ilike.%${params.q}%`
    );
  }

  const { data, error } = await query.limit(60);
  const locations = (data || []) as Location[];

  // Get unique regions for filter
  const { data: regionData } = await supabase
    .from("locations")
    .select("region")
    .not("region", "is", null)
    .order("region");

  const regions = [...new Set((regionData || []).map((r) => r.region as string))];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <section>
        <h1 className="font-serif text-3xl font-semibold text-text-primary sm:text-4xl">
          Orte entdecken
        </h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Studios, Retreat-Zentren, Seminarräume und besondere Orte für ganzheitliche Events.
          Finde den passenden Raum für deine Praxis.
        </p>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-2">
        <FilterLink href="/locations" label="Alle" active={!params.type && !params.region} />
        <FilterLink
          href="/locations?type=venue"
          label="Veranstaltungsorte"
          active={params.type === "venue"}
        />
        <FilterLink
          href="/locations?type=retreat_center"
          label="Retreat-Zentren"
          active={params.type === "retreat_center"}
        />
        <FilterLink
          href="/locations?type=outdoor"
          label="Outdoor"
          active={params.type === "outdoor"}
        />
        <FilterLink
          href="/locations?type=online"
          label="Online"
          active={params.type === "online"}
        />

        {regions.length > 0 ? (
          <>
            <span className="self-center text-text-muted">|</span>
            {regions.map((r) => (
              <FilterLink
                key={r}
                href={`/locations?region=${encodeURIComponent(r)}`}
                label={r}
                active={params.region === r}
              />
            ))}
          </>
        ) : null}
      </section>

      {/* Error */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Orte konnten nicht geladen werden.
        </div>
      ) : null}

      {/* Results */}
      {!error && locations.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-card p-8 text-text-secondary">
          Keine Orte gefunden.
        </div>
      ) : null}

      {locations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      ) : null}

      {/* Count */}
      {locations.length > 0 ? (
        <p className="text-center text-sm text-text-muted">
          {locations.length} {locations.length === 1 ? "Ort" : "Orte"} gefunden
        </p>
      ) : null}
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-accent-primary text-white"
          : "border border-border bg-bg-card text-text-secondary hover:bg-bg-secondary"
      }`}
    >
      {label}
    </a>
  );
}
