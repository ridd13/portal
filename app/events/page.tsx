import type { Metadata } from "next";
import Link from "next/link";
import { EventFilters } from "@/components/EventFilters";
import { EventsClientWrapper } from "@/components/EventsClientWrapper";
import { getCityFromAddress } from "@/lib/event-utils";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Category, Event, EventFormat } from "@/lib/types";

interface EventsPageProps {
  searchParams: Promise<{
    tag?: string;
    kategorie?: string;
    city?: string;
    plz?: string;
    q?: string;
    from?: string;
    to?: string;
    format?: string;
    online?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: EventsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = params.city?.trim();
  const plz = params.plz?.trim();
  const fmt = params.format?.trim();

  const formatLabel = fmt === "retreat" ? "Retreats" : fmt === "workshop" ? "Workshops" : null;

  if (city) {
    return {
      title: formatLabel ? `${formatLabel} in ${city}` : `Events in ${city}`,
      description: `Entdecke ganzheitliche ${formatLabel || "Events, Workshops und Retreats"} in ${city}.`,
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
    title: formatLabel || "Events",
    description:
      "Entdecke ganzheitliche und spirituelle Events – Tanz, Meditation, Coaching und mehr in deiner Nähe.",
  };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const supabase = getSupabaseServerClient();
  const params = await searchParams;
  // Support both legacy "tag" and new "kategorie" param
  const selectedCategory = params.kategorie?.trim() || "";
  const selectedTag = params.tag?.trim() || "";
  const selectedCity = params.city?.trim() || "";
  const selectedPlz = params.plz?.trim() || "";
  const searchQuery = params.q?.trim() || "";
  const fromDate = params.from?.trim() || "";
  const toDate = params.to?.trim() || "";
  const selectedFormat = (params.format?.trim() || "") as EventFormat | "";
  const showOnline = params.online === "true";

  const startFrom = fromDate
    ? new Date(fromDate + "T00:00:00").toISOString()
    : new Date().toISOString();

  let query = supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", startFrom)
    .order("start_at", { ascending: true });

  if (toDate) {
    query = query.lte("start_at", new Date(toDate + "T23:59:59").toISOString());
  }

  // Default: hide online events unless toggle is on
  if (!showOnline) {
    query = query.eq("is_online", false);
  }

  // Format filter
  if (selectedFormat) {
    query = query.eq("event_format", selectedFormat);
  }

  // Category filter: find event IDs via event_categories junction
  if (selectedCategory) {
    const { data: catEvents } = await supabase
      .from("event_categories")
      .select("event_id, categories!inner(slug)")
      .eq("categories.slug", selectedCategory);

    const eventIds = (catEvents || []).map((row: { event_id: string }) => row.event_id);
    if (eventIds.length > 0) {
      query = query.in("id", eventIds);
    } else {
      // No events match this category — return empty
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    }
  }

  // Legacy tag filter (backwards compatibility)
  if (selectedTag && !selectedCategory) {
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

  // Also find events matching search query by tag
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
      .gte("start_at", startFrom)
      .contains("tags", [tagSearch])
      .order("start_at", { ascending: true });

    if (toDate) {
      tagQuery = tagQuery.lte("start_at", new Date(toDate + "T23:59:59").toISOString());
    }
    if (!showOnline) tagQuery = tagQuery.eq("is_online", false);
    if (selectedFormat) tagQuery = tagQuery.eq("event_format", selectedFormat);
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

  // Deduplicate events with same title + start_at (keep newest by created_at)
  {
    const seen = new Map<string, Event>();
    for (const event of events) {
      const key = `${event.title}__${event.start_at}`;
      const existing = seen.get(key);
      if (!existing || (event.created_at && existing.created_at && event.created_at > existing.created_at)) {
        seen.set(key, event);
      }
    }
    events = [...seen.values()].sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );
  }

  // Load categories from DB
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories = (categoriesData || []) as Category[];

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
  const formatLabel = selectedFormat
    ? { event: "Events", workshop: "Workshops", retreat: "Retreats", kurs: "Kurse", festival: "Festivals", kreis: "Kreise" }[selectedFormat]
    : null;
  const categoryLabel = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name_de
    : null;

  let heroTitle = "Finde dein nächstes Event in der Community";
  if (locationLabel && formatLabel) {
    heroTitle = `${formatLabel} in ${locationLabel}`;
  } else if (locationLabel && categoryLabel) {
    heroTitle = `${categoryLabel} in ${locationLabel}`;
  } else if (locationLabel) {
    heroTitle = `Events in ${locationLabel}`;
  } else if (formatLabel && categoryLabel) {
    heroTitle = `${categoryLabel}-${formatLabel}`;
  } else if (formatLabel) {
    heroTitle = formatLabel;
  } else if (categoryLabel) {
    heroTitle = categoryLabel;
  }

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
        categories={categories}
        cities={cities}
        selectedCategory={selectedCategory || selectedTag}
        selectedCity={selectedCity}
        searchQuery={searchQuery}
        selectedFromDate={fromDate}
        selectedToDate={toDate}
        selectedFormat={selectedFormat}
        showOnline={showOnline}
      />

      {error ? (
        <div className="rounded-2xl border border-error-border bg-error-bg p-4 text-sm text-error-text">
          Events konnten gerade nicht geladen werden. Bitte Seite neu laden.
        </div>
      ) : null}

      <section className="flex flex-wrap gap-3">
        <Link
          href="/events?kategorie=kakaozeremonie&city=Hamburg"
          className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
        >
          Kakaozeremonie Hamburg
        </Link>
        <Link
          href="/events?format=retreat"
          className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
        >
          Retreats
        </Link>
        <Link
          href="/events?kategorie=yoga&city=Hamburg"
          className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
        >
          Yoga Hamburg
        </Link>
        <Link
          href="/events?kategorie=meditation"
          className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
        >
          Meditation
        </Link>
        <Link
          href="/events?kategorie=tantra"
          className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
        >
          Tantra
        </Link>
        <Link
          href="/events?kategorie=tanz"
          className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
        >
          Tanz
        </Link>
        <Link
          href="/events?format=workshop"
          className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
        >
          Workshops
        </Link>
      </section>

      <EventsClientWrapper
        events={events}
        initialPlz={selectedPlz || undefined}
        selectedTag={selectedTag}
        selectedCity={selectedCity}
        searchQuery={searchQuery}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
}
