import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Schleswig-Holstein — Termine & Community | Das Portal",
  description:
    "Ganzheitliche Events in Schleswig-Holstein: Retreats, Yoga, Meditation und Community-Formate in Kiel, Lübeck, Flensburg und der ganzen Region. Alle Termine auf Das Portal.",
  alternates: {
    canonical: "https://www.das-portal.online/schleswig-holstein",
  },
  openGraph: {
    title: "Ganzheitliche Events in Schleswig-Holstein — Das Portal",
    description:
      "Retreats, Yoga, Meditation und ganzheitliche Events in Schleswig-Holstein auf einen Blick.",
    url: "https://www.das-portal.online/schleswig-holstein",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const categories = [
  {
    title: "Ganzheitliche Events",
    description:
      "Von Kiel bis Flensburg, von Lübeck bis an die Westküste — Retreats, Workshops, Zeremonien und Community-Formate aus ganz Schleswig-Holstein.",
    href: "/schleswig-holstein/ganzheitliche-events",
  },
];

const cities = [
  { name: "Kiel", href: "/events?city=Kiel" },
  { name: "Lübeck", href: "/events?city=Lübeck" },
  { name: "Flensburg", href: "/events?city=Flensburg" },
  { name: "Neumünster", href: "/events?city=Neumünster" },
  { name: "Hamburg", href: "/hamburg" },
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

export default async function SchleswigHolsteinPage() {
  const supabase = getSupabaseServerClient();

  // Events aus ganz SH laden (alle Städte außer Hamburg)
  const shCities = ["kiel", "lübeck", "luebeck", "flensburg", "neumünster", "neumuenster",
    "norderstedt", "elmshorn", "itzehoe", "husum", "schleswig", "rendsburg",
    "pinneberg", "ahrensburg", "bad segeberg", "eutin", "plön"];

  const orFilter = shCities.map(c => `address.ilike.%${c}%`).join(",");

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, address, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or(orFilter)
    .order("start_at", { ascending: true })
    .limit(8);

  const events = data || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ganzheitliche Events in Schleswig-Holstein",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Schleswig-Holstein",
    url: "https://www.das-portal.online/schleswig-holstein",
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
            Schleswig-Holstein · Ganzheitliche Region
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Schleswig-Holstein
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Retreats in Gutshäusern, Yoga an der Ostsee, Meditationsabende in
            Kiel und Lübeck — Das Portal bündelt alle ganzheitlichen Termine
            der Region.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Events ansehen →
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
            Nächste Events in Schleswig-Holstein
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Region.`
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
              href="/events"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Events anzeigen →
            </Link>
          </div>
        </section>

        {/* Kategorien */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Events nach Kategorie
          </h2>
          <div className="mt-6">
            {categories.map(({ title, description, href }) => (
              <Link
                key={href}
                href={href}
                className="group block rounded-2xl border border-border bg-bg-card p-6 transition-shadow hover:shadow-md"
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

        {/* Städte */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">
            Events nach Stadt
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 space-y-6 text-text-primary">
          <h2 className="text-2xl font-semibold">
            Ganzheitliche Events zwischen den Meeren
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Schleswig-Holstein ist mehr als Strand und Deich. In den letzten
            Jahren hat sich eine wachsende Community aus Coaches, Facilitators,
            Yogalehrern und Heilpraktikern in der Region aufgebaut. Von
            Retreats auf alten Gutshöfen über Yoga-Morgen an der Ostsee bis zu
            Breathwork-Sessions in Kieler Lofts — das Angebot ist vielfältiger
            als man erwarten würde.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Die Szene verteilt sich auf mehrere Zentren: Kiel als
            Landeshauptstadt mit einer aktiven Yoga- und Meditationsszene,
            Lübeck mit starken Studio-Communities, Flensburg mit einer
            wachsenden Alternative-Szene, und das Umland mit Retreat-Locations
            die von der Nähe zur Natur profitieren. Dazu kommen die Inseln —
            Sylt, Föhr und Amrum — die vor allem im Sommer Retreat-Anbieter
            anziehen.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Das Problem war bisher: diese Events waren verstreut über
            Instagram-Stories, lokale Telegram-Gruppen und Mundpropaganda.
            Das Portal sammelt sie an einem Ort — filterbar nach Stadt,
            Kategorie und Datum.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Du bist Anbieter:in in Schleswig-Holstein?
          </h2>
          <p className="mt-3 text-text-secondary">
            Mach deine Events sichtbar — kostenlos, ohne Haken.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/fuer-facilitators"
              className="rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              So funktioniert es →
            </Link>
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-6 py-3 font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Telegram Community
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
