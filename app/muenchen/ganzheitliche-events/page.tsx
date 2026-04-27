import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events München — Termine & Workshops auf Das Portal",
  description:
    "Ganzheitliche Events in München: Meditation, Tantra, Breathwork, Kakaozeremonien, Heilarbeit und Retreats im Umland. Aktuelle Termine der Münchner Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/muenchen/ganzheitliche-events",
  },
  openGraph: {
    title: "Ganzheitliche Events München — Das Portal",
    description:
      "Die Münchner Szene für Bewusstsein, Körperarbeit und Heilung. Workshops, Circles, Retreats und Community-Formate — alle Termine auf einen Blick.",
    url: "https://das-portal.online/muenchen/ganzheitliche-events",
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

export default async function MuenchenGanzheitlicheEventsPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%München%,address.ilike.%muenchen%,address.ilike.%Muenchen%")
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events München",
    description:
      "Aktuelle ganzheitliche Events, Workshops und Retreats in München und Umgebung",
    url: "https://das-portal.online/muenchen/ganzheitliche-events",
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
        <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-8 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-12">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
            München · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in München — Termine & Workshops
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ganzheitliche Events in München? Hier findest du die
            aktuellen Termine: Meditation, Breathwork, Tantra, Kakaozeremonien,
            Circles und Retreats im Umland — alle an einem Ort.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=München"
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

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Aktuelle ganzheitliche Events in München
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Meditation bis Retreat.`
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
                href="/events?city=München"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle München Events anzeigen →
              </Link>
            </div>
          )}
        </section>

        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in München — was dich erwartet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              München ist in der ganzheitlichen Community oft die unterschätzte
              Größe. Viele denken zuerst an Berlin oder Freiburg, wenn es um
              Tantra, Embodiment oder Heilarbeit geht. Aber in München sitzt
              eine sehr aktive, sehr professionelle Szene — die wirkt nur oft
              ruhiger, weil sie weniger laut nach außen geht.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Münchner Szene ist geprägt von einer Mischung aus
              therapeutisch-arbeitenden Coaches, Breathwork-Teacher:innen,
              Tantra-Schulen, Meditation-Zentren und einer zunehmend sichtbaren
              Community rund um Kakaozeremonien, Frauenkreise und
              Sound-Healing-Formate. Dazu kommt das Umland: Ammersee, Starnberger
              See, Tegernsee, bayerisches Voralpenland — viele Retreats finden
              dort statt, organisiert von Münchner Anbietern.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ein Großteil der Formate läuft über feste Studios in Schwabing,
              Haidhausen, Glockenbach, Sendling und der Maxvorstadt. Wer
              regelmäßig teilnimmt, bewegt sich in einem erstaunlich dichten
              Netzwerk — man kennt sich, die Teacher:innen verweisen
              aufeinander, viele Workshops sind schnell ausgebucht.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Formate in München besonders stark sind
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Kategorien überschneiden sich, aber ein paar Schwerpunkte
              zeichnen die Münchner Szene aus:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Meditation und Kontemplation:</strong>{" "}
              München hat mehrere feste Meditation-Zentren und wöchentliche
              Sitz-Gruppen. Vipassana, Zen, säkulare Achtsamkeit — je nach
              Tradition. Stille-Retreats finden regelmäßig im Voralpenland
              statt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Breathwork und Atemarbeit:</strong>{" "}
              Holotropes Atmen, Conscious Connected Breathing, Wim Hof, Pranayama
              — in München werden alle Richtungen regelmäßig angeboten. Oft in
              Yoga-Studios oder Praxisräumen, meist mit kleiner Gruppengröße.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Tantra und Beziehungsarbeit:</strong>{" "}
              Mehrere etablierte Schulen, Workshops für Paare und Einzelne,
              längere Trainings. Die Münchner Tantra-Szene ist vergleichsweise
              erwachsen — Dogma-arm, therapeutisch informiert.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Zeremonielle Formate:</strong>{" "}
              Kakaozeremonien, Frauenkreise, Männerkreise, schamanische Abende.
              Diese Formate haben in den letzten drei, vier Jahren deutlich
              zugenommen. Qualität variiert — das Portal hilft dir zu filtern.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats im Umland:</strong>{" "}
              Ammersee, Tegernsee, Chiemgau, Pfaffenhofen, bayerische Alpen —
              die Retreat-Landschaft rund um München ist riesig. Wochenenden,
              Intensiv-Wochen, Stille-Retreats, Breathwork-Reisen. Viele
              Anbieter pendeln zwischen Stadt und Land.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Münchner Szene: Was sie besonders macht
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Drei Dinge machen München aus: Professionalität, Preisniveau,
              Diskretion. Viele Anbieter haben einen therapeutischen oder
              akademischen Hintergrund. Das zeigt sich in der Art, wie Workshops
              angelegt sind — eher strukturiert als wild, eher erklärend als
              nur erlebnisorientiert.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Preisniveau liegt leicht über dem in vielen anderen Städten
              — was teilweise der allgemeinen Münchner Preisstruktur geschuldet
              ist, teilweise auch den Raummieten und der Erfahrung der
              Anbieter. Rechne bei Workshops eher mit 60–150 Euro, bei
              Retreat-Wochenenden mit 350–800 Euro.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Und: Die Szene ist tendenziell diskreter als z.B. die Berliner.
              Viele Events werden nicht breit auf Instagram beworben, sondern
              laufen über Newsletter-Listen, geschlossene WhatsApp-Gruppen und
              persönliche Empfehlungen. Das Portal ist einer der wenigen Orte,
              an dem all diese Angebote zusammenkommen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in München?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Wenn du in München lebst oder arbeitest und dich für Körper,
              Bewusstsein oder Community interessierst, findest du hier dein
              Angebot. Die Szene ist nicht exklusiv — aber sie ist auch nicht
              auf Event-Charakter ausgelegt. Die meisten Formate sind eher
              klein, eher in sich ruhig, eher arbeitend als performativ.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für Einsteiger:innen empfehlen sich offene Meditation-Abende,
              Kakaozeremonien oder einzelne Breathwork-Sessions. Keine
              Vorbereitung nötig, kein langer Commit. Wenn du merkst, dass dich
              das Thema trägt, kannst du tiefer einsteigen — mit Workshops,
              Trainings oder einem Retreat.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Für erfahrene Praktizierende ist München einer der besseren Orte
              im DACH-Raum — gerade weil die Qualität hoch ist und die
              Lehrer:innen oft jahrzehntelang in ihrem Fachgebiet arbeiten.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Preise, Anmeldung, Ablauf
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Community-Formate wie offene Meditation oder Sharing Circles
              liegen meist bei 15–30 Euro oder laufen auf Spendenbasis.
              Workshops (Breathwork, Tantra, Constellations) kosten 60–150
              Euro. Tagesformate 100–200 Euro. Retreat-Wochenenden inklusive
              Unterkunft und Verpflegung zwischen 350 und 800 Euro.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Bei beliebten Anbietern solltest du früh buchen — manche Formate
              sind Monate im Voraus ausgebucht. Offene Abende kannst du meist
              spontan besuchen, aber auch dort hilft eine Voranmeldung.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Alle Details (Preis, Ort, Anmeldelink, Anbieter) stehen direkt
              bei jedem Event. Wenn du mehr über einen bestimmten Anbieter
              wissen willst: Klick auf das Host-Profil.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu ganzheitlichen Events in München
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was sind ganzheitliche Events?",
                a: "Formate, die Körper, Geist und oft auch spirituelle Praxis zusammen denken. Yoga, Meditation, Breathwork, Tantra, Kakaozeremonien, Frauenkreise, Sound Healing, schamanische Formate, Ecstatic Dance und Retreats gehören dazu.",
              },
              {
                q: "Warum ist die Münchner Szene oft weniger sichtbar als die in Berlin?",
                a: "Weil viele Münchner Anbieter weniger auf Social-Media-Sichtbarkeit setzen und stattdessen über Newsletter, WhatsApp-Gruppen und persönliche Empfehlungen arbeiten. Die Szene ist dicht und professionell, aber nicht so laut.",
              },
              {
                q: "Wo finden die Events in München statt?",
                a: "Viele in festen Studios und Praxen in Schwabing, Haidhausen, Glockenbach, Sendling und der Maxvorstadt. Retreats meist im Umland: Ammersee, Tegernsee, Chiemgau, bayerische Alpen.",
              },
              {
                q: "Sind die Events für Anfänger geeignet?",
                a: "Die meisten ja. Offene Formate wie Meditation-Abende, Kakaozeremonien oder Ecstatic Dance brauchen keine Vorerfahrung. Bei intensiveren Tantra- oder Retreat-Formaten stehen die Voraussetzungen in der Beschreibung.",
              },
              {
                q: "Was kosten die Events in München?",
                a: "Offene Formate 15–30 Euro, Workshops 60–150 Euro, Retreat-Wochenenden 350–800 Euro. Das Preisniveau liegt leicht über anderen Städten — Raummiete und Anbieter-Erfahrung sind höher.",
              },
              {
                q: "Wie melde ich mich an?",
                a: "Jedes Event auf Das Portal hat einen direkten Anmeldelink zum Anbieter. Dort findest du Konditionen, Zahlungsmodalitäten und weitere Infos.",
              },
              {
                q: "Finden Retreats in München oder nur im Umland statt?",
                a: "Beides. Tages-Retreats finden in der Stadt statt, mehrtägige Retreats meist im Umland — Ammersee, Tegernsee, Chiemgau. Anreise ist von München meist unter 90 Minuten.",
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
