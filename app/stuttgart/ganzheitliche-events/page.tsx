import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events Stuttgart — Termine & Workshops auf Das Portal",
  description:
    "Ganzheitliche Events in Stuttgart: Ecstatic Dance, Meditation, Breathwork, Kakaozeremonien und Community-Formate. Aktuelle Termine aus der Stuttgarter Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/stuttgart/ganzheitliche-events",
  },
  openGraph: {
    title: "Ganzheitliche Events Stuttgart — Das Portal",
    description:
      "Die Stuttgarter Community für Bewegung, Bewusstsein und Heilarbeit. Tanz, Musik, Meditation, Embodiment — alle Termine auf einen Blick.",
    url: "https://das-portal.online/stuttgart/ganzheitliche-events",
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

export default async function StuttgartGanzheitlicheEventsPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Stuttgart%,address.ilike.%stuttgart%")
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events Stuttgart",
    description:
      "Aktuelle ganzheitliche Events, Workshops und Retreats in Stuttgart und Umgebung",
    url: "https://das-portal.online/stuttgart/ganzheitliche-events",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
        location: {
          "@type": "Place",
          name: event.location_name || "Stuttgart",
          address: event.address || "Stuttgart",
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
        <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-8 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-12">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
            Stuttgart · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Stuttgart — Termine & Workshops
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ganzheitliche Events in Stuttgart? Hier findest du die
            aktuellen Termine: Ecstatic Dance, Meditation, Breathwork,
            Kakaozeremonien, Musik und Community-Formate — alle an einem Ort.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Stuttgart"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Stuttgart Events →
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

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Aktuelle ganzheitliche Events in Stuttgart
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Tanz bis Meditation.`
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
                href="/events?city=Stuttgart"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Stuttgart Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Stuttgart — was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Stuttgart ist in der ganzheitlichen Szene oft übersehen — und
              das zu Unrecht. Die Stadt hat eine kleine, aber sehr aktive
              Community, die sich in den letzten Jahren merklich ausgeweitet
              hat. Ecstatic Dance, Community-Abende, Meditation, Breathwork,
              Sharing Circles — all das gibt es hier regelmäßig, meist
              getragen von einer Handvoll Anbieter:innen, die seit Jahren
              dranbleiben.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Geographisch liegt Stuttgart günstig zwischen Schwarzwald,
              Schwäbischer Alb und Bodensee. Viele der Stuttgarter Anbieter
              nutzen diese Nähe und organisieren Retreats im Umland —
              Wochenenden, Intensiv-Wochen, Natur-Formate. Stuttgart selbst
              ist das Zentrum für wöchentliche und monatliche Formate, das
              Umland übernimmt die mehrtägigen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal bündelt die Termine, damit du nicht drei verschiedene
              Newsletter abonnieren und zehn Instagram-Accounts folgen musst,
              um zu wissen, was am nächsten Wochenende stattfindet.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Formate in Stuttgart besonders stark sind
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Stuttgart hat eigene Schwerpunkte, die sich über die Jahre
              herausgearbeitet haben:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Ecstatic Dance und Bewegung:</strong>{" "}
              Eine der stärksten Kategorien in Stuttgart. Regelmäßige Ecstatic-
              Dance-Abende, Contact Improvisation, freie Bewegungsformate.
              Meist mit festem Rhythmus, oft wöchentlich oder alle zwei
              Wochen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Meditation und Kontemplation:</strong>{" "}
              Feste Gruppen, geführte Meditationen, offene Sitz-Abende. Die
              Formate sind meist niedrigschwellig und gut für Einsteiger:innen
              geeignet.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Sound, Musik und Heilarbeit:</strong>{" "}
              Klangschalen-Abende, Live-Musik-Meditationen, Sound-Journeys. Die
              Stuttgarter Szene hat einen Faible für musikalisch begleitete
              Formate.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Community und Circles:</strong>{" "}
              Sharing Circles, gemischte Community-Abende, Frauenkreise.
              Kleinere Gruppen, oft in privaten Räumen oder kleinen Studios.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats in Umland:</strong>{" "}
              Schwäbische Alb, Schwarzwald, Allgäu, Bodensee — viele
              Wochenend-Retreats werden von Stuttgartern organisiert, finden
              aber in der Natur statt. Anreise meist unter zwei Stunden.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Stuttgarter Szene: Was sie besonders macht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Was Stuttgart auszeichnet, ist die Verbindlichkeit. Die
              Community ist klein genug, dass regelmäßige Teilnehmer:innen
              sich kennen. Das hat Vorteile: Du triffst Menschen wieder, die
              Formate bekommen über die Zeit eine eigene Kultur, die Anbieter
              kennen ihre Stammgäste. Und es hat Grenzen: Die Dichte an
              spezialisierten Formaten ist kleiner als in Berlin, Freiburg
              oder München.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Stadtteile wie Stuttgart-West, Stuttgart-Ost, der Süden und die
              Innenstadt haben sich als Orte etabliert. Viele Formate laufen
              in festen Studios, Yoga-Räumen oder kleinen Seminarzentren.
              Einige Anbieter arbeiten in Privaträumen oder mieten sich
              punktuell in Locations ein.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Mischung aus ansässiger Community plus internationalem
              Einschlag — viele Stuttgarter:innen arbeiten bei internationalen
              Firmen, reisen viel, bringen Formate von anderswo mit — macht
              die Szene offener, als man vielleicht erwartet.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Stuttgart?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Wenn du in Stuttgart oder in der Region lebst und dich für
              Körper, Bewusstsein oder Community interessierst, findest du
              hier gute Einstiegspunkte. Die Szene ist nicht so laut wie in
              größeren Städten — was auch bedeutet, dass die Formate oft
              persönlicher und ruhiger sind.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Einsteiger:innen empfehlen sich wöchentliche
              Ecstatic-Dance-Abende, offene Meditation-Gruppen oder
              Sharing Circles. Keine Vorerfahrung, niedriges Commitment,
              guter Einstieg, um den Ton der Community zu spüren. Wenn du
              merkst, dass es dir taugt, kannst du tiefer einsteigen — mit
              Workshops oder Retreats im Umland.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Erfahrene gilt: Stuttgart hat nicht die Dichte von Berlin,
              aber die Qualität ist hoch. Wenn du schon weißt, was dir taugt,
              findest du hier Stammformate und Anbieter, die über Jahre
              arbeiten.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Preise, Anmeldung, Ablauf
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Wöchentliche Community-Formate wie Ecstatic Dance oder
              Meditations-Gruppen liegen meist bei 12–25 Euro. Tagesworkshops
              50–120 Euro. Retreat-Wochenenden im Umland 280–600 Euro.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die meisten offenen Formate kannst du spontan besuchen, bei
              Workshops und Retreats ist Voranmeldung Standard. Gerade
              Retreats sind oft Wochen im Voraus ausgebucht.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Jedes Event auf Das Portal zeigt Preis, Ort, Anmeldelink und
              Anbieter-Profil. Wenn du mehr über einen Anbieter wissen willst,
              findest du weitere Termine und eine Beschreibung im Host-Profil.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu ganzheitlichen Events in Stuttgart
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was sind ganzheitliche Events?",
                a: "Formate, die Körper, Geist und oft auch spirituelle Praxis zusammen denken. Yoga, Meditation, Breathwork, Kakaozeremonien, Ecstatic Dance, Frauenkreise, Sound Healing und Retreats gehören dazu.",
              },
              {
                q: "Wie groß ist die Stuttgarter Szene?",
                a: "Kleiner als in Berlin oder München, aber sehr aktiv. Die Community ist überschaubar genug, dass Stammteilnehmer:innen sich kennen — und groß genug, dass regelmäßig neue Formate entstehen.",
              },
              {
                q: "Wo finden die Events statt?",
                a: "Viele in Stuttgart-West, Stuttgart-Ost, im Süden und in der Innenstadt — meist in festen Studios, Yoga-Räumen oder kleinen Seminarzentren. Retreats meist im Umland: Schwäbische Alb, Schwarzwald, Allgäu, Bodensee.",
              },
              {
                q: "Sind die Events für Anfänger geeignet?",
                a: "Die meisten ja. Offene Formate wie Ecstatic Dance, Meditation oder Kakaozeremonien brauchen keine Vorerfahrung. Bei Workshops und Retreats stehen Voraussetzungen in der Beschreibung.",
              },
              {
                q: "Was kosten die Events?",
                a: "Wöchentliche Community-Formate 12–25 Euro, Workshops 50–120 Euro, Retreat-Wochenenden 280–600 Euro. Preise stehen bei jedem Event.",
              },
              {
                q: "Wie melde ich mich an?",
                a: "Jedes Event hat einen direkten Anmeldelink zum Anbieter. Bei offenen Formaten reicht oft spontanes Kommen, bei Workshops und Retreats solltest du vorher anmelden — gerade weil Plätze oft begrenzt sind.",
              },
              {
                q: "Gibt es Retreats rund um Stuttgart?",
                a: "Ja. Viele Stuttgarter Anbieter organisieren Wochenend-Retreats im Umland — Schwäbische Alb, Schwarzwald, Allgäu, Bodensee. Anreise meist unter zwei Stunden mit Auto oder Zug.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-border bg-bg-card p-6">
                <h3 className="font-medium text-text-primary">{q}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keine Events mehr verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Events direkt
            zugeschickt. Oder trag dich in die Warteliste für frühen Zugang zur
            Plattform ein.
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
