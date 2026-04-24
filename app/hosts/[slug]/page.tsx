import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EventCard } from "@/components/EventCard";
import { formatEventDate, FORMAT_LABELS } from "@/lib/event-utils";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";
import type { Event, EventFormat, Host } from "@/lib/types";

interface HostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: HostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();
  const { data: host } = await supabase
    .from("hosts")
    .select("name, slug, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!host) return { title: "Anbieter nicht gefunden" };

  const siteUrl = getSiteUrl();
  const typedHost = host as { name: string; slug: string; description: string | null };
  const description = typedHost.description?.slice(0, 155) || `Events von ${typedHost.name} auf Das Portal`;

  return {
    title: `${typedHost.name} | Raumhalter auf Das Portal`,
    description,
    openGraph: {
      type: "profile",
      locale: "de_DE",
      url: `${siteUrl}/hosts/${slug}`,
      title: typedHost.name,
      description,
    },
    alternates: { canonical: `https://das-portal.online/hosts/${slug}` },
  };
}

/** Tag labels for display */
const TAG_LABELS: Record<string, string> = {
  yoga: "Yoga",
  breathwork: "Breathwork",
  meditation: "Meditation",
  tantra: "Tantra",
  tanz: "Tanz",
  "sound healing": "Sound Healing",
  schamanismus: "Schamanismus",
  coaching: "Coaching",
  heilarbeit: "Heilarbeit",
  "kakao-zeremonie": "Kakao-Zeremonie",
  embodiment: "Embodiment",
  community: "Community",
  natur: "Natur",
  frauen: "Frauen",
  "männer": "Männer",
  retreat: "Retreat",
  workshop: "Workshop",
  kreativität: "Kreativität",
  musik: "Musik",
  ayurveda: "Ayurveda",
};

