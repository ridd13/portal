import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tantra München — Workshops, Retreats & Circles auf Das Portal",
  description:
    "Tantra in München: Workshops, Paarseminare, Tantramassage-Kurse und Retreats im Voralpenland. Aktuelle Termine aus der Münchner Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/muenchen/tantra",
  },
  openGraph: {
    title: "Tantra München — Das Portal",
    description:
      "Tantra Workshops, Paarseminare und Retreats in München und im Voralpenland. Alle Termine auf einen Blick.",
    url: "https://das-portal.online/muenchen/tantra",
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

export default async function MuenchenTantraPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%München%,address.ilike.%muenchen%,address.ilike.%Muenchen%")
    .contains("tags", ["tantra"])
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tantra Events in München",
    description:
      "Tantra Workshops, Retreats und Community-Events in München und im Voralpenland",
    url: "https://das-portal.online/muenchen/tantra",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
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
            München · Tantra
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Tantra in München — Workshops, Retreats & Circles
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Tantra Workshops, Paarseminare und mehrtägige Retreats in München
            und im Voralpenland. Aktuelle Termine aus einer gewachsenen,
            etablierten Szene — auf einen Blick.
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
            Aktuelle Tantra Events in München
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von offenen Abenden bis zu mehrtägigen Retreats.`
              : "Gerade keine Tantra-Termine in München — schau bald wieder rein oder tritt unserer Telegram-Community bei."}
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
                Aktuell keine Tantra-Events in München.
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
              Tantra in München — gewachsen, etabliert, strukturiert
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              München hat eine Tantra-Landschaft, die weniger experimentell
              und mehr klassisch-etabliert ist als Berlin. Mehrere
              Tantra-Schulen arbeiten hier seit zwei Jahrzehnten, es gibt
              Ausbildungsinstitute für Tantramassage und Facilitator-Trainings,
              und die meisten Anbieter:innen haben mehrjährige Curricula
              durchlaufen, bevor sie eigene Angebote machen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Eine kurze Abgrenzung vorweg, weil der Begriff Tantra oft
              missverstanden wird: Seriöses Tantra ist keine sexuelle
              Dienstleistung. Die Arbeit integriert Körper, Atem, Präsenz und
              Energie, und Sexualität ist ein Teilbereich davon — aber im
              Kontext von Bewusstwerdung und nicht als Produkt. Wer das nicht
              trennt, verwechselt Tantra mit erotischen Dienstleistungen, die
              den Begriff missbrauchen. Die Münchner Szene ist in dieser
              Abgrenzung klar.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was du in München findest: sorgfältig gerahmte Workshops,
              Paarseminare mit therapeutischem Unterbau, Tantramassage-Kurse
              für Privatpersonen und Profis, sowie mehrtägige Retreats im
              Voralpenland.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Tantra-Formate gibt es in München?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Bandbreite reicht von einem offenen Abend bis zum
              zweiwöchigen Intensiv-Retreat. Orientierung:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Offene Abende und Einsteiger-Sessions:</strong>{" "}
              Der sinnvolle Erstkontakt. 2–3 Stunden mit Meditation,
              Atemarbeit, einfachen Partnerübungen und Gruppenaustausch.
              Kosten meist 25–50 €. Hier siehst du, ob Tantra überhaupt dein
              Weg ist, bevor du dich in größere Formate bewegst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Wochenend-Workshops:</strong>{" "}
              2–3 Tage, meist in München oder in nahegelegenen Seminarhäusern.
              Tiefere Arbeit, geschlossener Teilnehmerkreis, klarere
              energetische Bögen. Preislich zwischen 200 und 400 €.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Paarseminare:</strong>{" "}
              Ein Schwerpunkt der Münchner Szene. Reserviert für Paare, die
              an Nähe, Intimität und bewusster Sexualität arbeiten wollen.
              Oft therapeutisch angelehnt und in kleineren Gruppen (4–6
              Paare).
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tantramassage-Ausbildungen:</strong>{" "}
              München hat mehrere Institute, die mehrwöchige
              Tantramassage-Curricula anbieten — für Laien zur persönlichen
              Vertiefung oder als Berufsausbildung. Strukturierte
              Lernumgebungen mit Supervision und Ethikrahmen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats im Voralpenland:</strong>{" "}
              Viele Münchner Tantra-Lehrer:innen nutzen Seminarhäuser im
              Chiemgau, am Tegernsee oder im Allgäu für mehrtägige Formate.
              5–10 Tage geschlossene Arbeit, kombiniert mit Natur,
              meditativen Phasen und intensiver Körperarbeit.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Was Münchner Tantra von Berlin oder Freiburg unterscheidet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Berlin hat eine jüngere, club- und community-nahe Tantra-Szene,
              die stark mit queeren und sex-positiven Kontexten überlappt.
              Freiburg ist gewachsen, offen, mittelgroß. München ist
              etablierter, strukturierter, oft teurer — aber auch sehr
              zuverlässig in der Qualität der Facilitation.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was das für dich heißt: Wenn du Wert auf klare Rahmen, gut
              ausgebildete Lehrer:innen und eine stabile, wenig experimentelle
              Szene legst, passt München. Wenn du lieber in offenen,
              community-getriebenen Formaten arbeitest, schau zusätzlich nach
              Berlin oder Freiburg.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Tantra in München?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Für Singles und Paare. Für Menschen, die mit ihrem Körper in
              ein klareres Verhältnis kommen wollen. Für Paare, die Intimität
              und Präsenz vertiefen. Für Menschen, die spüren, dass ihr
              Verhältnis zu Sexualität mechanisch oder abgeschnitten geworden
              ist — und das ändern möchten, ohne in irgendeine Szene
              eintauchen zu müssen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was du mitbringen solltest: Bereitschaft, dich wahrzunehmen.
              Offenheit, im eigenen Tempo zu bleiben und Nein zu sagen, wenn
              etwas nicht passt — seriöse Tantra-Arbeit respektiert das immer.
              Bei schwerer Traumageschichte: nimm zusätzlich therapeutische
              Begleitung dazu. Tantra ist kein Therapie-Ersatz.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Tantra in München
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Ist Tantra sexuell?",
                a: "Sexualität ist ein Teil der tantrischen Praxis, aber nicht ihr Kern. Seriöse Tantra-Events fokussieren auf Präsenz, Atem, Körperwahrnehmung und Energiearbeit. Nackte Berührung, Penetration oder sexuelle Handlungen gehören in offenen Workshops und Retreats explizit nicht dazu. Angebote, die das versprechen, arbeiten nicht im Tantra-Sinn — München hat in dieser Abgrenzung klare Strukturen.",
              },
              {
                q: "Ich war noch nie in einem Tantra-Kontext. Wo fange ich in München an?",
                a: "An einem offenen Abend. 2–3 Stunden, niedrigschwellig, meist 25–50 €. Du siehst, ob die Arbeitsweise und der Facilitator zu dir passen, bevor du dich in längere Formate einbuchst. Aktuelle Einsteiger-Termine findest du oben im Event-Grid.",
              },
              {
                q: "Kann ich als Single zu Paarformaten kommen?",
                a: "Nein, Paarseminare sind reserviert für Paare. Aber es gibt genug offene Formate, die für Singles ausgelegt sind — Übungen finden dort mit wechselnden Partner:innen oder in Gruppen statt. Du sitzt nicht neben jemandem fest.",
              },
              {
                q: "Was kostet Tantra in München?",
                a: "Offene Abende liegen zwischen 25 und 50 €. Wochenend-Workshops kosten 200–400 €. Paarseminare und Tantramassage-Kurse zwischen 400 und 800 € für zwei bis drei Tage. Mehrtägige Retreats im Voralpenland (5–10 Tage) kosten je nach Haus und Dauer 700 bis 1.800 € inklusive Unterkunft und Verpflegung. München tendiert etwas teurer als andere Städte.",
              },
              {
                q: "Wie erkenne ich seriöse Tantra-Anbieter:innen in München?",
                a: "Ein paar Indikatoren: klare Website mit Biografie, überprüfbare Ausbildung (Diamond Lotus, Sky Dancing, ISTA, Sanandas oder vergleichbar), transparente Preise, explizite Consent-Richtlinien, keine sexuellen Dienstleistungs-Versprechen. Meide Angebote, die hauptsächlich mit erotischen Versprechen arbeiten oder keine klare Facilitator-Biografie haben.",
              },
              {
                q: "Gibt es Tantra-Retreats in der Nähe von München?",
                a: "Ja, viele. Das Voralpenland ist dicht mit Seminarhäusern besetzt, die für Tantra-Formate genutzt werden. Chiemgau, Tegernsee, Allgäu, Berchtesgadener Land — oft wird in 5- bis 10-Tages-Formaten gearbeitet. Aktuelle Termine siehst du im Event-Grid oben, soweit sie auf Das Portal eingestellt sind.",
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
            Neue Tantra-Termine in München nicht verpassen
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
