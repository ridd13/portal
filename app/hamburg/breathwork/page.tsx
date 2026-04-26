import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Breathwork Hamburg — Atemarbeit, Workshops & Events auf Das Portal",
  description:
    "Breathwork in Hamburg: Holotropes Atmen, Wim Hof, Pranayama, Transformational Breath und mehr. Aktuelle Workshops und Community-Events auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/breathwork",
  },
  openGraph: {
    title: "Breathwork Hamburg — Workshops & Events auf Das Portal",
    description:
      "Breathwork-Events in Hamburg — Holotropes Atmen, Wim Hof, Pranayama und Atemarbeit-Workshops. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/hamburg/breathwork",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const BREATHWORK_TAGS = [
  "breathwork",
  "atemarbeit",
  "holotrop",
  "wim hof",
  "pranayama",
  "atemübung",
  "breath",
  "atmen",
  "transformational breath",
  "rebirthing",
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

export default async function HamburgBreathworkPage() {
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
        BREATHWORK_TAGS.some((bt) => tag.toLowerCase().includes(bt))
      ) ||
      event.title?.toLowerCase().includes("breathwork") ||
      event.title?.toLowerCase().includes("atemarbeit") ||
      event.title?.toLowerCase().includes("atmen")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Breathwork Events Hamburg",
    description:
      "Aktuelle Breathwork-Events und Atemarbeit-Workshops in Hamburg",
    url: "https://das-portal.online/hamburg/breathwork",
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
            Hamburg · Breathwork
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Breathwork in Hamburg — Atemarbeit, Workshops & Events
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Breathwork-Events in Hamburg: Von Holotropem Atmen über Wim Hof
            bis zu sanften Pranayama-Sessions. Finde hier aktuelle Workshops,
            Intensiv-Formate und Community-Abende.
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
            Aktuelle Breathwork-Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} ${events.length === 1 ? "Termin" : "Termine"} gefunden.`
              : "Gerade keine Breathwork-Events geplant — schau bald wieder rein oder tritt der Telegram-Community bei."}
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
                Aktuell keine Breathwork-Events eingetragen.
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
              Breathwork in Hamburg — warum alle plötzlich atmen
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Atmen tut jeder. Bewusst atmen — das ist die andere Sache.
              Breathwork ist in den letzten Jahren von einer Nischenpraxis
              zu einem der am schnellsten wachsenden Formate in der
              ganzheitlichen Szene geworden. Und Hamburg ist da keine
              Ausnahme. Die Nachfrage nach Breathwork-Workshops hat sich
              vervielfacht, neue Facilitators kommen dazu, und die Formate
              werden immer vielfältiger.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Der Grund ist ziemlich einfach: Breathwork wirkt schnell und
              spürbar. Wo Meditation Geduld braucht und Yoga körperliche
              Praxis, schafft Breathwork innerhalb von Minuten einen
              veränderten Zustand. Das ist keine Übertreibung — das
              autonome Nervensystem reagiert direkt auf veränderte
              Atemmuster. Je nach Technik kann das aktivierend, beruhigend
              oder emotional öffnend wirken.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              In Hamburg findest du das gesamte Spektrum: Von sanften
              Pranayama-Abenden, die dich in tiefe Entspannung bringen, bis
              zu intensiven Holotropen Atem-Sessions, die dich an Grenzen
              führen können, von denen du nicht wusstest, dass du sie hast.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Breathwork-Stile, die du in Hamburg findest
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Holotropes Atmen</strong>{" "}
              ist die intensivste Variante. Entwickelt von Stanislav Grof,
              arbeitet sie mit beschleunigter Atmung und Musik, um tiefe
              Bewusstseinszustände zu erreichen. In Hamburg gibt es
              ausgebildete Facilitators, die regelmäßig Sessions anbieten —
              meist über zwei bis drei Stunden mit anschließender
              Integration. Nicht für jeden der richtige Einstieg, aber für
              Menschen, die bereit sind, tief zu gehen, ein kraftvolles
              Werkzeug.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Wim Hof Methode</strong>{" "}
              kombiniert Atemtechnik mit Kälteexposition und Mindset-
              Training. In Hamburg gibt es zertifizierte Wim Hof Instruktoren,
              die Workshops anbieten — vom zweistündigen Intro bis zum
              ganztägigen Deep Dive. Beliebt bei Menschen, die Breathwork
              mit körperlicher Herausforderung verbinden wollen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Pranayama</strong> — die
              yogische Atemarbeit — wird in Hamburg sowohl in Yoga-Studios
              als auch als eigenständiges Format angeboten. Techniken wie
              Nadi Shodhana (Wechselatmung), Kapalabhati oder Bhastrika
              sind zugänglicher als die intensiveren Methoden und eignen
              sich gut als Einstieg.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Transformational Breath</strong>{" "}
              nutzt ein verbundenes Atemmuster (ohne Pause zwischen Ein-
              und Ausatmung), um emotionale Blockaden zu lösen. Die
              Sessions werden oft von ausgebildeten Facilitators begleitet,
              die dich während der Atemsession durch Körperarbeit und
              Akupressur unterstützen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Rebirthing</strong> und
              ähnliche Formen der verbundenen Atemarbeit sind ebenfalls in
              Hamburg vertreten. Der Fokus liegt hier stärker auf
              emotionaler Verarbeitung und innerer Arbeit als auf
              Performance oder Körpertraining.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Hamburger Breathwork-Szene
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Was die Hamburger Breathwork-Community auszeichnet: Die
              Facilitators nehmen ihre Ausbildung ernst. Die meisten haben
              mehrjährige Ausbildungen hinter sich und legen Wert auf einen
              sicheren Rahmen. Das ist bei Breathwork wichtig — die
              intensiveren Techniken können starke körperliche und
              emotionale Reaktionen auslösen, und ein erfahrener Facilitator
              macht den Unterschied zwischen einer guten Erfahrung und einer
              überwältigenden.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Events finden überall in der Stadt statt — in Yoga-Studios
              in der Schanze, in Seminarräumen in Altona, in privaten
              Locations in Barmbek. Im Sommer auch draußen. Die meisten
              Facilitators bewerben ihre Events über Instagram und
              Telegram — was es schwer macht, den Überblick zu behalten,
              wenn man nicht schon vernetzt ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal sammelt alle diese Events an einem Ort. Du siehst
              auf einen Blick, was wann wo stattfindet, welcher Stil
              angeboten wird und was der Facilitator mitbringt.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Breathwork geeignet?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Grundsätzlich: Für die meisten Menschen. Breathwork ist
              niedrigschwellig im Einstieg — du brauchst keinen
              durchtrainierten Körper, keine Vorkenntnisse und keine
              bestimmte Weltanschauung. Was du brauchst: Die Bereitschaft,
              dich auf eine intensive körperliche Erfahrung einzulassen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ein paar wichtige Hinweise: Bei Herz-Kreislauf-Erkrankungen,
              Epilepsie, akuten psychischen Erkrankungen oder in der
              Schwangerschaft solltest du vorher mit dem Facilitator
              sprechen — manche Techniken sind in diesen Fällen nicht
              geeignet. Seriöse Facilitators fragen das vor der Session ab.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Wer sich unsicher ist, startet am besten mit einem sanfteren
              Format — Pranayama oder eine geführte Atemsession — statt
              direkt in eine dreistündige Holotrope Session zu springen.
              Die Hamburger Szene bietet genug Einstiegspunkte für jedes
              Level.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Breathwork in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was passiert bei einer Breathwork-Session?",
                a: "Du liegst oder sitzt, der Facilitator führt dich durch ein bestimmtes Atemmuster. Je nach Technik dauert die aktive Atemphase 20 bis 60 Minuten. Danach gibt es eine Integrationsphase mit ruhiger Atmung und oft Sharing in der Gruppe.",
              },
              {
                q: "Ist Breathwork sicher?",
                a: "Bei einem ausgebildeten Facilitator und ohne relevante Vorerkrankungen: ja. Intensivere Techniken können starke körperliche Empfindungen auslösen (Kribbeln, Muskelspannung, emotionale Reaktionen) — das ist normal und Teil des Prozesses.",
              },
              {
                q: "Was kostet ein Breathwork-Workshop in Hamburg?",
                a: "Einstiegs-Sessions und Community-Formate kosten zwischen 20 und 40 Euro. Intensivere Workshops zwischen 50 und 120 Euro. Ganztags-Formate oder Retreats können 150 bis 300 Euro kosten.",
              },
              {
                q: "Welcher Breathwork-Stil ist der richtige für mich?",
                a: "Für den Einstieg empfehlen sich Pranayama oder sanfte geführte Atemarbeit. Wenn du körperliche Aktivierung suchst, ist Wim Hof eine gute Option. Für tiefere emotionale Arbeit eignen sich Holotropes Atmen oder Transformational Breath.",
              },
              {
                q: "Wie oft sollte ich Breathwork machen?",
                a: "Sanftere Techniken wie Pranayama kannst du täglich praktizieren. Intensivere Formate wie Holotropes Atmen brauchen Integrationszeit — einmal im Monat ist ein guter Rhythmus.",
              },
              {
                q: "Kann ich als Anfänger zu einem Breathwork-Workshop kommen?",
                a: "Ja. Die meisten Hamburger Facilitators bieten Einsteiger-freundliche Formate an. In der Event-Beschreibung steht, ob Vorerfahrung empfohlen wird. Im Zweifel: Schreib dem Facilitator vorher eine Nachricht.",
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
            Kein Breathwork-Event mehr verpassen
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
