import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Meditation Schwarzwald — Kurse, Stille & Retreats auf Das Portal",
  description:
    "Meditation im Schwarzwald: Stille-Retreats, Vipassana, Zen, Achtsamkeitskurse und Meditationswochenenden. Aktuelle Termine auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/schwarzwald/meditation",
  },
  openGraph: {
    title: "Meditation Schwarzwald — Das Portal",
    description:
      "Meditation im Schwarzwald — Stille-Retreats, Vipassana, Zen, Achtsamkeitskurse. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/schwarzwald/meditation",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const MEDITATION_TAGS = [
  "meditation",
  "stille",
  "vipassana",
  "zen",
  "achtsamkeit",
  "mindfulness",
  "schweigen",
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

export default async function SchwarzwaldMeditationPage() {
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
        MEDITATION_TAGS.some((mt) => tag.toLowerCase().includes(mt))
      ) ||
      event.title?.toLowerCase().includes("meditation") ||
      event.title?.toLowerCase().includes("stille") ||
      event.title?.toLowerCase().includes("vipassana") ||
      event.title?.toLowerCase().includes("achtsamkeit")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Meditation Schwarzwald",
    description:
      "Aktuelle Meditationskurse, Stille-Retreats und Achtsamkeitsformate im Schwarzwald",
    url: "https://das-portal.online/schwarzwald/meditation",
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
            Schwarzwald · Meditation in der Natur
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Meditation im Schwarzwald — aktuelle Termine
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst Meditation im Schwarzwald? Hier findest du die
            aktuellen Termine — Stille-Retreats, Vipassana-Wochenenden,
            Zen-Sesshins und Achtsamkeitskurse in den Schwarzwaldhöfen.
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
            Aktuelle Meditations-Events im Schwarzwald
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Meditationstermine gefunden — vom Tagesretreat bis zum mehrtägigen Sesshin.`
              : "Gerade keine Meditationstermine — schau bald wieder rein oder trag dich in die Warteliste ein."}
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
                Aktuell keine Meditation-Events im Schwarzwald gelistet.
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
              Meditation im Schwarzwald — was den Ort besonders macht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Es gibt einen Grund, warum so viele Stille-Häuser im Schwarzwald
              stehen. Die Region kombiniert echte Stille mit erreichbarer
              Infrastruktur. Du fährst zwei Stunden raus aus Frankfurt,
              Stuttgart oder Basel — und bist in einer Welt, in der das
              lauteste Geräusch der Wind durch die Tannen ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Meditation funktioniert in dieser Umgebung anders als in der
              Stadt. Der Geist beruhigt sich schneller, wenn die Reize
              weniger werden. Das gilt für die ersten Tage eines Stille-
              Retreats genauso wie für die letzten — und es ist einer der
              Gründe, warum Stille-Praxis im Schwarzwald seit Jahrzehnten
              gepflegt wird.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Mehrere etablierte Stille-Zentren liegen in der Region: in der
              Nähe von Titisee, im Mittleren Schwarzwald, im Markgräflerland.
              Daneben gibt es kleinere Meditationswochenenden, die in
              Seminarhäusern und Klosterhöfen stattfinden. Das Portal listet
              die öffentlich ausgeschriebenen Termine.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Meditationsformate findest du im Schwarzwald?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Meditation ist ein weiter Begriff. Im Schwarzwald begegnest du
              vor allem diesen Linien:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Vipassana und buddhistische Meditation:</strong>{" "}
              Mehrere Anbieter arbeiten in der Vipassana-Linie nach Goenka
              oder in anderen Theravada-Traditionen. Retreats sind oft
              komplett schweigend, mit klarer Tagesstruktur (Sitzphasen,
              Geh-Meditation, Lehrgespräche) und einer Dauer von drei bis
              zehn Tagen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Zen-Praxis und Sesshins:</strong>{" "}
              Im Mittleren und Nordschwarzwald gibt es Zen-Häuser, die
              regelmäßig Sesshins anbieten. Strukturiert, formal, anspruchsvoll —
              für Menschen, die in der Zen-Tradition arbeiten oder es kennen-
              lernen wollen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Achtsamkeitskurse (MBSR-Linie):</strong>{" "}
              Wochenend-Retreats und Tagesseminare in der Achtsamkeitslehre
              nach Jon Kabat-Zinn. Säkular, gut zugänglich, oft als
              Vertiefung zu einem MBSR-Kurs gedacht.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Christlich-kontemplative Meditation:</strong>{" "}
              Mehrere Klosterhöfe im Schwarzwald bieten kontemplative
              Schweigewochenenden an. Eine andere Sprache, aber im Kern
              ähnliche Praxis: Stille, Sitzen, innere Ausrichtung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Naturverbundene Meditation:</strong>{" "}
              Geh-Meditationen, Sit-Spots, Wald-Meditation — Formate, die
              die Schwarzwald-Umgebung explizit einbeziehen. Etwas seltener,
              aber gerade in den letzten Jahren mit wachsender Nachfrage.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Stille-Retreat oder Meditationswochenende — was passt für dich?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Nicht jede:r soll mit einem Sieben-Tage-Vipassana anfangen. Die
              Bandbreite an Formaten im Schwarzwald gibt dir die Möglichkeit,
              den Einstieg zu wählen, der für dich passt:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tag bis Wochenende:</strong>{" "}
              Gut für Einsteiger:innen oder als Vertiefung neben einer
              regelmäßigen Praxis. Du gewöhnst dich an längere Sitzphasen,
              ohne im tiefen Schweigen zu landen. Achtsamkeitstage,
              Kennenlern-Wochenenden, Themenformate.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Drei bis sieben Tage Stille:</strong>{" "}
              Hier wird es ernst. Komplettes Schweigen, klare Tagesstruktur,
              wenig Außenkontakt. Nicht für den ersten Versuch, aber das
              Format mit der größten Tiefenwirkung. Setzt regelmäßige Praxis
              voraus — frag im Zweifel die Anbieter.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Zehn Tage und länger:</strong>{" "}
              Klassische Vipassana-Kurse oder ausgedehnte Retreats. Hochintensiv,
              aber auch sehr formend. Nichts, was du im Vorbeigehen machst.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Was unterscheidet Schwarzwald-Meditation von Stadt-Meditation?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              In der Stadt meditieren ist gut. In den Bergen meditieren ist
              anders. Nicht besser oder schlechter — anders. Im Schwarzwald
              fällt der Geist schneller in eine Ruhe, die in München oder
              Stuttgart Wochen brauchen würde. Die Reize sind reduziert. Die
              Geräuschkulisse anders. Der Tagesrhythmus folgt dem Licht
              draußen, nicht dem Kalender.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was die Schwarzwald-Meditation außerdem ausmacht: Die
              Möglichkeit, zwischen Sitzphasen draußen zu gehen. Die meisten
              Häuser stehen im Wald oder am Waldrand. Geh-Meditation in
              echtem Wald ist eine andere Erfahrung als auf einem Innenhof.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Klarer Hinweis: Wer im Schwarzwald meditiert, kann nicht
              schnell zurück nach Hause fahren wenn es schwer wird. Das ist
              Teil des Formats. Die Bergung im Naturraum ist gleichzeitig
              ein Verzicht auf den Fluchtweg — was viele Praktizierende
              gerade schätzen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Praktisch: Anreise, Preise, Anmeldung
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die meisten Stille-Häuser im Schwarzwald sind mit dem ÖPNV
              erreichbar, einige nur mit Auto oder Sammeltransfer. Frag im
              Anmeldeprozess nach — die Anbieter haben das meist organisiert.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Preise: Wochenend-Meditationsretreats kosten meist 200-400
              Euro inklusive Unterkunft und vegetarischer Verpflegung.
              Mehrtägige Vipassana- und Zen-Sesshins laufen oft auf
              Spendenbasis — mit Richtwerten von 30-80 Euro pro Tag.
              Achtsamkeitsworkshops und Tagesretreats 80-180 Euro.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Anmeldung läuft direkt beim Anbieter, nicht über Das Portal.
              Wir verlinken dich auf deren Anmeldeseite. Bei manchen
              Stille-Retreats wird vorab ein kurzer Fragebogen oder ein
              Telefonat geführt — gerade wenn das Format Vorerfahrung
              voraussetzt.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Meditation im Schwarzwald
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Brauche ich Meditationserfahrung für ein Retreat im Schwarzwald?",
                a: "Hängt vom Format ab. Achtsamkeitstage und Wochenend-Retreats sind oft auch für Einsteiger:innen offen. Mehrtägige Stille-Retreats setzen meist regelmäßige Praxis voraus. Frag im Zweifel den Anbieter — die meisten beraten ehrlich, ob das Format zu dir passt.",
              },
              {
                q: "Was kostet ein Stille-Retreat im Schwarzwald?",
                a: "Wochenende: 200-400 Euro inklusive Unterkunft und Verpflegung. Mehrtägige Vipassana- oder Zen-Sesshins laufen oft auf Spendenbasis mit Richtwerten von 30-80 Euro pro Tag. Achtsamkeitsworkshops 80-180 Euro pro Tag. Den Preis siehst du beim jeweiligen Event.",
              },
              {
                q: "Was ist der Unterschied zwischen Vipassana, Zen und Achtsamkeit?",
                a: "Vipassana und Zen sind buddhistische Traditionen mit klarer Methodik und Lehrer:innen-Linien. Vipassana arbeitet stärker mit Körperempfindungen, Zen mit dem direkten Sitzen (Shikantaza). Achtsamkeit (MBSR) ist die säkularisierte, westliche Variante — gut zugänglich, ohne religiösen Kontext.",
              },
              {
                q: "Muss ich im Retreat den ganzen Tag schweigen?",
                a: "Bei Stille-Retreats: ja, weitgehend. Sprachregelungen werden zu Beginn klar erklärt. Lehrgespräche oder Einzelsprechen mit den Lehrer:innen sind oft die einzigen Ausnahmen. Wochenend- und Themenformate sind oft nicht durchgehend schweigend.",
              },
              {
                q: "Wie komme ich zum Retreatort im Schwarzwald?",
                a: "Viele Häuser sind mit der Bahn (z.B. über Freiburg, Titisee, Hausach) und Bus erreichbar, manche brauchen Auto oder Mitfahrgelegenheit. Anbieter organisieren oft Sammeltransfers vom nächsten Bahnhof — frag im Anmeldeprozess danach.",
              },
              {
                q: "Was muss ich zum Stille-Retreat mitbringen?",
                a: "Bequeme Sitzkleidung, warme Lagen (auch im Sommer kann es im Schwarzwald nachts kalt werden), ein Meditationskissen falls vorhanden (oft gestellt), Hausschuhe. Persönliche Hygieneartikel, Regenkleidung. Anbieter schicken vor dem Retreat eine konkrete Packliste.",
              },
              {
                q: "Kann ich als Anbieter mein Meditationsformat auf Das Portal eintragen?",
                a: "Ja. Trag dein Event unter /einreichen ein, wir prüfen und veröffentlichen. Voraussetzung ist ein klares Format, Datum, Ort und Anbieter-Profil. Wir listen sowohl traditionelle Linien als auch säkulare Achtsamkeitsformate.",
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
            Keine Meditationstermine mehr verpassen
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
