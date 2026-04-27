import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events Berlin — Termine & Workshops auf Das Portal",
  description:
    "Ganzheitliche Events in Berlin: Ecstatic Dance, Tantra, Breathwork, Kakaozeremonien, Heilarbeit und Community-Formate. Aktuelle Termine aus der Berliner Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/berlin/ganzheitliche-events",
  },
  openGraph: {
    title: "Ganzheitliche Events Berlin — Das Portal",
    description:
      "Die Berliner Szene für Bewusstsein, Embodiment und Community. Tanz, Tantra, Sound Healing, Circles und Retreats — alle Termine auf einen Blick.",
    url: "https://das-portal.online/berlin/ganzheitliche-events",
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

export default async function BerlinGanzheitlicheEventsPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Berlin%,address.ilike.%berlin%")
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events Berlin",
    description:
      "Aktuelle ganzheitliche Events, Workshops und Retreats in Berlin",
    url: "https://das-portal.online/berlin/ganzheitliche-events",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
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
        <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-8 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-12">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
            Berlin · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Berlin — Termine & Workshops
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ganzheitliche Events in Berlin? Hier findest du die
            aktuellen Termine: Ecstatic Dance, Tantra, Breathwork,
            Kakaozeremonien, Heilarbeit, Frauenkreise, Retreats — alle an
            einem Ort.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Berlin"
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

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Aktuelle ganzheitliche Events in Berlin
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Tanz bis Tantra.`
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
                Aktuell keine Events in dieser Kategorie.
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
                href="/events?city=Berlin"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Berlin Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Berlin — was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Berlin ist für die ganzheitliche Community das, was es für so
              viele Szenen ist: offen, laut, international, teils chaotisch,
              aber mit einer schieren Dichte an Angeboten, die sonst in
              Deutschland nirgends zu finden ist. Wer in Berlin nach Ecstatic
              Dance, Tantra, Kakaozeremonien oder Breathwork sucht, hat an
              einem einzigen Wochenende mehr Optionen als in anderen Städten
              im ganzen Monat.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Szene ist international. Viele Formate laufen auf Englisch,
              viele Anbieter pendeln zwischen Berlin und anderen Städten
              weltweit. Das hat Vorteile — extrem vielfältige Qualität und
              Richtungen — und Nachteile: Es fehlt manchmal der kontinuierliche
              Faden, den kleinere Städte haben. Teacher:innen kommen und gehen,
              Formate entstehen und verschwinden wieder.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal hilft dir dabei, in dieser Masse Orientierung zu
              finden. Statt dich durch 30 Instagram-Accounts zu scrollen,
              siehst du die aktuellen Termine an einem Ort — mit Beschreibung,
              Preis, Anbieter und Anmeldelink.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Formate in Berlin besonders stark sind
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Ein paar Bereiche sind in Berlin dichter besetzt als anderswo:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Ecstatic Dance und Embodiment:</strong>{" "}
              Berlin hat wohl die aktivste Ecstatic-Dance-Szene Deutschlands.
              Mehrere wöchentliche Formate an verschiedenen Orten, dazu
              Contact Improvisation, Authentic Movement und Five-Rhythms-Jams.
              Wer tanzt, findet in Berlin immer was.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tantra und Conscious Sexuality:</strong>{" "}
              Mehrere große Tantra-Schulen, internationale Teacher:innen,
              offene Abende und mehrwöchige Trainings. Viele Formate auf
              Englisch — die Berliner Tantra-Szene ist eine der sichtbarsten
              in Europa.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Heilarbeit und Energiearbeit:</strong>{" "}
              Sound Healing, Reiki-Zirkel, Schamanismus, Constellations,
              Breathwork-Journeys. Die Bandbreite ist hier besonders groß —
              von sehr therapeutisch bis sehr mystisch. Qualität variiert
              stark, lohnt sich vorher in Beschreibung und Anbieter-Profil zu
              schauen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Frauenkreise und Community:</strong>{" "}
              Monatliche und wöchentliche Circles, sehr aktiv. Viele Formate
              rund um Weiblichkeit, Zyklusarbeit, Sharing. Dazu gemischte
              Community-Abende und Community-Dinners, die das Soziale in den
              Mittelpunkt stellen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Kakaozeremonien:</strong>{" "}
              Beliebt und wöchentlich verfügbar. Unterschiedliche Stile — von
              stiller Meditation um den Kakao herum bis zu Zeremonien mit
              Live-Musik und Bewegung.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Berliner Szene: Was sie besonders macht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Drei Dinge: Internationalität, Diversität, Tempo. Berlin zieht
              Menschen aus der ganzen Welt an, und das prägt die Szene. Du
              findest hier Formate, die du sonst in Deutschland nicht findest
              — einfach weil die Community groß und vernetzt genug ist, um
              spezialisierte Angebote zu tragen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Diversität reicht von sehr säkular-therapeutisch bis hin zu
              sehr mystisch-spirituell. Manche Formate passen sehr klar in eine
              Schublade, andere mischen. Wichtig: Lies vor der Anmeldung die
              Beschreibung, damit du weißt, worauf du dich einlässt. Ein
              Berliner Breathwork-Abend kann sehr unterschiedlich aussehen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Geographisch verteilt sich die Szene über viele Kieze:
              Friedrichshain, Kreuzberg, Neukölln, Prenzlauer Berg,
              Mitte, Wedding, Pankow. Es gibt kein klares "Zentrum" — das
              macht es etwas unübersichtlicher, aber auch bedeutet, dass du
              nie weit von einem Event entfernt bist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Dazu kommt Berlins Tempo. Viele Formate sind Pop-ups. Etwas läuft
              drei Monate, dann ändert sich der Ort, dann kommt was Neues.
              Genau deswegen ist eine zentrale Event-Übersicht hier besonders
              wertvoll.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Berlin?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Für dich, wenn du offen für Experimente bist. Berlin belohnt
              Menschen, die bereit sind, mal in ein Format zu gehen, ohne
              vorher genau zu wissen, was passiert. Das Angebot ist zu groß und
              zu divers, um alles vorher durchzuchecken.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Einsteiger:innen empfehlen sich offene Formate — Ecstatic
              Dance, Kakaozeremonien, Sharing Circles. Diese sind bewusst
              niedrigschwellig und brauchen keine Vorerfahrung. Sobald du ein
              Gefühl für die Szene hast, kannst du tiefer einsteigen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Erfahrene ist Berlin ein Spielfeld. Hier findest du
              Intensiv-Trainings, wochenlange Immersions, internationale
              Gast-Teacher und Formate, die nirgendwo sonst stattfinden.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Preise, Anmeldung, Ablauf
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Das Preisspektrum in Berlin ist breit. Viele Community-Formate
              laufen auf Spendenbasis (Sliding Scale) und kosten zwischen 10
              und 30 Euro. Workshops meist 40–120 Euro. Tantra-Intensive und
              längere Trainings können mehrere hundert bis über tausend Euro
              kosten. Retreat-Wochenenden außerhalb Berlins meist 250–600
              Euro.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Anmeldung läuft bei vielen Formaten über Eventbrite, bei
              anderen direkt beim Anbieter. Das Portal verlinkt direkt zur
              Anmeldung. Manche Community-Formate sind drop-in, manche brauchen
              vorherige Registrierung — steht bei jedem Event.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Wichtig: In Berlin laufen einige Formate auf Englisch. Wenn das
              für dich eine Rolle spielt, schau in die Beschreibung. Bei einem
              Großteil der Events ist Deutsch aber Standard.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu ganzheitlichen Events in Berlin
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was sind ganzheitliche Events?",
                a: "Formate, die Körper, Geist und oft auch spirituelle Praxis zusammen denken. Dazu zählen Yoga, Meditation, Breathwork, Tantra, Kakaozeremonien, Ecstatic Dance, Frauen- und Männerkreise, Sound Healing, schamanische Formate und Retreats.",
              },
              {
                q: "Wie finde ich aktuelle ganzheitliche Events in Berlin?",
                a: "Das Portal listet alle Termine auf einer Seite. Du kannst nach Kategorie, Datum und Bezirk filtern. Zusätzlich kannst du der Telegram-Community beitreten — dort werden neue Events direkt geteilt.",
              },
              {
                q: "Auf welcher Sprache sind die Events?",
                a: "Die meisten auf Deutsch. In Berlin laufen aber viele Formate auch auf Englisch — vor allem im Tantra- und Ecstatic-Dance-Bereich. Die Sprache steht in der Event-Beschreibung.",
              },
              {
                q: "Sind die Events für Anfänger geeignet?",
                a: "Die meisten ja. Offene Formate wie Ecstatic Dance, Kakaozeremonien oder Sharing Circles brauchen keine Vorerfahrung. Bei Tantra-Intensiven und Retreat-Formaten stehen die Voraussetzungen in der Beschreibung.",
              },
              {
                q: "Was kosten die Events?",
                a: "Community-Formate 10–30 Euro oft auf Spendenbasis. Workshops 40–120 Euro. Längere Trainings und Intensive deutlich mehr. Retreat-Wochenenden 250–600 Euro.",
              },
              {
                q: "Wo in Berlin finden die Events statt?",
                a: "Verteilt über viele Bezirke — Friedrichshain, Kreuzberg, Neukölln, Prenzlauer Berg, Mitte, Wedding, Pankow. Kein zentraler Ort, sondern viele kleine und mittlere Studios, Räume und Locations. Der genaue Ort steht immer bei jedem Event.",
              },
              {
                q: "Gibt es Retreats rund um Berlin?",
                a: "Ja — viele Berliner Anbieter organisieren Retreats im Umland: Brandenburg, Mecklenburg, Uckermark. Oft Wochenend-Formate oder längere Intensive. Anreise meist mit Auto oder als organisierter Shuttle.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-border bg-bg-card p-6">
                <h3 className="font-medium text-text-primary">{q}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keine Events mehr verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Events direkt
            zugeschickt. Oder trag dich in die Warteliste für frühen Zugang zur
            Plattform ein.
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
