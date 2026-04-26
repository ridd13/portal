import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Frauenkreis Hamburg — Sisterhood & feminine Embodiment Termine",
  description:
    "Frauenkreise in Hamburg: Frauenkreise, Sisterhood-Abende, feminine Embodiment und Women's Circles. Aktuelle Termine auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/frauenkreis",
  },
  openGraph: {
    title: "Frauenkreis Hamburg — Das Portal",
    description:
      "Frauenkreise in Hamburg: Sisterhood, feminine Embodiment, Weiblichkeit. Alle Termine auf einen Blick.",
    url: "https://das-portal.online/hamburg/frauenkreis",
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

export default async function HamburgFrauenkreisPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .contains("tags", ["frauen"])
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Frauenkreise Hamburg",
    description:
      "Aktuelle Frauenkreise, Sisterhood-Formate und feminine Embodiment Events in Hamburg",
    url: "https://das-portal.online/hamburg/frauenkreis",
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
            Hamburg · Frauenkreise & Sisterhood
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Frauenkreis Hamburg — Termine & Formate
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst einen Frauenkreis in Hamburg? Hier findest du alle
            aktuellen Termine: reguläre Frauenkreise, Sisterhood-Abende,
            feminine Embodiment Practices und Women's Circles — direkt aus der
            Hamburger Community.
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
            Aktuelle Frauenkreise in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Sisterhood bis feminine Embodiment.`
              : "Gerade keine Termine — schau bald wieder rein oder trag dich in die Warteliste ein."}
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
                Aktuell keine Frauenkreis-Events in dieser Kategorie.
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
              Was ist ein Frauenkreis?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Ein Frauenkreis ist ein Raum, in dem Frauen zusammenkommen, um bei
              sich selbst anzukommen. Das klingt einfach, ist aber ziemlich
              selten geworden. In einem Frauenkreis geht es nicht um
              Optimierung, Leistung oder Selbstverbesserung. Es geht um
              Präsenz, Verbindung und darum, gehört zu werden.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Frauenkreise sind eine uralte Praxis. In vielen traditionellen
              Kulturen waren sie selbstverständlich — ein Raum für Frauen, um
              Erfahrungen zu teilen, sich gegenseitig zu halten und ihre
              Weiblichkeit zu feiern. Dass es das heute bewusst wieder gibt,
              ist ein Zeichen dafür, dass dieser Raum dringend gebraucht wird.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              In Hamburg funktionieren Frauenkreise unterschiedlich. Manche sind
              monatliche Zusammenkünfte mit festen Gruppen, andere sind offene
              Formate, die Frauen empfangen, die gerade vorbeikommen. Manche
              sind sehr persönlich, andere haben einen spirituellen
              Fokus. Was sie verbindet: Es ist ein von Frauen für Frauen
              geschaffener Raum — ohne Ablenkung, ohne Außenwirkung, ohne das
              Gefühl, sich erklären zu müssen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Frauenkreis-Formate in Hamburg
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Hamburg hat eine vielfältige Frauenkreis-Szene. Die Formate
              unterscheiden sich — aber alle schaffen einen Raum speziell für
              Frauen:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Reguläre Frauenkreise:</strong>{" "}
              Monatliche oder regelmäßige Treffen mit einer festen oder offenen
              Gruppe. Oft mit Themen wie Zyklus, Weiblichkeit, Kraft oder Leben
              in den verschiedenen Lebensphasen. Diese Formate sind niedrigschwellig
              und bauen Vertrauen über die Zeit auf.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Sisterhood & Embodiment:</strong>{" "}
              Formate, die feminine Embodiment praktizieren — also lernen, in
              den weiblichen Körper zurückzukehren. Das kann Tanz sein, Atemarbeit,
              oder einfach die Erlaubnis, im weiblichen Tempo statt männlichem
              Leistungsmodus zu sein.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Mondrituale & Zyklus-Kreise:</strong>{" "}
              Formate, die den weiblichen Zyklus oder die Mondphasen integrieren.
              Diese Kreise arbeiten mit dem natürlichen Rhythmus statt gegen ihn.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats für Frauen:</strong>{" "}
              Mehrtägige Frauenkreise, oft außerhalb der Stadt in der Natur.
              Diese intensiven Erfahrungen ermöglichen tiefere Arbeit und das
              Gefühl, wirklich "aus der Welt" zu kommen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Themen-Spezifische Kreise:</strong>{" "}
              Kreise rund um Mutterschaft, Menopause, Trauer, Sexualität oder
              Berufung. Diese adressieren spezifische Lebensthemen, für die
              Frauen einen dedizierten Raum brauchen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Warum Frauenkreise wichtig sind
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Das ist vielleicht eine unbequeme Wahrheit: Die meisten Strukturen
              in der modernen Welt sind nicht für weibliche Erfahrung gebaut.
              Arbeitsplätze, Schule, sogar Therapie — vieles ist auf
              männliche Leistungslogik ausgerichtet.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Frauenkreise bieten einen Gegenpol. Ein Raum, in dem die weibliche
              Erfahrung selbstverständlich ist. Wo es okay ist, nicht immer
              "on" zu sein. Wo Intuition neben Logik steht. Wo Weinerlichkeit
              nicht als Schwäche gilt. Wo der Körper gehört wird, nicht nur der
              Verstand.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für viele Frauen ist ein Frauenkreis zum ersten Mal die Erfahrung,
              wirklich gesehen und gehört zu werden — nicht wegen ihrer
              Produktivität oder ihres Aussehens, sondern einfach weil sie eine
              Frau sind, die existiert.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Frauenkreise in Hamburg: Die Szene
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Hamburg hat eine wachsende Frauenkreis-Szene. Viertel wie Eimsbüttel,
              Ottensen/Altona und die Schanze sind Zentren, aber es gibt Kreise
              überall. Manche sind von großen Coaches organisiert, andere sind
              Grassroots-Initiativen von Freundinnen, die einfach einen Raum
              schaffen wollten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was besonders an Hamburg ist: Die Szene ist professionell genug,
              dass es viele gut organisierte Formate gibt, aber gleichzeitig
              noch authentisch. Es geht nicht um Branding oder Influencer-Status
              — es geht darum, dass Frauen zusammenkommen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal sammelt diese Events an einem Ort. Du findest aktuelle
              Termine, kannst sehen, welche Formate gerade laufen und dich
              direkt anmelden. Kein umständliches Suchen über Instagram oder
              Telegram — alle Frauenkreis-Termine in Hamburg auf einen Blick.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind Frauenkreise?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Frauenkreise sind für Frauen. Punkt. Alter, Hintergrund, spirituelle
              Erfahrung — das spielt keine Rolle. Du kannst seit Jahren in der
              Szene sein oder gerade zum ersten Mal neugierig werden. Die meisten
              Kreise sind niedrigschwellig und heißen alle willkommen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Manche Kreise haben spezifische Fokus (z.B. "für Mütter" oder "für
              über 40"), aber das ist in der Regel klar angekündigt. Wenn es
              einfach "Frauenkreis" heißt, bedeutet das: Jede Frau kann kommen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die einzige Voraussetzung ist das Interesse, sich selbst und
              anderen Frauen näher zu kommen. Der Rest ergibt sich im Kreis.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Frauenkreise als Teil der ganzheitlichen Bewegung
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Frauenkreise sind nicht isoliert — sie sind Teil eines größeren
              Wandels. Überall entstehen Räume, die die weibliche Erfahrung
              wieder ernst nehmen. Coaching für Frauen, feminine Leadership,
              Zyklus-Workshops, Women's Embodiment — das alles gehört zusammen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Hamburg ist da mittendrin. Die ganzheitliche Community hier ist
              einer der wenigen Orte in Deutschland, wo dieses Thema wirklich
              angekommen ist. Das Portal dokumentiert das — es zeigt, dass es
              nicht um New-Age-Esoterik geht, sondern um praktische, notwendige
              Räume für Frauen.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Frauenkreisen in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was genau passiert in einem Frauenkreis?",
                a: "Das variiert je nach Kreis. Typischerweise sitzen oder sitzen Frauen zusammen, es gibt einen Eröffnungsritual oder eine Intention, dann folgt oft ein offenes Sharing — jede kann sprechen, was sie gerade bewegt. Manche Kreise haben auch Atemarbeit, Bewegung oder stille Momente. Der Fokus liegt auf Präsenz und Verbindung, nicht auf Anleitung.",
              },
              {
                q: "Muss ich spirituell sein, um in einen Frauenkreis zu gehen?",
                a: "Nein. Frauenkreise sind offen für Frauen unabhängig von ihrer spirituellen Überzeugung. Manche Kreise haben einen spirituellen Rahmen (Mondrituale, Chakren), andere sind rein säkular. Bei jedem Event auf Das Portal kannst du sehen, welche Ausrichtung der Kreis hat.",
              },
              {
                q: "Was kosten Frauenkreise in Hamburg?",
                a: "Das variiert stark. Manche Community-Kreise sind kostenlos oder auf Spendenbase. Regelmäßig stattfindende Kreise kosten meist 15–40 Euro. Intensiv-Workshops und Retreats können 50–300 Euro kosten. Das Portal zeigt dir das Preismodell direkt in der Event-Beschreibung.",
              },
              {
                q: "Kann ich einfach vorbeikommen oder muss ich mich anmelden?",
                a: "Das kommt auf den Kreis an. Manche sind offen für Spontan-Besuch, aber die meisten bitten um Anmeldung. Das hat praktische Gründe (Raumgröße) und hilft auch den Facilitatorinnen, den Kreis gut zu halten. Schau bei der Anmeldung, ob es offene oder geschlossene Formate sind.",
              },
              {
                q: "Gibt es auch Frauenkreise nur für eine bestimmte Altersgruppe?",
                a: "Ja, es gibt spezialisierte Kreise. Du findest Kreise für junge Frauen, für Mütter, für Frauen über 40, für Frauen in der Menopause. Diese sind in der Regel in der Beschreibung klar gekennzeichnet. Viele Kreise sind aber offen für alle Altersgruppen — da siehst du eine schöne Durchmischung.",
              },
              {
                q: "Wie finde ich den passenden Frauenkreis für mich?",
                a: "Das Portal zeigt alle aktuellen Termine. Schau dir die Beschreibung an — was ist der Fokus? Wo treffen sie sich? Zu welcher Zeit? Und vor allem: Wie fühlt sich die Beschreibung an? Vertrau auf dein Bauchgefühl. Du kannst auch mehrere Kreise ausprobieren, um zu sehen, welcher Raum sich für dich richtig anfühlt.",
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
            Frauenkreis-Termine nicht verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue
            Frauenkreis-Termine direkt zugeschickt. Oder trag dich in die
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
