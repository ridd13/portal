import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events Schleswig-Holstein — Das Portal",
  description:
    "Ganzheitliche Events in Schleswig-Holstein: Retreats, Yoga, Meditation, Kakaozeremonien und mehr. Termine aus Kiel, Lübeck, Flensburg und der ganzen Region auf Das Portal.",
  alternates: {
    canonical:
      "https://www.das-portal.online/schleswig-holstein/ganzheitliche-events",
  },
  openGraph: {
    title: "Ganzheitliche Events Schleswig-Holstein — Das Portal",
    description:
      "Alle ganzheitlichen Events in Schleswig-Holstein. Von Kiel bis Flensburg, von Retreats bis Kakaozeremonie — Das Portal bündelt alle Termine der Region.",
    url: "https://www.das-portal.online/schleswig-holstein/ganzheitliche-events",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const SH_CITIES = [
  "Kiel",
  "Lübeck",
  "Flensburg",
  "Neumünster",
  "Norderstedt",
  "Elmshorn",
  "Pinneberg",
  "Heide",
  "Rendsburg",
  "Schleswig",
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SchleswigHolsteinGanzheitlicheEventsPage() {
  const supabase = getSupabaseServerClient();

  // Fetch events from SH cities (excluding Hamburg which has its own page)
  const cityFilters = SH_CITIES.map((city) => `address.ilike.%${city}%`).join(
    ","
  );

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or(cityFilters)
    .order("start_at", { ascending: true })
    .limit(12);

  const events = (data || []) as Event[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events Schleswig-Holstein",
    description:
      "Aktuelle ganzheitliche Events, Workshops und Retreats in Schleswig-Holstein",
    url: "https://www.das-portal.online/schleswig-holstein/ganzheitliche-events",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: event.start_at,
        location: {
          "@type": "Place",
          name: event.location_name || "Schleswig-Holstein",
          address: event.address || "Schleswig-Holstein",
        },
        url: `https://www.das-portal.online/events/${event.slug}`,
      },
    })),
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
            Von Kiel bis Flensburg, von Lübeck bis an die Westküste: Das
            Portal bündelt ganzheitliche Events aus ganz Schleswig-Holstein —
            Retreats, Workshops, Zeremonien und Community-Formate direkt aus
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

        {/* Quick Links zu Städten */}
        <section className="mt-8">
          <p className="text-sm text-text-secondary">Direkt zu einer Stadt:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { city: "Kiel", href: "/kiel/yoga" },
              { city: "Lübeck", href: "/events?city=Lübeck" },
              { city: "Flensburg", href: "/events?city=Flensburg" },
              { city: "Hamburg", href: "/hamburg/ganzheitliche-events" },
            ].map(({ city, href }) => (
              <Link
                key={city}
                href={href}
                className="rounded-full border border-border bg-bg-card px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-secondary"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>

        {/* Aktuelle Events */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Aktuelle ganzheitliche Events in Schleswig-Holstein
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine in der Region — von Retreat bis Meditationsabend.`
              : "Gerade keine Termine eingetragen — bald mehr. Oder schau in unserer Telegram-Community vorbei."}
          </p>

          {events.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-text-primary group-hover:text-accent-primary">
                      {event.title}
                    </h3>
                    {event.price_model === "free" && (
                      <span className="shrink-0 rounded-full bg-[#edf5e6] px-2 py-0.5 text-xs text-[#4b6841]">
                        kostenlos
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {formatDate(event.start_at)} · {formatTime(event.start_at)}
                  </p>
                  {event.location_name && (
                    <p className="mt-0.5 text-sm text-text-muted">
                      📍 {event.location_name}
                    </p>
                  )}
                  {event.tags && event.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {event.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-tag-bg px-2.5 py-0.5 text-xs text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-border bg-bg-card p-8 text-center">
              <p className="text-text-secondary">
                Aktuell keine Events in dieser Region eingetragen.
              </p>
              <Link
                href="/events"
                className="mt-3 inline-block text-sm text-accent-primary hover:underline"
              >
                Alle Events ansehen →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Schleswig-Holstein — wo steht die Szene?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Schleswig-Holstein ist kein Nischenmärkchen mehr. Wer die letzten
              fünf Jahre aufmerksam beobachtet hat, sieht: Das Angebot an
              ganzheitlichen Events hat sich — auch außerhalb Hamburgs —
              deutlich entwickelt. Kiel hat eine wachsende Yoga- und
              Breathwork-Szene. Lübeck eine für Meditation und sanftere
              Körperarbeit. Flensburg, trotz seiner überschaubaren Größe,
              überrascht immer wieder mit Retreat-Wochenenden und zeremoniellen
              Formaten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Problem: Diese Angebote sind verstreut. Kein zentrales
              Verzeichnis, keine gemeinsame Plattform. Wer nicht gerade in den
              richtigen Telegram-Gruppen ist oder zufällig dem richtigen
              Instagram-Account folgt, bekommt vieles gar nicht mit.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal ändert das — für Schleswig-Holstein und Hamburg
              zusammen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Was macht das ganzheitliche Angebot in SH besonders?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Zwei Dinge stechen heraus, wenn man die Region genauer anschaut.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Erstens: die Natur. Schleswig-Holstein hat Küste, Felder,
              Seenlandschaften — und das nutzen viele Anbieter. Retreat-Formate
              in Gutshäusern und Bauernhöfen, Outdoor-Meditation an der Ostsee,
              Waldbaden in der Holsteinischen Schweiz. Diese Art von Event
              findest du in einem urbanen Kontext nicht.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Zweitens: die Gemeinschaft. Viele Anbieter in der Region kennen
              sich, empfehlen sich gegenseitig, arbeiten zusammen. Was das
              Angebot manchmal übersichtlicher macht als in Hamburg — und
              gleichzeitig vertrauensvoller.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events nach Städten
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Kiel:</strong> Die
              Landeshauptstadt hat eine überschaubare aber stabile Szene.
              Yoga-Studios, Meditationsgruppen und vereinzelte
              Breathwork-Angebote. Für größere zeremonielle Formate fahren viele
              Kieler nach Hamburg.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Lübeck:</strong> Starke
              Yoga- und Meditationsbasis, einige Facilitators mit langjähriger
              Erfahrung. Lübeck hat ein ruhigeres Tempo als Hamburg — was zu
              bestimmten Formaten sehr gut passt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Flensburg:</strong> Kleiner
              Markt, aber aktive Community. Nah an Dänemark, was manchmal zu
              Kollaborationen über die Grenze führt. Einzelne Anbieter mit
              starker Verankerung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Ländliche Regionen:</strong>{" "}
              Retreats finden oft außerhalb der Städte statt — in Gutshäusern,
              auf Biohöfen, in Seminarräumen mit Naturanbindung. Das Portal
              listet diese Events mit vollständiger Adresse.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für Anbieter: Deine Events auf Das Portal
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Du bist Coach, Facilitator oder bietest ganzheitliche Formate in
              Schleswig-Holstein an? Das Portal ist für Menschen wie dich
              gebaut. Wir aggregieren Events aus der Region, machen sie für
              Menschen sichtbar, die aktiv suchen — und verbinden die Community
              über Telegram.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Kein Algorithmus, kein Pay-to-play, keine
              Reichweiten-Abhängigkeit. Einfach: dein Event, sichtbar für alle
              die es suchen.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Fragen zu ganzheitlichen Events in Schleswig-Holstein
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Welche Städte in SH haben das größte ganzheitliche Angebot?",
                a: "Kiel und Lübeck haben die aktivsten Szenen innerhalb Schleswig-Holsteins. Flensburg wächst. Für das breiteste Angebot in der Region ist Hamburg (direkt angrenzend) die erste Anlaufstelle.",
              },
              {
                q: "Gibt es Retreats in Schleswig-Holstein?",
                a: "Ja — das ist tatsächlich eine Stärke der Region. Retreats in Gutshäusern, an der Küste und in der Natur sind ein häufiges Format. Das Portal listet alle Retreat-Events aus SH, inklusive Standort und Datum.",
              },
              {
                q: "Wie finde ich ganzheitliche Events in meiner Stadt in SH?",
                a: "Nutze die Stadtfilterung auf Das Portal unter /events. Alternativ tritt der Telegram-Community bei — dort teilen Anbieter neue Termine direkt.",
              },
              {
                q: "Sind die Events auf Das Portal kuratiert?",
                a: "Ja. Das Portal listet Events von Facilitators und Anbietern, die dem Geist der ganzheitlichen Community entsprechen. Kein allgemeiner Veranstaltungskalender — Fokus auf Bewusstsein, Körper, Gemeinschaft.",
              },
              {
                q: "Kann ich als Anbieter meine Events kostenlos eintragen?",
                a: "Das Portal ist noch in der Beta-Phase. Trag dich in die Warteliste ein, wir informieren dich über den nächsten Schritt.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-border bg-bg-card p-6">
                <h3 className="font-medium text-text-primary">{q}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Bleib auf dem Laufenden
          </h2>
          <p className="mt-3 text-text-secondary">
            Neue Events aus Schleswig-Holstein direkt in deinem Telegram. Oder
            trag dich in die Warteliste für frühzeitigen Zugang zu Das Portal ein.
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
