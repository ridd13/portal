import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events Schwarzwald — Retreats & Workshops auf Das Portal",
  description:
    "Ganzheitliche Events im Schwarzwald: Retreats in der Natur, Embodiment, Breathwork, Heilarbeit, Frauen- und Männerkreise. Aktuelle Termine auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/schwarzwald/ganzheitliche-events",
  },
  openGraph: {
    title: "Ganzheitliche Events Schwarzwald — Das Portal",
    description:
      "Retreats, Workshops und Circles im Schwarzwald. Natur, Ruhe, Tiefe — alle Termine aus der Region auf einen Blick.",
    url: "https://das-portal.online/schwarzwald/ganzheitliche-events",
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

export default async function SchwarzwaldGanzheitlicheEventsPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Schwarzwald%,address.ilike.%schwarzwald%")
    .order("start_at", { ascending: true })
    .limit(12);

  const events = (data || []) as Event[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events Schwarzwald",
    description:
      "Aktuelle Retreats, Workshops und ganzheitliche Events im Schwarzwald",
    url: "https://das-portal.online/schwarzwald/ganzheitliche-events",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: event.start_at,
        location: {
          "@type": "Place",
          name: event.location_name || "Schwarzwald",
          address: event.address || "Schwarzwald",
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
            Schwarzwald · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events im Schwarzwald — Retreats & Workshops
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst Retreats und ganzheitliche Events im Schwarzwald? Hier
            findest du die aktuellen Termine: Natur-Retreats, Breathwork,
            Heilarbeit, Embodiment, Frauen- und Männerkreise — alle an einem
            Ort.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?region=Schwarzwald"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Schwarzwald Events →
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
            Aktuelle ganzheitliche Events im Schwarzwald
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Retreats bis zu Tageswork­shops.`
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
                href="/events?region=Schwarzwald"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Schwarzwald Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events im Schwarzwald — was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Der Schwarzwald ist für viele Facilitators und Community-Builder
              aus Freiburg, Stuttgart, Karlsruhe und der Schweiz der
              natürliche Rückzugsort. Wenn Workshops in der Stadt zu eng, zu
              laut oder zu voll werden, verlagert sich das Ganze aufs Land.
              Genau deswegen gibt es im Schwarzwald eine dichte
              Retreat-Landschaft — auch wenn die Szene selbst oft gar nicht
              hier lebt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Region reicht vom Hochschwarzwald mit Feldberg und Titisee
              über das Dreisamtal und Hotzenwald bis in den Ortenaukreis und
              ins Kinzigtal. Viele Retreat-Häuser liegen in alten Bauernhöfen,
              kleinen Seminarzentren oder umgebauten Gasthöfen — oft
              versteckt, meist mit eigener Küche, fast immer mit Zugang zu
              Wald und Bergen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal listet Retreats und Events aus der gesamten Region,
              organisiert von Anbietern aus dem DACH-Raum. Egal ob du dich zu
              einem Wochenend-Retreat anmelden willst, zu einer Breathwork-
              Journey oder zu einem Stille-Retreat — die Termine findest du
              hier.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Formate im Schwarzwald besonders stark sind
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Weil die Region primär Retreat-Ort ist, liegen die Schwerpunkte
              anders als in Städten. Einiges, was in der Stadt selten wird, ist
              hier Standard.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreat-Wochenenden:</strong>{" "}
              Das Kernformat. Freitag-Abend bis Sonntag-Nachmittag, kleine
              Gruppen (8–20 Menschen), feste Unterkunft, gemeinsames Essen,
              klares Programm. Themen: Embodiment, Breathwork, Stille,
              Beziehungsarbeit, Systemisches, Heilarbeit.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Natur-Arbeit und Vision Quests:</strong>{" "}
              Mehrtägige Formate draußen. Wanderungen mit meditativem Rahmen,
              Solo-Zeit im Wald, Übernachtung in Hütten oder Zelten. Eher
              saisonal (April bis Oktober).
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Intensiv-Wochen:</strong>{" "}
              Fünf- bis siebentägige Retreats, oft als Jahresprogramm-Module
              oder Trainings. Tantra-Trainings, Meditation-Intensive,
              Körperarbeit-Wochen — wer tiefer in ein Thema einsteigen will,
              findet diese Formate im Schwarzwald häufig.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Stille-Retreats:</strong>{" "}
              Vipassana-artige Formate, aber auch andere Traditionen. Mehrere
              Retreat-Häuser im Schwarzwald sind auf Stille spezialisiert.
              Rahmen: komplette Stille, einfache Kost, klarer Tagesablauf.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tanz und Embodiment in der Natur:</strong>{" "}
              Ecstatic-Dance-Retreats, Contact Improvisation, Somatics —
              oft in Verbindung mit Natur und Bewegung draußen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Der Schwarzwald als Retreat-Ort
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Warum der Schwarzwald so oft gewählt wird, ist einfach: die
              Mischung. Du hast hier echte Stille — nicht nur gedämpfte
              Großstadt-Stille, sondern tatsächliche Ruhe. Dazu Zugang zu
              dichtem Wald, Bergen, Flüssen, klarer Luft. Von fast jedem
              Retreat-Haus kommst du in zehn Minuten in den Wald.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Gleichzeitig ist die Region verkehrstechnisch gut angebunden.
              Zug nach Freiburg, Stuttgart, Karlsruhe oder Basel — von dort
              weiter mit Bus, Mitfahrgelegenheit oder Shuttle. Einige
              Retreat-Zentren organisieren Shuttle vom Bahnhof. Anreise mit
              Auto ist natürlich einfacher, gerade wenn du aus kleineren
              Orten kommst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Der Schwarzwald hat außerdem eine Tradition als Kur- und
              Rückzugsort. Das merkt man der Infrastruktur an: viele
              Gasthöfe, Ferienhäuser und Seminarzentren, die sich auf kleine
              Gruppen eingestellt haben. Für Facilitators macht es leichter,
              hier etwas zu organisieren — für Teilnehmer:innen heißt es in
              der Regel: ordentliches Zimmer, gutes Essen, reale Ruhe.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind Retreats und Events im Schwarzwald?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Für dich, wenn du rausgehen willst — aus dem Alltag, aus der
              Stadt, aus dem normalen Wochenrhythmus. Ein Retreat im
              Schwarzwald funktioniert anders als ein Abendworkshop in Berlin
              oder München. Du kommst an, bist zwei, drei oder mehr Tage
              eingebettet in einen Rahmen, der dich vom Alltag entkoppelt.
              Das ist genau der Punkt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Einsteiger:innen können Wochenend-Retreats eine gute
              Möglichkeit sein, tiefer in ein Thema einzutauchen als bei
              einem Abendworkshop. Rahmen, Gruppe, Zeit — das macht einiges
              möglich, was in 90 Minuten nicht geht. Bei intensiveren
              Retreats (Stille, Vision Quest, mehrwöchige Trainings) lohnt
              sich ein bisschen Vorerfahrung, steht aber immer in der
              Beschreibung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Erfahrene ist der Schwarzwald einer der schönsten Orte in
              Deutschland für längere Vertiefung. Gerade wenn du schon einen
              Teacher oder eine Methode kennst, mit der du arbeitest.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Preise, Anmeldung, Ablauf
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Retreat-Wochenenden im Schwarzwald liegen meist zwischen 300 und
              700 Euro — inklusive Unterkunft, Verpflegung (oft vegetarisch
              oder vegan) und Programm. Intensiv-Wochen zwischen 900 und 2500
              Euro, je nach Teacher und Länge. Tagesformate und einzelne
              Workshops liegen ähnlich wie in den Städten bei 80–150 Euro.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Anmeldung ist bei Retreats fast immer Pflicht, oft Wochen oder
              Monate im Voraus. Viele Formate sind schnell ausgebucht.
              Stornierungsbedingungen unterscheiden sich — schau dir das vor
              Buchung an.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ablauf typischerweise: Anreise Freitag-Nachmittag oder -Abend,
              gemeinsames Opening, Programm bis Sonntag-Mittag oder
              Nachmittag, Closing, Abreise. Bei längeren Retreats wird der
              Rhythmus tiefer, meist mit mehreren Sessions pro Tag, Pausen
              draußen, gemeinsamen Mahlzeiten und Sharing Circles.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu ganzheitlichen Events im Schwarzwald
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Wo im Schwarzwald finden die Events statt?",
                a: "Verteilt über die Region — Hochschwarzwald (Feldberg, Titisee, Hinterzarten), Dreisamtal, Hotzenwald, Kinzigtal, Ortenaukreis, Südschwarzwald. Der genaue Ort steht bei jedem Event. Viele Retreat-Häuser liegen in kleinen Dörfern und Höfen, teils abgelegen.",
              },
              {
                q: "Wie komme ich dorthin?",
                a: "Meist per Zug nach Freiburg, Stuttgart, Karlsruhe oder Basel — von dort weiter per Bus, Auto oder organisiertem Shuttle. Einige Retreat-Zentren bieten Shuttle ab Bahnhof an. Mit dem Auto ist die Anreise einfacher, gerade bei abgelegenen Orten.",
              },
              {
                q: "Was ist ein Retreat überhaupt?",
                a: "Ein mehrtägiges Format mit festem Rahmen — Unterkunft, Verpflegung, Programm. Du kommst an, bist für die Dauer des Retreats aus dem Alltag raus und arbeitest mit Gruppe und Teacher:in an einem Thema (Meditation, Breathwork, Embodiment, Beziehung, Stille, etc.).",
              },
              {
                q: "Für Anfänger geeignet?",
                a: "Viele ja. Ein Wochenend-Retreat ist oft ein guter Einstieg in ein Thema. Bei intensiveren Formaten (Stille-Retreats, längere Intensive) stehen Voraussetzungen in der Beschreibung. Wenn du unsicher bist: Anbieter kontaktieren.",
              },
              {
                q: "Was kosten Retreats im Schwarzwald?",
                a: "Wochenend-Retreats 300–700 Euro inklusive Unterkunft und Verpflegung. Intensiv-Wochen 900–2500 Euro. Tagesformate 80–150 Euro. Preise stehen direkt bei jedem Event.",
              },
              {
                q: "Was nehme ich mit?",
                a: "Bequeme Kleidung, warme Lagen (auch im Sommer), Regenjacke, feste Schuhe für draußen. Je nach Format: Meditations-Kissen, Decke, Journal. Eine Packliste kommt meist mit der Anmeldebestätigung vom Anbieter.",
              },
              {
                q: "Was ist mit Verpflegung?",
                a: "Meist ist Verpflegung im Preis enthalten. Oft vegetarisch oder vegan, regional, einfach gehalten. Allergien und Unverträglichkeiten solltest du bei der Anmeldung angeben — die meisten Häuser können das unterbringen.",
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
