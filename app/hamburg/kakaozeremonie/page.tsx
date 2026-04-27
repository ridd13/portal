import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kakaozeremonie Hamburg — Termine & Rituale auf Das Portal",
  description:
    "Kakaozeremonien in Hamburg: Aktuelle Termine, zeremonielle Abende und Community-Rituale mit Rohkakao. Finde deine nächste Kakaozeremonie auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/kakaozeremonie",
  },
  openGraph: {
    title: "Kakaozeremonie Hamburg — Das Portal",
    description:
      "Kakaozeremonien in Hamburg — zeremonielle Abende, Gruppenrituale und Community-Events mit Rohkakao. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/hamburg/kakaozeremonie",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const KAKAO_TAGS = [
  "kakaozeremonie",
  "cacao",
  "kakao",
  "zeremonie",
  "ritual",
  "cacao ceremony",
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

export default async function HamburgKakaozermoniePage() {
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
        KAKAO_TAGS.some((kt) => tag.toLowerCase().includes(kt))
      ) ||
      event.title?.toLowerCase().includes("kakao") ||
      event.title?.toLowerCase().includes("cacao")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kakaozeremonien Hamburg",
    description:
      "Aktuelle Kakaozeremonien und zeremonielle Kakao-Events in Hamburg",
    url: "https://das-portal.online/hamburg/kakaozeremonie",
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
            Hamburg · Kakaozeremonien
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Kakaozeremonie in Hamburg — Termine & Rituale
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst eine Kakaozeremonie in Hamburg? Hier findest du aktuelle
            Termine — von offenen Community-Abenden bis zu intensiven
            Zeremonie-Formaten mit Rohkakao.
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
            Aktuelle Kakaozeremonien in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} ${events.length === 1 ? "Termin" : "Termine"} gefunden.`
              : "Gerade keine Kakaozeremonien geplant — schau bald wieder rein oder tritt der Telegram-Community bei."}
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
                Aktuell keine Kakaozeremonien eingetragen.
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
              Kakaozeremonie in Hamburg — was das eigentlich ist
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Wenn jemand "Kakaozeremonie" hört, denkt er erstmal an heiße
              Schokolade mit Räucherstäbchen. Verständlich. Aber das trifft es
              nicht wirklich. Eine Kakaozeremonie ist ein bewusstes
              Gruppenerlebnis, bei dem zeremoniell zubereiteter Rohkakao
              getrunken wird — als Werkzeug, nicht als Getränk.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Der Kakao, der in solchen Zeremonien verwendet wird, hat nichts
              mit dem Pulver aus dem Supermarkt zu tun. Es handelt sich um
              minimal verarbeitete Kakaomasse aus Mittel- oder Südamerika,
              oft in Block- oder Pastenform. Theobromin, der Hauptwirkstoff,
              wirkt mild herzöffnend und stimmungsaufhellend — ohne die
              Nervosität von Koffein. In indigenen Kulturen Mesoamerikas wird
              Kakao seit Jahrtausenden zeremoniell genutzt, als "Medizin des
              Herzens".
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              In Hamburg hat sich um Kakaozeremonien eine eigene Szene
              gebildet. Die Formate reichen von intimen Abenden mit sechs
              Teilnehmern in privaten Räumen bis zu offenen
              Community-Zeremonien mit dreißig und mehr Menschen. Manche
              Facilitators kombinieren den Kakao mit Soundhealing,
              Breathwork oder Meditationen — andere halten es bewusst
              schlicht: Kakao, Kreis, Intention.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Wie eine Kakaozeremonie in Hamburg typischerweise abläuft
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Jeder Facilitator hat seinen eigenen Stil, aber ein roter Faden
              zieht sich durch die meisten Zeremonien. Du kommst an, setzt
              dich in einen Kreis. Meistens gibt es eine kurze Einführung —
              was Kakao ist, wie er wirkt, was dich erwartet. Dann wird der
              Kakao zubereitet und verteilt. Oft setzt jeder eine Intention
              für den Abend.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Danach beginnt der eigentliche zeremonielle Teil: Musik,
              Stille, geführte Meditation, manchmal Gesang oder
              Klanginstrumente. Die Dauer variiert — von anderthalb Stunden
              für einen Feierabend-Kreis bis zu drei oder vier Stunden für
              eine tiefere Zeremonie. Am Ende gibt es meist eine
              Sharing-Runde, in der jeder teilen kann, was aufgetaucht ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was viele überrascht: Es gibt keinen Druck, irgendetwas
              Bestimmtes zu erleben. Manche spüren viel, manche wenig.
              Manche weinen, manche lachen, manche sitzen einfach da und
              genießen die Ruhe. Die Zeremonie gibt einen Rahmen — was du
              daraus machst, liegt bei dir.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Hamburger Kakao-Szene
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Hamburg hat in den letzten Jahren eine überraschend aktive
              Kakao-Community entwickelt. Im Schanzenviertel, in Altona, in
              Ottensen und Barmbek finden regelmäßig Zeremonien statt —
              manche wöchentlich, manche monatlich, manche zu besonderen
              Anlässen wie Vollmond oder Sonnenwende.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Facilitators kommen aus unterschiedlichen Hintergründen:
              Einige haben in Guatemala oder Peru direkt von indigenen
              Kakao-Hütern gelernt. Andere verbinden Kakao mit ihrer
              Ausbildung in Traumatherapie, Breathwork oder
              Klangarbeit. Was sie vereint, ist der respektvolle Umgang
              mit dem Kakao als Pflanze und der Wunsch, einen Raum zu
              halten, in dem Menschen sich öffnen können.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Problem: Die meisten Zeremonien werden über Instagram-
              Stories, Telegram-Gruppen oder Mund-zu-Mund beworben. Wer
              nicht vernetzt ist, findet sie kaum. Das Portal ändert das —
              hier siehst du alle anstehenden Kakaozeremonien in Hamburg
              auf einen Blick, ohne dich durch zwanzig Profile klicken
              zu müssen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist eine Kakaozeremonie?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Kurz: Für alle, die Lust haben, sich auf eine bewusste
              Erfahrung einzulassen. Du brauchst keine Vorerfahrung, keine
              spirituelle Praxis, kein bestimmtes Weltbild. Kakaozeremonien
              ziehen eine sehr gemischte Crowd an — von Yoga-Lehrerinnen über
              Unternehmer bis zu Leuten, die einfach neugierig sind und was
              Neues ausprobieren wollen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was hilft: Offenheit. Der Kakao macht keine Wunder — er
              unterstützt dich dabei, in Kontakt mit dir zu kommen. Wenn du
              bereit bist, dich darauf einzulassen, wirst du was mitnehmen.
              Wenn du es als netten Abend mit warmem Getränk siehst, ist
              das auch völlig okay.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ein Hinweis: Bei bestimmten Medikamenten (vor allem MAO-Hemmern
              und Antidepressiva) solltest du vorher mit dem Facilitator
              sprechen. Rohkakao enthält MAO-Hemmer und kann in Kombination
              mit bestimmten Substanzen Wechselwirkungen haben. Seriöse
              Facilitators fragen das im Vorfeld ab.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Kakaozeremonie vs. Kakao-Ritual — gibt es einen Unterschied?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Im Grunde meinen die Begriffe dasselbe, werden aber manchmal
              unterschiedlich verwendet. "Zeremonie" betont den gehaltenen
              Rahmen — ein Facilitator führt durch den Abend, es gibt
              Struktur und Intention. "Ritual" wird manchmal für einfachere
              Formate verwendet, bei denen Kakao eher begleitend getrunken
              wird, etwa vor einer Meditation oder einem Soundhealing.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Auf Das Portal findest du beide Varianten. In der
              Event-Beschreibung steht jeweils, was dich erwartet — so
              kannst du selbst entscheiden, ob du eher eine geführte
              Zeremonie oder ein offeneres Format suchst.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Kakaozeremonien in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was kostet eine Kakaozeremonie in Hamburg?",
                a: "Die meisten Kakaozeremonien liegen zwischen 25 und 55 Euro. Manche Community-Formate arbeiten auf Spendenbasis. In der Regel ist der Kakao im Preis enthalten. Bei längeren oder intensiveren Zeremonien kann es auch bis zu 80 Euro gehen.",
              },
              {
                q: "Muss ich Erfahrung mitbringen?",
                a: "Nein. Die meisten Kakaozeremonien in Hamburg sind bewusst für Einsteiger offen gestaltet. Der Facilitator erklärt am Anfang alles, was du wissen musst. Komm einfach mit Offenheit — der Rest ergibt sich.",
              },
              {
                q: "Wie finde ich eine seriöse Kakaozeremonie?",
                a: "Achte darauf, dass der Facilitator transparent kommuniziert: Welcher Kakao wird verwendet? Gibt es Kontraindikationen? Wird vorher nach Medikamenten gefragt? Auf Das Portal findest du Zeremonien von geprüften Anbietern aus der Hamburger Community.",
              },
              {
                q: "Wie wirkt der Kakao?",
                a: "Zeremonieller Rohkakao enthält Theobromin, das mild herzöffnend und stimmungsaufhellend wirkt. Keine berauschende Wirkung — eher ein warmes, fokussiertes Gefühl. Manche beschreiben es als sanftes Öffnen, andere spüren vor allem körperliche Wärme und Ruhe.",
              },
              {
                q: "Wie lange dauert eine Kakaozeremonie?",
                a: "Zwischen anderthalb und vier Stunden, je nach Format. Kürzere Abende sind eher Community-Formate mit Kakao und Sharing. Längere Zeremonien beinhalten oft Soundhealing, Breathwork oder geführte Meditationen.",
              },
              {
                q: "Kann ich alleine kommen?",
                a: "Auf jeden Fall. Die meisten Teilnehmer kommen alleine. Das ist kein Problem — im Gegenteil, der Kreis-Charakter der Zeremonie verbindet dich schnell mit den anderen.",
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
            Keine Kakaozeremonie verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Zeremonien
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
