import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Yoga München — Klassen, Workshops & Retreats",
  description:
    "Yoga in München: Vinyasa, Yin, Hatha, Yoga-Workshops und Retreats. Aktuelle Termine aus der Münchner Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/muenchen/yoga",
  },
  openGraph: {
    title: "Yoga München — Das Portal",
    description:
      "Yoga in München — Vinyasa, Yin, Hatha, Workshops und Retreats. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/muenchen/yoga",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const YOGA_TAGS = [
  "yoga",
  "vinyasa",
  "hatha",
  "yin",
  "ashtanga",
  "kundalini",
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

export default async function MuenchenYogaPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or(
      "address.ilike.%München%,address.ilike.%muenchen%,address.ilike.%Muenchen%,address.ilike.%münchen%"
    )
    .order("start_at", { ascending: true })
    .limit(20);

  const allEvents = deduplicateEvents((data || []) as Event[]);
  const events = allEvents.filter(
    (event) =>
      event.tags?.some((tag) =>
        YOGA_TAGS.some((yt) => tag.toLowerCase().includes(yt))
      ) || event.title?.toLowerCase().includes("yoga")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Yoga München",
    description: "Aktuelle Yoga-Termine, Workshops und Retreats in München",
    url: "https://das-portal.online/muenchen/yoga",
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
            München · Yoga-Szene
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Yoga in München — Klassen, Workshops & Retreats
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst Yoga in München? Hier findest du Workshops und
            Retreat-Termine aus der Münchner Szene — von Vinyasa-Klassen in
            Schwabing bis zu Wochenend-Retreats im Voralpenland.
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
            Aktuelle Yoga-Events in München
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Yoga-Termine gefunden — Workshops, Specials und Retreats.`
              : "Gerade keine Yoga-Termine — schau bald wieder rein oder trag dich in die Warteliste ein."}
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
                Aktuell keine Yoga-Events in München gelistet.
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
                href="/muenchen/ganzheitliche-events"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle München Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Yoga in München — was du wissen solltest
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              München hat eine der ältesten und dichtesten Yoga-Szenen
              Deutschlands. Studios gibt es seit den frühen 2000ern, manche
              Lehrer:innen unterrichten seit 30 Jahren. Wer in München Yoga
              sucht, findet sowohl die ganz alten Schulen mit klassischer
              Hatha- oder Iyengar-Linie als auch alles, was in den letzten
              Jahren dazu gekommen ist: Vinyasa, Yin, Power Yoga, Yoga-Therapie.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Szene verteilt sich über die ganze Stadt, mit Schwerpunkten
              in Schwabing, Haidhausen, Maxvorstadt und Glockenbach. Dazu
              kommt eine wachsende Zahl an Pop-up-Formaten in Co-Working-Spaces,
              Galerien oder Privaträumen — die laufen oft nicht über die
              klassischen Studio-Webseiten, sondern über WhatsApp-Gruppen und
              Instagram. Das macht den Überblick schwer.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal bündelt das, was öffentlich angekündigt wird: Specials,
              Workshops, Retreats, Themenwochen. Wöchentliche Studio-Klassen
              listen wir nicht — die findest du über die Studios direkt. Was
              du hier findest, sind die Termine, die nicht zur Routine
              gehören.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Yoga-Stile sind in München verbreitet?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              In München gibt es nahezu jeden Yogastil — von sehr klassisch
              bis sehr modern. Ein paar Schwerpunkte, die in der Szene
              regelmäßig auftauchen:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Vinyasa und Power Yoga:</strong>{" "}
              Der wahrscheinlich häufigste Stil in den großen Studios.
              Fließende Bewegung, viel Kraft, oft mit Musik. Workshops gehen
              meistens in Richtung Inversions, Arm Balances oder spezifische
              Themen wie Hüftöffner.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Yin- und Restorative Yoga:</strong>{" "}
              Gegenpol zum dynamischen Vinyasa. Lange Haltephasen, Faszien-
              und Bindegewebsarbeit. Zunehmend beliebt — viele Workshop-Termine
              in den letzten Jahren.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Klassisches Hatha & Iyengar:</strong>{" "}
              In München traditionell stark vertreten. Mehrere etablierte
              Schulen, oft in der Iyengar-Linie. Workshops sind anatomisch
              detailliert, mit viel Ausrichtung und Hilfsmittel-Arbeit.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Kundalini Yoga:</strong>{" "}
              Spirituell ausgerichteter, mit Mantras, Atemtechniken und
              Meditation. In München gibt es eine kleine, aber aktive
              Kundalini-Community. Workshops und Special-Sessions tauchen
              regelmäßig auf.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Yoga & Verwandtes:</strong>{" "}
              Yoga Nidra, Pre-/Postnatal-Yoga, Yoga für Männer, Aerial Yoga
              — die spezialisierten Formate gibt es in München mittlerweile
              alle. Im Workshop-Format eher selten, aber vereinzelt findest
              du sie auf Das Portal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Münchner Yoga-Szene: Was sie ausmacht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Münchens Yoga-Szene verteilt sich auf feste Studios in
              Schwabing, Haidhausen, Glockenbach und Maxvorstadt — und auf
              Pop-up-Formate, die nur über WhatsApp und Instagram laufen. Das
              Portal bündelt beides, sofern die Termine öffentlich
              angekündigt sind.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Auffällig in München: Viele Yoga-Lehrer:innen kombinieren ihre
              Praxis mit anderen Disziplinen. Yoga und Coaching, Yoga und
              Atemarbeit, Yoga und Pilates, Yoga und Faszien-Arbeit. Du
              findest weniger reine Yoga-Pakete als in Berlin oder Hamburg —
              dafür mehr integrative Formate.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Im Sommer fließt vieles raus aus den Studios: Yoga im
              Olympiapark, am Flaucher, in den Parks. Im Winter ziehen die
              Workshops in die Studios und in private Locations zurück.
              Saisonalität spielt in München eine größere Rolle als in
              anderen Städten.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Yoga-Retreats aus München — fast immer im Voralpenland
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die meisten Yoga-Retreats Münchner Anbieter finden nicht in der
              Stadt statt, sondern im Voralpenland, am Tegernsee, Chiemsee,
              Schliersee oder in den nahen Bergen. Anreise oft mit der Bahn
              oder gemeinsamer Fahrgemeinschaft, Wochenende oder eine ganze
              Woche, klassisch mit zwei Yoga-Einheiten am Tag und Zeit für
              Wanderungen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal listet diese Retreats unter dem München-Filter, auch
              wenn sie woanders stattfinden — der Anbieter sitzt in München
              und die Zielgruppe ist die Münchner Community.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind Yoga-Workshops in München?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die meisten Workshops setzen Grundkenntnisse voraus — du
              solltest also nicht ganz bei Null anfangen. Wenn du komplett
              neu bist, geh erst in ein paar reguläre Klassen, bevor du dich
              für einen Workshop anmeldest. Die Beschreibung beim jeweiligen
              Event auf Das Portal sagt dir, ab welchem Level es passt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Workshops sind ideal, um einen bestimmten Aspekt zu vertiefen:
              Inversions, Atmung, Anatomie, einen bestimmten Stil
              kennenlernen, einen Lehrer hören der sonst nicht in München
              unterrichtet. Die Münchner Szene zieht regelmäßig
              internationale Gast-Lehrer:innen an, das findest du auf Das
              Portal mit angekündigt.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Yoga in München
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Listet Das Portal auch wöchentliche Yoga-Klassen?",
                a: "Nein. Wir listen Workshops, Specials, Master Classes und Retreats — also Termine, die nicht zur regulären Routine gehören. Reguläre Studio-Klassen findest du direkt bei den Münchner Studios.",
              },
              {
                q: "Brauche ich Vorerfahrung für Yoga-Workshops in München?",
                a: "Bei den meisten Workshops ja. Wenn du komplett neu bist, geh erst in ein paar reguläre Klassen. Die Beschreibung beim Event sagt dir, welches Level vorausgesetzt wird — manche Workshops sind explizit für Anfänger:innen konzipiert.",
              },
              {
                q: "Was kostet ein Yoga-Workshop in München?",
                a: "Workshops liegen meist zwischen 30 und 80 Euro für 2-3 Stunden. Tagesworkshops 80-150 Euro. Wochenend-Workshops 200-400 Euro. Retreats sind separat, je nach Länge und Unterkunft. Den Preis siehst du immer direkt am Event.",
              },
              {
                q: "Welche Stadtteile sind die Yoga-Hochburgen?",
                a: "Schwabing, Haidhausen, Glockenbach und Maxvorstadt. Dort sitzen die meisten Studios. In Sendling und Westend gibt es ebenfalls einige etablierte Schulen. Pop-up-Formate finden auch in Co-Working-Spaces oder Privaträumen statt.",
              },
              {
                q: "Finde ich auf Das Portal auch Yoga-Lehrerausbildungen?",
                a: "Yoga-TT (Teacher Trainings) tauchen vereinzelt auf, vor allem als Wochenend- oder Modul-Format. Lange, durchgehende Ausbildungen findest du eher direkt bei den Schulen — wir sind kein Yoga-Schulverzeichnis.",
              },
              {
                q: "Kann ich als Yoga-Lehrer:in mein Event auf Das Portal eintragen?",
                a: "Ja. Trag dein Event unter /einreichen ein, wir prüfen und veröffentlichen. Voraussetzung ist, dass das Event öffentlich zugänglich ist und ein klares Datum, Ort und Anbieter-Profil hat.",
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
            Keine Yoga-Events in München mehr verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Termine
            direkt zugeschickt. Oder trag dich in die Warteliste für frühen
            Zugang zur Plattform ein.
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
