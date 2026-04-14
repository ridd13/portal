import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Spirituelle Events Hamburg — Zeremonien, Rituale & Workshops auf Das Portal",
  description:
    "Spirituelle Events in Hamburg: Kakaozeremonien, Mondrituale, Frauenkreise, Soundhealing und mehr. Alle aktuellen Termine aus der Hamburger Community auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/spirituelle-events",
  },
  openGraph: {
    title: "Spirituelle Events Hamburg — Das Portal",
    description:
      "Kakaozeremonien, Mondrituale, Frauenkreise, Soundhealing und zeremonielle Formate in Hamburg. Das Portal zeigt dir alle spirituellen Events auf einen Blick.",
    url: "https://das-portal.online/hamburg/spirituelle-events",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

// Tags that are relevant for "spirituelle Events"
const SPIRITUAL_TAGS = [
  "kakaozeremonie",
  "cacao",
  "mondrituale",
  "mondkreis",
  "frauenkreis",
  "zeremonie",
  "ritual",
  "soundhealing",
  "klangreise",
  "schamanisch",
  "meditation",
  "spirituell",
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

export default async function HamburgSpiritueleEventsPage() {
  const supabase = getSupabaseServerClient();

  // Fetch Hamburg events — filter for spiritually relevant tags on client if needed
  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .order("start_at", { ascending: true })
    .limit(16);

  const allEvents = (data || []) as Event[];

  // Prefer events with spiritual tags, but show all Hamburg events if few matches
  const spiritualEvents = allEvents.filter(
    (e) =>
      e.tags &&
      e.tags.some((tag) =>
        SPIRITUAL_TAGS.some(
          (st) => tag.toLowerCase().includes(st) || st.includes(tag.toLowerCase())
        )
      )
  );

  const events = spiritualEvents.length >= 3 ? spiritualEvents : allEvents.slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Spirituelle Events Hamburg",
    description:
      "Aktuelle spirituelle Events, Zeremonien und Rituale in Hamburg",
    url: "https://das-portal.online/hamburg/spirituelle-events",
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
            Hamburg · Zeremonien & Rituale
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Spirituelle Events in Hamburg — Zeremonien, Rituale & Workshops
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Kakaozeremonien, Mondrituale, Frauenkreise, Soundhealing und
            zeremonielle Körperarbeit — Das Portal zeigt dir alle spirituellen
            Events in Hamburg, direkt aus der Community.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Hamburg&tag=zeremonie"
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

        {/* Tag-Navigation */}
        <section className="mt-8">
          <p className="text-sm text-text-secondary">Direkt zu einer Kategorie:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: "Kakaozeremonie", href: "/hamburg/kakaozeremonie" },
              { label: "Meditation", href: "/hamburg/meditation" },
              { label: "Soundhealing", href: "/events?city=Hamburg&tag=soundhealing" },
              { label: "Frauenkreis", href: "/events?city=Hamburg&tag=frauenkreis" },
              { label: "Ganzheitliche Events", href: "/hamburg/ganzheitliche-events" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="rounded-full border border-border bg-bg-card px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-secondary"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* Aktuelle Events */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Aktuelle spirituelle Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine — von Kakaozeremonie bis Mondkreis.`
              : "Gerade keine Termine eingetragen — komm bald wieder oder tritt der Telegram-Community bei."}
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
                Aktuell keine spirituellen Events in Hamburg eingetragen.
              </p>
              <Link
                href="/events"
                className="mt-3 inline-block text-sm text-accent-primary hover:underline"
              >
                Alle Events ansehen →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Spirituelle Events in Hamburg — eine Szene, die gewachsen ist
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Hamburg hat seit Jahren eine aktive spirituelle Community. Und ich
              meine das nicht als Marketing-Satz — das lässt sich schlicht
              beobachten. Wo vor zehn Jahren vielleicht ein Yoga-Studio und
              eine Meditationsgruppe waren, gibt es heute ein ganzes Ökosystem
              aus Facilitators, Zeremonien-Begleitenden, Soundhealing-Künstlern
              und Community-Organizern.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was dieses Wachstum ausgelöst hat? Schwer zu sagen. Wahrscheinlich
              mehreres auf einmal: ein gesellschaftliches Interesse an
              Sinnfragen, die Popularisierung von Bewusstseinspraktiken, und die
              einfach wachsende Professionalisierung der Menschen, die diese
              Formate anbieten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Ergebnis ist ein Angebot, das für Einsteiger wie für
              Erfahrene etwas bereithält. Wenn du weißt, wo du schauen musst.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die wichtigsten Formate: was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Kakaozeremonie:</strong> Eines
              der am stärksten gewachsenen Formate in Hamburg. Zeremonielle
              Kakao — ursprünglich aus Mesoamerika — wird hier in professionell
              begleiteten Gruppen getrunken, oft kombiniert mit Meditation,
              Bewegung oder Intention-Setting. Mehrere feste Anbieter in
              Hamburg, regelmäßige Termine.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Mondrituale & Frauenkreise:</strong>{" "}
              Monatliche Formate, die um Neu- und Vollmond herum stattfinden.
              Frauenkreise sind ein Raum für Austausch, Körperbewusstsein und
              Gemeinschaft — von sehr divers bis klar spirituell ausgerichtet.
              Hamburg hat hier eine solide Auswahl.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Soundhealing & Klangreisen:</strong>{" "}
              Klangschalen, Gongs, Synthesizer — geführte Klangerfahrungen die
              das Nervensystem regulieren und tief entspannen. In Hamburg finden
              sich sowohl Einzel-Sessions als auch Gruppenformate.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Ecstatic Dance & Bewegungsrituale:</strong>{" "}
              Für viele in der Community einer der Einstiege ins spirituelle
              Tanzen. Keine Choreographie, kein Partner-Zwang — freies Bewegen
              in Gemeinschaft. Hamburg hat regelmäßige Formate, teils mit DJ,
              teils mit Live-Musik.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Hamburger Stadtteile mit aktivem Angebot
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Das Schanzenviertel, Altona und Eimsbüttel sind traditionell
              stark. Viele Anbieter sind in Studios oder gemieteten Räumen in
              diesen Stadtteilen aktiv. Barmbek und Winterhude holen auf.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Interessant: Manche Formate — besonders zeremonielle und
              nächtebasierte — wandern in private oder halb-öffentliche
              Locations aus. Das macht sie manchmal schwer zu finden. Das
              Portal versucht genau das zu lösen: auch diese Termine sichtbar
              zu machen, ohne dass du in zehn verschiedenen Telegram-Kanälen
              suchen musst.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind spirituelle Events in Hamburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Direkte Antwort: für alle, die neugierig sind. Die Szene in Hamburg
              ist deutlich weniger exklusiv als ihr Ruf manchmal vermuten lässt.
              Du brauchst keine Vorgeschichte, keine spirituelle Praxis, keine
              bestimmte Weltanschauung. Du brauchst Interesse am eigenen
              Erleben und Offenheit für Formate, die über den klassischen
              Workshop hinausgehen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die meisten Events auf Das Portal sind ausdrücklich offen für
              Einsteiger. Bei denjenigen, die Vorerfahrung voraussetzen, wird
              das in der Beschreibung klar kommuniziert.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Fragen zu spirituellen Events in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was unterscheidet spirituelle von ganzheitlichen Events?",
                a: "Der Unterschied ist fließend. Spirituelle Events haben oft einen stärker zeremoniellen oder ritualbasierten Charakter — Kakaozeremonie, Mondrituale, Klangreisen. Ganzheitliche Events ist der weitere Begriff, der auch Yoga, Breathwork und Wellness-Formate einschließt.",
              },
              {
                q: "Brauche ich eine spirituelle Praxis um teilzunehmen?",
                a: "Nein. Die meisten Formate sind ausdrücklich für Einsteiger offen. Eine Grundbereitschaft zur Selbstreflexion und Offenheit für unbekannte Formate ist hilfreicher als jede Vorpraxis.",
              },
              {
                q: "Wie finde ich Kakaozeremonien in Hamburg?",
                a: "Das Portal listet alle Kakaozeremonie-Events in Hamburg unter /hamburg/kakaozeremonie. Alternativ nutze den Tag-Filter 'kakaozeremonie' auf der Events-Seite.",
              },
              {
                q: "Gibt es regelmäßige spirituelle Formate in Hamburg?",
                a: "Ja — Frauenkreise und Mondrituale finden meist monatlich statt. Meditationsabende und Soundhealing-Sessions teils wöchentlich. Das Portal zeigt die nächsten Termine chronologisch.",
              },
              {
                q: "Sind spirituelle Events in Hamburg teuer?",
                a: "Das variiert. Community-Formate und Meditationsabende sind oft kostenlos oder auf Spendenbase. Zeremonielle Formate mit professioneller Begleitung liegen meist zwischen 30 und 80 Euro. Das Portal zeigt das Preismodell direkt in der Übersicht.",
              },
              {
                q: "Was ist Der Unterschied zwischen Soundhealing und Klangreise?",
                a: "Meist nur der Name. Beide beschreiben geführte Klangerfahrungen mit Klangschalen, Gongs oder anderen Instrumenten. Manche Anbieter nutzen 'Klangreise' für intensivere oder längere Formate — aber eine einheitliche Definition gibt es nicht.",
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
            Kein Termin mehr verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt der Telegram-Community bei — dort kommen neue spirituelle
            Events direkt zu dir. Oder trag dich in die Warteliste ein für
            frühen Zugang zu Das Portal.
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
