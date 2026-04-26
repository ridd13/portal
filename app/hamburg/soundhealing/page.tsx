import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Soundhealing Hamburg — Klangabende & Termine auf Das Portal",
  description:
    "Soundhealing in Hamburg: Gong Baths, Klangschalen-Sessions, Sound Journeys und Klangmeditationen. Finde deinen nächsten Klangabend auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/soundhealing",
  },
  openGraph: {
    title: "Soundhealing Hamburg — Das Portal",
    description:
      "Soundhealing in Hamburg — Gong Baths, Klangschalen, Sound Journeys und Klangmeditationen. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/hamburg/soundhealing",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const SOUND_TAGS = [
  "soundhealing",
  "sound healing",
  "klang",
  "gong",
  "klangschale",
  "sound bath",
  "sound journey",
  "klangmeditation",
  "singing bowl",
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

export default async function HamburgSoundhealingPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .order("start_at", { ascending: true })
    .limit(20);

    const allEvents = deduplicateEvents((data || []) as Event[]);
    const events = allEvents.filter(
    (event) =>
      event.tags?.some((tag) =>
        SOUND_TAGS.some((st) => tag.toLowerCase().includes(st))
      ) ||
      event.title?.toLowerCase().includes("sound") ||
      event.title?.toLowerCase().includes("klang") ||
      event.title?.toLowerCase().includes("gong")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Soundhealing Hamburg",
    description:
      "Aktuelle Soundhealing-Events, Gong Baths und Klangabende in Hamburg",
    url: "https://das-portal.online/hamburg/soundhealing",
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
            Hamburg · Soundhealing & Klang
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Soundhealing in Hamburg — Klangabende & Termine
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ein Soundhealing in Hamburg? Hier findest du aktuelle
            Termine — von Gong Baths und Klangschalen-Sessions bis zu
            geführten Sound Journeys.
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
            Aktuelle Soundhealing-Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} ${events.length === 1 ? "Termin" : "Termine"} gefunden.`
              : "Gerade keine Soundhealing-Events geplant — schau bald wieder rein oder tritt der Telegram-Community bei."}
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
                Aktuell keine Soundhealing-Events eingetragen.
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
              Soundhealing in Hamburg — was dahintersteckt
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Soundhealing klingt erstmal esoterisch. Jemand spielt
              Klangschalen, du liegst auf einer Matte und wirst "geheilt".
              So stellen sich viele das vor. Aber Soundhealing ist
              pragmatischer als sein Name vermuten lässt. Im Kern geht es
              darum, dass bestimmte Frequenzen und Klangtexturen das
              Nervensystem beruhigen und den Körper in einen tiefen
              Entspannungszustand bringen. Kein Hokuspokus, sondern
              Physik trifft Physiologie.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Instrumente, die dabei zum Einsatz kommen, sind vielfältig:
              tibetische Klangschalen, Gongs, Kristallschalen, Stimmgabeln,
              Didgeridoo, Handpan oder die menschliche Stimme. Jedes
              Instrument hat seine eigene Klangqualität und Wirkung. Gongs
              etwa erzeugen massive Klangteppiche, die dich buchstäblich
              durchströmen. Klangschalen arbeiten feiner, mit Obertönen,
              die sich langsam aufbauen und den Raum füllen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              In Hamburg gibt es eine wachsende Soundhealing-Szene. Von
              kleinen, intimen Klangabenden in Altona bis zu großen Gong
              Baths in Yoga-Studios in Eimsbüttel oder der Schanze. Die
              Facilitators bringen unterschiedliche Hintergründe mit —
              manche sind ausgebildete Musiktherapeuten, andere haben
              sich über Jahre in die Kunst des Klangspielens vertieft.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Gong Bath, Sound Journey, Klangmeditation — die Formate
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Gong Bath ist das bekannteste Format: Du liegst auf einer
              Matte, der Facilitator spielt einen oder mehrere Gongs, und
              du lässt den Klang durch dich hindurchfließen. Die Sessions
              dauern meistens 60 bis 90 Minuten. Viele Menschen berichten,
              dass sie dabei in einen Zustand zwischen Wachen und Schlafen
              kommen — tief entspannt, aber nicht bewusstlos.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Sound Journeys sind immersiver. Hier setzt der Facilitator
              verschiedene Instrumente ein und baut eine klangliche Reise
              auf — mit ruhigen und intensiveren Phasen. Manchmal wird
              geführte Meditation eingebaut, manchmal Atemübungen. Das
              Ergebnis ist ein vielschichtiges Klangerlebnis, das je nach
              Abend sehr unterschiedlich sein kann.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Klangmeditationen sind die ruhigste Variante. Hier werden
              Klangschalen oder Kristallschalen sanft gespielt, während du
              in Stille sitzt oder liegst. Der Klang dient als Anker für
              deine Aufmerksamkeit — ähnlich wie der Atem in einer
              klassischen Meditation, aber zugänglicher für Menschen, die
              mit reiner Stille Schwierigkeiten haben.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Wie Soundhealing wirkt — jenseits von Esoterik
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Wirkung von Klang auf den Körper ist gut dokumentiert.
              Bestimmte Frequenzen aktivieren den Parasympathikus — den
              Teil des Nervensystems, der für Entspannung, Verdauung und
              Regeneration zuständig ist. In einem Gong Bath sinkt die
              Herzfrequenz, die Muskelspannung lässt nach, und
              Stresshormone werden abgebaut.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das erklärt, warum viele Teilnehmer nach einer
              Soundhealing-Session sagen, sie hätten besser geschlafen als
              seit Wochen. Es ist kein Placebo — es ist das Nervensystem,
              das endlich mal runterfahren durfte. In einer Welt, in der
              die meisten von uns chronisch im Sympathikus-Modus hängen
              (Kampf oder Flucht), ist das ein ziemlich wertvolles Geschenk.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Darüber hinaus nutzen manche Klangtherapeuten gezielt
              binaurale Beats oder Frequenzen, die bestimmte Gehirnwellen
              anregen — Theta-Wellen für tiefe Entspannung, Alpha-Wellen
              für kreativen Flow. Das ist kein Wundermittel, aber ein
              interessantes Werkzeug, das immer mehr Anklang findet.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Soundhealing geeignet?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Für alle, die Lust auf Entspannung haben, ohne dafür
              etwas "können" zu müssen. Das ist der große Vorteil von
              Soundhealing gegenüber Meditation oder Yoga: Du musst
              nichts tun. Du liegst da, schließt die Augen und lässt
              den Klang arbeiten. Kein Leistungsdruck, keine falsche
              Haltung, kein "ich kann nicht meditieren"-Problem.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Besonders beliebt ist Soundhealing bei Menschen mit hohem
              Stresslevel, Schlafproblemen oder chronischen Verspannungen.
              Aber auch Neugierige, die einfach eine ungewöhnliche
              Erfahrung machen wollen, sind willkommen. Viele kommen
              nach dem ersten Mal wieder — weil sich das Gefühl danach
              einfach gut anfühlt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Einzige Einschränkung: Bei bestimmten psychischen
              Erkrankungen oder Epilepsie solltest du vorher mit dem
              Facilitator sprechen. Starke Klangreize können in seltenen
              Fällen unangenehme Reaktionen auslösen. Seriöse Anbieter
              fragen das vorher ab.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Soundhealing in Hamburg finden — warum Das Portal
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Das Problem mit Soundhealing-Events in Hamburg: Die meisten
              werden über Instagram-Stories oder kleine WhatsApp-Gruppen
              beworben. Wer nicht schon in der Szene drin ist, findet
              sie kaum. Das Portal sammelt alle Klangabende, Gong Baths
              und Sound Journeys in Hamburg an einem Ort — mit Datum,
              Location und direktem Link zur Anmeldung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              In unserer Telegram-Community werden neue Events geteilt,
              sobald sie online gehen. So verpasst du nichts und findest
              immer den nächsten Klangabend, der zu dir passt.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Soundhealing in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was kostet ein Soundhealing in Hamburg?",
                a: "Die meisten Soundhealing-Sessions liegen zwischen 20 und 45 Euro. Gong Baths und Sound Journeys mit mehreren Instrumenten können bis zu 60 Euro kosten. Manche Community-Formate arbeiten auf Spendenbasis.",
              },
              {
                q: "Was muss ich mitbringen?",
                a: "Bequeme Kleidung und warme Socken reichen. Manche bringen ein eigenes Kissen oder eine Decke mit, aber die meisten Studios stellen alles bereit. Wichtig: Komm pünktlich — verspätet in eine laufende Session zu kommen stört die Atmosphäre.",
              },
              {
                q: "Ist Soundhealing das Gleiche wie Musiktherapie?",
                a: "Nicht ganz. Musiktherapie ist ein klinisch anerkanntes Verfahren mit therapeutischer Zielsetzung. Soundhealing ist breiter gefasst und reicht von therapeutischen Ansätzen bis zu entspannenden Klangabenden ohne therapeutischen Anspruch. Beide nutzen Klang, aber mit unterschiedlichem Rahmen.",
              },
              {
                q: "Kann ich dabei einschlafen?",
                a: "Ja, und das ist völlig in Ordnung. Viele Teilnehmer dösen während eines Gong Baths weg — das zeigt, dass dein Nervensystem entspannt. Der Klang wirkt auch im Schlaf weiter.",
              },
              {
                q: "Wie oft sollte ich zum Soundhealing gehen?",
                a: "So oft es sich gut anfühlt. Manche gehen wöchentlich, andere einmal im Monat. Es gibt keine Regel. Wenn du merkst, dass es dir gut tut, bau es in deinen Rhythmus ein.",
              },
              {
                q: "Gibt es Soundhealing auch als Einzelsession?",
                a: "Ja, einige Klangtherapeuten in Hamburg bieten Einzelsitzungen an, die individuell auf dich abgestimmt werden. Diese sind intensiver und kosten entsprechend mehr. Auf Das Portal findest du auch solche Angebote.",
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
            Keinen Klangabend verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue
            Soundhealing-Events direkt zugeschickt. Oder trag dich in die
            Warteliste ein.
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
