import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Retreat Schwarzwald — Auszeiten in der Natur auf Das Portal",
  description:
    "Retreats im Schwarzwald: Wochenend-Auszeiten, Stille-Retreats, Yoga- und Naturretreats in den Schwarzwaldhöfen. Aktuelle Termine auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/schwarzwald/retreat",
  },
  openGraph: {
    title: "Retreat Schwarzwald — Das Portal",
    description:
      "Retreats im Schwarzwald — mehrtägige Auszeiten, Stille-Retreats, Yoga- und Naturretreats. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/schwarzwald/retreat",
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

export default async function SchwarzwaldRetreatPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Schwarzwald%,address.ilike.%schwarzwald%")
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
    name: "Retreats Schwarzwald",
    description:
      "Aktuelle Retreats und mehrtägige Auszeiten im Schwarzwald",
    url: "https://das-portal.online/schwarzwald/retreat",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
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
        {/* Hero */}
        <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-8 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-12">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
            Schwarzwald · Retreats in der Natur
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Retreat im Schwarzwald — aktuelle Termine
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ein Retreat im Schwarzwald? Hier findest du die
            aktuellen Auszeiten in der Region — vom Stille-Wochenende auf
            einem alten Hof bei Titisee bis zum Yoga-Retreat im Münstertal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/schwarzwald/ganzheitliche-events"
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

        {/* Aktuelle Events */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Aktuelle Retreats im Schwarzwald
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Retreat-Termine gefunden — von Wochenend-Auszeiten bis zu mehrtägigen Klausuren.`
              : "Gerade keine Retreats gelistet — schau bald wieder rein oder trag dich in die Warteliste ein."}
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
                Aktuell keine Retreats im Schwarzwald gelistet.
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
                href="/schwarzwald/ganzheitliche-events"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Schwarzwald Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Retreat im Schwarzwald — was die Region besonders macht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Der Schwarzwald ist eine der dichtesten Retreat-Regionen
              Deutschlands. Das hat einen einfachen Grund: Du bist innerhalb
              von Minuten in echter Natur, hast aber gleichzeitig die
              Infrastruktur, dass dreißig Leute mit Aufnahme-Bett und Vollpension
              ein Wochenende verbringen können. Die alten Schwarzwaldhöfe,
              ehemaligen Klosterhäuser und kleinen Seminarhotels sind dafür
              wie gemacht.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Anbieter aus Freiburg, Stuttgart, Karlsruhe und Basel kommen
              hier her. Das macht den Schwarzwald zur Bühne für Retreats, die
              nicht alle aus der Region selbst kommen — sondern aus den Städten
              ringsum. Die Retreatorte sind oft kleine Höfe, die seit Jahren
              Gruppen empfangen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Angebot ist breit: Stille-Retreats, Yoga-Retreats,
              Tantra-Retreats, schamanische Retreats, Familien-Retreats,
              Frauen-Retreats. Manches richtet sich an Einsteiger:innen, anderes
              setzt mehrjährige Praxis voraus.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Retreat-Formate findest du im Schwarzwald?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Der Begriff Retreat ist weit. Im Schwarzwald begegnest du immer
              wieder ein paar Formaten, die hier besonders gut funktionieren —
              meist weil die Naturkulisse und die Stille ein wichtiger Teil
              des Formats sind:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Stille-Retreats:</strong>{" "}
              Mehrere etablierte Stille-Häuser im Schwarzwald arbeiten in der
              Zen-Tradition, in der Vipassana-Linie oder mit christlich-
              kontemplativer Praxis. Drei bis sieben Tage, oft komplett
              schweigend, mit klarer Tagesstruktur.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Yoga- und Meditations-Retreats:</strong>{" "}
              Das beliebteste Format. Wochenende oder eine Woche, meist mit
              zwei Yoga-Einheiten am Tag, Meditationssitzungen und freier
              Zeit für Spaziergänge. Im Frühjahr und Herbst sind diese
              Retreats fast immer ausgebucht.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tantra- und Beziehungs-Retreats:</strong>{" "}
              Tantra-Retreats über Tantra-Schulen aus Freiburg, Basel oder
              Stuttgart finden regelmäßig im Schwarzwald statt. Auch
              Paar-Retreats und Workshops mit Beziehungs-Schwerpunkt sind
              hier vertreten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Schamanische und Naturverbindungs-Retreats:</strong>{" "}
              Visionssuchen, Medizinwochenenden, Naturverbindungs-Retreats. Der
              Schwarzwald als Übungsfeld passt genau zu diesen Formaten —
              echte Wildnis ist nie weit, gleichzeitig hast du die
              Sicherheit eines bewohnten Mittelgebirges.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Breathwork- und Embodiment-Retreats:</strong>{" "}
              Wim-Hof-Retreats mit Eisbad in einem Bach, Holotropes Atmen über
              ein Wochenende, somatische Embodiment-Retreats. Die
              Kombination aus Naturbezug und Körperarbeit funktioniert hier
              besonders gut.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Wo finden Retreats im Schwarzwald statt?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Retreatorte verteilen sich über die ganze Region. Ein paar
              Hotspots:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Hochschwarzwald (Titisee, Hinterzarten, Feldberg):</strong>{" "}
              Klassische Retreathäuser auf 800–1.200 Metern Höhe. Etwas
              kühler, etwas stiller, sehr klar. Beliebt für Stille- und
              Yoga-Retreats.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Münstertal und Markgräflerland:</strong>{" "}
              Sanfter, milder, weinbau-geprägt. Viele kleinere Höfe und
              Seminarhäuser. Beliebt für Yoga- und Frauen-Retreats.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Nordschwarzwald (rund um Baiersbronn, Freudenstadt):</strong>{" "}
              Größere Seminarhäuser, mehr Hotellerie-Charakter, oft
              luxuriösere Retreats mit Wellness-Anteil.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Mittlerer Schwarzwald (Gutach, Wolfach, Kinzigtal):</strong>{" "}
              Klassische Schwarzwaldhöfe, oft familiär geführt, ruhig
              gelegen. Ideal für kleinere Retreatgruppen und intensivere
              Formate.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind Retreats im Schwarzwald geeignet?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Retreats im Schwarzwald sind grundsätzlich gut zugänglich. Die
              Region ist bekannt, die Anreise machbar, das Niveau der Häuser
              meist hoch. Was du mitbringen solltest, hängt vom Format ab.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für ein Wochenend-Yoga-Retreat braucht es keine Vorerfahrung.
              Für ein einwöchiges Stille-Retreat solltest du regelmäßig
              meditieren, sonst werden die ersten Tage hart. Für tantrische
              oder schamanische Vertiefungs-Retreats setzen die Schulen
              häufig Vorworkshops oder Erfahrung mit dem jeweiligen Lehrer
              voraus.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was du auf jeden Fall mitbringen solltest: warme Kleidung. Auch
              im Sommer. Und feste Schuhe. Der Schwarzwald ist nicht der Ort
              für Sneaker im Stadtmodus.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Praktisch: Anreise, Preise, Anmeldung
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Anreise mit der Bahn ist meist möglich, aber je nach Ort
              umständlich. Viele Retreats organisieren Sammeltransfers vom
              nächsten Bahnhof oder Fahrgemeinschaften. Frag im
              Anmeldeprozess danach — Anbieter haben das fast immer auf dem
              Schirm.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Preisrahmen: Wochenend-Retreats kosten meist 250–500 Euro
              inklusive Unterkunft und Verpflegung. Längere Retreats und
              spezialisierte Formate liegen darüber. Stille-Retreats laufen
              oft auf Spendenbasis mit Richtwerten von 30–80 Euro pro Tag.
              Den genauen Preis siehst du immer am jeweiligen Event.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Anmeldung läuft direkt beim Anbieter. Das Portal verlinkt dich
              dorthin — wir aggregieren, der Anbieter wickelt ab. So bleiben
              Bezahlung, Ausfallregelung und Direktkontakt klar geregelt.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Retreats im Schwarzwald
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was kostet ein Retreat im Schwarzwald?",
                a: "Wochenend-Retreats kosten typischerweise zwischen 250 und 500 Euro inklusive Unterkunft und Verpflegung. Spezialisierte Tantra- oder Schamanismus-Retreats können teurer sein. Stille-Retreats laufen oft auf Spendenbasis mit Richtwerten von 30–80 Euro pro Tag. Den genauen Preis siehst du beim jeweiligen Event auf Das Portal.",
              },
              {
                q: "Wie komme ich zum Retreatort?",
                a: "Viele Schwarzwald-Retreatorte sind mit der Bahn erreichbar (z.B. über Freiburg, Titisee oder Baiersbronn), oft mit Bus-Anschluss. Für entlegene Höfe organisieren die Anbieter Sammeltransfers oder Fahrgemeinschaften — frag im Anmeldeprozess nach.",
              },
              {
                q: "Sind Schwarzwald-Retreats für Anfänger geeignet?",
                a: "Wochenend-Yoga-Retreats und offene Themenformate sind oft ohne Vorerfahrung machbar. Stille- und Vertiefungs-Retreats setzen meist Praxis voraus. Die Beschreibung beim Event sagt dir, was vorausgesetzt wird.",
              },
              {
                q: "Was muss ich mitbringen?",
                a: "Warme Kleidung (auch im Sommer), feste Schuhe, Yogamatte falls nicht angegeben, Hausschuhe für drinnen. Persönliche Hygieneartikel, Bettwäsche meist gestellt. Anbieter schicken vor dem Retreat eine Packliste.",
              },
              {
                q: "Kann ich im Retreat schweigen oder muss ich sprechen?",
                a: "Hängt vom Format ab. Stille-Retreats sind durchgehend schweigend (außer bei Lehrgesprächen). Andere Formate haben oft phasenweise Stille — z.B. die ersten Tage oder die Mahlzeiten. Sprich-Retreats gibt es auch, mit explizitem Austausch in der Gruppe.",
              },
              {
                q: "Kann ich als Anbieter mein Schwarzwald-Retreat eintragen?",
                a: "Ja. Das Portal listet Retreats, die im Schwarzwald stattfinden — unabhängig davon, wo der Anbieter sitzt. Trag dein Retreat unter /einreichen ein, wir prüfen und veröffentlichen.",
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
            Tritt unserer Telegram-Community bei und bekomm neue
            Schwarzwald-Termine direkt zugeschickt. Oder trag dich in die
            Warteliste für frühen Zugang zur Plattform ein.
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
