import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EventCard } from "@/components/EventCard";
import { formatEventDate, deduplicateEvents } from "@/lib/event-utils";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";
import type { Event, Location } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  venue: "Veranstaltungsort",
  retreat_center: "Retreat-Zentrum",
  outdoor: "Outdoor-Ort",
  coworking: "Coworking Space",
  online: "Online-Plattform",
  private: "Privater Ort",
  other: "Ort",
};

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();
  const { data: location } = await supabase
    .from("locations")
    .select("name, slug, description, city, type")
    .eq("slug", slug)
    .maybeSingle();

  if (!location) return { title: "Ort nicht gefunden" };

  const typedLocation = location as { name: string; slug: string; description: string | null; city: string | null; type: string };
  const cityPart = typedLocation.city ? ` in ${typedLocation.city}` : "";
  const description = typedLocation.description?.slice(0, 155) || `Events bei ${typedLocation.name}${cityPart}`;

  return {
    title: `${typedLocation.name} | Ort`,
    description,
    openGraph: {
      type: "website",
      locale: "de_DE",
      url: `${getSiteUrl()}/locations/${slug}`,
      title: typedLocation.name,
      description,
    },
    alternates: { canonical: `https://das-portal.online/locations/${slug}` },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const supabase = getSupabaseServerClient();
  const { slug } = await params;

  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (locationError) {
    return (
      <section className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Ort konnte nicht geladen werden. Bitte später erneut versuchen.
      </section>
    );
  }

  if (!location) {
    notFound();
  }

  const loc = location as Location;
  const typeLabel = TYPE_LABELS[loc.type] || "Ort";
  const cityDisplay = [loc.city, loc.region].filter(Boolean).join(", ");

  const now = new Date().toISOString();

  // Upcoming events at this location
  const { data: upcomingData } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("location_id", loc.id)
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(12);

  // Past events
  const { data: pastData } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("location_id", loc.id)
    .eq("is_public", true)
    .eq("status", "published")
    .lt("start_at", now)
    .order("start_at", { ascending: false })
    .limit(6);

  const upcomingEvents = deduplicateEvents((upcomingData || []) as Event[]);
  const pastEvents = deduplicateEvents((pastData || []) as Event[]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header Section */}
      <section className="overflow-hidden rounded-3xl border border-border bg-bg-card shadow-[0_8px_24px_rgba(44,36,24,0.07)]">
        {/* Cover Image */}
        {loc.cover_image_url ? (
          <div className="relative aspect-[21/9] w-full overflow-hidden">
            <Image
              src={loc.cover_image_url}
              alt={loc.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        ) : null}

        <div className="p-6 sm:p-8">
          {/* Type + City */}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-accent-sage/15 px-3 py-1 text-xs font-semibold text-accent-sage">
              {typeLabel}
            </span>
            {cityDisplay ? (
              <span className="text-sm text-text-secondary">{cityDisplay}</span>
            ) : null}
            {!loc.is_claimed ? (
              <span className="rounded-full bg-bg-secondary px-3 py-1 text-xs text-text-muted">
                Noch nicht beansprucht
              </span>
            ) : null}
          </div>

          {/* Name */}
          <h1 className="font-serif text-3xl font-semibold text-text-primary sm:text-4xl">
            {loc.name}
          </h1>

          {/* Address */}
          {loc.address ? (
            <p className="mt-2 text-text-secondary">
              {loc.address}
              {loc.geo_lat && loc.geo_lng ? (
                <>
                  {" "}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.geo_lat},${loc.geo_lng}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-accent-primary hover:underline"
                  >
                    In Google Maps öffnen
                  </a>
                </>
              ) : null}
            </p>
          ) : null}

          {/* Links */}
          <div className="mt-5 flex flex-wrap gap-3">
            {loc.website_url ? (
              <a
                href={loc.website_url}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
              >
                Website
              </a>
            ) : null}
            {loc.contact_email ? (
              <a
                href={`mailto:${loc.contact_email}`}
                className="rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
              >
                E-Mail
              </a>
            ) : null}
            {loc.phone ? (
              <a
                href={`tel:${loc.phone}`}
                className="rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
              >
                Anrufen
              </a>
            ) : null}
            <Link
              href="/locations"
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-secondary"
            >
              Alle Orte
            </Link>
          </div>

          {/* Social Links */}
          {loc.social_links ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(loc.social_links).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          ) : null}

          {/* Description */}
          {loc.description ? (
            <div className="mt-6 max-w-3xl space-y-4">
              {loc.description.split("\n\n").map((paragraph, i) => (
                <p key={i} className="leading-relaxed text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {/* Details Grid */}
          {(loc.capacity || loc.overnight_possible || loc.wheelchair_accessible || (loc.amenities && loc.amenities.length > 0)) ? (
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-bg-secondary p-5 sm:grid-cols-4">
              {loc.capacity ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-muted">Kapazität</p>
                  <p className="mt-1 font-semibold text-text-primary">{loc.capacity} Personen</p>
                </div>
              ) : null}
              {loc.overnight_possible != null ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-muted">Übernachtung</p>
                  <p className="mt-1 font-semibold text-text-primary">
                    {loc.overnight_possible ? "Möglich" : "Nicht möglich"}
                  </p>
                </div>
              ) : null}
              {loc.wheelchair_accessible != null ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-muted">Barrierefrei</p>
                  <p className="mt-1 font-semibold text-text-primary">
                    {loc.wheelchair_accessible ? "Ja" : "Nein"}
                  </p>
                </div>
              ) : null}
              {loc.amenities && loc.amenities.length > 0 ? (
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Ausstattung</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {loc.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-bg-card px-3 py-1 text-xs font-medium text-text-secondary"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Unclaimed CTA */}
          {!loc.is_claimed ? (
            <div className="mt-6 rounded-2xl border border-border bg-bg-secondary p-5">
              <p className="text-sm leading-relaxed text-text-secondary">
                Dieser Ort wurde noch nicht persönlich beansprucht. Du betreibst{" "}
                <strong>{loc.name}</strong>? Melde dich bei uns und ergänze dein Profil
                mit Bildern, Beschreibung und Kontaktdaten.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-normal text-text-primary">
            Kommende Events bei {loc.name}
          </h2>
          {upcomingEvents[0] ? (
            <p className="text-sm text-text-secondary">
              Nächstes Event: {formatEventDate(upcomingEvents[0].start_at)}
            </p>
          ) : null}
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="rounded-2xl border border-border bg-bg-card p-8 text-text-secondary">
            Aktuell sind keine zukünftigen Events an diesem Ort hinterlegt.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 ? (
        <section>
          <h2 className="mb-4 text-2xl font-normal text-text-muted">
            Vergangene Events
          </h2>
          <div className="grid grid-cols-1 gap-6 opacity-75 md:grid-cols-2 xl:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
