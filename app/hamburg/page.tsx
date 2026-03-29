import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Hamburg — Termine & Community | Das Portal",
  description:
    "Finde ganzheitliche Events in Hamburg: Yoga, Breathwork, Kakaozeremonien, Retreats, Frauenkreise und mehr. Aktuelle Termine aus der Hamburger Community auf Das Portal.",
  alternates: {
    canonical: "https://www.das-portal.online/hamburg",
  },
  openGraph: {
    title: "Ganzheitliche Events in Hamburg — Das Portal",
    description:
      "Alle ganzheitlichen Events in Hamburg auf einen Blick. Yoga, Meditation, Breathwork, Kakaozeremonien und Retreats.",
    url: "https://www.das-portal.online/hamburg",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const categories = [
  {
    title: "Ganzheitliche Events",
    description:
      "Yoga, Breathwork, Meditation, Ecstatic Dance, Retreats und mehr — das volle Spektrum ganzheitlicher Formate in Hamburg.",
    href: "/hamburg/ganzheitliche-events",
  },
  {
    title: "Spirituelle Events",
    description:
      "Kakaozeremonien, Mondrituale, Frauenkreise, Soundhealing und zeremonielle Formate in Hamburg.",
    href: "/hamburg/spirituelle-events",
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HamburgPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .order("start_at", { ascending: true })
    .limit(8);

  const events = data || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ganzheitliche Events in Hamburg",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Hamburg",
    url: "https://www.das-portal.online/hamburg",
    isPartOf: { "@type": "WebSite", name: "Das Portal", url: "https://www.das-portal.online" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-8 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-12">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
            Hamburg · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Hamburg
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Hamburg hat eine der aktivsten ganzheitlichen Communities in
            Norddeutschland. Das Portal bündelt alle Termine — von Breathwork
            über Kakaozeremonien bis zu Retreats an der Alster.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Hamburg"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Hamburg Events →
            </Link>
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Telegram Community
            </Link>
          </div>
        </section>

        {/* Aktuelle Events */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Nächste Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Hamburger Community.`
              : "Aktuell keine Termine — schau bald wieder rein."}
          </p>

          {events.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {events.map((event: Record<string, unknown>) => (
                <Link
                  key={event.id as string}
                  href={`/events/${event.slug}`}
                  className="group rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-text-primary group-hover:text-accent-primary">
                      {event.title as string}
                    </h3>
                    {event.price_model === "free" && (
                      <span className="shrink-0 rounded-full bg-[#edf5e6] px-2 py-0.5 text-xs text-[#4b6841]">
                        kostenlos
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {formatDate(event.start_at as string)} · {formatTime(event.start_at as string)}
                  </p>
                  {Boolean(event.location_name) && (
                    <p className="mt-0.5 text-sm text-text-muted">
                      📍 {event.location_name as string}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/events?city=Hamburg"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Hamburg Events anzeigen →
            </Link>
          </div>
        </section>

        {/* Kategorien */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Events nach Kategorie
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {categories.map(({ title, description, href }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-border bg-bg-card p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="text-xl font-semibold text-text-primary group-hover:text-accent-primary">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {description}
                </p>
                <span className="mt-4 inline-block text-sm text-accent-primary">
                  Termine ansehen →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 space-y-6 text-text-primary">
          <h2 className="text-2xl font-semibold">
            Was macht die Hamburger Szene besonders?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            In Hamburg treffen sich eine stark internationalisierte Community und
            eine tief verwurzelte lokale Szene. Das Ergebnis: ein Angebot das
            sowohl divers als auch qualitativ hoch ist. Stadtviertel wie das
            Schanzenviertel, Altona, Eimsbüttel und Barmbek haben sich als
            Zentren für ganzheitliche Formate etabliert.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Viele Anbieter pendeln zwischen Studios, gemieteten Räumen und
            privaten Locations. Das macht das Auffinden von Events manchmal
            schwierig — genau dafür gibt es Das Portal: eine Übersicht die
            unabhängig von einzelnen Instagram-Accounts oder Telegram-Kanälen
            funktioniert und dir alle ganzheitlichen Events in Hamburg zeigt.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Von Kakaozeremonien im Schanzenviertel über Breathwork-Workshops in
            Altona bis hin zu Frauenkreisen in Eimsbüttel und Retreat-Wochenenden
            an der Alster — Hamburg hat für jeden Einstieg etwas. Die meisten
            Formate sind offen für alle und brauchen keine Vorerfahrung.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keine Events verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt der Telegram-Community bei und bekomm neue Events direkt
            zugeschickt.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Telegram Community beitreten
            </Link>
            <Link
              href="/#warteliste"
              className="rounded-full border border-border px-6 py-3 font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Auf die Warteliste
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
