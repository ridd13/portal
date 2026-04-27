import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events Hamburg — Termine & Workshops auf Das Portal",
  description:
    "Ganzheitliche Events in Hamburg: Kakaozeremonien, Breathwork, Meditation, Frauenkreise und mehr. Aktuelle Termine aus der Hamburger Community auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/ganzheitliche-events",
  },
  openGraph: {
    title: "Ganzheitliche Events Hamburg — Das Portal",
    description:
      "Die besten ganzheitlichen Events in Hamburg. Yoga, Meditation, Breathwork, Retreats und Community-Formate — alle Termine auf einen Blick.",
    url: "https://das-portal.online/hamburg/ganzheitliche-events",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

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

export default async function HamburgGanzheitlicheEventsPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events Hamburg",
    description:
      "Aktuelle ganzheitliche Events, Workshops und Retreats in Hamburg",
    url: "https://das-portal.online/hamburg/ganzheitliche-events",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
        location: {
          "@type": "Place",
          name: event.location_name || "Hamburg",
          address: event.address || "Hamburg",
        },
        url: `https://das-portal.online/events/${event.slug}`,
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
            Hamburg · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Hamburg — Termine & Workshops
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ganzheitliche Events in Hamburg? Hier findest du alle
            aktuellen Termine: Kakaozeremonien, Breathwork-Workshops,
            Meditationen, Frauenkreise und Retreats — direkt aus der Hamburger
            Community.
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
            Aktuelle ganzheitliche Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Yoga bis Kakaozeremonie.`
              : "Gerade keine Termine — schau bald wieder rein oder trag dich in die Warteliste ein."}
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
                Aktuell keine Events in dieser Kategorie.
              </p>
              <Link
                href="/events"
                className="mt-3 inline-block text-sm text-accent-primary hover:underline"
              >
                Alle Events ansehen →
              </Link>
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/events?city=Hamburg"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Hamburg Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Hamburg — was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Hamburg hat eine der aktivsten ganzheitlichen Communities in
              Norddeutschland. Das klingt zunächst vielleicht wie ein
              Marketing-Versprechen — ist es aber nicht. In der Stadt findet
              sich eine dichte Szene aus Facilitators, Coaches, Heilpraktikern
              und Community-Buildern, die regelmäßig Formate anbieten, die
              anderswo kaum zu finden sind.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ganzheitliche Events in Hamburg reichen von Kakaozeremonien im
              Schanzenviertel über Breathwork-Workshops in Altona bis hin zu
              Frauenkreisen in Eimsbüttel und Retreat-Wochenenden an der
              Alster. Die Bandbreite ist groß — und genau das macht es
              manchmal schwer, den Überblick zu behalten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal bündelt alle diese Angebote an einem Ort. Kein
              Durchklicken durch Instagram-Profile, kein Verpassen von
              Terminen weil du zum falschen Zeitpunkt auf der falschen Seite
              warst.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche ganzheitlichen Events gibt es in Hamburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Kategorien überschneiden sich oft — was für eine Person ein
              spirituelles Event ist, ist für eine andere einfach ein guter
              Workshop. Trotzdem lassen sich ein paar Schwerpunkte
              herausarbeiten, die in Hamburg besonders stark vertreten sind:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Körperarbeit und Bewegung:</strong>{" "}
              Yoga, Contact Improvisation, Ecstatic Dance und Somatic Movement
              haben in Hamburg eine treue Community. Wöchentliche Formate,
              aber auch Intensiv-Workshops und Einzeltage.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Atemarbeit und Meditation:</strong>{" "}
              Breathwork — ob Holotropes Atmen, Wim Hof oder eher sanfte
              Pranayama-Formate — ist in Hamburg fest verankert. Dazu kommen
              Meditationsabende, Stille-Retreats und geführte
              Bewusstseinsformate.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Zeremonielle Formate:</strong>{" "}
              Kakaozeremonien, Frauenkreise, Mondrituale. Diese Formate haben
              in den letzten Jahren stark zugenommen. Was früher nur in kleinen
              Zirkeln stattfand, ist heute öffentlich zugänglich und
              professionell begleitet.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats und mehrtägige Formate:</strong>{" "}
              Nicht alle Hamburger Retreats finden in Hamburg selbst statt —
              viele Anbieter organisieren Wochenend-Retreats in
              Schleswig-Holstein, auf den Inseln oder in der näheren Umgebung.
              Das Portal listet auch diese.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Hamburger Szene: Was sie besonders macht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Was Hamburg von anderen Städten unterscheidet, ist die
              Mischung. Du hast hier gleichzeitig eine stark internationalisierte
              Community (viele Expats, viel Englisch) und eine tief verwurzelte
              lokale Szene. Das führt dazu, dass das Angebot sowohl sehr divers
              als auch qualitativ hoch ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Stadtviertel wie das Schanzenviertel, Altona, Eimsbüttel und
              Barmbek haben sich als Zentren etabliert. Viele Anbieter pendeln
              zwischen verschiedenen Locations — feste Studios, gemietete
              Räume, private Locations. Das macht das Auffinden von Events
              manchmal tricky, wenn man nicht vernetzt ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Genau da setzt Das Portal an: Eine Übersicht, die unabhängig von
              einzelnen Instagram-Accounts oder Telegram-Kanälen funktioniert
              und dir alle ganzheitlichen Events in Hamburg an einem Ort zeigt.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Hamburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Eine Frage, die ich immer wieder höre: "Bin ich überhaupt die
              richtige Person für sowas?" Und meine ehrliche Antwort: Wenn du
              dich für Körper, Geist und Bewusstsein interessierst — ja.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ganzheitliche Events sind weder esoterisch-exklusiv noch
              therapeutisch-heavy. Die meisten Formate sind offen für alle,
              brauchen keine Vorerfahrung und funktionieren solo wie mit
              Begleitung. Ob du schon seit Jahren in der Szene bist oder
              gerade zum ersten Mal schaust — das Angebot in Hamburg ist breit
              genug, um einen passenden Einstieg zu finden.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu ganzheitlichen Events in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was genau sind ganzheitliche Events?",
                a: "Ganzheitliche Events verbinden Körper, Geist und manchmal auch spirituelle Praxis. Dazu zählen Yoga- und Meditationsformate, Breathwork, Kakaozeremonien, Frauenkreise, Ecstatic Dance, Retreats und ähnliche Formate — alles was über rein mentale oder rein körperliche Angebote hinausgeht.",
              },
              {
                q: "Wie finde ich aktuelle ganzheitliche Events in Hamburg?",
                a: "Das Portal zeigt dir alle aktuellen Termine in Hamburg auf einer Seite. Du kannst nach Kategorie, Datum und Stadtteil filtern. Alternativ tritt unserer Telegram-Community bei — dort werden neue Events direkt geteilt.",
              },
              {
                q: "Sind die Events für Anfänger geeignet?",
                a: "Die meisten ja. Bei jedem Event auf Das Portal siehst du die Beschreibung und kannst prüfen, ob Vorerfahrung empfohlen wird. Grundsätzlich sind die meisten Community-Formate bewusst offen gestaltet.",
              },
              {
                q: "Was kosten ganzheitliche Events in Hamburg?",
                a: "Das variiert stark: Manche Community-Formate sind kostenlos oder auf Spendenbase. Workshops liegen meist zwischen 20 und 80 Euro. Retreat-Wochenenden können 200–500 Euro kosten. Das Portal zeigt dir das Preismodell direkt in der Event-Übersicht.",
              },
              {
                q: "Kann ich als Anbieter meine Events auf Das Portal eintragen?",
                a: "Ja — Das Portal ist für Coaches, Facilitators und Heilerinnen aus Schleswig-Holstein und Hamburg gedacht. Trag dich in die Warteliste ein, wir melden uns mit den nächsten Schritten.",
              },
              {
                q: "Gibt es auch Retreats in der Nähe von Hamburg?",
                a: "Ja, viele Hamburger Anbieter organisieren Retreats in Schleswig-Holstein, auf Sylt, Föhr oder in der Lüneburger Heide. Das Portal listet auch diese — filterbar nach Entfernung und Kategorie.",
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
            Keine Events mehr verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Events
            direkt zugeschickt. Oder trag dich in die Warteliste für frühen
            Zugang zur Plattform ein.
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
