import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tantra Events Hamburg — Workshops & Termine auf Das Portal",
  description: "Tantra Events in Hamburg: Tantramassage-Workshops, Tantra Retreats, sinnliche Rituale und Community-Formate. Aktuelle Termine auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/tantra",
  },
  openGraph: {
    title: "Tantra Events Hamburg — Das Portal",
    description: "Tantra Events in Hamburg: Workshops, Retreats und Community. Alle Termine auf einen Blick.",
    url: "https://das-portal.online/hamburg/tantra",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function TantraHamburgPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .contains("tags", ["tantra"])
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tantra Events in Hamburg",
    description: "Tantra Workshops, Retreats und Community-Events in Hamburg",
    url: "https://das-portal.online/hamburg/tantra",
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

      <div className="min-h-screen bg-bg-primary">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#8b6f47] via-[#a0866f] to-[#9d7e5d] mx-4 sm:mx-6 lg:mx-8 mt-8 mb-16 px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4 leading-tight">
              Tantra in Hamburg
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Workshops, Retreats und Community-Events für Anfänger und Erfahrene — aus der ganzheitlichen Tantra-Szene in Eimsbüttel, Altona und Barmbek.
            </p>
            <Link
              href="#events"
              className="inline-block bg-accent-primary text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all"
            >
              Alle Tantra Events →
            </Link>
          </div>
        </section>

        {/* Events Section */}
        {events.length > 0 && (
          <section id="events" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <h2 className="text-3xl font-serif font-bold text-text-primary mb-10">
              Aktuelle Events in Hamburg
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: Event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group bg-bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all"
                >
                  <div className="aspect-video bg-bg-secondary relative overflow-hidden">
                    {event.cover_image_url && (
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-text-muted mb-3">
                      📍 {event.location_name || event.address}
                    </p>
                    <p className="text-sm font-medium text-text-secondary">
                      {formatDate(event.start_at)} · {formatTime(event.start_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Content Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 prose prose-invert max-w-none">
          <div className="prose-content space-y-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-text-primary mb-6">
                Was sind Tantra Events in Hamburg?
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Tantra ist eine über 2000 Jahre alte Tradition, die Körper, Geist und Energie als ein zusammenhängendes System versteht. Anders als oft missverstanden: Tantra geht es nicht primär um Sex, sondern um bewusstes Erleben, Energiefluss und tiefe Verbindung — zu sich selbst und anderen.
              </p>
              <p className="text-text-secondary leading-relaxed">
                In Hamburg haben sich in den letzten Jahren etablierte Tantra-Anbieter und energetische Coaches in Eimsbüttel, Altona, dem Schanzenviertel und Barmbek ansiedelt. Die Events reichen von Tantramassage-Workshops über Kundalini-Kriyas bis zu Retreat-Wochenenden mit Meditation, Atemtechniken und sinnlichen Ritualen.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-serif font-bold text-text-primary mb-6">
                Typen von Tantra Events
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Die Hamburger Tantra-Szene ist vielfältig. Beliebte Event-Formate sind:
              </p>
              <ul className="space-y-3 text-text-secondary mb-6">
                <li className="flex items-start">
                  <span className="mr-3 text-accent-primary font-bold">→</span>
                  <span><strong>Tantramassage-Workshops</strong> — Hands-on Kurse für Paare oder Singles, um Berührung bewusster zu gestalten</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-accent-primary font-bold">→</span>
                  <span><strong>Kundalini & Atemtechniken</strong> — Sessions zur Aktivierung und Lenkung von Körperenergie</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-accent-primary font-bold">→</span>
                  <span><strong>Tantra Retreats</strong> — Mehrtägige intensive Programme, oft in der Lüneburger Heide oder an der Riepenburger Mühle (südlich Hamburg)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-accent-primary font-bold">→</span>
                  <span><strong>Community Circles</strong> — Regelmäßige Treffen für Austausch, Meditations-Sessions und gemeinsame Rituale</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-accent-primary font-bold">→</span>
                  <span><strong>Paarseminare</strong> — Spezialisierte Workshops für Couples zum Vertiefen von Intimität und Energieaustausch</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-serif font-bold text-text-primary mb-6">
                Hamburg: Hotspots der Tantra-Szene
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Besonders aktiv sind Tantra-Anbieter in:
              </p>
              <ul className="space-y-2 text-text-secondary mb-6">
                <li><strong>Eimsbüttel</strong> — Zentrum für ganzheitliche Arbeit, viele energetische Coaches und Massage-Studios</li>
                <li><strong>Altona</strong> — Alternative Community, etablierte Yogis und Tantra-Facilitators</li>
                <li><strong>Schanzenviertel</strong> — Kreative Community mit regelmäßigen Workshops und Retreats</li>
                <li><strong>Barmbek</strong> — Aufstrebender Standort mit neuen Anbietergruppen</li>
                <li><strong>Riepenburger Mühle</strong> — Beliebter Retreat-Ort südlich Hamburgs für intensive Wochenenden</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-serif font-bold text-text-primary mb-6">
                Für wen sind Tantra Events?
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Tantra Events sind offen für Anfänger und Erfahrene. Du brauchst keine Vorkenntnisse — nur die Bereitschaft, dich auf neue Erfahrungen einzulassen. Events sind für Singles, Paare, und alle, die sich mit ihrem Körper, ihrer Sexualität und Energie bewusster auseinandersetzen möchten. Ein wichtiger Punkt: Seriöse Tantra-Workshops sind niemals "sexuelle Erfahrungen" — sondern energetische Praktiken, die Bewusstsein und Verbindung vertiefen.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-serif font-bold text-text-primary mb-6">
                Tantra in der ganzheitlichen Community
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Tantra ist ein natürlicher Teil der breiteren ganzheitlichen Szene in Hamburg — neben Yoga, Coaching, schamanischen Ritualen und energetischer Heilarbeit. Viele Anbieter kombinieren mehrere Praktiken: Ein Coach macht Körperarbeit mit Tantra-Elementen, oder ein Kundalini-Yoga-Event integriert tantrische Atemtechniken.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Das Portal verbindet diese Community — Tantra-Events, Yoga-Retreats, Healing-Circles und ganzheitliche Coachings findest du hier an einem Ort.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-serif font-bold text-text-primary mb-10">
            Häufige Fragen zu Tantra Events
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Was sind Tantra Events wirklich?",
                a: "Tantra ist eine traditionelle Praxis, die Körper, Geist und Energie integriert. Events beinhalten typischerweise Meditation, Atemtechniken (Pranayama), energetische Übungen und bewusste Berührung — mit dem Ziel, Bewusstsein zu vertiefen und Energie zu aktivieren.",
              },
              {
                q: "Sind Tantra Events sexuell?",
                a: "Nein. Seriöse Tantra-Events konzentrieren sich auf energetische Praktiken und bewusstes Erleben, nicht auf sexuelle Handlungen. Es geht um Respekt, Grenzen und die Integration von Körper und Geist. Jeder Event hat klare Regeln und professionelle Facilitators.",
              },
              {
                q: "Kann ich als Anfänger teilnehmen?",
                a: "Ja, absolut. Die meisten Events sind speziell für Anfänger geöffnet. Facilitators erklären alle Techniken und passen sie an dein Level an. Es gibt keine Hierarchie — alle Körper und Erfahrungsstufen sind willkommen.",
              },
              {
                q: "Was kosten Tantra Events in Hamburg?",
                a: "Preise variieren stark: Drops-in Sessions kosten 15–25 €, halbtägige Workshops 40–80 €, ganztägige Events 80–150 €, Retreats 200–800 € je nach Umfang und Facilitator. Viele Anbieter bieten Ermäßigungen für Studis an.",
              },
              {
                q: "Gibt es Events nur für Paare oder auch für Singles?",
                a: "Beides. Es gibt reine Paarseminare, aber auch viele offene Community-Events und Workshops für Singles. Du kannst alleine teilnehmen und Gleichgesinnte treffen.",
              },
              {
                q: "Wie erkenne ich seriöse Tantra-Anbieter?",
                a: "Achte auf: klare Beschreibung des Events, professionelle Webseite, Vorstellung der Facilitators, transparente Preise, und positive Bewertungen. Vermeide vage Versprechen oder Druck. Auf Das Portal findest du curatierte Events von etablierten Anbietern.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-text-primary mb-3">
                  {faq.q}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 bg-bg-secondary rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl font-serif font-bold text-text-primary mb-4 text-center">
            Bleib auf dem Laufenden
          </h2>
          <p className="text-text-secondary text-center mb-8 text-lg">
            Trag dich auf unsere Warteliste ein oder tritt unserer Telegram-Community bei — so verpasst du keinen Event in Hamburg.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-accent-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all text-center"
            >
              Telegram beitreten
            </Link>
            <Link
              href="/#warteliste"
              className="inline-block bg-accent-sage text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all text-center"
            >
              Warteliste
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
