import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Meditation München — Termine, Kurse & Retreats auf Das Portal",
  description:
    "Meditation in München: Stille-Abende, Zen, Vipassana, geführte Meditationen und Retreats im Voralpenland. Aktuelle Termine aus der Münchner Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/muenchen/meditation",
  },
  openGraph: {
    title: "Meditation München — Das Portal",
    description:
      "Meditationsabende, Zen-Sitzungen, Vipassana-Tage und Retreats im Voralpenland. Alle Termine auf einen Blick.",
    url: "https://das-portal.online/muenchen/meditation",
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

export default async function MuenchenMeditationPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%München%,address.ilike.%muenchen%,address.ilike.%Muenchen%")
    .contains("tags", ["meditation"])
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Meditation Events in München",
    description:
      "Aktuelle Meditationsabende, Zen-Sitzungen und Retreats in München und Umgebung",
    url: "https://das-portal.online/muenchen/meditation",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: event.start_at,
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
            München · Meditation
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Meditation in München — Termine, Kurse & Retreats
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Meditation in München — von der wöchentlichen Abendsitzung in
            Schwabing bis zum zehntägigen Schweigeretreat im Voralpenland.
            Aktuelle Termine aus der Münchner Community auf einen Blick.
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
            Aktuelle Meditation Events in München
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Abendmeditationen bis zu mehrtägigen Retreats.`
              : "Gerade keine Meditation-Termine in München — schau bald wieder rein oder tritt unserer Telegram-Community bei."}
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
                Aktuell keine Meditation-Events in München.
              </p>
              <Link
                href="/muenchen/ganzheitliche-events"
                className="mt-3 inline-block text-sm text-accent-primary hover:underline"
              >
                Alle München Events ansehen →
              </Link>
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/muenchen/ganzheitliche-events"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle ganzheitlichen Events in München →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Meditation in München — gewachsene Struktur, breites Angebot
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              München hat eine der ältesten und bestorganisierten
              Meditations-Landschaften in Deutschland. Das Zen-Zentrum, die
              Vipassana-Gruppen, die buddhistische Zentren, MBSR-Institute an
              der LMU und im klinischen Kontext, dazu zahlreiche Yoga-Studios
              mit Meditations-Angebot — die Dichte ist hoch, die Qualität
              solide. Was manchmal fehlt, ist der Überblick.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das liegt daran, dass die Münchner Szene stark in festen Gruppen
              und Institutionen organisiert ist. Viele Angebote laufen über
              eigene Mailverteiler, Vereinsstrukturen oder
              Studio-Mitgliedschaften. Für Außenstehende oder Neuankömmlinge
              nicht leicht zugänglich. Das Portal versucht, diese
              Fragmentierung aufzulösen und sichtbar zu machen, was gerade
              offen für Neue ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Du siehst im Event-Grid oben aktuelle Termine — von offenen
              Abendmeditationen bis zu mehrtägigen Retreats in den
              Voralpenland-Häusern, die viele Münchner Lehrer:innen nutzen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Meditations-Formate findest du in München?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Münchner Szene deckt praktisch alle relevanten Traditionen
              ab. Eine Orientierung:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Zen:</strong>{" "}
              München hat ein aktives Zen-Zentrum in der Innenstadt sowie
              mehrere Zen-Linien (Soto, Rinzai) mit festen wöchentlichen
              Zazen-Sitzungen. Einsteigerabende werden regelmäßig angeboten.
              Wenn du eine klare, stille, formale Praxis willst — hier findest
              du sie.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Vipassana und Insight Meditation:</strong>{" "}
              Starke Tradition in München, unter anderem durch die Vipassana
              Meditation München und einzelne Lehrer:innen im Umfeld des
              buddhistischen Zentrums. Tagesretreats, Wochenenden und
              mehrtägige Schweigeretreats in bayerischen Landhäusern.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tibetisch-buddhistische Praxis:</strong>{" "}
              Mehrere Dharma-Zentren bieten Ngöndro, Lamrim und geführte
              Visualisierungen. Für Menschen mit Bezug zur vajrayana-Tradition
              oder für jene, die strukturierte Langzeit-Praxis suchen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">MBSR und säkulare Achtsamkeit:</strong>{" "}
              Acht-Wochen-Programme, die Meditation unabhängig von religiöser
              Rahmung lehren. Getragen oft von der LMU, TU oder privaten
              MBSR-Trainer:innen. Solide Wahl, wenn du Meditation als
              Stress-Prävention oder therapeutisches Tool nutzen willst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Geführte Meditationen und Integration:</strong>{" "}
              Weichere Einstiege mit geführter Anleitung, oft verbunden mit
              Yoga, Klang oder therapeutischem Kontext. Gut geeignet für
              Menschen, denen stille Traditionen anfangs zu leer wirken.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats im Umland:</strong>{" "}
              Das Voralpenland zwischen München und den Alpen ist dicht mit
              Retreat-Häusern besetzt. Benediktbeuern, Mittenwald, das
              Tegernsee-Umfeld — viele Münchner Meditationslehrer:innen
              arbeiten mit diesen Häusern. Wenn du einen Schritt tiefer gehen
              willst, findest du hier das passende Format.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Wo in München findet Meditation statt?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Verteilung in der Stadt ist klar konzentriert. Schwabing und
              Maxvorstadt sind die dichtesten Standorte — Zen-Zentrum,
              Dharma-Zentren, mehrere Yoga-Studios mit Meditations-Angebot,
              dazu die Nähe zur Universität und damit zu MBSR-Kursen.
              Haidhausen und das Glockenbachviertel ziehen die eher
              szene-nahen Formate an. Obergiesing und der Westend haben
              kleinere, aber treue Community-Kreise.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Viele Lehrer:innen arbeiten an mehreren Orten parallel — abends
              in der Stadt, am Wochenende im Umland. Deshalb reicht es oft
              nicht, ein einzelnes Studio im Blick zu haben. Das Portal zeigt
              dir Formate verschiedener Anbieter und Standorte auf einer
              Seite.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Meditation in München?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Für Anfänger funktioniert München besonders gut, weil die
              Anbieter meist strukturierter arbeiten als in kleineren Städten.
              Wenn du noch nie meditiert hast, findest du dedizierte
              Einsteiger-Abende in fast jeder Tradition. Du musst nicht "schon
              wissen", worum es geht — die Arbeit beginnt dort, wo du stehst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Erfahrene ist das Angebot breit genug, dass du nicht beim
              Anfänger-Level hängenbleibst. Mehrtägige Retreats,
              fortgeschrittene Kurse und Langzeit-Praxisbegleitung sind in
              München gut verfügbar — oft in mehreren Traditionen gleichzeitig.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Meditation in München
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Wo fange ich an, wenn ich noch nie meditiert habe?",
                a: "Geh zu einem Einsteiger-Abend. Zen-Zentrum, Vipassana-Gruppen, ein MBSR-Schnupperabend oder ein Yoga-Studio mit Meditationsformat — die meisten Münchner Anbieter haben dedizierte Erstkontakt-Termine. Such dir einen aktuellen Termin oben im Event-Grid, meld dich an, geh hin. Nach 2–3 Versuchen merkst du, welche Form zu dir passt.",
              },
              {
                q: "Zen, Vipassana oder MBSR — was ist der Unterschied?",
                a: "Zen arbeitet mit formaler Sitzhaltung, offenem Gewahrsein und oft Koan-Fragen. Vipassana fokussiert auf Beobachtung von Empfindungen und Geistesinhalten. MBSR ist säkular-therapeutisch, ein 8-Wochen-Programm, das Alltagstauglichkeit betont. Techniken überschneiden sich, der Rahmen unterscheidet sich. Probier eins nach dem anderen, statt zu theoretisieren.",
              },
              {
                q: "Wie viel kostet Meditation in München?",
                a: "Abendmeditationen in Zentren und Gruppen laufen oft auf Spendenbasis (5–20 €). MBSR-Kurse (8 Wochen) kosten 300–500 €, manchmal von Krankenkassen teilweise erstattet. Tagesretreats liegen bei 50–100 €. Mehrtägige Retreats im Umland kosten je nach Dauer 300–900 € inklusive Unterkunft und Verpflegung. Drop-in-Sessions im Studio sind meist in Yoga-Karten integriert.",
              },
              {
                q: "Gibt es Schweigeretreats in der Nähe von München?",
                a: "Ja, zahlreiche. Das Voralpenland zwischen München und den Alpen ist dicht mit Retreat-Häusern besetzt. Benediktbeuern, das Tegernsee-Umfeld, einzelne Klöster und Dharma-Häuser bieten regelmäßig mehrtägige Schweigeretreats. Viele werden von Münchner Lehrer:innen geleitet. Aktuelle Termine findest du oben im Event-Grid, soweit sie auf Das Portal eingestellt sind.",
              },
              {
                q: "Ist Meditation in München religiös?",
                a: "Das hängt vom Anbieter ab. Zen und tibetisch-buddhistische Formate stehen in religiöser Tradition, auch wenn sie oft offen für Nicht-Buddhist:innen sind. Vipassana wird häufig säkular vermittelt. MBSR ist vollständig säkular. Die Praxis selbst — sitzen, atmen, beobachten — ist weltanschauungsneutral. Such dir den Rahmen, der zu deinem Hintergrund passt.",
              },
              {
                q: "Ich bin oft gestresst und unruhig. Ist Meditation dann überhaupt sinnvoll?",
                a: "Ja, gerade dann. Allerdings: Setz realistische Erwartungen. Die ersten zwei, drei Wochen fühlt sich Meditation oft anstrengend oder unruhig an — dein Nervensystem merkt, dass es nicht mehr dauerhaft abgelenkt wird. Das ist normal. MBSR-Kurse und begleitete Einsteiger-Formate sind gerade für gestresste Menschen sinnvoll, weil du Unterstützung bekommst statt alleine durchzubeißen.",
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
            Neue Meditation-Termine in München nicht verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Events direkt
            zugeschickt. Oder trag dich in die Warteliste für frühen Zugang
            zur Plattform ein.
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
