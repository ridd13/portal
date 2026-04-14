import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Breathwork Kiel — Atemarbeit, Workshops & Events auf Das Portal",
  description:
    "Breathwork in Kiel: Holotropes Atmen, Pranayama, Transformational Breath und Atemkreise. Aktuelle Workshops und Community-Events in Kiel und Umgebung auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/kiel/breathwork",
  },
  openGraph: {
    title: "Breathwork Kiel — Workshops & Events auf Das Portal",
    description:
      "Breathwork-Events in Kiel — Atemarbeit, Pranayama, Atemkreise und Workshops. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/kiel/breathwork",
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
  "atemkreis",
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

export default async function KielBreathworkPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Kiel%,address.ilike.%kiel%,location_name.ilike.%Kiel%")
    .order("start_at", { ascending: true })
    .limit(20);

  const allEvents = (data || []) as Event[];
  const events = allEvents.filter(
    (event) =>
      event.tags?.some((tag) =>
        BREATHWORK_TAGS.some((bt) => tag.toLowerCase().includes(bt))
      ) ||
      event.title?.toLowerCase().includes("breathwork") ||
      event.title?.toLowerCase().includes("atemarbeit") ||
      event.title?.toLowerCase().includes("atmen") ||
      event.title?.toLowerCase().includes("atemkreis")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Breathwork Events Kiel",
    description:
      "Aktuelle Breathwork-Events und Atemarbeit-Workshops in Kiel",
    url: "https://das-portal.online/kiel/breathwork",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: event.start_at,
        location: {
          "@type": "Place",
          name: event.location_name || "Kiel",
          address: event.address || "Kiel",
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
            Kiel · Breathwork
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Breathwork in Kiel — Atemarbeit, Workshops & Events
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Breathwork in Kiel und Umgebung: Atemkreise, Pranayama, Holotropes
            Atmen und Transformational Breath. Finde aktuelle Workshops und
            Community-Formate an der Kieler Förde.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Kiel"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Kiel Events
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
            Aktuelle Breathwork-Events in Kiel
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
                Aktuell keine Breathwork-Events in Kiel eingetragen.
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
                href="/events?city=Kiel"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Kiel Events anzeigen
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Breathwork in Kiel — eine Szene, die wächst
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Kiel ist nicht die erste Stadt, an die man bei Breathwork denkt.
              Berlin, Hamburg, München — klar. Aber an der Förde passiert seit
              ein paar Jahren etwas, das sich lohnt, genauer hinzuschauen.
              Facilitators siedeln sich an, regelmäßige Atemkreise entstehen,
              und die Community wächst leise aber stetig.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das hat Gründe. Kiel ist eine Stadt mit hohem
              Gesundheitsbewusstsein — Uni-Stadt, viel Wasser, viel Natur,
              viele Menschen, die nach Alternativen zum klassischen
              Stressmanagement suchen. Und Breathwork liefert genau das:
              Einen Zugang zum eigenen Nervensystem, der schnell wirkt, wenig
              Ausrüstung braucht und in der Gruppe eine besondere Dynamik
              entwickelt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was Kiel von größeren Städten unterscheidet: Die Szene ist
              überschaubarer. Das hat Vorteile. Du landest nicht in einer
              anonymen Gruppe mit fünfzig Leuten, sondern in einem Kreis, in
              dem sich die Leute kennen. Das schafft einen Rahmen, der gerade
              für Einsteiger wertvoll ist — du wirst gesehen, der Facilitator
              hat Zeit für dich, und die Gruppe trägt dich.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Was Breathwork eigentlich ist — und warum es wirkt
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Atmen tut jeder. Bewusst atmen — das ist etwas anderes. Beim
              Breathwork nutzt du gezielte Atemmuster, um Zustände in deinem
              Körper und Nervensystem zu verändern. Klingt simpel. Ist es
              im Prinzip auch. Aber die Wirkung überrascht die meisten, die
              es zum ersten Mal ausprobieren.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Dein autonomes Nervensystem reagiert direkt auf die Art, wie du
              atmest. Schnellere, tiefere Atmung aktiviert den Sympathikus —
              du wirst wacher, energetischer, emotionale Blockaden können
              sich lösen. Langsame, gezielte Atmung aktiviert den
              Parasympathikus — Entspannung, Ruhe, Integration. Je nach
              Technik und Intention nutzen Breathwork-Facilitators
              unterschiedliche Muster, um unterschiedliche Erfahrungen zu
              ermöglichen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die wissenschaftliche Forschung holt langsam auf. Studien zeigen
              positive Effekte auf Stressreduktion, emotionale Regulation und
              das allgemeine Wohlbefinden. Aber frag die Leute, die regelmäßig
              zu Atemkreisen gehen — die brauchen keine Studie. Sie spüren
              den Unterschied in ihrem Alltag.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Breathwork-Formate, die du in Kiel findest
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Atemkreise</strong> sind
              das häufigste Format in Kiel. Regelmäßige Treffen, meist
              wöchentlich oder zweiwöchentlich, in denen eine Gruppe gemeinsam
              atmet. Der Facilitator führt durch verschiedene Techniken, die
              Session dauert typischerweise 60 bis 90 Minuten. Einsteigerfreundlich,
              bezahlbar, und ein guter Weg, Breathwork kennenzulernen und
              eine Praxis aufzubauen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Holotropes Atmen</strong>{" "}
              gibt es auch in Kiel — wenn auch seltener als in Hamburg oder
              Berlin. Die Sessions sind intensiver, dauern zwei bis drei
              Stunden und arbeiten mit beschleunigter Atmung und Musik,
              um tiefe Bewusstseinszustände zu erreichen. Nicht der typische
              Einstieg, aber für erfahrenere Atmer ein kraftvolles Format.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Pranayama</strong> — die
              yogische Atemarbeit — wird in Kiel sowohl in Yoga-Studios als
              eigenständiges Angebot als auch als Teil von Yoga-Klassen
              unterrichtet. Techniken wie Nadi Shodhana (Wechselatmung) oder
              Kapalabhati sind sanfter und eignen sich als tägliche Praxis.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Transformational Breath
              und Embodied Breathwork</strong> verbinden Atemarbeit mit
              Körperbewusstsein. In Kiel gibt es Facilitators, die diesen
              integrativen Ansatz anbieten — Atem plus Bewegung, Atem plus
              Berührung, Atem plus Stimmarbeit. Besonders spannend für
              Menschen, die nicht nur "atmen" wollen, sondern den ganzen
              Körper einbeziehen möchten.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Breathwork an der Förde — die Location macht den Unterschied
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Was Kiel besonders macht: Die Nähe zum Wasser. Einige
              Facilitators nutzen das bewusst — Breathwork-Sessions am
              Strand von Strande, auf der Kiellinie oder in Räumen mit
              Blick auf die Förde. Das klingt nach Nice-to-have, ist es
              aber nicht. Die Umgebung beeinflusst die Erfahrung. Frische
              Seeluft, das Rauschen der Ostsee im Hintergrund, die Weite
              des Horizonts — das sind keine Deko-Elemente, das sind
              Katalysatoren für eine tiefere Atemerfahrung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Im Sommer verlagern sich viele Formate nach draußen. Sessions
              bei Sonnenaufgang am Falckensteiner Strand, Atemkreise im
              Düsternbrooker Gehölz, Workshops an der Schwentine. Kiel
              bietet eine Kulisse, die Großstädte nicht liefern können.
              Und wer nach einer intensiven Atemsession ins Meer springt,
              versteht, warum Wim Hof das mit der Kälte so ernst meint.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Auch die Indoor-Locations haben ihren Charme. Gemeinschaftsräume
              in Gaarden, Yoga-Studios am Dreiecksplatz, private Seminarräume
              in der Altstadt — Kiel hat eine Infrastruktur für
              Gruppenformate, die wächst und sich professionalisiert.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Breathwork geeignet?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Grundsätzlich für alle, die bereit sind, sich auf eine
              körperliche Erfahrung einzulassen. Du brauchst keine
              Vorkenntnisse, keine Flexibilität, keinen sportlichen Körper.
              Was du brauchst: Die Bereitschaft, dich einzulassen. Und eine
              Portion Neugier.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Besonders häufig kommen Menschen zu Breathwork, die nach einem
              Weg suchen, Stress abzubauen, der nicht noch mehr Leistung
              fordert. Kein Marathon, keine Kalt-Dusch-Challenge, kein
              Optimierungs-Wahn. Sondern: Hinlegen, atmen, spüren. Das
              zieht Menschen an, die im Alltag viel leisten und einen
              Ausgleich brauchen, der wirklich im Körper ankommt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Wichtige Einschränkung: Bei Herz-Kreislauf-Erkrankungen,
              Epilepsie, akuten psychischen Krisen oder in der
              Schwangerschaft solltest du vorher mit dem Facilitator
              sprechen. Manche Techniken sind in diesen Fällen nicht
              geeignet. Seriöse Facilitators fragen das vor jeder Session ab.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Breathwork in Kiel vs. Hamburg — lohnt sich die Fahrt?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Hamburg hat die größere Szene, keine Frage. Mehr Facilitators,
              mehr Formate, mehr Auswahl. Aber Kiel hat etwas, das Hamburg
              nicht bieten kann: Nähe. In einer Stadt mit 250.000 Menschen
              landest du in Gruppen, in denen du den Facilitator nach der
              Session auf dem Wochenmarkt triffst. Das schafft eine andere
              Art von Verbindung und Vertrauen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Außerdem: Die Kieler Facilitators kommen oft aus der Hamburger
              Szene, haben dort ihre Ausbildungen gemacht und bringen das
              Know-how mit nach Schleswig-Holstein. Du bekommst also
              Hamburger Qualität in Kieler Atmosphäre. Für spezielle
              Intensiv-Formate oder Retreats lohnt sich der Blick nach
              Hamburg — für regelmäßige Praxis und Community-Anbindung
              ist Kiel der bessere Ort, wenn du hier lebst.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Breathwork in Kiel
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was passiert bei einer Breathwork-Session?",
                a: "Du liegst oder sitzt, der Facilitator führt dich durch ein bestimmtes Atemmuster. Die aktive Atemphase dauert je nach Technik 20 bis 60 Minuten. Danach gibt es eine Integrationsphase mit ruhiger Atmung. In Atemkreisen folgt oft ein Sharing in der Gruppe.",
              },
              {
                q: "Ist Breathwork sicher?",
                a: "Bei einem ausgebildeten Facilitator und ohne relevante Vorerkrankungen: ja. Intensivere Techniken können starke körperliche Empfindungen auslösen — Kribbeln, Muskelspannung, emotionale Reaktionen. Das ist normal und Teil des Prozesses.",
              },
              {
                q: "Was kostet Breathwork in Kiel?",
                a: "Regelmäßige Atemkreise kosten zwischen 15 und 35 Euro pro Session. Intensivere Workshops liegen bei 50 bis 100 Euro. Manche Community-Formate arbeiten auf Spendenbasis. In Kiel ist das Preisniveau insgesamt etwas niedriger als in Hamburg.",
              },
              {
                q: "Brauche ich Vorerfahrung?",
                a: "Nein. Die meisten Breathwork-Formate in Kiel sind für Einsteiger offen. Atemkreise eignen sich besonders gut als Einstieg. Der Facilitator erklärt alles, was du wissen musst. Komm einfach mit Offenheit.",
              },
              {
                q: "Wie finde ich den richtigen Breathwork-Facilitator in Kiel?",
                a: "Auf Das Portal findest du alle aktuellen Breathwork-Events in Kiel mit Infos zum Facilitator. Achte auf Transparenz: Welche Ausbildung hat der Facilitator? Wird vorher nach Kontraindikationen gefragt? Gibt es ein Vorgespräch? Seriöse Anbieter nehmen sich dafür Zeit.",
              },
              {
                q: "Gibt es Breathwork-Events auch am Strand oder draußen?",
                a: "Ja — vor allem im Sommer. Einige Kieler Facilitators bieten Sessions am Strand von Strande, an der Kiellinie oder in der Natur an. Im Winter finden die meisten Events in Seminar- oder Gemeinschaftsräumen statt.",
              },
              {
                q: "Wie oft sollte ich Breathwork machen?",
                a: "Sanftere Techniken wie Pranayama kannst du täglich üben. Für intensivere Formate ist einmal pro Woche oder alle zwei Wochen ein guter Rhythmus. Regelmäßige Atemkreise helfen dir, eine Praxis aufzubauen und die Effekte im Alltag zu spüren.",
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
            Kein Breathwork-Event in Kiel verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt der Telegram-Community bei und bekomm neue Events direkt
            zugeschickt. Oder trag dich in die Warteliste ein und sei von
            Anfang an dabei.
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
