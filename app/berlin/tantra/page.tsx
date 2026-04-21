import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tantra Berlin — Workshops, Retreats & Circles auf Das Portal",
  description:
    "Tantra in Berlin: Workshops, Paarseminare, offene Circles und Retreats im Umland. Aktuelle Termine aus einer der lebendigsten Tantra-Szenen Europas auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/berlin/tantra",
  },
  openGraph: {
    title: "Tantra Berlin — Das Portal",
    description:
      "Tantra Workshops, Paarseminare und Retreats in Berlin und Umgebung. Alle Termine auf einen Blick.",
    url: "https://das-portal.online/berlin/tantra",
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

export default async function BerlinTantraPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Berlin%,address.ilike.%berlin%")
    .contains("tags", ["tantra"])
    .order("start_at", { ascending: true })
    .limit(12);

  const events = (data || []) as Event[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tantra Events in Berlin",
    description:
      "Tantra Workshops, Retreats und Community-Events in Berlin und Umgebung",
    url: "https://das-portal.online/berlin/tantra",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: event.start_at,
        location: {
          "@type": "Place",
          name: event.location_name || "Berlin",
          address: event.address || "Berlin",
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
            Berlin · Tantra
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Tantra in Berlin — Workshops, Retreats & Circles
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Eine der lebendigsten Tantra-Szenen Europas. Workshops,
            Paarseminare, offene Circles und Retreats im Umland — aktuelle
            Termine aus Kreuzberg, Neukölln, Prenzlauer Berg und Friedrichshain
            auf einen Blick.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/berlin/ganzheitliche-events"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Berlin Events →
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
            Aktuelle Tantra Events in Berlin
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von offenen Abenden bis zu mehrtägigen Retreats.`
              : "Gerade keine Tantra-Termine in Berlin — schau bald wieder rein oder tritt unserer Telegram-Community bei."}
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
                Aktuell keine Tantra-Events in Berlin.
              </p>
              <Link
                href="/berlin/ganzheitliche-events"
                className="mt-3 inline-block text-sm text-accent-primary hover:underline"
              >
                Alle Berlin Events ansehen →
              </Link>
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/berlin/ganzheitliche-events"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle ganzheitlichen Events in Berlin →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Tantra in Berlin — eine der dichtesten Szenen Europas
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Berlin hat sich in den letzten 15 Jahren zu einem der zentralen
              Orte für Tantra in Europa entwickelt. Das liegt weniger an einer
              einzelnen Schule und mehr an einem gewachsenen Ökosystem aus
              etablierten Anbieter:innen, internationalen Facilitator:innen
              (ISTA, Sky Dancing, Sanandas), einer aktiven Community rund um
              bewusste Sexualität und Intimität, und Seminarräumen, die
              durchgängig belegt sind.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Wichtige Abgrenzung vorweg, weil der Begriff Tantra oft
              missverstanden wird: Seriöses Tantra ist keine sexuelle
              Dienstleistung. Es integriert Körper, Atem, Präsenz und
              Energiearbeit. Sexualität ist ein Teilbereich — aber im Kontext
              von Bewusstwerdung, nicht als Kernprodukt. Angebote, die das
              vermischen, arbeiten nicht im Tantra-Sinn. Die Berliner Szene
              hat in den letzten Jahren sehr klare ethische Standards und
              Consent-Kulturen entwickelt, die das sauber trennen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was Berlin besonders macht: die Bandbreite. Vom klassischen
              Paarseminar über queer-freundliche Community-Events bis zu
              mehrwöchigen Facilitator-Trainings findest du hier Formate, die
              in anderen Städten schlicht nicht existieren.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Tantra-Formate gibt es in Berlin?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Angebotsvielfalt ist beeindruckend. Eine Orientierung:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Offene Abende und Community Circles:</strong>{" "}
              Regelmäßige Termine in Kreuzberg, Neukölln und Friedrichshain.
              2–4 Stunden, meist 20–40 €, teilweise auf Spendenbasis. Der
              sinnvolle Erstkontakt, oft mit starkem Community-Aspekt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Wochenend-Workshops:</strong>{" "}
              2–3 Tage, meist in festen Seminarräumen wie in Kreuzberg oder
              Neukölln. Tiefere Gruppenprozesse, geschlossene
              Teilnehmerkreise, klarere energetische Arbeit. Preislich meist
              250–450 €.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Paarseminare:</strong>{" "}
              Breites Angebot für Paare — von einfachen Wochenend-Seminaren
              bis zu mehrwöchigen Begleitprozessen. Oft therapeutisch
              angelehnt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">ISTA- und Facilitator-Trainings:</strong>{" "}
              Berlin ist einer der wichtigsten Standorte für ISTA (International
              School of Temple Arts) in Europa. Mehrwöchige Level-1- und
              Level-2-Trainings werden hier regelmäßig abgehalten — auch für
              Menschen, die später selbst facilitieren wollen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Queer- und sex-positive Tantra-Räume:</strong>{" "}
              Berlin ist europaweit führend in der Verbindung von Tantra mit
              queer- und sex-positiven Communities. Formate, die in
              klassischeren Städten nicht existieren, finden hier ihre
              natürliche Umgebung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats im Berliner Umland:</strong>{" "}
              Brandenburg und Mecklenburg-Vorpommern bieten viele
              Seminarhäuser, in denen mehrtägige Tantra-Retreats stattfinden.
              5–10 Tage geschlossene Arbeit, oft kombiniert mit Natur,
              meditativen Phasen und intensiver Körperarbeit.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Wo in Berlin findet Tantra statt?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Szene konzentriert sich im Osten und Südosten. Kreuzberg
              und Neukölln sind die beiden dichtesten Standorte — hier liegen
              die meisten Seminarräume und viele Facilitator:innen arbeiten
              in diesen Vierteln. Friedrichshain und Prenzlauer Berg haben
              eigene Community-Kreise, oft etwas weniger szeneförmig.
              Einzelne Anbieter:innen arbeiten auch im Wedding und in Mitte,
              meist in kleineren Formaten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Viele Formate finden in wenigen Stammhäusern statt, die
              teilweise wöchentlich verschiedene Facilitator:innen
              beherbergen. Das macht die Suche paradoxerweise schwierig:
              Wenn du weißt, wo du hingehen sollst, findest du viel. Wenn
              du es nicht weißt, bleibt der Großteil unsichtbar. Das Portal
              versucht, diese Sichtbarkeit herzustellen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Was Berlin von München und Freiburg unterscheidet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              München ist klassisch-etabliert, strukturiert, oft teurer.
              Freiburg ist gewachsen und mittelgroß. Berlin ist größer,
              diverser, experimenteller und jünger in der Community. Viele
              internationale Facilitator:innen legen Zwischenstopps in Berlin
              ein, was das Angebot laufend erneuert.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für dich heißt das: Wenn du experimentell arbeiten, in queeren
              oder sex-positiven Kontexten unterwegs sein oder internationale
              Lehrer:innen erleben willst, ist Berlin der offensichtliche
              Standort. Für klassischere, therapeutisch eingebettete Arbeit
              kann München je nach Thema die bessere Wahl sein.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Tantra in Berlin?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Für Singles, Paare und polyamore Konstellationen. Für Menschen,
              die mit Körper, Intimität und Sexualität in ein anderes
              Verhältnis kommen wollen. Für Menschen in der queeren oder
              sex-positiven Community, die Tantra in einem Kontext erleben
              wollen, der sie wirklich meint. Für Facilitator:innen in
              spe, die an Ausbildung und kontinuierlicher Praxis interessiert
              sind.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was du mitbringen solltest: Bereitschaft, dich wahrzunehmen.
              Offenheit, im eigenen Tempo zu bleiben und Nein zu sagen. Gute
              Facilitation in Berlin respektiert das immer. Bei schwerer
              Traumageschichte: hol dir zusätzlich therapeutische Begleitung —
              Tantra ist kein Therapie-Ersatz, und das sollte keine
              Tantra-Arbeit behaupten.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Tantra in Berlin
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Ist Tantra sexuell?",
                a: "Sexualität ist ein Teil der tantrischen Praxis, aber nicht ihr Kern. Seriöse Tantra-Events fokussieren auf Präsenz, Atem, Körperwahrnehmung und Energiearbeit. Nackte Berührung, Penetration oder sexuelle Handlungen gehören in offenen Workshops und Retreats explizit nicht dazu — das gilt auch für Berlin. Angebote, die das versprechen, arbeiten nicht im Tantra-Sinn.",
              },
              {
                q: "Ich war noch nie bei so etwas. Wo fange ich in Berlin an?",
                a: "An einem offenen Abend oder Community Circle. 2–4 Stunden, niedrigschwellig, meist 20–40 €. Du siehst, ob die Arbeitsweise und der Facilitator zu dir passen, bevor du dich in größere Formate einbuchst. Aktuelle Einsteiger-Termine findest du oben im Event-Grid.",
              },
              {
                q: "Ist die Berliner Tantra-Szene queer-freundlich?",
                a: "Ja, stark. Berlin ist europaweit führend in der Verbindung von Tantra mit queer- und sex-positiven Kontexten. Es gibt explizit queer-orientierte Formate, aber auch die meisten offenen Circles arbeiten inklusiv. Wenn du spezifisch danach suchst, achte auf entsprechende Kennzeichnung bei den Event-Beschreibungen.",
              },
              {
                q: "Was kostet Tantra in Berlin?",
                a: "Offene Abende und Community Circles liegen bei 20–40 €, teilweise auf Spendenbasis. Wochenend-Workshops kosten 250–450 €. Paarseminare und mehrtägige Formate zwischen 400 und 1.200 € je nach Dauer und Facilitator. ISTA-Trainings (Level 1, 7 Tage) kosten meist 1.200–1.800 € inklusive Unterkunft und Verpflegung.",
              },
              {
                q: "Wie erkenne ich seriöse Tantra-Anbieter:innen in Berlin?",
                a: "Ein paar Indikatoren: klare Website mit Biografie, überprüfbare Ausbildung (ISTA, Sky Dancing, Diamond Lotus, Sanandas oder vergleichbar), transparente Preise, explizite Consent-Richtlinien, kein Druck, kein Overpromise. In Berlin gibt es ausgereifte Consent-Kulturen — gute Anbieter benennen ihre Ethik-Standards auf der Website oder am Eventanfang.",
              },
              {
                q: "Gibt es Tantra-Retreats in der Nähe von Berlin?",
                a: "Ja, viele. Brandenburg und Mecklenburg-Vorpommern sind dicht mit Seminarhäusern besetzt, die für Tantra-Retreats genutzt werden. 5–10 Tage geschlossene Arbeit in abgelegenen Häusern am See oder im Wald. Aktuelle Termine findest du im Event-Grid oben, soweit sie auf Das Portal eingestellt sind.",
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
            Neue Tantra-Termine in Berlin nicht verpassen
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
