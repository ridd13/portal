import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Retreat Freiburg — Retreats & Auszeiten auf Das Portal",
  description:
    "Retreats in Freiburg und im Schwarzwald: Wochenend-Auszeiten, Stille-Retreats, Yoga- und Tantra-Retreats. Aktuelle Termine aus der Freiburger Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/freiburg/retreat",
  },
  openGraph: {
    title: "Retreat Freiburg — Das Portal",
    description:
      "Retreats in Freiburg und Umgebung — Wochenend-Auszeiten, Stille-Retreats, Yoga- und Tantra-Retreats. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/freiburg/retreat",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const RETREAT_TAGS = [
  "retreat",
  "auszeit",
  "rückzug",
  "stille",
  "silent retreat",
  "wochenend-retreat",
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

export default async function FreiburgRetreatPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Freiburg%,address.ilike.%freiburg%")
    .order("start_at", { ascending: true })
    .limit(20);

  const allEvents = deduplicateEvents((data || []) as Event[]);
  const events = allEvents.filter(
    (event) =>
      event.tags?.some((tag) =>
        RETREAT_TAGS.some((rt) => tag.toLowerCase().includes(rt))
      ) ||
      event.title?.toLowerCase().includes("retreat") ||
      event.title?.toLowerCase().includes("auszeit") ||
      event.event_format === "retreat"
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Retreats Freiburg",
    description:
      "Aktuelle Retreats und mehrtägige Auszeiten in Freiburg und Umgebung",
    url: "https://das-portal.online/freiburg/retreat",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
        location: {
          "@type": "Place",
          name: event.location_name || "Freiburg",
          address: event.address || "Freiburg",
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
            Freiburg · Retreats & Auszeiten
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Retreats in Freiburg — aktuelle Termine
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ein Retreat in oder um Freiburg? Hier findest du die
            aktuellen mehrtägigen Auszeiten der Freiburger Szene — vom
            Wochenend-Retreat im Schwarzwald bis zum Stille-Retreat in einem
            Klosterhof bei Staufen.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Freiburg"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Freiburg Events →
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
            Aktuelle Retreats in Freiburg & Umgebung
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Retreat-Termine gefunden — von Tagesretreats bis zu mehrtägigen Auszeiten.`
              : "Gerade keine Retreat-Termine — schau bald wieder rein oder trag dich in die Warteliste ein."}
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
                Aktuell keine Retreats in Freiburg gelistet.
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
                href="/events?city=Freiburg"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Freiburg Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Retreats in Freiburg — was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Freiburg ist eine der dichtesten Retreat-Regionen Süddeutschlands.
              Das hat zwei einfache Gründe: Eine aktive Facilitator-Szene in
              der Stadt und der Schwarzwald direkt vor der Haustür. Das eine
              kann ohne das andere kaum existieren.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die meisten Retreats finden nicht in Freiburg selbst statt,
              sondern in Seminarhäusern, Bauernhöfen und kleinen Hotels in der
              Region — Münstertal, Staufen, Glottertal, Hofsgrund. Anbieter
              aus Freiburg fahren mit ihren Gruppen raus, weg vom Stadtleben,
              rein in eine Umgebung die das eigentliche Retreat-Erleben erst
              möglich macht.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Bandbreite ist groß: Stille-Retreats über Vipassana-Linie,
              Tantra-Retreats über mehrere Tage, Yoga-Retreats mit Naturbezug,
              Frauen-Retreats mit Zyklus-Arbeit, schamanische Visionssuchen,
              Breathwork-Wochenenden. Das Portal listet alle, die öffentlich
              ausgeschrieben sind.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Retreat-Formate sind in Freiburg verbreitet?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Retreat ist nicht gleich Retreat. Der Begriff ist über die
              letzten Jahre so weich geworden, dass er von einem
              Sonntags-Workshop bis zu einer dreiwöchigen Klausur alles meinen
              kann. In der Freiburger Szene haben sich ein paar Formate
              etabliert, die du immer wieder findest:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Wochenend-Retreats (Fr–So):</strong>{" "}
              Das häufigste Format. Anreise Freitag Abend, Abreise Sonntag
              Nachmittag. Genug Zeit für echte Tiefe, kurz genug um neben dem
              Job machbar zu sein. Themen: Tantra, Breathwork, Yoga, Frauen-
              oder Männerkreise.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Stille- und Meditations-Retreats:</strong>{" "}
              Mehrere Anbieter in Freiburg arbeiten in der Vipassana-Linie
              oder mit Zen-Praxis. Das sind keine Wellness-Wochenenden — das
              ist tiefe Meditationsarbeit, oft drei bis sieben Tage, oft im
              Schweigen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tantra-Retreats:</strong>{" "}
              Freiburg hat eine erstaunlich gewachsene Tantra-Szene mit
              mehreren Schulen, die seit Jahren hier arbeiten. Retreats reichen
              vom Einsteiger-Wochenende bis zur einwöchigen Vertiefung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Yoga- und Bewegungs-Retreats:</strong>{" "}
              Klassische Yoga-Retreats, aber auch Mischformate mit Wandern,
              Schwarzwald-Spaziergängen und Körperarbeit. Beliebt im Frühjahr
              und Herbst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Schamanische und visionäre Retreats:</strong>{" "}
              Etwas seltener, aber fest in der Szene verankert. Visionssuchen
              im Schwarzwald, Medizin-Wochenenden, Naturverbindungs-Retreats.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Freiburger Retreat-Szene: Was sie besonders macht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Wenn du Retreats in München, Berlin oder Hamburg vergleichst,
              fällt dir bei Freiburg ein Unterschied auf: Die Anbieter sind
              in der Regel weniger konzern-glatt, dafür länger im Thema. Viele
              haben hier seit zehn, fünfzehn Jahren ihre Praxis aufgebaut.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Stadtteile wie die Wiehre, Herdern und Vauban sind Knotenpunkte
              der Szene — dort sitzen die Studios, die Praxen, die Yoga-Räume.
              Und von dort fährt die ganze Crew dann raus in die Retreatorte
              im Umland: Münstertal, Glottertal, Markgräflerland, Kaiserstuhl.
              Wer einmal in einem Retreat in einem alten Schwarzwaldhof war,
              versteht warum die Region so beliebt ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Dazu kommt die Nähe zur Schweiz und zum Elsass. Manche
              Freiburger Anbieter machen Retreats in Frankreich oder im
              Berner Oberland. Das Portal zeigt dir auch diese, wenn sie in
              der Stadt aufgesetzt werden.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind Retreats in Freiburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Ein Retreat ist keine kleine Entscheidung. Du investierst Zeit,
              Geld und meistens ein bisschen Mut. Die Frage "ist das was für
              mich?" ist also legitim.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die meisten Freiburger Retreats sind für Menschen, die
              regelmäßig oder zumindest gelegentlich mit Körperarbeit,
              Meditation oder ähnlichen Formaten zu tun hatten. Ein erstes
              Tantra-Retreat ohne jede Vorerfahrung kann viel sein. Ein erstes
              Stille-Retreat ohne Meditationspraxis ist hart. Anbieter
              schreiben die Voraussetzungen meist klar in die Beschreibung —
              und auf Das Portal siehst du diese Beschreibungen direkt mit
              der jeweiligen Veranstaltung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Einsteiger:innen sind Wochenend-Retreats mit
              Bewegungs-Schwerpunkt oder offene Themen-Wochenenden ein guter
              Einstieg. Für Erfahrenere lohnt sich der Blick auf die
              spezialisierten Schulen, die in Freiburg seit Jahren arbeiten.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Praktisch: Anmeldung, Preise, Anreise
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Anmeldung läuft fast immer direkt beim Anbieter, nicht über Das
              Portal. Wir leiten dich nach dem Klick auf das Event zur
              Anmeldeseite des Veranstalters weiter — du buchst direkt dort,
              das Portal ist Aggregator, kein Ticketshop.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Preise variieren stark. Ein Wochenend-Retreat in der Region
              liegt meist zwischen 250 und 500 Euro inklusive Unterkunft und
              Verpflegung. Spezialisierte Tantra- oder Schamanismus-Retreats
              können darüber liegen. Stille-Retreats laufen oft auf
              Spendenbasis, teils mit Richtwerten von 30–80 Euro pro Tag.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Anreise: Die meisten Retreatorte im Schwarzwald sind mit ÖPNV
              erreichbar, aber nicht alle. Anbieter organisieren oft
              Fahrgemeinschaften — frag im Anmeldeprozess nach. Bei
              abgelegeneren Häusern lohnt es sich, einen Mitfahrenden über
              den Telegram-Kanal zu finden.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Retreats in Freiburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was unterscheidet ein Retreat von einem normalen Workshop?",
                a: "Ein Retreat ist mehrtägig und meist mit Übernachtung. Du verlässt deinen Alltag, bist fokussiert auf die Praxis, isst und schläfst am Ort. Workshops dauern wenige Stunden bis einen Tag. Retreats gehen von zwei Tagen bis zu mehreren Wochen.",
              },
              {
                q: "Finde ich auf Das Portal nur Retreats in Freiburg selbst?",
                a: "Nein — wir listen Retreats die von Freiburger Anbietern organisiert werden, auch wenn sie im Schwarzwald, im Markgräflerland oder im Elsass stattfinden. Der Veranstalter sitzt in Freiburg, der Retreatort kann woanders sein.",
              },
              {
                q: "Sind Retreats für Anfänger geeignet?",
                a: "Manche ja, manche nein. Wochenend-Retreats und offene Themenformate sind oft anfängergeeignet. Stille-Retreats und spezialisierte Tantra-/Schamanismus-Retreats setzen meist Vorerfahrung voraus. Die Beschreibung beim jeweiligen Event auf Das Portal sagt dir, was vorausgesetzt wird.",
              },
              {
                q: "Was kostet ein Retreat in Freiburg?",
                a: "Wochenend-Retreats liegen typischerweise zwischen 250 und 500 Euro inklusive Unterkunft und Verpflegung. Längere Formate oder spezialisierte Schulen können teurer sein. Stille-Retreats laufen oft auf Spendenbasis. Den Preis siehst du immer direkt am Event.",
              },
              {
                q: "Muss ich vegan oder vegetarisch sein für ein Retreat?",
                a: "Die meisten Retreats in der Region kochen vegetarisch oder vegan. Allergien und Unverträglichkeiten sind kein Problem — gib sie bei der Anmeldung an. Wer reine Fleischverpflegung sucht, wird in der ganzheitlichen Szene seltener fündig.",
              },
              {
                q: "Kann ich als Anbieter mein Retreat auf Das Portal eintragen?",
                a: "Ja. Das Portal ist offen für alle Facilitator:innen, Coaches und Heiler:innen, die in der Region arbeiten. Trag dein Retreat unter /einreichen ein, wir prüfen und veröffentlichen.",
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
            Keine Retreats mehr verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Termine
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
