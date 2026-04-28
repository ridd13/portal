import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";
import { formatEventDate, formatPrice, getHostPreview, getCityFromAddress, buildGoogleCalendarUrl, formatBerlinISO } from "@/lib/event-utils";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";
import { generateICS } from "@/lib/ics";
import { CalendarDownloadButton } from "@/components/CalendarDownloadButton";
import { SingleEventMap } from "@/components/SingleEventMap";
import { SocialLinks } from "@/components/SocialLinks";
import { EventCard } from "@/components/EventCard";
import { EventRegistration } from "@/components/EventRegistration";
import { AdminDeleteEventButton } from "@/components/AdminDeleteEventButton";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import type { Event, Host, HostPreview } from "@/lib/types";

const ADMIN_EMAIL = "lennert.bewernick@gmail.com";

interface EventDetailProps {
  params: Promise<{ slug: string }>;
}

type EventWithHost = Omit<Event, "hosts"> & { hosts: Host | Host[] | null };

async function getEvent(slug: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, hosts(name, slug, description, website_url, social_links, telegram_username, email, is_public), locations(name, slug, type, city)")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return data as EventWithHost;
}

async function getRelatedEvents(event: EventWithHost, limit = 4) {
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const city = getCityFromAddress(event.address);

  // Strategy: same city + same tags, exclude current event, only future
  let query = supabase
    .from("events")
    .select("id, title, slug, start_at, address, location_name, cover_image_url, tags, event_format, price_model, price_amount, host_id, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .neq("id", event.id)
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(limit);

  // If same city, prefer those
  if (city) {
    query = query.ilike("address", `%${city}%`);
  }

  const { data: cityEvents } = await query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cityResults = (cityEvents || []) as any[];

  // If we got enough, return them
  if (cityResults.length >= limit) {
    return cityResults as (Event & { hosts: HostPreview | HostPreview[] | null })[];
  }

  // Otherwise, fill up with events from anywhere
  const existingIds = [event.id, ...cityResults.map((e) => e.id)];
  const { data: moreEvents } = await supabase
    .from("events")
    .select("id, title, slug, start_at, address, location_name, cover_image_url, tags, event_format, price_model, price_amount, host_id, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .not("id", "in", `(${existingIds.join(",")})`)
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(limit - cityResults.length);

  return [...cityResults, ...(moreEvents || [])] as (Event & { hosts: HostPreview | HostPreview[] | null })[];
}

export async function generateMetadata({ params }: EventDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event nicht gefunden" };

  const siteUrl = getSiteUrl();
  const city = getCityFromAddress(event.address);

  const description = event.description
    ? event.description.slice(0, 155).replace(/\n/g, " ") + "…"
    : `${event.title} – ${formatEventDate(event.start_at)}${city ? ` in ${city}` : ""}`;

  return {
    title: [event.title, city].filter(Boolean).join(" in "),
    description,
    openGraph: {
      type: "article",
      locale: "de_DE",
      url: `${siteUrl}/events/${slug}`,
      title: event.title,
      description,
      ...(event.cover_image_url ? { images: [{ url: event.cover_image_url, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: event.cover_image_url ? "summary_large_image" : "summary",
      title: event.title,
      description,
      ...(event.cover_image_url ? { images: [event.cover_image_url] } : {}),
    },
    alternates: { canonical: `https://das-portal.online/events/${slug}` },
  };
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const relatedEvents = await getRelatedEvents(event);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  let isAdmin = false;
  if (accessToken) {
    const { user } = await getUserFromAccessToken(accessToken);
    isAdmin = user?.email === ADMIN_EMAIL;
  }

  const hostRaw = event.hosts;
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;
  const hostPreview = getHostPreview({
    ...event,
    hosts: hostRaw,
  });

  const siteUrl = getSiteUrl();
  const googleCalUrl = buildGoogleCalendarUrl(event);

  // Load registration count for capacity display
  let confirmedCount = 0;
  if (event.registration_enabled !== false) {
    try {
      const adminClient = getSupabaseAdminClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (adminClient.from("event_registrations") as any)
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "confirmed");
      confirmedCount = count || 0;
    } catch (e) {
      console.error("[event detail] Registration count failed:", e);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || undefined,
    startDate: formatBerlinISO(event.start_at),
    endDate: formatBerlinISO(event.end_at),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.is_online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    url: `${siteUrl}/events/${event.slug}`,
    image: event.cover_image_url || undefined,
    location: (event.location_name || event.address) ? {
      "@type": "Place",
      name: event.location_name || event.address || "Ort folgt",
      address: event.address ? {
        "@type": "PostalAddress",
        streetAddress: event.address,
        addressLocality: getCityFromAddress(event.address) || undefined,
        addressCountry: "DE",
      } : undefined,
    } : {
      "@type": "Place",
      name: "Ort wird noch bekannt gegeben",
    },
    organizer: hostPreview ? {
      "@type": "Organization",
      name: hostPreview.name,
      url: hostPreview.slug ? `${siteUrl}/hosts/${hostPreview.slug}` : undefined,
    } : undefined,
    performer: hostPreview ? {
      "@type": "Person",
      name: hostPreview.name,
      url: hostPreview.slug ? `${siteUrl}/hosts/${hostPreview.slug}` : undefined,
    } : undefined,
    offers: {
      "@type": "Offer",
      price: event.price_model === "free"
        ? "0"
        : event.price_amount
          ? String(event.price_amount)
          : undefined,
      priceCurrency: "EUR",
      url: event.ticket_link || `${siteUrl}/events/${event.slug}`,
      availability: "https://schema.org/InStock",
      validFrom: event.created_at || undefined,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-4xl space-y-8">
        {isAdmin ? (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-red-200 bg-red-50/50 px-4 py-3">
            <p className="text-xs text-red-500">Admin</p>
            <AdminDeleteEventButton eventId={event.id} eventTitle={event.title} />
          </div>
        ) : null}
        <div className="overflow-hidden rounded-3xl border border-border bg-bg-card shadow-[0_10px_30px_rgba(44,36,24,0.08)]">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={event.title}
              width={1200}
              height={384}
              priority
              className="h-72 w-full object-cover sm:h-96"
            />
          ) : (
            <div className="h-72 w-full bg-linear-to-br from-[#f0e2d1] via-[#eadfce] to-[#d5decb] sm:h-96" />
          )}

          <div className="space-y-6 p-6 sm:p-8">
            {/* Title */}
            <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
              {event.title}
            </h1>

            {/* Info-Grid */}
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-bg-secondary p-5 sm:grid-cols-2">
              {/* Datum */}
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">📅</span>
                <div>
                  <p className="text-sm font-medium text-text-muted">Wann</p>
                  <p className="font-medium text-text-primary">
                    {formatEventDate(event.start_at)}
                  </p>
                  {event.end_at ? (
                    <p className="text-sm text-text-secondary">bis {formatEventDate(event.end_at)}</p>
                  ) : null}
                </div>
              </div>

              {/* Ort */}
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">{event.is_online ? "💻" : "📍"}</span>
                <div>
                  <p className="text-sm font-medium text-text-muted">Wo</p>
                  {event.is_online ? (
                    <>
                      <p className="font-medium text-accent-sage">Online-Event</p>
                      {event.location_name && event.location_name.toLowerCase() !== "online" ? (
                        <p className="text-sm text-text-secondary">{event.location_name}</p>
                      ) : null}
                      <p className="mt-1 text-sm text-text-secondary">
                        Du erhältst alle Details nach der Anmeldung.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-text-primary">
                        {(event as any).locations?.slug ? (
                          <Link href={`/locations/${(event as any).locations.slug}`} className="hover:text-accent-primary transition-colors">
                            {event.location_name || (event as any).locations.name || "Ort wird noch bekanntgegeben"}
                          </Link>
                        ) : (
                          event.location_name || "Ort wird noch bekanntgegeben"
                        )}
                      </p>
                      {event.address && event.location_name ? (
                        <p className="text-sm text-text-secondary">{event.address}</p>
                      ) : null}
                      {(event.address || event.location_name) ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            [event.location_name, event.address].filter(Boolean).join(", ")
                          )}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent-secondary hover:underline"
                        >
                          In Google Maps öffnen
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.5-3a.75.75 0 0 1 .75-.75H17a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V4.06l-5.97 5.97a.75.75 0 1 1-1.06-1.06L15.19 3h-3.44a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                          </svg>
                        </a>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              {/* Preis */}
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">💰</span>
                <div>
                  <p className="text-sm font-medium text-text-muted">Preis</p>
                  <p className="text-lg font-medium text-text-primary">
                    {formatPrice(event.price_model, event.price_amount)}
                  </p>
                </div>
              </div>

              {/* Anbieter */}
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">🙋</span>
                <div>
                  <p className="text-sm font-medium text-text-muted">Anbieter</p>
                  {hostPreview && hostPreview.is_public !== false ? (
                    hostPreview.slug ? (
                      <Link
                        href={`/hosts/${hostPreview.slug}`}
                        className="font-medium text-accent-primary hover:underline"
                      >
                        {hostPreview.name}
                      </Link>
                    ) : (
                      <p className="font-medium text-text-primary">{hostPreview.name}</p>
                    )
                  ) : (
                    <p className="font-medium text-text-primary">Das Portal</p>
                  )}
                </div>
              </div>

              {/* Beginner-friendly Badge */}
              {event.description_sections?.is_beginner_friendly === true ? (
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl" aria-hidden="true">🌱</span>
                  <div>
                    <p className="text-sm font-medium text-text-muted">Level</p>
                    <p className="font-medium text-accent-sage">Für Einsteiger geeignet</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Tags (klickbar) */}
            {event.tags && event.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/events?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-bg-secondary px-3 py-1 text-sm text-text-secondary transition hover:bg-accent-sage hover:text-white"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            ) : null}

            {/* CTA Button */}
            {event.ticket_link ? (() => {
              const raw = event.ticket_link!.trim();
              const isMailto = raw.startsWith("mailto:");
              const isEmail = isMailto || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
              const isTel = raw.startsWith("tel:");
              const isPhone = isTel || /^\+?[\d\s\-/()]{6,20}$/.test(raw);
              const isUrl = /^https?:\/\//.test(raw);
              const looksLikeDomain = /^[\w-]+\.[\w./-]+/.test(raw);

              if (isEmail) {
                const href = isMailto ? raw : `mailto:${raw}`;
                return (
                  <a href={href} className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-lg font-semibold text-white transition hover:brightness-95">
                    Kontakt per E-Mail <span aria-hidden="true">&rarr;</span>
                  </a>
                );
              }
              if (isPhone) {
                const href = isTel ? raw : `tel:${raw.replace(/[\s\-/()]/g, "")}`;
                return (
                  <a href={href} className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-lg font-semibold text-white transition hover:brightness-95">
                    Telefonisch anfragen <span aria-hidden="true">&rarr;</span>
                  </a>
                );
              }
              if (isUrl || looksLikeDomain) {
                const href = isUrl ? raw : `https://${raw}`;
                return (
                  <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-lg font-semibold text-white transition hover:brightness-95">
                    Jetzt anmelden <span aria-hidden="true">&rarr;</span>
                  </a>
                );
              }
              // Freetext like "Anmeldung via DM" – link to host Telegram if available
              const tgUser = host && "telegram_username" in host ? (host as unknown as Record<string, unknown>).telegram_username as string | null : null;
              if (tgUser) {
                return (
                  <a href={`https://t.me/${tgUser}`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-lg font-semibold text-white transition hover:brightness-95">
                    Per Telegram anmelden <span aria-hidden="true">&rarr;</span>
                  </a>
                );
              }
              return (
                <p className="rounded-xl bg-bg-secondary px-6 py-3 text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Anmeldung:</span> {raw}
                </p>
              );
            })() : null}

            {/* Anchor-Link zur Anmeldung */}
            {event.registration_enabled !== false && (
              <a href="#anmeldung" className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-lg font-semibold text-white transition hover:brightness-95">
                Jetzt anmelden <span aria-hidden="true">&rarr;</span>
              </a>
            )}

            {/* Structured Description Sections */}
            {event.description_sections ? (
              <div className="space-y-6">
                {event.description_sections.what_to_expect ? (
                  <section>
                    <h2 className="mb-2 text-xl font-normal text-text-primary">Was erwartet dich</h2>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {event.description_sections.what_to_expect}
                    </p>
                  </section>
                ) : null}

                {Array.isArray(event.description_sections.what_youll_experience) && event.description_sections.what_youll_experience.length ? (
                  <section>
                    <h2 className="mb-2 text-xl font-normal text-text-primary">Was du erleben wirst</h2>
                    <ul className="space-y-1.5 text-sm text-text-secondary">
                      {event.description_sections.what_youll_experience.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 text-accent-sage">&#10022;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {event.description_sections.who_is_this_for ? (
                  <section className="rounded-xl border border-accent-sage/20 bg-accent-sage/5 p-4">
                    <h2 className="mb-2 text-xl font-normal text-text-primary">Für wen ist das</h2>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {event.description_sections.who_is_this_for}
                    </p>
                    {event.description_sections.is_beginner_friendly === true ? (
                      <span className="mt-2 inline-block rounded-full bg-accent-sage/15 px-3 py-1 text-xs font-medium text-accent-sage">
                        Für Einsteiger geeignet
                      </span>
                    ) : null}
                  </section>
                ) : null}

                {Array.isArray(event.description_sections.what_youll_take_away) && event.description_sections.what_youll_take_away.length ? (
                  <section>
                    <h2 className="mb-2 text-xl font-normal text-text-primary">Was du mitnimmst</h2>
                    <ul className="space-y-1.5 text-sm text-text-secondary">
                      {event.description_sections.what_youll_take_away.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 text-accent-sage">&#10022;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {event.description_sections.schedule ? (
                  <section>
                    <h2 className="mb-2 text-xl font-normal text-text-primary">Ablauf</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                      {event.description_sections.schedule}
                    </p>
                  </section>
                ) : null}

                {event.description_sections.location_details ? (
                  <section>
                    <h2 className="mb-2 text-xl font-normal text-text-primary">Über den Ort</h2>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {event.description_sections.location_details}
                    </p>
                  </section>
                ) : null}
              </div>
            ) : null}

            {/* Description (fallback or additional details) */}
            {event.description ? (
              <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
                {event.description_sections ? (
                  <h2 className="text-xl font-normal text-text-primary">Weitere Details</h2>
                ) : null}
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-xl font-normal text-text-primary">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-normal text-text-primary">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => <p>{children}</p>,
                    ul: ({ children }) => (
                      <ul className="list-disc space-y-1 pl-5">{children}</ul>
                    ),
                  }}
                >
                  {event.description}
                </ReactMarkdown>
              </div>
            ) : null}

            {/* Event Registration */}
            {event.registration_enabled !== false && (
              <EventRegistration
                eventId={event.id}
                eventTitle={event.title}
                eventSlug={event.slug}
                capacity={(event as unknown as Record<string, unknown>).capacity as number | null}
                confirmedCount={confirmedCount}
                waitlistEnabled={(event as unknown as Record<string, unknown>).waitlist_enabled as boolean ?? false}
                registrationEnabled={true}
                priceModel={event.price_model}
                priceAmount={event.price_amount}
              />
            )}

            {/* Facilitator / Host Box — nur bei öffentlichen Hosts */}
            {host && hostPreview?.is_public !== false ? (
              <section className="rounded-2xl border border-border bg-bg-secondary p-4">
                <h2 className="mb-3 text-xl font-normal text-text-primary">Anbieter</h2>
                {hostPreview?.slug ? (
                  <Link
                    href={`/hosts/${hostPreview.slug}`}
                    className="block font-medium text-accent-secondary hover:underline"
                  >
                    {hostPreview.name}
                  </Link>
                ) : (
                  <p className="font-medium text-text-primary">{hostPreview?.name}</p>
                )}
                {host.description ? (
                  <p className="mt-2 text-sm text-text-secondary">{host.description}</p>
                ) : null}
                {host.website_url ? (
                  <a
                    href={host.website_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 block text-sm font-semibold text-accent-secondary hover:underline"
                  >
                    Website besuchen
                  </a>
                ) : null}
                {host.social_links ? (
                  <div className="mt-3">
                    <SocialLinks links={host.social_links as Record<string, string>} />
                  </div>
                ) : null}
              </section>
            ) : (
              <section className="rounded-2xl border border-dashed border-accent-secondary bg-bg-secondary p-4">
                <p className="font-medium text-text-primary">Ist das dein Event?</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Registriere dich als Anbieter und verwalte dein Listing.
                </p>
                <Link
                  href="/fuer-facilitators"
                  className="mt-3 inline-block rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-primary"
                >
                  Mehr erfahren
                </Link>
              </section>
            )}
          </div>
        </div>

        {/* Map (single event) — nicht für Online-Events */}
        {event.geo_lat && event.geo_lng && !event.is_online ? (
          <section className="space-y-3">
            <h2 className="text-lg font-normal text-text-primary">Standort</h2>
            <SingleEventMap event={event} />
          </section>
        ) : null}

        {/* Calendar Buttons */}
        <section className="flex flex-wrap gap-3">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
          >
            Zu Google Calendar hinzufügen
          </a>
          <CalendarDownloadButton
            icsContent={generateICS(event)}
            filename={`${event.slug || "event"}.ics`}
          />
        </section>

        {event.source_type === "telegram" ? (
          <p className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-xs text-text-muted">
            Dieses Event wurde automatisch aus einer Telegram-Gruppe importiert. Angaben ohne Gewähr.
          </p>
        ) : null}

        {/* Related Events */}
        {relatedEvents.length > 0 ? (
          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-text-primary">
              Das könnte dich auch interessieren
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedEvents.map((relEvent) => (
                <EventCard key={relEvent.id} event={relEvent} />
              ))}
            </div>
          </section>
        ) : null}

        <Link
          href="/events"
          className="inline-flex items-center text-sm font-semibold text-accent-secondary hover:underline"
        >
          Zurück zur Übersicht
        </Link>
      </article>
    </>
  );
}
