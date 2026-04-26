import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ecstatic Dance Hamburg — Termine & Events auf Das Portal",
  description:
    "Ecstatic Dance in Hamburg: Freier Tanz, Conscious Dance und Bewegungs-Events ohne Alkohol. Finde deinen nächsten Ecstatic Dance auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/ecstatic-dance",
  },
  openGraph: {
    title: "Ecstatic Dance Hamburg — Das Portal",
    description:
      "Ecstatic Dance in Hamburg — freier Tanz, Conscious Dance und Bewegungs-Events. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/hamburg/ecstatic-dance",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const DANCE_TAGS = [
  "ecstatic dance",
  "ecstatic-dance",
  "ecstatic",
  "tanz",
  "conscious dance",
  "contact improvisation",
  "dance",
  "5 rhythmen",
  "5rhythms",
  "biodanza",
  "movement",
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

export default async function HamburgEcstaticDancePage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .order("start_at", { ascending: true })
    .limit(30);

  const allEvents = deduplicateEvents((data || []) as Event[]);
  const events = allEvents.filter(
    (event) =>
      event.tags?.some((tag) =>
        DANCE_TAGS.some((dt) => tag.toLowerCase().includes(dt))
      ) ||
      event.title?.toLowerCase().includes("ecstatic") ||
      event.title?.toLowerCase().includes("tanz") ||
      event.title?.toLowerCase().includes("dance") ||
      event.title?.toLowerCase().includes("contact improvisation")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ecstatic Dance Hamburg",
    description:
      "Aktuelle Ecstatic Dance Events und Conscious Dance Abende in Hamburg",
    url: "https://das-portal.online/hamburg/ecstatic-dance",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: event.start_at,
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
            Hamburg · Ecstatic Dance & Bewegung
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ecstatic Dance in Hamburg — Events & Termine
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst einen Ecstatic Dance in Hamburg? Hier findest du aktuelle
            Termine — von offenen Tanzabenden und Conscious Dance bis zu Contact
            Improvisation und Bewegungs-Workshops.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Hamburg"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Hamburg Events
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
            Aktuelle Ecstatic Dance Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} ${events.length === 1 ? "Termin" : "Termine"} gefunden.`
              : "Gerade keine Ecstatic Dance Events geplant — schau bald wieder rein oder tritt der Telegram-Community bei."}
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
                      {event.location_name}
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
                Aktuell keine Ecstatic Dance Events eingetragen.
              </p>
              <Link
                href="/events"
                className="mt-3 inline-block text-sm text-accent-primary hover:underline"
              >
                Alle Events ansehen
              </Link>
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/events?city=Hamburg"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Hamburg Events anzeigen
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ecstatic Dance in Hamburg — was das ist und warum es boomt
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Ecstatic Dance ist kein Tanzkurs. Es gibt keine Schritte,
              keine Choreografie, keinen Lehrer, der dir sagt, was du
              falsch machst. Stattdessen: ein DJ, ein Raum, eine
              Community — und die Einladung, dich zu bewegen, wie es
              sich gerade richtig anfühlt. Mit geschlossenen Augen, barfuß,
              völlig frei. Kein Alkohol, kein Reden auf der Tanzfläche,
              keine Handys. Nur du und die Musik.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was als Nischen-Format in der Conscious-Community begann,
              ist längst im Mainstream angekommen. In Hamburg finden
              regelmäßig Ecstatic Dances statt — manchmal mit hundert
              Leuten in einem großen Saal, manchmal mit zwanzig in
              einem intimen Studio. Die Szene wächst, weil immer mehr
              Menschen merken: Tanzen ist eine der natürlichsten Formen,
              Stress abzubauen, Emotionen zu verarbeiten und sich
              lebendig zu fühlen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              In Hamburg findet Ecstatic Dance an verschiedenen Orten
              statt — in Altona, der Schanze, Ottensen, Barmbek oder
              St. Pauli. Die Musik reicht von organisch-tribal über
              Deep House bis elektronisch-experimentell. Jeder DJ bringt
              seinen eigenen Stil mit, und jeder Abend fühlt sich
              anders an.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Wie ein Ecstatic Dance Abend in Hamburg abläuft
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die meisten Ecstatic Dances folgen einer ähnlichen Struktur.
              Du kommst an, ziehst deine Schuhe aus, legst dein Handy weg.
              Oft gibt es ein kurzes Opening — der Facilitator erklärt die
              Regeln (kein Reden, kein Alkohol, Konsens bei Berührung) und
              setzt die Intention für den Abend.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Dann startet die Musik. Meistens sanft — langsame, einladende
              Klänge, zu denen du dich erstmal warmtanzen kannst. Über
              ein bis zwei Stunden steigert der DJ die Energie: schnellere
              Beats, tiefere Bässe, mehr Intensität. Es kommt ein Punkt,
              an dem der Raum vibriert und alle tanzen, als würde niemand
              zuschauen. Weil tatsächlich niemand zuschaut — alle sind in
              ihrem eigenen Flow.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Am Ende wird die Musik langsamer, weicher. Viele legen sich
              hin, manche umarmen sich. Es gibt eine kurze Integration,
              manchmal ein Sharing-Circle. Dann ist der Abend vorbei — und
              du gehst raus mit einem Gefühl, das schwer zu beschreiben
              ist. Leichter. Offener. Lebendiger.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Ecstatic Dance vs. Clubbing — der Unterschied
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Auf den ersten Blick könnte man denken: Beides ist Tanzen
              zu Musik. Aber das Erlebnis ist grundverschieden. Im Club
              geht es um Soziales — Leute treffen, trinken, gesehen
              werden. Ecstatic Dance ist introvertiert. Du tanzt für dich,
              nicht für andere. Kein Alkohol bedeutet: kein Enthemmungs-
              Shortcut. Du musst dich nüchtern auf die Tanzfläche trauen.
              Und genau da liegt die Magie.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ohne Alkohol und ohne die Erwartung, cool auszusehen,
              passiert etwas Interessantes: Du fängst an, wirklich zu
              tanzen. Nicht performativ, sondern authentisch. Manchmal
              wild, manchmal zart, manchmal nur ein leichtes Wiegen.
              Alles ist erlaubt. Kein Urteil, kein Kommentar. Für viele
              ist das die befreiendste Erfahrung, die sie seit Jahren
              gemacht haben.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Deshalb zieht Ecstatic Dance auch Menschen an, die nie in
              einen Club gehen würden. Introvertierte, Menschen mit
              Körperthemen, Leute über vierzig, die sich in der
              Club-Szene nicht mehr wohlfühlen. Der Raum ist so gehalten,
              dass sich jeder sicher fühlen kann — und das spürt man.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Verwandte Formate: Contact Improvisation, 5Rhythmen, Biodanza
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Ecstatic Dance ist nur ein Format unter vielen. In Hamburg
              gibt es auch Contact Improvisation — eine Tanzform, bei der
              zwei oder mehr Personen durch Berührung und Gewichtsverlagerung
              kommunizieren. Kein fester Partner, kein Führen und Folgen,
              sondern ein Dialog aus Bewegung. Perfekt für Menschen, die
              Körperkontakt in einem sicheren Rahmen erleben wollen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              5Rhythmen (5Rhythms) ist eine strukturierte Tanzpraxis mit
              fünf Phasen: Flowing, Staccato, Chaos, Lyrical, Stillness.
              Jede Phase hat ihre eigene Energie und Musik. Das Format
              wurde von Gabrielle Roth entwickelt und hat weltweit eine
              große Community. Biodanza wiederum kombiniert Tanz mit
              Begegnung und Berührung — ein intensives Format, das tiefer
              geht als ein normaler Tanzabend.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Auf Das Portal findest du all diese Formate an einem Ort.
              Egal ob du frei tanzen willst, einen Partner-Tanz suchst
              oder ein strukturiertes Bewegungsformat — hier siehst du,
              was wann und wo in Hamburg stattfindet.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Ecstatic Dance?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Für jeden, der sich bewegen will. Wirklich. Du musst
              nicht tanzen können. Du musst nicht fit sein. Du musst
              nicht jung sein, nicht dünn sein, nicht irgendwas sein.
              Der ganze Punkt von Ecstatic Dance ist, dass es keine
              Anforderungen gibt. Du bringst deinen Körper mit — der
              Rest passiert von selbst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Viele, die zum ersten Mal kommen, haben Angst, sich
              lächerlich zu machen. Das ist normal. Und es vergeht
              meistens nach den ersten zehn Minuten, wenn du merkst:
              Hier schaut keiner hin. Hier bewertet keiner. Hier
              darfst du einfach sein. Und dann tanzt du. Und es fühlt
              sich gut an.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Ecstatic Dance in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was kostet ein Ecstatic Dance in Hamburg?",
                a: "Die meisten Events liegen zwischen 12 und 25 Euro. Manche arbeiten mit Sliding Scale — du zahlst, was du kannst. Regelmäßige Tänzer können oft Monatspakete kaufen.",
              },
              {
                q: "Muss ich tanzen können?",
                a: "Nein. Es gibt keine Schritte, keine Choreografie, nichts zu lernen. Du bewegst dich einfach, wie es sich richtig anfühlt. Stehen bleiben ist auch okay.",
              },
              {
                q: "Darf ich während des Tanzens reden?",
                a: "Nein, das ist eine der Grundregeln. Kein Reden auf der Tanzfläche. Das schützt den Raum und erlaubt dir, ganz bei dir zu bleiben, statt in Gespräche zu gehen.",
              },
              {
                q: "Gibt es Alkohol?",
                a: "Nein. Ecstatic Dance ist immer alkohol- und drogenfrei. Das ist kein Moralding — es geht darum, nüchtern zu tanzen und die Erfahrung bewusst zu machen.",
              },
              {
                q: "Was soll ich anziehen?",
                a: "Bequeme Kleidung, in der du dich frei bewegen kannst. Getanzt wird barfuß. Viele tragen leichte, weite Sachen. Es gibt keinen Dresscode — komm so, wie du dich wohlfühlst.",
              },
              {
                q: "Kann ich alleine kommen?",
                a: "Auf jeden Fall. Die meisten kommen alleine. Ecstatic Dance ist im Kern eine Solo-Erfahrung, auch wenn du mit hundert Leuten im Raum bist. Du wirst merken: Alleine kommen fühlt sich nach den ersten Minuten gar nicht mehr alleine an.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="rounded-2xl border border-border bg-bg-card p-6"
              >
                <h3 className="font-medium text-text-primary">{q}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keinen Dance verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Ecstatic Dance
            Events direkt zugeschickt. Oder trag dich in die Warteliste ein.
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
