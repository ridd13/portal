import type { Metadata } from "next";
import Link from "next/link";
import { EventFilters } from "@/components/EventFilters";
import { EventsClientWrapper } from "@/components/EventsClientWrapper";
import { deduplicateEvents, getCityFromAddress, matchCity } from "@/lib/event-utils";
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
  const kategorie = params.kategorie?.trim();

  const formatLabel = fmt === "retreat" ? "Retreats" : fmt === "workshop" ? "Workshops" : null;

  // Build canonical URL keeping only SEO-valuable params.
  // Strip ephemeral params (from, to, q, online, plz) that generate
  // near-infinite URL variants without unique indexable content.
  const canonicalParts = new URLSearchParams();
  if (city) canonicalParts.set("city", city);
  if (fmt) canonicalParts.set("format", fmt);
  if (kategorie) canonicalParts.set("kategorie", kategorie);
  const canonical = `/events${canonicalParts.toString() ? `?${canonicalParts.toString()}` : ""}`;

  if (city) {
    return {
      title: formatLabel ? `${formatLabel} in ${city}` : `Events in ${city}`,
      description: `Ganzheitliche ${formatLabel || "Events, Workshops und Retreats"} in ${city} — aktuelle Termine auf Das Portal.`,
      alternates: { canonical },
    };
  }

  if (plz) {
    return {
      title: `Events nahe ${plz}`,
      description: `Ganzheitliche Events und Workshops in der Nähe von ${plz}.`,
      alternates: { canonical },
    };
  }

  return {
    title: formatLabel || "Events",
    description:
      "Ganzheitliche und spirituelle Events — Tanz, Meditation, Coaching und mehr in deiner Nähe.",
    alternates: { canonical },
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

  // Base column select — omits description_sections, source_type, source_message_id,
  // end_at, host_id, is_public, status, ticket_link, location_id, capacity,
  // waitlist_enabled, registration_enabled. Detail page fetches the full row.
  const BASE_SELECT =
    "id, slug, title, description, start_at, cover_image_url, " +
    "location_name, address, geo_lat, geo_lng, " +
    "event_format, tags, is_online, price_model, price_amount, created_at";

  // Category filter: look up event IDs before building the main query so the
  // same IDs can be reused in a fallback query if needed.
  let categoryEventIds: string[] | undefined;
  if (selectedCategory) {
    const { data: catEvents } = await supabase
      .from("event_categories")
      .select("event_id, categories!inner(slug)")
      .eq("categories.slug", selectedCategory);
    categoryEventIds = (catEvents || []).map((row: { event_id: string }) => row.event_id);
  }

  // Query builder — accepts the hosts sub-select so we can fall back to a
  // version without is_featured if the column migration hasn't been applied yet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildQuery = (hostsSelect: string): any => {
    let q = supabase
      .from("events")
      .select(`${BASE_SELECT}, ${hostsSelect}`)
      .eq("is_public", true)
      .eq("status", "published")
      .gte("start_at", startFrom)
      .order("start_at", { ascending: true })
      .limit(300);

    if (toDate) {
      q = q.lte("start_at", new Date(toDate + "T23:59:59").toISOString());
    }
    if (!showOnline) q = q.eq("is_online", false);
    if (selectedFormat) q = q.eq("event_format", selectedFormat);

    if (categoryEventIds !== undefined) {
      if (categoryEventIds.length > 0) {
        q = q.in("id", categoryEventIds);
      } else {
        q = q.eq("id", "00000000-0000-0000-0000-000000000000");
      }
    } else if (selectedTag) {
      q = q.contains("tags", [selectedTag]);
    }

    if (selectedCity) q = q.ilike("address", `%${selectedCity}%`);
    if (searchQuery) {
      q = q.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location_name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`
      );
    }

    return q;
  };

  // Try with is_featured; if it fails (e.g. migration pending), fall back to
  // hosts(name, slug) so events are still visible without featured sorting.
  let activeHostsSelect = "hosts(name, slug, is_featured)";
  let { data, error } = await buildQuery(activeHostsSelect);

  if (error) {
    console.error("[events/page] Primary query failed (code=%s): %s", error.code, error.message);
    activeHostsSelect = "hosts(name, slug)";
    const { data: fallbackData, error: fallbackError } = await buildQuery(activeHostsSelect);
    if (!fallbackError) {
      data = fallbackData;
      error = null;
    } else {
      console.error("[events/page] Fallback query also failed: %s", fallbackError.message);
    }
  }

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
      .select(`${BASE_SELECT}, ${activeHostsSelect}`)
      .eq("is_public", true)
      .eq("status", "published")
      .gte("start_at", startFrom)
      .contains("tags", [tagSearch])
      .order("start_at", { ascending: true })
      .limit(100);

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
  events = deduplicateEvents(events);

  // Truncate descriptions for list view — card renders line-clamp-3 (~150 chars).
  // Full text is fetched by the detail page via its own query.
  events = events.map((e) => ({
    ...e,
    description: e.description ? e.description.slice(0, 300) : null,
  }));

  // Load categories from DB
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories = (categoriesData || []) as Category[];

  // Load all distinct cities (from ALL events, not just published — for broader city coverage)
  const { data: allEventsForCities } = await supabase
    .from("events")
    .select("address")
    .not("address", "is", null);

  const cities = [
    ...new Set(
      (allEventsForCities || [])
        .map((e: { address: string | null }) => matchCity(e.address))
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
          Bewusste Events finden
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          {heroTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Bewusste Events, Workshops und Retreats — finde dein nächstes transformatives Erlebnis.
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
        {[
          { label: "Retreats", href: "/events?format=retreat" },
          { label: "Workshops", href: "/events?format=workshop" },
          { label: "Yoga", href: "/events?tag=yoga" },
          { label: "Meditation", href: "/events?tag=meditation" },
          { label: "Breathwork", href: "/events?tag=breathwork" },
          { label: "Tanz", href: "/events?tag=tanz" },
          { label: "Sound Healing", href: "/events?tag=sound+healing" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
          >
            {label}
          </Link>
        ))}
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
