import type { Metadata } from "next";
import { EventFilters } from "@/components/EventFilters";
import { EventsClientWrapper } from "@/components/EventsClientWrapper";
import { getCityFromAddress } from "@/lib/event-utils";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event } from "@/lib/types";

interface EventsPageProps {
  searchParams: Promise<{
    tag?: string;
    city?: string;
    plz?: string;
    q?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: EventsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = params.city?.trim();
  const plz = params.plz?.trim();

  if (city) {
    return {
      title: `Events in ${city}`,
      description: `Entdecke ganzheitliche Events, Workshops und Retreats in ${city}.`,
      alternates: {
        canonical: `/events/${city.toLowerCase().replace(/\s+/g, "-")}`,
      },
    };
  }

  if (plz) {
    return {
      title: `Events nahe ${plz}`,
      description: `Ganzheitliche Events und Workshops in der Nähe von ${plz}.`,
      alternates: { canonical: `/events/${plz}` },
    };
  }

  return {
    title: "Events",
    description:
      "Entdecke ganzheitliche und spirituelle Events – Tanz, Meditation, Coaching und mehr in deiner Nähe.",
  };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const supabase = getSupabaseServerClient();
  const params = await searchParams;
  const selectedTag = params.tag?.trim() || "";
  const selectedCity = params.city?.trim() || "";
  const selectedPlz = params.plz?.trim() || "";
  const searchQuery = params.q?.trim() || "";

  // Load ALL matching events (client handles radius filtering + display)
  let query = supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true });

  if (selectedTag) {
    query = query.contains("tags", [selectedTag]);
  }

  if (selectedCity) {
    query = query.ilike("address", `%${selectedCity}%`);
  }

  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location_name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`
    );
  }

  const { data, error } = await query;
  let events = (data || []) as Event[];

  // Also find events matching search query by tag (tags are arrays, not searchable via .or())
  if (searchQuery) {
    const tagSearch = searchQuery
      .toLowerCase()
      .replace(/[äÄ]/g, "ae")
      .replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/\s+/g, "-");

    let tagQuery = supabase
      .from("events")
      .select("*, hosts(name, slug)")
      .eq("is_public", true)
      .eq("status", "published")
      .gte("start_at", new Date().toISOString())
      .contains("tags", [tagSearch])
      .order("start_at", { ascending: true });

    if (selectedTag) tagQuery = tagQuery.contains("tags", [selectedTag]);
    if (selectedCity) tagQuery = tagQuery.ilike("address", `%${selectedCity}%`);

    const { data: tagData } = await tagQuery;
    if (tagData && tagData.length > 0) {
      const existingIds = new Set(events.map((e) => e.id));
      const newTagEvents = (tagData as Event[]).filter((e) => !existingIds.has(e.id));
      events = [...events, ...newTagEvents];
      events.sort(
        (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      );
    }
  }

  // Load all distinct tags
  const { data: allEventsData } = await supabase
    .from("events")
    .select("tags")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString());

  const tags = [
    ...new Set(
      (allEventsData || [])
        .flatMap((event: { tags: string[] | null }) => event.tags || [])
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "de"));

  // Load all distinct cities
  const { data: allEventsForCities } = await supabase
    .from("events")
    .select("address")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString());

  const cities = [
    ...new Set(
      (allEventsForCities || [])
        .map((e: { address: string | null }) => getCityFromAddress(e.address))
        .filter(Boolean)
    ),
  ].sort((a, b) => a!.localeCompare(b!, "de")) as string[];

  // Build the hero heading
  const locationLabel = selectedCity || (selectedPlz ? `PLZ ${selectedPlz}` : "");
  const heroTitle = locationLabel
    ? `Events in ${locationLabel}`
    : "Finde dein nächstes Event in der Community";

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-6 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-8">
        <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
          Ganzheitliche Event-Plattform
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          {heroTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Tanz, Meditation, Coaching und spirituelle Formate in deiner Nähe.
        </p>
      </section>

      <EventFilters
        tags={tags}
        cities={cities}
        selectedTag={selectedTag}
        selectedCity={selectedCity}
        searchQuery={searchQuery}
      />

      {error ? (
        <div className="rounded-2xl border border-error-border bg-error-bg p-4 text-sm text-error-text">
          Events konnten gerade nicht geladen werden. Bitte Seite neu laden.
        </div>
      ) : null}

      <EventsClientWrapper
        events={events}
        initialPlz={selectedPlz || undefined}
      />
    </div>
  );
}
