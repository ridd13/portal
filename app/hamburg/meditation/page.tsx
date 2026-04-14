import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Meditation Hamburg — Events, Kurse & Stille-Retreats auf Das Portal",
  description:
    "Meditations-Events in Hamburg: Geführte Meditationen, Stille-Retreats, Achtsamkeits-Workshops und Community-Formate. Aktuelle Termine auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/meditation",
  },
  openGraph: {
    title: "Meditation Hamburg — Events & Retreats auf Das Portal",
    description:
      "Meditations-Events in Hamburg — geführte Meditationen, Stille-Retreats, Achtsamkeits-Workshops. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/hamburg/meditation",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const MEDITATION_TAGS = [
  "meditation",
  "achtsamkeit",
  "mindfulness",
  "stille",
  "vipassana",
  "zen",
  "kontemplation",
  "sitzen",
  "meditationsabend",
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

export default async function HamburgMeditationPage() {
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

  const allEvents = (data || []) as Event[];
  const events = allEvents.filter(
    (event) =>
      event.tags?.some((tag) =>
        MEDITATION_TAGS.some((mt) => tag.toLowerCase().includes(mt))
      ) ||
      event.title?.toLowerCase().includes("meditation") ||
      event.title?.toLowerCase().includes("achtsamkeit") ||
      event.title?.toLowerCase().includes("stille")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Meditations-Events Hamburg",
    description:
      "Aktuelle Meditations-Events, Workshops und Retreats in Hamburg",
    url: "https://das-portal.online/hamburg/meditation",
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
            Hamburg · Meditation
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Meditation in Hamburg — Events, Kurse & Stille-Retreats
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst Meditations-Events in Hamburg? Hier findest du geführte
            Meditationen, Achtsamkeits-Workshops, Stille-Retreats und
            Community-Formate — über den regulären Studio-Kurs hinaus.
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
            Aktuelle Meditations-Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} ${events.length === 1 ? "Termin" : "Termine"} gefunden.`
              : "Gerade keine Meditations-Events geplant — schau bald wieder rein oder tritt der Telegram-Community bei."}
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
                Aktuell keine Meditations-Events eingetragen.
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
              Meditation in Hamburg — mehr als Augen zu und Atmen
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Meditation ist das Ding, von dem jeder weiß, dass es gut ist —
              und das trotzdem die wenigsten regelmäßig machen. "Ich kann
              nicht meditieren, mein Kopf ist zu laut" ist wahrscheinlich der
              Satz, den Meditationslehrer in Hamburg am häufigsten hören. Und
              genau da liegt das Missverständnis: Meditation bedeutet nicht,
              dass der Kopf still wird. Es bedeutet, dass du lernst, dem Lärm
              anders zu begegnen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Hamburg hat eine überraschend tiefe Meditations-Szene. Von
              buddhistischen Zentren mit Jahrzehnte langer Tradition über
              moderne Achtsamkeits-Studios bis zu freien Lehrern, die in
              gemieteten Räumen oder Open-Air Formate anbieten. Und dann
              gibt es noch die Events, die sich am besten mit "Meditation
              Plus" beschreiben lassen — Meditation kombiniert mit
              Soundhealing, mit Breathwork, mit Kakao, mit Bewegung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Auf Das Portal findest du die besonderen Formate: Workshops,
              die über eine Stunde hinausgehen. Stille-Retreats, die ein
              ganzes Wochenende dauern. Community-Meditationen, bei denen du
              in der Gruppe sitzt statt alleine auf dem Kissen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Meditationsformen findest du in Hamburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Geführte Meditation</strong>{" "}
              ist das zugänglichste Format und in Hamburg weit verbreitet. Ein
              Lehrer führt dich mit Stimme durch eine innere Reise, eine
              Visualisierung oder eine Körperwahrnehmungsübung. Gut für
              Einsteiger und für alle, die alleine schwer in die Stille
              kommen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Vipassana-Meditation</strong>{" "}
              hat in Hamburg mehrere Anlaufstellen. Die Technik — stilles
              Sitzen mit Fokus auf Körperempfindungen — wird in Wochenend-
              Kursen und längeren Retreats gelehrt. Die klassischen
              10-Tage-Retreats finden außerhalb der Stadt statt, aber
              Einführungs-Workshops gibt es regelmäßig in Hamburg.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Zen-Meditation</strong>{" "}
              wird in Hamburg von mehreren Zen-Gruppen und einem etablierten
              Zen-Zentrum angeboten. Zazen — das stille Sitzen — ist die
              Kernpraxis. Die Atmosphäre ist eher formal und strukturiert,
              was viele Menschen schätzen, die Klarheit und Disziplin in
              ihrer Praxis suchen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Klang-Meditation</strong>{" "}
              und Soundhealing-Formate verbinden Meditation mit akustischen
              Instrumenten — Klangschalen, Gongs, Monochord. In Hamburg ein
              wachsender Bereich, bei dem die Grenzen zwischen Meditation
              und zeremonieller Erfahrung fließend sind.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Achtsamkeits-Workshops</strong>{" "}
              (MBSR-basiert oder frei) sind in Hamburg gut vertreten. Diese
              Formate richten sich an Menschen, die Meditation in ihren
              Alltag integrieren wollen — weniger spirituell, mehr
              pragmatisch. Stressbewältigung, Fokus, emotionale Regulation.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Warum Meditation in der Gruppe anders wirkt
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Alleine meditieren ist gut. In der Gruppe meditieren ist
              anders. Das klingt erstmal wie ein Plattitüde, aber jeder,
              der beides kennt, wird bestätigen: Im Raum mit anderen
              Menschen zu sitzen verändert die Qualität der Erfahrung. Die
              Stille wird dichter, die Verbindlichkeit höher, und der
              innere Widerstand hat weniger Angriffsfläche, wenn du
              umgeben von Menschen sitzt, die dasselbe tun.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              In Hamburg gibt es verschiedene Formate, die genau das
              ermöglichen: Wöchentliche Sitz-Gruppen, monatliche
              Community-Meditationen, und Events, bei denen dreißig oder
              mehr Menschen zusammen in der Stille sitzen. Das Portal
              zeigt dir, wann und wo diese stattfinden.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Stille-Retreats ab Hamburg
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Wer Meditation vertiefen will, kommt an einem Retreat kaum
              vorbei. In Hamburg selbst sind mehrtägige Stille-Retreats
              selten — die Stadtgeräusche arbeiten dagegen. Aber viele
              Hamburger Lehrer organisieren Retreats in Schleswig-Holstein,
              an der Ostsee oder in ländlichen Seminarorten in der
              Umgebung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Von einem Wochenende bis zu einer Woche Stille ist alles
              dabei. Das Portal listet diese Retreats mit, sodass du von
              einem Ort aus alle Optionen siehst — egal ob in Hamburg
              oder in der Nähe.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Meditation in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Ich habe noch nie meditiert — wo fange ich an?",
                a: "Geführte Meditationsabende oder Achtsamkeits-Workshops sind der beste Einstieg. Du brauchst keinerlei Vorerfahrung. Ein Lehrer führt dich durch die Praxis und erklärt alles Schritt für Schritt.",
              },
              {
                q: "Was kosten Meditations-Events in Hamburg?",
                a: "Community-Meditationen sind oft kostenlos oder auf Spendenbasis. Workshops liegen zwischen 20 und 60 Euro. Stille-Retreats kosten je nach Dauer und Location zwischen 150 und 500 Euro.",
              },
              {
                q: "Wie lange dauert eine Meditations-Session?",
                a: "Community-Abende dauern meist 60 bis 90 Minuten. Workshops gehen über einen halben oder ganzen Tag. Retreats dauern von einem Wochenende bis zu mehreren Tagen.",
              },
              {
                q: "Muss ich still sitzen können?",
                a: "Nein. Die meisten Formate bieten Kissen, Bänke und Stühle an. Du musst nicht im Lotussitz sitzen. Bequem und aufrecht reicht völlig aus — der Rest kommt mit der Übung.",
              },
              {
                q: "Was ist der Unterschied zwischen Meditation und Achtsamkeit?",
                a: "Achtsamkeit ist eine Form der Meditation — Aufmerksamkeit im Moment, ohne zu bewerten. Meditation ist der Oberbegriff und umfasst viele Techniken: Achtsamkeit, Visualisierung, Mantra, Körperwahrnehmung und mehr.",
              },
              {
                q: "Gibt es in Hamburg auch Vipassana-Retreats?",
                a: "Einführungs-Workshops gibt es in Hamburg. Die klassischen 10-Tage-Retreats finden an Retreat-Zentren außerhalb der Stadt statt. Auf Das Portal findest du Termine und Infos zu beidem.",
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
            Kein Meditations-Event mehr verpassen
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
