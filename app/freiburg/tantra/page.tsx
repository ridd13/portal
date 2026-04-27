import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tantra Freiburg — Workshops, Retreats & Circles auf Das Portal",
  description:
    "Tantra in Freiburg: Workshops, Paarseminare, Tantramassage-Kurse und Retreats im Schwarzwald. Aktuelle Termine aus der Freiburger Community auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/freiburg/tantra",
  },
  openGraph: {
    title: "Tantra Freiburg — Das Portal",
    description:
      "Tantra Workshops, Retreats und Community-Events in Freiburg und im Schwarzwald. Alle Termine auf einen Blick.",
    url: "https://das-portal.online/freiburg/tantra",
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

export default async function FreiburgTantraPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Freiburg%,address.ilike.%freiburg%")
    .contains("tags", ["tantra"])
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tantra Events in Freiburg",
    description:
      "Tantra Workshops, Retreats und Community-Events in Freiburg und im Schwarzwald",
    url: "https://das-portal.online/freiburg/tantra",
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
            Freiburg · Tantra
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Tantra in Freiburg — Workshops, Retreats & Circles
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Tantra Workshops, Paarseminare und mehrtägige Retreats in Freiburg
            und im Schwarzwald. Aktuelle Termine aus einer der lebendigsten
            Tantra-Szenen im deutschsprachigen Raum — auf einen Blick.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/freiburg/ganzheitliche-events"
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
            Aktuelle Tantra Events in Freiburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von offenen Abenden bis zu mehrtägigen Retreats.`
              : "Gerade keine Tantra-Termine in Freiburg — schau bald wieder rein oder tritt unserer Telegram-Community bei."}
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
                Aktuell keine Tantra-Events in Freiburg.
              </p>
              <Link
                href="/freiburg/ganzheitliche-events"
                className="mt-3 inline-block text-sm text-accent-primary hover:underline"
              >
                Alle Freiburg Events ansehen →
              </Link>
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/freiburg/ganzheitliche-events"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle ganzheitlichen Events in Freiburg →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Warum Freiburg für Tantra eine der ersten Adressen ist
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Freiburg hat sich in den letzten zwanzig Jahren als einer der
              stabilsten Tantra-Standorte im deutschsprachigen Raum etabliert.
              Das ist keine zufällige Entwicklung — die Kombination aus
              Schwarzwald-Nähe, einer breiten ganzheitlichen Szene und einer
              Stadt, in der Körperarbeit und Bewusstseinsarbeit nie als
              Randthemen behandelt wurden, hat dafür gesorgt, dass hier
              mehrere etablierte Tantra-Schulen und unabhängige Facilitators
              arbeiten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Wichtig vorweg, weil es viele Missverständnisse gibt: Seriöses
              Tantra ist keine sexuelle Dienstleistung. Tantra ist eine alte
              Tradition, die Körper, Atem, Bewusstsein und Energiearbeit
              integriert. Sexualität ist ein Teil davon, aber im Kontext von
              Präsenz, Verbindung und Bewusstwerdung — nicht als Kernprodukt.
              Wer das nicht trennt, verwechselt Tantra mit erotischen
              Angeboten, die den Begriff missbrauchen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Freiburger Szene nimmt diese Abgrenzung ernst. Die meisten
              Anbieter:innen arbeiten mit klaren ethischen Standards,
              ausgebildet in mehrjährigen Curricula, mit strukturierten
              Consent-Prozessen und ohne Graubereiche.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Tantra-Formate gibt es in Freiburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Bandbreite ist groß. Ein paar Orientierungspunkte:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Offene Abende und Einsteiger-Formate:</strong>{" "}
              Kurze Termine (2–3 Stunden) mit Meditation, Atemarbeit, einfachen
              Partnerübungen. Der sinnvolle Erstkontakt, wenn du wissen willst,
              ob Tantra für dich überhaupt relevant ist. Kosten meist 25–50 €.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Workshop-Wochenenden:</strong>{" "}
              2–3 Tage, oft in Freiburg oder im näheren Schwarzwald. Tiefer
              als offene Abende — du arbeitest länger, es gibt einen
              geschlossenen Teilnehmerkreis, klarere energetische Bögen.
              Preislich meist 200–400 €.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Paarseminare:</strong>{" "}
              Spezifisch für Paare, die an Nähe, Intimität und bewusster
              Sexualität arbeiten wollen. Diese Formate sind oft therapeutisch
              angelehnt und werden von Paaren aus ganz Deutschland besucht.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tantramassage-Kurse:</strong>{" "}
              Trainings für Privatpersonen oder angehende Masseur:innen.
              Körperarbeit mit klarem pädagogischem Rahmen. In Freiburg gibt
              es mehrere Ausbildungsinstitute, die international unterrichten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats im Schwarzwald:</strong>{" "}
              Mehrtägige Formate, oft 5–10 Tage, in abgelegenen Häusern. Das
              ist die Tiefe — geschlossener Raum, intensive Gruppenprozesse,
              meditative Stille-Phasen kombiniert mit Körper- und
              Energiearbeit. Nicht als Einstieg gedacht.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Was Freiburger Tantra von Berlin oder München unterscheidet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Berlin hat eine junge, clubnahe Tantra-Szene, die sich stark
              mit queeren und sex-positiven Communities überschneidet. München
              ist eher klassisch-etabliert, oft teurer, kleinere Kreise.
              Freiburg liegt dazwischen: gewachsen, substanziell, aber ohne
              elitären Gestus. Viele Lehrer:innen arbeiten seit 15 bis 25
              Jahren in der Stadt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das bedeutet für dich: Du findest hier seltener die experimentell
              aufgeladenen Berliner Formate, dafür eine hohe Dichte an gut
              ausgebildeten Facilitators mit verlässlicher Arbeit. Wenn du
              das erste Mal in die Tantra-Welt einsteigst, ist Freiburg eine
              der sichersten Städte für diesen Schritt.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Tantra in Freiburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Für Singles und Paare. Für Menschen, die mit dem eigenen Körper
              in ein anderes Verhältnis kommen wollen. Für Menschen in
              Beziehungen, die an Tiefe und Präsenz arbeiten. Für Menschen,
              die das Gefühl haben, dass ihre Sexualität entweder abgeschnitten
              oder schematisch geworden ist und sich wieder beleben soll.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was du mitbringen solltest: Bereitschaft, dich wahrzunehmen.
              Offenheit für Körperarbeit. Die Fähigkeit, im eigenen Tempo zu
              bleiben und Nein zu sagen, wenn etwas nicht passt — seriöse
              Tantra-Arbeit respektiert das immer. Wenn du eine schwere
              Traumageschichte hast, such dir zusätzlich therapeutische
              Begleitung. Tantra ersetzt keine Therapie.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Tantra in Freiburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Ist Tantra sexuell?",
                a: "Sexualität ist ein Teil der tantrischen Praxis, aber nicht ihr Kern. Seriöse Tantra-Events fokussieren auf Präsenz, Atem, Körperwahrnehmung und Energiearbeit. Nackte Berührung, Penetration oder sexuelle Handlungen gehören in offenen Workshops und Retreats explizit nicht dazu. Angebote, die das versprechen, arbeiten nicht im Tantra-Sinn.",
              },
              {
                q: "Ich war noch nie bei so etwas. Ist ein Wochenend-Retreat ok als Einstieg?",
                a: "Nicht optimal. Fang mit einem offenen Abend oder einem Eintages-Format an. So siehst du, ob die Arbeitsweise und der Facilitator zu dir passen, bevor du dich in einen mehrtägigen geschlossenen Raum begibst. Aktuelle Einsteiger-Termine siehst du im Event-Grid oben.",
              },
              {
                q: "Kann ich als Single zu Paarformaten kommen?",
                a: "Nein, Paarseminare sind reserviert für Paare. Es gibt aber genug offene Formate, die für Singles ausgelegt sind — Übungen passieren dort mit wechselnden Partner:innen oder in Gruppen. Keine Sorge, du sitzt nicht neben jemandem fest.",
              },
              {
                q: "Was kostet Tantra in Freiburg?",
                a: "Offene Abende liegen meist zwischen 25 und 50 €. Wochenend-Workshops kosten 200–400 €. Paarseminare und Tantramassage-Kurse bewegen sich zwischen 400 und 800 € für zwei bis drei Tage. Schwarzwald-Retreats (5–10 Tage) kosten je nach Haus und Dauer 600 bis 1.500 € inklusive Unterkunft und Verpflegung.",
              },
              {
                q: "Wie erkenne ich seriöse Tantra-Anbieter in Freiburg?",
                a: "Ein paar Indikatoren: Klare Website mit Biografie, überprüfbare Ausbildung (Diamond Lotus, Sky Dancing, ISTA, Sanandas oder vergleichbar), transparente Preise, explizite Consent-Policies, kein Druck auf der Webseite. Meide Angebote, die hauptsächlich mit sexuellen Versprechen arbeiten oder keine klare Facilitator-Biografie haben.",
              },
              {
                q: "Gibt es Tantra-Retreats im Schwarzwald?",
                a: "Ja, das Umland ist eines der aktivsten Retreat-Gebiete für Tantra in Deutschland. Mehrere Häuser im Münstertal, im Südschwarzwald und rund um Sankt Peter werden regelmäßig für mehrtägige Tantra-Formate gebucht. Im Event-Grid oben siehst du aktuelle Termine inklusive der Retreats.",
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
            Neue Tantra-Termine in Freiburg nicht verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Events direkt
            zugeschickt. Oder trag dich in die Warteliste für frühen Zugang
            zur Plattform ein.
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
