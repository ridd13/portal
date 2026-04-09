import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Niedersachsen — Termine & Community | Das Portal",
  description:
    "Ganzheitliche Events in Niedersachsen: Retreats, Yoga, Meditation und Community-Formate in Hannover, Braunschweig, Oldenburg, Lüneburg und der ganzen Region.",
  alternates: {
    canonical: "https://www.das-portal.online/niedersachsen",
  },
  openGraph: {
    title: "Ganzheitliche Events in Niedersachsen — Das Portal",
    description:
      "Retreats, Yoga, Meditation und ganzheitliche Events in Niedersachsen auf einen Blick.",
    url: "https://www.das-portal.online/niedersachsen",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const cities = [
  { name: "Hannover", href: "/events?city=Hannover" },
  { name: "Braunschweig", href: "/events?city=Braunschweig" },
  { name: "Oldenburg", href: "/events?city=Oldenburg" },
  { name: "Lüneburg", href: "/events?city=Lüneburg" },
  { name: "Osnabrück", href: "/events?city=Osnabrück" },
  { name: "Göttingen", href: "/events?city=Göttingen" },
  { name: "Wolfsburg", href: "/events?city=Wolfsburg" },
  { name: "Bremen", href: "/bremen" },
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

export default async function NiedersachsenPage() {
  const supabase = getSupabaseServerClient();

  const nsCities = ["hannover", "braunschweig", "oldenburg", "lüneburg", "lueneburg",
    "osnabrück", "osnabrueck", "göttingen", "goettingen", "wolfsburg", "hildesheim",
    "salzgitter", "delmenhorst", "wilhelmshaven", "celle", "leer", "emden",
    "cuxhaven", "stade", "niedersachsen"];

  const orFilter = nsCities.map(c => `address.ilike.%${c}%`).join(",");

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
    name: "Ganzheitliche Events in Niedersachsen",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Niedersachsen",
    url: "https://www.das-portal.online/niedersachsen",
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
            Niedersachsen · Ganzheitliche Region
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Niedersachsen
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Von Hannover bis zur Nordsee, von Lüneburg bis Göttingen —
            Niedersachsen hat eine wachsende ganzheitliche Community.
            Das Portal bündelt alle Termine der Region.
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
            Nächste Events in Niedersachsen
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
                      {event.location_name as string}
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
            Ganzheitliche Szene in Niedersachsen
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Niedersachsen ist flächenmäßig das zweitgrößte Bundesland und
            entsprechend vielfältig: In Hannover gibt es eine etablierte
            Yoga- und Meditationsszene, Lüneburg profitiert von seiner Nähe
            zu Hamburg und zieht kreative Facilitators an, und Oldenburg
            hat eine überraschend lebendige alternative Community.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Besonders im ländlichen Raum boomen Retreats — Gutshöfe in der
            Lüneburger Heide, Seminarhäuser an der Nordsee und umgebaute
            Bauernhöfe im Weserbergland bieten perfekte Bedingungen für
            mehrtägige Formate. Das Portal macht dieses verteilte Angebot
            sichtbar und hilft dir, das richtige Event zu finden.
          </p>
        </section>

        {/* Nachbar-Regionen */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">
            Weitere Regionen
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { name: "Hamburg", href: "/hamburg" },
              { name: "Bremen", href: "/bremen" },
              { name: "Schleswig-Holstein", href: "/schleswig-holstein" },
              { name: "Mecklenburg-Vorpommern", href: "/mecklenburg-vorpommern" },
            ].map(({ name, href }) => (
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

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Du bist Anbieter in Niedersachsen?
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
