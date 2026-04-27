import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events Freiburg — Termine & Workshops auf Das Portal",
  description:
    "Ganzheitliche Events in Freiburg: Tantra, Breathwork, Kakaozeremonien, Retreats im Schwarzwald und mehr. Aktuelle Termine aus der Freiburger Community auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/freiburg/ganzheitliche-events",
  },
  openGraph: {
    title: "Ganzheitliche Events Freiburg — Das Portal",
    description:
      "Die aktivste ganzheitliche Szene Süddeutschlands. Tantra, Heilarbeit, Embodiment, Retreats — alle Termine aus Freiburg auf einen Blick.",
    url: "https://das-portal.online/freiburg/ganzheitliche-events",
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

export default async function FreiburgGanzheitlicheEventsPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Freiburg%,address.ilike.%freiburg%")
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events Freiburg",
    description:
      "Aktuelle ganzheitliche Events, Workshops und Retreats in Freiburg und Umgebung",
    url: "https://das-portal.online/freiburg/ganzheitliche-events",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
        location: {
          "@type": "Place",
          name: event.location_name || "Freiburg",
          address: event.address || "Freiburg",
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
            Freiburg · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Freiburg — Termine & Workshops
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ganzheitliche Events in Freiburg? Hier findest du die
            aktuellen Termine der Freiburger Szene: Tantra, Breathwork,
            Kakaozeremonien, Heilarbeit, Retreats im Schwarzwald — alles an
            einem Ort.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Freiburg"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Freiburg Events →
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
            Aktuelle ganzheitliche Events in Freiburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Workshop bis Retreat.`
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
                href="/events?city=Freiburg"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Freiburg Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Freiburg — was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Freiburg hat eine der aktivsten ganzheitlichen Szenen in ganz
              Süddeutschland. Das ist keine Marketing-Behauptung, sondern liegt
              einfach an der Geschichte der Stadt: Uni-Stadt mit ökologischem
              Gründungsmythos, Schwarzwald vor der Tür, Nähe zu Frankreich und
              der Schweiz, plus eine Generation von Menschen, die seit Jahren
              Räume für Körperarbeit, Bewusstsein und Community-Formate
              geschaffen haben.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Wer in Freiburg nach Tantra-Workshops, Breathwork-Abenden,
              Kakaozeremonien oder Retreats sucht, hat wöchentlich Optionen —
              das Problem ist weniger die Verfügbarkeit als die
              Auffindbarkeit. Vieles läuft über geschlossene WhatsApp-Gruppen,
              Instagram-Stories einzelner Facilitators oder Flyer in bestimmten
              Cafés. Das Portal bündelt diese Angebote, damit du nicht zehn
              Kanäle gleichzeitig beobachten musst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Freiburgs Szene ist dabei ungewöhnlich vielfältig. Von hochgradig
              professionalisierten Tantra-Schulen über somatische Bewegungs-
              und Embodiment-Formate bis zu schamanischen Zirkeln im
              Schwarzwald — der Ton reicht von sehr therapeutisch bis sehr
              feierlich. Wichtig zu wissen, damit du vorher weißt, worauf du
              dich einlässt.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche ganzheitlichen Formate in Freiburg besonders stark sind
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Jede Stadt hat ihre eigenen Schwerpunkte. In Freiburg sind ein
              paar Bereiche besonders dicht vertreten — nicht weil es sonst
              nichts gäbe, sondern weil sich hier über Jahre bestimmte Teacher
              und Communities verfestigt haben.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tantra und Beziehungsarbeit:</strong>{" "}
              Freiburg ist einer der bekanntesten Tantra-Hubs im DACH-Raum.
              Workshops für Einzelne und Paare, längere Trainings, offene
              Abende. Die Qualität ist deutlich höher als in vielen anderen
              Städten — weil die Lehrer:innen teils seit zehn, zwanzig Jahren
              hier arbeiten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Embodiment und Körperarbeit:</strong>{" "}
              Somatisches Arbeiten, Contact Improvisation, Ecstatic Dance,
              Authentic Movement. Das sind Formate, bei denen der Körper selbst
              das Medium ist. Freiburg hat mehrere feste Studios und wöchentliche
              Serien.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Heilarbeit und energetische Formate:</strong>{" "}
              Sound Healing, Kakaozeremonien, Constellations, Family Systems,
              schamanische Reisen. Viele davon in kleineren Zirkeln, oft mit
              Voranmeldung, manchmal in privaten Räumen oder kleinen Studios in
              Wiehre, Herdern oder im Grünen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats in Schwarzwald und Umgebung:</strong>{" "}
              Ein Großteil der Freiburger Retreats findet nicht in der Stadt
              selbst statt. Schwarzwald, Kaiserstuhl, Markgräflerland und die
              Schweizer Grenze liegen alle in Reichweite. Wochenend-Retreats,
              Intensiv-Wochen, Stille-Klausuren — meist mit einer Hand voll
              Teilnehmer:innen und festem Rahmen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Community und Circles:</strong>{" "}
              Frauenkreise, Männerkreise, gemischte Sharing Circles, offene
              Communities rund um Bewusstsein und bewusste Beziehung. Viele
              davon laufen monatlich oder zweiwöchentlich.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Freiburger Szene: Was sie besonders macht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Was Freiburg von Berlin, München oder Hamburg unterscheidet, ist
              die Dichte. Die Stadt ist vergleichsweise klein, aber die
              Community ist groß — und dadurch kennt sich viel untereinander.
              Wenn du zwei, drei Events besuchst, triffst du Menschen, die dir
              fünf andere empfehlen können. Das ist ein echter Vorteil gegenüber
              größeren Städten, wo du schneller anonym bleibst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Quartiere wie die Wiehre, Herdern, Stühlinger und das Vauban-Viertel
              haben sich als Zentren etabliert. Viele der größeren Studios und
              Praxen liegen dort, genauso wie die Cafés, in denen die Szene
              aushängt. Einige Anbieter sitzen aber auch weiter draußen — in
              Gundelfingen, Kirchzarten, im Dreisamtal oder im Markgräflerland.
              Wenn du mit dem Auto kommst, erweitert sich das Angebot deutlich.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ein weiterer Punkt: Die Nähe zu Basel und zur Schweizer Szene
              bringt ein eigenes Angebot mit. Viele Facilitators pendeln
              zwischen beiden Städten. Einige internationale Formate finden in
              Freiburg statt, weil es geographisch ein natürlicher Punkt
              zwischen Deutschland und der Schweiz ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal zeigt dir alle diese Angebote an einem Ort. Keine
              Instagram-Scrollerei, keine WhatsApp-Gruppen, kein "wenn ich das
              früher gewusst hätte".
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Freiburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Kurze Antwort: Für dich, wenn du dich für Körper, Beziehung,
              Bewusstsein oder Community interessierst. Die längere Antwort
              hängt davon ab, wo du gerade stehst.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Wenn du komplett neu bist, würde ich mit offenen Formaten starten
              — Ecstatic Dance, ein offener Meditation-Abend, eine
              Kakaozeremonie. Keine Voraussetzung, kein Druck, kein großer
              Einsatz. Du fühlst den Ton der Szene und kannst schauen, ob dir
              der Vibe taugt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Wenn du schon Erfahrung hast, sind die intensiveren Formate das
              Spannende. Mehrtägige Tantra-Workshops, Constellation-Arbeit,
              Retreat-Wochenenden. Da wird es dichter — und da passiert oft
              auch mehr.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was die Szene verbindet: Die meisten Formate sind bewusst offen
              gestaltet, ohne religiösen Rahmen, ohne Dogma. Du musst an
              nichts Bestimmtes glauben, um mitzumachen. Du musst nur bereit
              sein, ein paar Stunden oder Tage in einem Raum mit anderen zu
              verbringen, der nicht aussieht wie dein normaler Alltag.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Preise, Anmeldung, Ablauf
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Preise in Freiburg liegen ähnlich wie in anderen süddeutschen
              Städten. Offene Community-Formate meist auf Spendenbasis oder
              15–25 Euro. Workshops zwischen 40 und 120 Euro für Tagesformate.
              Retreat-Wochenenden zwischen 250 und 600 Euro inklusive
              Unterkunft und Verpflegung — je nach Location und Dauer.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Viele Formate haben eine Voranmeldung. Besonders Retreats und
              Tantra-Workshops sind oft schnell ausgebucht — da lohnt es sich,
              ein paar Wochen im Voraus zu schauen. Offene Abendformate kannst
              du meist spontan besuchen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Auf Das Portal siehst du bei jedem Event Preis, Ort, Anmeldelink
              und Infos zum Anbieter. Wenn du mehr über die Anbieter wissen
              willst: Klick auf das Profil — dort findest du weitere Termine
              und eine Beschreibung.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu ganzheitlichen Events in Freiburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was sind ganzheitliche Events genau?",
                a: "Formate, die Körper, Geist und oft auch spirituelle Praxis zusammen denken. Dazu zählen Yoga, Meditation, Breathwork, Tantra, Kakaozeremonien, Ecstatic Dance, Frauen- und Männerkreise, Sound Healing, schamanische Formate und Retreats — alles was mehr ist als reine Fitness oder reine Gesprächstherapie.",
              },
              {
                q: "Warum ist Freiburg so stark in dieser Szene?",
                a: "Uni-Stadt, ökologische Tradition, Schwarzwald vor der Tür, Nähe zu Basel und zur Schweizer Szene. Viele der Facilitators sitzen seit Jahren hier und haben die Community über Jahrzehnte aufgebaut. Außerdem gibt es mehrere feste Studios und Retreat-Orte im Umland.",
              },
              {
                q: "Wie finde ich aktuelle Events in Freiburg?",
                a: "Das Portal listet alle Termine auf einer Seite. Alternativ tritt der Telegram-Community bei — dort werden neue Events direkt geteilt. Oder abonniere die Warteliste für die volle Plattform, die gerade entsteht.",
              },
              {
                q: "Sind die Events für Anfänger geeignet?",
                a: "Die meisten ja. Offene Formate wie Ecstatic Dance, Kakaozeremonien oder Sharing Circles brauchen keine Vorerfahrung. Bei intensiveren Tantra- oder Retreat-Formaten stehen die Voraussetzungen in der Beschreibung — schau da rein, bevor du buchst.",
              },
              {
                q: "Was kosten die Events?",
                a: "Kostenlose oder Spendenbasis-Formate gibt es regelmäßig. Workshops liegen meist bei 40–120 Euro, Retreat-Wochenenden zwischen 250 und 600 Euro. Preise stehen direkt bei jedem Event.",
              },
              {
                q: "Finden die Retreats in Freiburg selbst statt?",
                a: "Meist nicht — die Retreats werden von Freiburger Anbietern organisiert, finden aber im Schwarzwald, Markgräflerland, auf Schweizer Seite oder im Dreisamtal statt. Anreise von Freiburg ist meist unter einer Stunde.",
              },
              {
                q: "Kann ich als Anbieter meine Events eintragen?",
                a: "Ja. Das Portal ist für Facilitators, Coaches und Heiler:innen aus dem DACH-Raum gedacht. Trag dich in die Warteliste ein oder reich dein Event direkt über das Formular ein — wir nehmen uns die Zeit, jedes Event manuell zu prüfen.",
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
