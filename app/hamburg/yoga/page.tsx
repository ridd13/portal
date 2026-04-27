import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Yoga Hamburg — Events, Workshops & Retreats auf Das Portal",
  description:
    "Yoga-Events in Hamburg: Vinyasa, Yin Yoga, Kundalini, Acroyoga und mehr. Aktuelle Workshops, Retreat-Termine und Community-Formate auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/yoga",
  },
  openGraph: {
    title: "Yoga Hamburg — Events & Workshops auf Das Portal",
    description:
      "Yoga-Events in Hamburg — Workshops, Retreats und Community-Formate. Vinyasa, Yin, Kundalini und mehr. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/hamburg/yoga",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const YOGA_TAGS = [
  "yoga",
  "vinyasa",
  "yin yoga",
  "kundalini",
  "ashtanga",
  "hatha",
  "acroyoga",
  "yoga nidra",
  "yin",
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

export default async function HamburgYogaPage() {
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
        YOGA_TAGS.some((yt) => tag.toLowerCase().includes(yt))
      ) ||
      event.title?.toLowerCase().includes("yoga")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Yoga Events Hamburg",
    description: "Aktuelle Yoga-Events, Workshops und Retreats in Hamburg",
    url: "https://das-portal.online/hamburg/yoga",
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
            Hamburg · Yoga
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Yoga in Hamburg — Events, Workshops & Retreats
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Yoga-Events in Hamburg jenseits vom regulären Stundenplan. Hier
            findest du besondere Workshops, Retreat-Tage, Community-Formate
            und Intensiv-Kurse — alles auf einen Blick.
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
            Aktuelle Yoga-Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} ${events.length === 1 ? "Termin" : "Termine"} gefunden — von Vinyasa bis Yoga Nidra.`
              : "Gerade keine Yoga-Events geplant — schau bald wieder rein oder tritt der Telegram-Community bei."}
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
                Aktuell keine Yoga-Events eingetragen.
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
              Yoga-Events in Hamburg — warum nicht einfach ins Studio?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Hamburg hat keinen Mangel an Yoga-Studios. Allein in Eimsbüttel,
              Altona und der Schanze wirst du auf hundert Meter mehr Studios
              finden als Bäckereien. Für den regulären Stundenplan — Vinyasa
              um 18 Uhr, Yin am Sonntag — bist du da bestens versorgt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Aber es gibt eine ganze Welt an Yoga-Formaten, die im
              Wochenstundenplan keines Studios auftaucht. Intensiv-Workshops
              über ein ganzes Wochenende. Yoga-Retreats in der Lüneburger
              Heide oder an der Ostsee. Acroyoga-Jams im Park. Kundalini-
              Workshops mit Live-Musik. Yoga Nidra Sessions bei
              Vollmond. Yin-Zeremonien mit Klangschalen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Genau diese Formate sammelt Das Portal. Nicht die reguläre
              Dienstag-Stunde, sondern die besonderen Events — die, für die
              du normalerweise drei Instagram-Accounts, zwei Telegram-Gruppen
              und einen Newsletter durchforsten müsstest.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Yoga-Stile, die du in Hamburg findest
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Hamburger Yoga-Szene ist breit aufgestellt. Vinyasa und
              Hatha sind die Klassiker und machen den Großteil des Angebots
              aus. Aber Hamburg hat auch starke Communities für Stile, die
              anderswo schwerer zu finden sind.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Kundalini Yoga</strong> hat
              in Hamburg eine treue Anhängerschaft. Die Kombination aus
              Atemübungen, Mantras und dynamischen Bewegungssequenzen zieht
              Menschen an, die mehr wollen als körperliche Praxis. Workshops
              gehen oft über mehrere Stunden und werden von erfahrenen Lehrern
              begleitet.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Yin Yoga</strong> ist in
              den letzten Jahren vom Nischenformat zum festen Bestandteil fast
              jedes Studios geworden. Die besonderen Events — Yin mit
              Klangschalen, Yin-Zeremonie, Yin und Meditation — finden oft
              außerhalb der Studios statt, in gemieteten Räumen oder privaten
              Locations.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Acroyoga</strong> hat in
              Hamburg eine aktive Community, die sich regelmäßig zu Jams und
              Workshops trifft. Im Sommer im Park, im Winter in Turnhallen
              und Tanzstudios. Wer hier einsteigen will, braucht keine
              Vorerfahrung — die Community nimmt Anfänger gerne mit.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Yoga Nidra</strong> — der
              "yogische Schlaf" — wird in Hamburg sowohl als eigenständiges
              Format als auch als Teil von Retreat-Tagen angeboten. Besonders
              die Abendformate erfreuen sich wachsender Beliebtheit.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Hamburger Yoga: Was die Szene auszeichnet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Was an der Hamburger Yoga-Szene auffällt: Sie ist weniger
              dogmatisch als in anderen Städten. Die Grenzen zwischen den
              Stilen verschwimmen. Ein Workshop, der als "Vinyasa" angekündigt
              wird, enthält Elemente von Breathwork. Eine "Yin-Session"
              wird mit Soundhealing kombiniert. Ein "Yoga-Retreat"
              beinhaltet Kakaozeremonie und Ecstatic Dance.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Puristen manchmal irritierend. Für alle anderen: Eine
              Chance, Yoga nicht als isolierte Disziplin zu erleben,
              sondern als Teil einer ganzheitlichen Praxis. Und das ist
              ziemlich genau das, was Hamburg gut kann — Dinge
              zusammenbringen, die auf dem Papier nicht zusammengehören,
              und trotzdem funktioniert es.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Stadtviertel mit der dichtesten Yoga-Community sind
              Eimsbüttel, Ottensen, die Schanze und Barmbek. Aber auch in
              Winterhude, Eppendorf und Wandsbek wächst das Angebot. Im
              Sommer verlagert sich ein Teil der Events nach draußen —
              Alsterpark, Elbstrand, Stadtpark.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Yoga-Retreats ab Hamburg
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Nicht jedes Yoga-Retreat findet in Hamburg selbst statt. Viele
              Hamburger Lehrerinnen und Lehrer organisieren mehrtägige
              Retreats in Schleswig-Holstein, an der Ostsee, auf Sylt oder in
              der Lüneburger Heide. Freitag Nachmittag los, Sonntag
              Nachmittag zurück — ein Wochenende raus aus der Stadt, rein in
              die Praxis.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal listet auch diese Retreat-Formate, sodass du nicht
              separat nach "Yoga Retreat Hamburg" und "Yoga Retreat
              Schleswig-Holstein" suchen musst. Ein Ort, alle Optionen.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Yoga-Events in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was ist der Unterschied zwischen Yoga-Studio und Yoga-Event?",
                a: "Im Studio hast du regelmäßige Stunden im Wochenrhythmus. Yoga-Events sind besondere Formate — Workshops, Retreat-Tage, Intensiv-Kurse, Community-Jams. Oft länger, tiefer und von spezialisierten Lehrern begleitet.",
              },
              {
                q: "Brauche ich Vorerfahrung für Yoga-Workshops?",
                a: "Kommt auf den Workshop an. Viele sind explizit für alle Level offen. Bei Intensiv-Formaten oder fortgeschrittenen Workshops steht das in der Beschreibung. Auf Das Portal findest du die Details direkt beim Event.",
              },
              {
                q: "Was kosten Yoga-Events in Hamburg?",
                a: "Community-Jams und Park-Sessions sind oft kostenlos oder auf Spendenbasis. Workshops liegen zwischen 30 und 90 Euro. Retreat-Wochenenden kosten je nach Location und Verpflegung zwischen 200 und 600 Euro.",
              },
              {
                q: "Welche Yoga-Stile finde ich auf Das Portal?",
                a: "Vinyasa, Hatha, Yin, Kundalini, Ashtanga, Acroyoga, Yoga Nidra und viele Mischformate. Hamburg hat eine sehr vielfältige Szene — wir bilden das Angebot so ab, wie es tatsächlich ist.",
              },
              {
                q: "Gibt es Yoga-Events im Freien?",
                a: "Ja, vor allem im Sommer. Alsterpark, Stadtpark und Elbstrand sind beliebte Spots. Acroyoga-Jams finden fast ausschließlich draußen statt. Im Winter verlagert sich das Ganze in Studios und gemietete Räume.",
              },
              {
                q: "Kann ich als Yoga-Lehrer meine Events eintragen?",
                a: "Ja — Das Portal ist für Anbieter in Schleswig-Holstein und Hamburg gedacht. Trag dich in die Warteliste ein und wir melden uns.",
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
            Kein Yoga-Event mehr verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt der Telegram-Community bei und bekomm neue Events direkt
            zugeschickt. Oder trag dich in die Warteliste ein.
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