export default async function HostPage({ params }: HostPageProps) {
  const supabase = getSupabaseServerClient();
  const { slug } = await params;
  const siteUrl = getSiteUrl();

  const { data: host, error: hostError } = await supabase
    .from("hosts")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (hostError) {
    return (
      <section className="mx-auto max-w-4xl rounded-2xl border border-error-border bg-error-bg p-6 text-error-text">
        Anbieter-Profil konnte nicht geladen werden. Bitte später erneut versuchen.
      </section>
    );
  }

  if (!host) {
    notFound();
  }

  const typedHost = host as Host;
  const initial = typedHost.name.charAt(0).toUpperCase();

  const now = new Date().toISOString();

  // Upcoming events
  const { data: upcomingData, error: eventsError } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("host_id", typedHost.id)
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(12);

  // Past events
  const { data: pastData } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("host_id", typedHost.id)
    .eq("is_public", true)
    .eq("status", "published")
    .lt("start_at", now)
    .order("start_at", { ascending: false })
    .limit(6);

  // Dedup helper: same title + start_at → keep newest
  function dedupEvents(events: Event[]): Event[] {
    const seen = new Map<string, Event>();
    for (const event of events) {
      const key = `${event.title}::${event.start_at}`;
      const existing = seen.get(key);
      if (!existing || (event.created_at && existing.created_at && event.created_at > existing.created_at)) {
        seen.set(key, event);
      }
    }
    return Array.from(seen.values());
  }

  const upcomingEvents = dedupEvents((upcomingData || []) as Event[]);
  const pastEvents = dedupEvents((pastData || []) as Event[]);
  const allEvents = [...upcomingEvents, ...pastEvents];

  // Extract unique tags and formats from events
  const tagSet = new Set<string>();
  const formatSet = new Set<EventFormat>();
  const citySet = new Set<string>();
  for (const event of allEvents) {
    if (event.tags) event.tags.forEach((t) => tagSet.add(t));
    if (event.event_format && event.event_format !== "event") formatSet.add(event.event_format);
    if (event.location_name && !event.is_online) citySet.add(event.location_name);
  }
  const topTags = Array.from(tagSet).slice(0, 12);
  const formats = Array.from(formatSet);

  // Social links
  const socialLinks = typedHost.social_links as Record<string, string> | null;
  const hasSocials = socialLinks && Object.keys(socialLinks).length > 0;
  const hasContactInfo = typedHost.website_url || typedHost.email || typedHost.telegram_username || hasSocials;

  // Social icon SVGs
  const socialIcons: Record<string, string> = {
    instagram: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
    facebook: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z",
    linkedin: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z",
    youtube: "M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z",
    telegram: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  };

  // Parse 1:1 offers from description (lines starting with • or -)
  const offers: string[] = [];
  if (typedHost.description) {
    const lines = typedHost.description.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.startsWith("\u2022") || trimmed.startsWith("-")) && trimmed.length > 5) {
        offers.push(trimmed.replace(/^[•\-]\s*/, ""));
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero Header */}
      <section className="overflow-hidden rounded-3xl border border-border bg-bg-card shadow-[0_8px_24px_rgba(44,36,24,0.07)]">
        {/* Cover gradient */}
        <div className="h-32 bg-linear-to-br from-[#E9DACA] via-[#DDD5C8] to-[#C8D5C0]" />

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {/* Avatar overlapping the cover */}
          <div className="-mt-12 mb-4 flex items-end gap-4">
            {typedHost.avatar_url ? (
              <Image
                src={typedHost.avatar_url}
                alt={typedHost.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-2xl border-4 border-bg-card object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-bg-card bg-accent-sage text-3xl font-semibold text-white shadow-md">
                {initial}
              </div>
            )}
          </div>

          <h1 className="font-serif text-3xl font-semibold text-text-primary sm:text-4xl">
            {typedHost.name}
          </h1>
          {typedHost.city ? (
            <p className="mt-1 text-sm text-text-muted">
              {[typedHost.city, typedHost.region].filter(Boolean).join(", ")}
            </p>
          ) : null}

          {/* Format badges */}
          {formats.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {formats.map((f) => (
                <span key={f} className="rounded-full bg-accent-sage/15 px-3 py-1 text-xs font-semibold text-accent-sage">
                  {FORMAT_LABELS[f] || f}
                </span>
              ))}
              <span className="rounded-full bg-bg-secondary px-3 py-1 text-xs font-medium text-text-muted">
                {allEvents.length} Events
              </span>
            </div>
          ) : null}
        </div>
      </section>

      {/* Main Content: 2-column on desktop */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: About + Events */}
        <div className="space-y-8 lg:col-span-2">
          {/* About */}
          {typedHost.description ? (
            <section className="rounded-2xl border border-border bg-bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Über {typedHost.name}</h2>
              <div className="max-w-none space-y-3">
                {typedHost.description.split("\n\n").map((paragraph, i) => {
                  const lines = paragraph.split("\n");
                  const isList = lines.every(
                    (l) => l.startsWith("\u2022") || l.startsWith("-") || l.trim() === ""
                  );
                  if (isList) {
                    return (
                      <ul key={i} className="space-y-1.5 pl-1">
                        {lines
                          .filter((l) => l.trim())
                          .map((line, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-sage" />
                              {line.replace(/^[•\-]\s*/, "")}
                            </li>
                          ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="text-sm leading-relaxed text-text-secondary">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-border bg-bg-secondary/50 p-6">
              <h2 className="mb-2 text-lg font-semibold text-text-primary">Über {typedHost.name}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {typedHost.name} ist auf Das Portal als Raumhalter gelistet.
                Dieses Profil wurde noch nicht persönlich beansprucht — sobald{" "}
                {typedHost.name} das Profil übernimmt, findest du hier mehr
                Informationen.
              </p>
              <Link
                href="/einreichen/host"
                className="mt-4 inline-block rounded-full border border-accent-sage px-5 py-2 text-sm font-semibold text-accent-sage transition hover:bg-accent-sage/10"
              >
                Du bist {typedHost.name}? Profil beanspruchen
              </Link>
            </section>
          )}

          {/* Schwerpunkte / Tags */}
          {topTags.length > 0 ? (
            <section className="rounded-2xl border border-border bg-bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Schwerpunkte</h2>
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/events?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-border bg-bg-secondary px-3.5 py-1.5 text-sm font-medium text-text-secondary transition hover:border-accent-sage hover:text-accent-sage"
                  >
                    {TAG_LABELS[tag] || tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Upcoming Events */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Kommende Veranstaltungen
              </h2>
              {upcomingEvents[0] ? (
                <p className="text-sm text-text-muted">
                  {formatEventDate(upcomingEvents[0].start_at)}
                </p>
              ) : null}
            </div>

            {eventsError ? (
              <div className="rounded-2xl border border-error-border bg-error-bg p-4 text-sm text-error-text">
                Events konnten nicht geladen werden.
              </div>
            ) : null}

            {!eventsError && upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg-secondary/50 p-8 text-center text-sm text-text-muted">
                Aktuell keine kommenden Veranstaltungen.
              </div>
            ) : null}

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : null}
          </section>

          {/* Past Events */}
          {pastEvents.length > 0 ? (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-text-muted">
                Vergangene Veranstaltungen
              </h2>
              <div className="grid grid-cols-1 gap-6 opacity-60 md:grid-cols-2">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Contact Box */}
          {hasContactInfo ? (
            <div className="rounded-2xl border border-border bg-bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Kontakt</h3>
              <div className="space-y-3">
                {typedHost.website_url ? (
                  <a
                    href={typedHost.website_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
                  >
                    <svg className="h-5 w-5 shrink-0 text-accent-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="truncate">{typedHost.website_url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
                  </a>
                ) : null}
                {typedHost.email ? (
                  <a
                    href={`mailto:${typedHost.email}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
                  >
                    <svg className="h-5 w-5 shrink-0 text-accent-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span className="truncate">{typedHost.email}</span>
                  </a>
                ) : null}
                {typedHost.telegram_username ? (
                  <a
                    href={`https://t.me/${typedHost.telegram_username}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
                  >
                    <svg className="h-5 w-5 shrink-0 text-accent-secondary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    <span>@{typedHost.telegram_username}</span>
                  </a>
                ) : null}
              </div>

              {/* Social Links */}
              {hasSocials ? (
                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  {Object.entries(socialLinks!).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition hover:bg-bg-secondary hover:text-text-primary"
                      aria-label={platform}
                    >
                      {socialIcons[platform] ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d={socialIcons[platform]} />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium uppercase">{platform.slice(0, 2)}</span>
                      )}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Angebote (parsed from description bullet points) */}
          {offers.length > 0 ? (
            <div className="rounded-2xl border border-accent-primary/20 bg-linear-to-br from-[#faf6f1] to-[#f5ece1] p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent-primary">Angebote</h3>
              <ul className="space-y-3">
                {offers.map((offer, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-primary">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-primary/15 text-xs text-accent-primary">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {offer}
                  </li>
                ))}
              </ul>
              {typedHost.website_url ? (
                <a
                  href={typedHost.website_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 block rounded-xl bg-accent-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:brightness-95"
                >
                  Termin anfragen
                </a>
              ) : typedHost.email ? (
                <a
                  href={`mailto:${typedHost.email}`}
                  className="mt-4 block rounded-xl bg-accent-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:brightness-95"
                >
                  Kontakt aufnehmen
                </a>
              ) : null}
            </div>
          ) : null}

          {/* Quick Facts */}
          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Auf einen Blick</h3>
            <dl className="space-y-3 text-sm">
              {typedHost.city ? (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Standort</dt>
                  <dd className="font-medium text-text-primary">{typedHost.city}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-text-muted">Veranstaltungen</dt>
                <dd className="font-medium text-text-primary">{allEvents.length}</dd>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Nächstes Event</dt>
                  <dd className="font-medium text-text-primary">{formatEventDate(upcomingEvents[0].start_at)}</dd>
                </div>
              ) : null}
              {formats.length > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Formate</dt>
                  <dd className="font-medium text-text-primary">{formats.map((f) => FORMAT_LABELS[f] || f).join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {/* CTA for unclaimed profiles */}
          {!typedHost.description ? (
            <div className="rounded-2xl border border-dashed border-accent-sage/40 bg-accent-sage/5 p-5 text-center">
              <p className="text-sm text-text-secondary">
                Ist das dein Profil? Ergänze deine Beschreibung, Links und Angebote.
              </p>
              <Link
                href="/einreichen/host"
                className="mt-3 inline-block rounded-full bg-accent-sage px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Profil beanspruchen
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
