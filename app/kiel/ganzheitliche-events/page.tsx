import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Event } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/date-utils";

export const metadata: Metadata = {
  title: "Ganzheitliche Events Kiel — Termine & Workshops auf Das Portal",
  description: "Ganzheitliche Events in Kiel: Breathwork, Tanz, Embodiment, Workshops und Community-Formate. Aktuelle Termine aus der Kieler Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/kiel/ganzheitliche-events",
  },
  openGraph: {
    title: "Ganzheitliche Events Kiel — Das Portal",
    description: "Ganzheitliche Events in Kiel: Breathwork, Dance, Workshops und Community. Alle Termine auf einen Blick.",
    url: "https://das-portal.online/kiel/ganzheitliche-events",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

function formatEventDate(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${formatDate(startDate)}, ${formatTime(startDate)}–${formatTime(endDate)} Uhr`;
  }
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export default async function KielGanzheitlicheEventsPage() {
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Kiel%,address.ilike.%kiel%")
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as (Event & { hosts: { name: string; slug: string } | null })[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events Kiel",
    description: "Ganzheitliche Events in Kiel: Breathwork, Tanz, Embodiment, Workshops und Community-Formate.",
    url: "https://das-portal.online/kiel/ganzheitliche-events",
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
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] rounded-3xl mx-auto mb-16 sm:mb-20 max-w-6xl">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-text-primary">
            Ganzheitliche Events in Kiel
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary font-light leading-relaxed">
            Breathwork, Tanz, Embodiment und Community-Formate aus der Kieler Szene — aktuelle Termine übersichtlich auf Das Portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a
              href="#events"
              className="inline-block px-6 py-3 bg-accent-primary text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              Zu den Events
            </a>
            <a
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-bg-card border border-border text-text-primary rounded-lg font-medium hover:bg-bg-secondary transition"
            >
              Telegram Community
            </a>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      {events.length > 0 && (
        <section id="events" className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary mb-12">
            Kommende Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group bg-bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {event.cover_image_url && (
                  <div className="relative h-48 w-full overflow-hidden bg-bg-secondary">
                    <img
                      src={event.cover_image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-serif font-semibold text-text-primary group-hover:text-accent-primary transition">
                    {event.title}
                  </h3>
                  <div className="text-sm text-text-secondary">
                    📍 {event.location_name}
                  </div>
                  <div className="text-sm text-text-muted">
                    {formatEventDate(event.start_at, event.end_at || event.start_at)}
                  </div>
                  {event.hosts && !Array.isArray(event.hosts) && (
                    <div className="text-xs text-text-muted pt-2">
                      von {event.hosts.name}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SEO Content */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-4xl mx-auto space-y-12 mb-20">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary mb-6">
            Die ganzheitliche Szene in Kiel
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Kiel ist eine Stadt mit Geschichte, Wasser und ganz eigenem Rhythmus. An der Förde gelegen, mit direktem Zugang zur Ostsee, hat sich hier eine wachsende Gemeinschaft von Facilitatoren, Coaches und Praktizierenden zusammengefunden — kleiner als Hamburg, dafür umso persönlicher. Die Szene in Kiel zeichnet sich durch Authentizität aus: Menschen treffen sich nicht aus Trend, sondern aus echtem Interesse an Körperarbeit, Atempraxis und innerer Entwicklung.
          </p>

          <h3 className="text-2xl font-serif font-bold text-text-primary mt-10 mb-4">
            Was findest du auf Das Portal?
          </h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Auf Das Portal sind alle ganzheitlichen Events aus Kiel zentral erfasst. Das bedeutet: Kein Suchen mehr in verschiedenen Telegram-Gruppen, Instagram-Profilen oder persönlichen Chats. Du findest hier:
          </p>
          <ul className="space-y-3 mb-6 text-text-secondary">
            <li className="flex gap-3">
              <span className="text-accent-primary font-bold">→</span>
              <span><strong>Breathwork-Kreise</strong> für Anfänger und Geübte — regelmäßige Treffen zum gemeinsamen Atmen und Lösen von Blockaden.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-primary font-bold">→</span>
              <span><strong>Conscious Dance & Embodiment Workshops</strong> — Soul Motion und andere bewusste Tanzformate, die den Körper reintegrieren.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-primary font-bold">→</span>
              <span><strong>Tantra & Energiearbeit</strong> — Sessions zu Tantra, Energiearbeit und Heilarbeit mit erfahrenen Facilitatoren.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-primary font-bold">→</span>
              <span><strong>Coaching & Facilitator-Trainings</strong> — Intensiv-Workshops für alle, die selbst zum Facilitator werden wollen.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-primary font-bold">→</span>
              <span><strong>Nature-basierte Workshops</strong> — Events an der Ostsee, im Wald oder auf der Förde, die Körperarbeit mit Natur verbinden.</span>
            </li>
          </ul>

          <h3 className="text-2xl font-serif font-bold text-text-primary mt-10 mb-4">
            Warum Kiel für ganzheitliche Arbeit?
          </h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Kiel hat etwas, das größere Städte oft verlieren: eine echte Community. Wenn du hier zu einem Event gehst, triffst du nicht fremde Menschen in einer großen anonymen Menge, sondern ein Netzwerk von Menschen, die sich kennen, unterstützen und miteinander wachsen. Die Facilitatoren hier arbeiten persönlich — sie kennen ihre Klienten, geben direktes Feedback, bauen Kontinuität auf.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            Die Förde selbst ist ein Heiler. Das Wasser, der Wind, die Nähe zur Natur prägen die Qualität der Arbeit. Viele Events hier integrieren diesen Ort: Atemwork auf der Wiese am Wasser, Tanz mit Blick auf die Ostsee, Retreats, die den Körper und die Umgebung zusammenbringen.
          </p>

          <h3 className="text-2xl font-serif font-bold text-text-primary mt-10 mb-4">
            Für wen sind diese Events?
          </h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Ganz einfach: für Menschen, die sich selbst besser kennenlernen wollen. Das bedeutet nicht, dass du bereits meditierst, tanzt oder Körperarbeit machst. Viele Events sind bewusst für Anfänger geöffnet. Du bringst Neugier mit, eine Bereitschaft zu spüren, und die Offenheit, dich selbst anders zu erleben als im Alltag.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            Manche Events sind intensiver und richten sich an erfahrenere Praktizierenden oder solche, die selbst zum Facilitator werden wollen. Das ist auf Das Portal jeweils gekennzeichnet.
          </p>

          <h3 className="text-2xl font-serif font-bold text-text-primary mt-10 mb-4">
            Wie funktioniert Das Portal?
          </h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Das Portal ist eine Übersichts-Plattform für Schleswig-Holstein und Hamburg. Jeder Facilitator, jede Organisation kann ihre Events hier eintragen. Die Events sind filtebar nach Ort, Datum und Art. Du kannst gezielt nach Breathwork in Kiel suchen oder dir alle kommenden Termine in deiner Nähe anzeigen lassen.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            Es geht darum, die Szene sichtbar zu machen — nicht als Algorithmus, der dir eine bestimmte Event-Blase zeigt, sondern als offenes Verzeichnis aller ganzheitlichen Angebote in der Region. Qualitätskontrolle: Wir arbeiten mit etablierten Facilitatoren zusammen und prüfen die Events.
          </p>

          <h3 className="text-2xl font-serif font-bold text-text-primary mt-10 mb-4">
            Kieler Orte für ganzheitliche Events
          </h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Events in Kiel finden in verschiedenen Settings statt: Yogastudios im Zentrum, private Räume in Gaarden, Wiesen am Wasser, Studios an der Förde. Manche sind als Einzel-Sessions, andere als mehrwöchige Kreise organisiert. Das Portal zeigt dir zu jedem Event die genaue Adresse und den Treffpunkt.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary mb-12">
          Häufig gefragt
        </h2>
        <div className="space-y-6">
          <div className="bg-bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-serif font-bold text-text-primary">
              Welche ganzheitlichen Events gibt es in Kiel?
            </h3>
            <p className="text-text-secondary">
              Es gibt Breathwork-Kreise, Conscious Dance (Soul Motion), Embodiment-Workshops, Tantra-Sessions, Energiearbeit und Facilitator-Trainings. Viele Events sind regelmäßig, einige finden nur zu bestimmten Terminen statt. Auf Das Portal findest du alle anstehenden Termine mit genauen Details.
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-serif font-bold text-text-primary">
              Ist die Szene in Kiel groß genug?
            </h3>
            <p className="text-text-secondary">
              Ja. Kiel ist kleiner als Hamburg, aber die Szene ist lebendig und wächst. Der Vorteil: Du triffst echte Community statt Anonymität. Die Facilitatoren arbeiten persönlich und kontinuierlich. Das ist für viele Menschen eine tiefere Erfahrung als große, anonyme Events.
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-serif font-bold text-text-primary">
              Brauche ich Vorerfahrung?
            </h3>
            <p className="text-text-secondary">
              Nein, die meisten ganzheitlichen Events in Kiel sind offen für Anfänger. Viele Facilitatoren arbeiten bewusst inklusiv. Es gibt aber auch intensivere Angebote für Geübte oder spezielle Trainings — die sind auf Das Portal gekennzeichnet.
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-serif font-bold text-text-primary">
              Was kosten Events in Kiel?
            </h3>
            <p className="text-text-secondary">
              Das variiert. Breathwork-Kreise kosten meist 15–25€, Workshops 30–80€, Intensiv-Trainings 200–500€. Zu jedem Event auf Das Portal ist der Preis angegeben. Manche Facilitatoren arbeiten mit Sliding-Scale oder bieten kostenlose Schnupptermine an.
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-serif font-bold text-text-primary">
              Wie finde ich Events in Kiel?
            </h3>
            <p className="text-text-secondary">
              Das Portal hat eine Suchfunktion: Du kannst nach Stadt (Kiel), Datum und Eventtyp filtern. Alternativ siehst du hier alle kommenden Termine aus Kiel übersichtlich. Du kannst dich auch in unsere Telegram-Community eintragen und bekommst regelmäßig Termine zugeschickt.
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-serif font-bold text-text-primary">
              Gibt es auch Retreats in der Nähe von Kiel?
            </h3>
            <p className="text-text-secondary">
              Ja. Kiel liegt nah an der Ostsee und Schleswig-Holstein hat viele Retreat-Orte. Viele der Facilitatoren organisieren auch mehrtägige Retreats oder Intensiv-Wochenenden. Auf Das Portal findest du auch Events in benachbarten Städten und ländlicheren Gegenden in der Region.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-4xl mx-auto">
        <div className="bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] rounded-3xl p-8 sm:p-12 space-y-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary">
            Bleib auf dem Laufenden
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Neue Events, Ankündigungen und Community-Updates direkt in dein Postfach oder deinen Telegram.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-accent-primary text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              Telegram Community beitreten
            </a>
            <a
              href="/#warteliste"
              className="inline-block px-8 py-3 bg-bg-card border border-border text-text-primary rounded-lg font-medium hover:bg-bg-secondary transition"
            >
              Zur Warteliste
            </a>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
