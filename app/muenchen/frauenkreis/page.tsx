import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Frauenkreis München — aktuelle Termine",
  description:
    "Frauenkreise in München: Mondkreise, Sister Circles, Frauen-Workshops und Frauen-Retreats. Aktuelle Termine aus der Münchner Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/muenchen/frauenkreis",
  },
  openGraph: {
    title: "Frauenkreis München — Das Portal",
    description:
      "Frauenkreise in München — Mondkreise, Sister Circles, Frauen-Workshops und Retreats. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/muenchen/frauenkreis",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const FRAUENKREIS_TAGS = [
  "frauenkreis",
  "frauen",
  "women",
  "weiblichkeit",
  "sisterhood",
  "sister",
  "mondkreis",
  "moon",
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

export default async function MuenchenFrauenkreisPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or(
      "address.ilike.%München%,address.ilike.%muenchen%,address.ilike.%Muenchen%,address.ilike.%münchen%"
    )
    .order("start_at", { ascending: true })
    .limit(20);

  const allEvents = deduplicateEvents((data || []) as Event[]);
  const events = allEvents.filter(
    (event) =>
      event.tags?.some((tag) =>
        FRAUENKREIS_TAGS.some((ft) => tag.toLowerCase().includes(ft))
      ) ||
      event.title?.toLowerCase().includes("frauenkreis") ||
      event.title?.toLowerCase().includes("frauen") ||
      event.title?.toLowerCase().includes("sister") ||
      event.title?.toLowerCase().includes("women") ||
      event.title?.toLowerCase().includes("mondkreis")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Frauenkreis München",
    description:
      "Aktuelle Frauenkreise, Sister Circles und Frauen-Workshops in München",
    url: "https://das-portal.online/muenchen/frauenkreis",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
        location: {
          "@type": "Place",
          name: event.location_name || "München",
          address: event.address || "München",
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
            München · Frauenkreise & Sisterhood
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Frauenkreis in München — aktuelle Termine
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst einen Frauenkreis in München? Hier findest du die
            aktuellen Termine — von Mondkreisen über Sister Circles bis zu
            Frauen-Wochenenden im Voralpenland.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/muenchen/ganzheitliche-events"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle München Events →
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
            Aktuelle Frauenkreise in München
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — Mondkreise, Sister Circles, Workshops und Retreats für Frauen.`
              : "Gerade keine Frauenkreis-Termine — schau bald wieder rein oder trag dich in die Warteliste ein."}
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
                Aktuell keine Frauenkreise in München gelistet.
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
                href="/muenchen/ganzheitliche-events"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle München Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Frauenkreis München — was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Frauenkreise sind in den letzten Jahren in München fest in der
              ganzheitlichen Szene angekommen. Was vor zehn Jahren noch
              vereinzelt in privaten Wohnungen stattfand, ist heute ein
              eigenes Format mit regelmäßigen Terminen, festen Anbieterinnen
              und einer wachsenden Community.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ein Frauenkreis in München kann sehr unterschiedlich aussehen:
              Manche sind klassisch geführt mit Sharing-Runde, Räucherwerk
              und Mondbezug. Andere sind moderner, mit Embodiment-Übungen,
              Atemarbeit oder kreativem Ausdruck. Wieder andere sind themen-
              orientiert: Zyklus, Beziehung, Kinderwunsch, Verlust,
              Kraftphase.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was sie alle teilen: Ein geschützter Rahmen für Frauen, in dem
              Themen Platz haben, die im Alltag oft keinen Raum bekommen.
              Ohne Bewertung, ohne Lösungsdruck, mit echtem Zuhören.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Frauen-Formate gibt es in München?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              In München haben sich ein paar Frauen-Formate etabliert, die du
              regelmäßig findest:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Mondkreise:</strong>{" "}
              Meist um Neumond oder Vollmond. Etwa zwei bis drei Stunden,
              klassisch mit Eröffnung, Sharing, Meditation oder Ritual,
              gemeinsamer Abschluss. Oft 8-20 Frauen, halb-offen oder
              geschlossen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Sister Circles und Women Circles:</strong>{" "}
              Etwas freier in der Form, oft englischsprachig, mit
              internationaler Community. In München gibt es eine wachsende
              Expat-Community, die solche Formate trägt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Themen-Workshops für Frauen:</strong>{" "}
              Ein Tag bis ein Wochenende, fokussiert auf ein konkretes Thema
              — Zyklusbewusstsein, weibliche Sexualität, Mutterschaft,
              Wechseljahre, Beziehung, Karriere. Anbieterinnen kommen oft
              aus Coaching, Körperarbeit oder Heilkunde.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Frauen-Retreats:</strong>{" "}
              Wochenend-Retreats für Frauen, meist im Voralpenland oder am
              See. Yoga, Meditation, Sharing, Wandern. Längere Formate
              vereinzelt, aber zunehmend.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tantra für Frauen:</strong>{" "}
              Klar abgegrenzte Räume, oft mehrtägig. Setzt meist
              Vorerfahrung mit Embodiment-Arbeit voraus, wird auf Das Portal
              klar als solches gekennzeichnet.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Münchner Frauenkreis-Szene: Was sie ausmacht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Was Münchens Frauenkreis-Szene auszeichnet, ist die Mischung
              aus Tiefe und Bodenständigkeit. Viele Münchner Anbieterinnen
              kommen aus Coaching-, Yoga- oder Therapie-Hintergründen — das
              heißt: weniger esoterisch verpackt, mehr handwerklich
              gearbeitet. Die Kreise sind oft strukturiert, aber nicht steif.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Stadtviertel mit aktiver Szene: Schwabing, Glockenbach,
              Haidhausen, Maxvorstadt. Viele Kreise finden in Studios oder
              Privaträumen statt — die Anbieterinnen vermarkten meistens
              über Instagram und WhatsApp, was es schwer macht, ohne Insider-
              Kontakte einen Kreis zu finden.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal löst genau dieses Problem: Statt durch zehn
              Instagram-Profile zu scrollen, bekommst du alle aktuellen
              Frauen-Termine an einem Ort. Beschreibung, Anbieterin, Preis
              und Anmeldelink — direkt sichtbar.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist ein Frauenkreis?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Eine Frage, die immer wieder kommt: "Bin ich da überhaupt
              richtig?" Die ehrliche Antwort: Wenn du in einem Raum mit
              anderen Frauen sein willst, in dem nicht performt werden muss,
              dann ja.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Frauenkreise sind nicht therapeutisch im klinischen Sinn. Sie
              ersetzen keine Therapie. Sie sind auch nicht sich-mal-
              ausheulen-Termine. Sie sind ein Format, in dem Frauen gemeinsam
              Themen bewegen — manchmal still, manchmal redend, manchmal
              durch Bewegung oder Ritual.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Du musst keine spirituelle Praxis haben. Du musst nicht
              feministisch sein, nicht Mutter sein, nicht in einer
              Lebenskrise stecken. Die meisten Münchner Kreise sind offen für
              Frauen aller Lebensphasen, mit unterschiedlichem Hintergrund.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was hilft: Bereitschaft zum Zuhören. Bereitschaft, von dir zu
              erzählen — aber nur so viel wie du willst. Und das Vertrauen,
              dass das Geteilte im Raum bleibt. Vertraulichkeit ist
              Grundregel in fast allen Kreisen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Praktisch: Anmeldung, Preise, Ablauf
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Anmeldung läuft direkt bei der Anbieterin — Das Portal verlinkt
              dich auf deren Anmeldeseite. Preisrahmen: Mondkreise und
              Sister Circles liegen meist bei 25-50 Euro pro Abend.
              Tagesworkshops 80-150 Euro. Wochenend-Retreats für Frauen
              250-500 Euro inklusive Unterkunft.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ablauf eines typischen Mondkreises: Eröffnung mit
              Räucherwerk, Mantra oder kurzer Meditation. Sharing-Runde
              (jede Frau spricht so viel oder wenig wie sie will). Manchmal
              Bewegung, Atemarbeit oder kreativer Ausdruck. Stille-Phase
              oder Meditation. Abschluss mit gemeinsamem Tee oder Snacks.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was du mitbringen solltest: bequeme Kleidung, manchmal eine
              Kerze oder ein persönliches Symbol (steht in der
              Beschreibung), Offenheit. Mehr nicht.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Frauenkreisen in München
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was ist ein Frauenkreis genau?",
                a: "Ein Frauenkreis ist ein Format, in dem Frauen sich in einem geschützten Rahmen treffen, um sich auszutauschen, zu meditieren oder zu rituell zu arbeiten. Es gibt klassische Mondkreise, themenorientierte Workshops und mehrtägige Retreats. Vertraulichkeit ist meist Grundregel.",
              },
              {
                q: "Brauche ich Vorerfahrung für einen Frauenkreis?",
                a: "Nein, die meisten Münchner Frauenkreise sind offen für alle Frauen, unabhängig von Vorerfahrung. Spezialisierte Formate wie Tantra für Frauen oder bestimmte Vertiefungen setzen oft Erfahrung voraus — das steht klar in der Beschreibung.",
              },
              {
                q: "Was kostet ein Frauenkreis in München?",
                a: "Mondkreise und Sister Circles liegen meist bei 25-50 Euro pro Abend. Tages-Workshops 80-150 Euro. Wochenend-Retreats 250-500 Euro inklusive Unterkunft und Verpflegung. Den Preis siehst du direkt am Event auf Das Portal.",
              },
              {
                q: "Sind Frauenkreise spirituell oder therapeutisch?",
                a: "Sie sind kein Ersatz für Therapie. Manche Kreise haben einen spirituellen Rahmen (Mond, Ritual, Räuchern), andere sind eher psychologisch oder körperarbeitsorientiert. Die Beschreibung beim Event sagt dir, welche Richtung der Kreis hat.",
              },
              {
                q: "Wie finde ich einen passenden Frauenkreis in München?",
                a: "Auf Das Portal siehst du alle aktuellen Termine mit Beschreibung und Anbieterin. Probier verschiedene Formate aus — manche Kreise passen, andere nicht. Das ist normal. Geh nach Bauchgefühl beim Lesen der Beschreibung.",
              },
              {
                q: "Sind die Termine für Anfängerinnen geeignet?",
                a: "Die meisten ja. Wenn du noch nie in einem Frauenkreis warst, fang mit einem offenen Mondkreis oder Sister Circle an — das sind die niedrigschwelligsten Formate. Vertiefungs- und Mehrtages-Formate sind eher für Frauen mit Vorerfahrung.",
              },
              {
                q: "Kann ich als Anbieterin meinen Frauenkreis auf Das Portal eintragen?",
                a: "Ja. Trag dein Format unter /einreichen ein, wir prüfen und veröffentlichen. Voraussetzung: öffentlich zugänglich, klares Datum, Ort und Anbieterinnen-Profil.",
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
            Keine Frauenkreis-Termine mehr verpassen
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
