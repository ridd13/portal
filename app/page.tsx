import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { EventCard } from "@/components/EventCard";
import { matchCity } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Das Portal | Bewusste Events in deiner Nähe",
  description:
    "Entdecke Breathwork, Yoga, Sound Healing, Kakao-Zeremonien und mehr — finde Facilitators und Erlebnisse, denen du vertrauen kannst.",
};

export const revalidate = 300;

export default async function LandingPage() {
  const supabase = getSupabaseServerClient();

  // Nächste 4 Events (keine Online-Events)
  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .eq("is_online", false)
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(4);

  const upcomingEvents = (data || []) as Event[];

  // Social Proof Counts (alle Events, nicht nur published)
  const { count: eventCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true });

  const { count: hostCount } = await supabase
    .from("hosts")
    .select("*", { count: "exact", head: true });

  // Städte-Count (from ALL events for broader coverage)
  const { data: cityData } = await supabase
    .from("events")
    .select("address")
    .not("address", "is", null);

  const uniqueCities = new Set(
    (cityData || [])
      .map((e: { address: string | null }) => matchCity(e.address))
      .filter(Boolean)
  );
  const cityCount = uniqueCities.size;

  // Facilitator Spotlight: 4 Hosts mit den meisten kommenden Events + description
  const { data: spotlightHostsRaw } = await supabase
    .from("hosts")
    .select("id, name, slug, description, avatar_url")
    .not("description", "is", null)
    .order("created_at", { ascending: true })
    .limit(50);

  // Upcoming event counts per host
  const { data: upcomingByHost } = await supabase
    .from("events")
    .select("host_id")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString());

  const hostEventCounts = new Map<string, number>();
  for (const e of upcomingByHost || []) {
    const hid = (e as { host_id: string | null }).host_id;
    if (hid) hostEventCounts.set(hid, (hostEventCounts.get(hid) || 0) + 1);
  }

  type SpotlightHost = {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    avatar_url: string | null;
    eventCount: number;
  };

  const spotlightHosts: SpotlightHost[] = ((spotlightHostsRaw || []) as SpotlightHost[])
    .map((h) => ({ ...h, eventCount: hostEventCounts.get(h.id) || 0 }))
    .filter((h) => h.eventCount > 0)
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 4);

  return (
    <div className="space-y-16 pb-8">
      {/* 1.1 Hero */}
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] px-6 py-12 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:px-10 sm:py-16">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text-primary sm:text-5xl lg:text-6xl">
          Finde deinen Raum.
          <br />
          Finde deine Menschen.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary sm:text-xl">
          Breathwork, Yoga, Sound Healing, Kakao-Zeremonien und mehr —
          bewusste Events und Anbieter in deiner Nähe.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/events"
            className="inline-flex items-center rounded-xl bg-accent-primary px-6 py-3 text-base font-semibold text-white shadow-md transition hover:brightness-95"
          >
            Events entdecken
          </Link>
          <Link
            href="/anbieter"
            className="inline-flex items-center rounded-xl border border-border bg-bg-card px-6 py-3 text-base font-medium text-text-primary transition hover:bg-bg-secondary"
          >
            Anbieter entdecken
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-8 flex gap-8">
          {eventCount ? (
            <div>
              <p className="text-3xl font-bold text-accent-primary">{eventCount}+</p>
              <p className="text-sm text-text-muted">Events</p>
            </div>
          ) : null}
          {hostCount ? (
            <div>
              <p className="text-3xl font-bold text-accent-primary">{hostCount}+</p>
              <p className="text-sm text-text-muted">Anbieter</p>
            </div>
          ) : null}
          {cityCount > 0 ? (
            <div>
              <p className="text-3xl font-bold text-accent-primary">{cityCount}+</p>
              <p className="text-sm text-text-muted">Städte</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* 1.2 So funktioniert Das Portal */}
      <section className="space-y-6">
        <h2 className="text-center text-2xl font-normal text-text-primary sm:text-3xl">
          So funktioniert Das Portal
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-sage text-xl font-bold text-white">
              1
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">Komm an</h3>
            <p className="text-text-secondary">
              Finde Events und Anbieter nach Ort, Kategorie oder Datum — alles an einem Platz.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary text-xl font-bold text-white">
              2
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">Vertrau</h3>
            <p className="text-text-secondary">
              Lerne die Menschen hinter den Events kennen — mit echten Profilen und Hintergrund.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-secondary text-xl font-bold text-white">
              3
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">Geh rein</h3>
            <p className="text-text-secondary">
              Nimm teil. Lass dich ein. Finde deine Community vor Ort.
            </p>
          </div>
        </div>
      </section>

      {/* 1.3 Nächste Events */}
      {upcomingEvents.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-normal text-text-primary sm:text-3xl">
              Nächste Events
            </h2>
            <Link
              href="/events"
              className="text-sm font-semibold text-accent-secondary hover:underline"
            >
              Alle Events anzeigen
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <p className="text-center">
            <Link
              href="/anbieter"
              className="text-sm text-accent-secondary hover:underline"
            >
              Oder entdecke Anbieter in deiner Nähe &rarr;
            </Link>
          </p>
        </section>
      ) : null}

      {/* 1.4 Kategorie-Kacheln + Top-Städte */}
      <section className="space-y-6">
        <h2 className="text-center text-2xl font-normal text-text-primary sm:text-3xl">
          Was interessiert dich?
        </h2>
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
          {[
            { label: "Breathwork", tag: "breathwork", icon: "🌬️" },
            { label: "Yoga", tag: "yoga", icon: "🧘" },
            { label: "Meditation", tag: "meditation", icon: "🪷" },
            { label: "Tanz & Bewegung", tag: "tanz", icon: "💃" },
            { label: "Kakao-Zeremonie", tag: "kakao-zeremonie", icon: "🍫" },
            { label: "Tantra", tag: "tantra", icon: "🔥" },
            { label: "Sound Healing", tag: "sound healing", icon: "🎵" },
            { label: "Schamanismus", tag: "schamanismus", icon: "🪶" },
            { label: "Heilarbeit", tag: "heilarbeit", icon: "🌿" },
            { label: "Natur", tag: "natur", icon: "🌲" },
          ].map(({ label, tag, icon }) => (
            <Link
              key={tag}
              href={`/events?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-primary transition hover:bg-bg-secondary hover:text-accent-primary"
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
        </div>

        {/* Top-Städte */}
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
          {["Hamburg", "Berlin", "Köln", "München", "Kiel", "Freiburg", "Lübeck"].map(
            (city) => (
              <Link
                key={city}
                href={`/events?city=${encodeURIComponent(city)}`}
                className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-sage hover:text-accent-sage"
              >
                {city}
              </Link>
            )
          )}
        </div>
      </section>

      {/* 1.5 Facilitator Spotlight */}
      {spotlightHosts.length > 0 ? (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-normal text-text-primary sm:text-3xl">
              Lerne unsere Anbieter kennen
            </h2>
            <p className="mt-2 text-text-secondary">
              Coaches, Heiler und Facilitators — mit eigenen Profilen auf Das Portal.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {spotlightHosts.map((h) => (
              <Link
                key={h.id}
                href={h.slug ? `/hosts/${h.slug}` : "#"}
                className="flex flex-col items-center rounded-2xl border border-border bg-bg-card p-5 text-center transition hover:shadow-[0_8px_24px_rgba(44,36,24,0.1)]"
              >
                {h.avatar_url ? (
                  <img
                    src={h.avatar_url}
                    alt={h.name}
                    className="mb-3 h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent-sage/20 text-xl font-bold text-accent-sage">
                    {h.name.charAt(0)}
                  </div>
                )}
                <p className="font-serif text-lg text-text-primary">{h.name}</p>
                {h.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                    {h.description.slice(0, 100)}
                  </p>
                ) : null}
                <span className="mt-2 rounded-full bg-accent-sage/10 px-3 py-1 text-xs font-medium text-accent-sage">
                  {h.eventCount} kommende{h.eventCount === 1 ? "s" : ""} Event{h.eventCount === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-center">
            <Link
              href="/anbieter"
              className="text-sm font-semibold text-accent-secondary hover:underline"
            >
              Alle Anbieter entdecken &rarr;
            </Link>
          </p>
        </section>
      ) : null}

      {/* 1.6 Trust-Sektion */}
      <section className="rounded-3xl bg-bg-secondary px-6 py-10 sm:px-10">
        <h2 className="mb-8 text-center text-2xl font-normal text-text-primary sm:text-3xl">
          Warum Das Portal?
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-sage/20 text-lg">
              💚
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              Komplett kostenlos
            </h3>
            <p className="text-sm text-text-secondary">
              Kein Abo, keine Provision, keine versteckten Kosten — für alle. Events einstellen, Profile anlegen, Events finden.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/15 text-lg">
              🤝
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              Profile, die Vertrauen schaffen
            </h3>
            <p className="text-sm text-text-secondary">
              Keine anonymen Listings. Lerne die Menschen hinter den Events kennen.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-secondary/15 text-lg">
              🌍
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              Community statt Marketplace
            </h3>
            <p className="text-sm text-text-secondary">
              Wir sind kein Ticketshop. Wir verbinden Menschen mit transformativen Erfahrungen.
            </p>
          </div>
        </div>
      </section>

      {/* 1.7 Telegram CTA – dezent */}
      <div className="flex items-center justify-center gap-3 text-sm text-text-secondary">
        <span>Auch auf Telegram:</span>
        <a
          href="https://t.me/dasgrosseportal"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 font-medium text-accent-primary transition hover:underline"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          @dasgrosseportal
        </a>
      </div>
      {/* 1.8 Beliebte Regionen Footer (SEO) */}
      <section className="space-y-3 text-center text-sm">
        <div>
          <span className="text-text-muted">Beliebte Regionen: </span>
          {["Hamburg", "Berlin", "Köln", "München", "Kiel", "Flensburg", "Lübeck", "Hannover"].map(
            (city, i) => (
              <span key={city}>
                {i > 0 ? <span className="text-text-muted"> | </span> : null}
                <Link
                  href={`/events?city=${encodeURIComponent(city)}`}
                  className="text-text-secondary transition hover:text-accent-primary"
                >
                  {city}
                </Link>
              </span>
            )
          )}
        </div>
        <div>
          <span className="text-text-muted">Beliebte Kategorien: </span>
          {[
            { label: "Yoga", tag: "yoga" },
            { label: "Meditation", tag: "meditation" },
            { label: "Breathwork", tag: "breathwork" },
            { label: "Tanz", tag: "tanz" },
            { label: "Sound Healing", tag: "sound+healing" },
            { label: "Kakao-Zeremonie", tag: "kakao-zeremonie" },
            { label: "Schamanismus", tag: "schamanismus" },
          ].map(({ label, tag }, i) => (
            <span key={tag}>
              {i > 0 ? <span className="text-text-muted"> | </span> : null}
              <Link
                href={`/events?tag=${tag}`}
                className="text-text-secondary transition hover:text-accent-primary"
              >
                {label}
              </Link>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
