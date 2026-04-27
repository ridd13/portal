import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Retreat Hamburg — Retreats & Auszeiten",
  description:
    "Retreats in Hamburg und Umgebung: Mehrtägige Auszeiten, Wochenend-Retreats und transformative Rückzugsorte. Finde dein nächstes Retreat auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg/retreat",
  },
  openGraph: {
    title: "Retreat Hamburg — Das Portal",
    description:
      "Retreats in Hamburg — mehrtägige Auszeiten, Wochenend-Retreats und transformative Rückzugsorte. Alle Termine auf Das Portal.",
    url: "https://das-portal.online/hamburg/retreat",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const RETREAT_TAGS = [
  "retreat",
  "auszeit",
  "rückzug",
  "stille",
  "silent retreat",
  "wochenend-retreat",
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

export default async function HamburgRetreatPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .order("start_at", { ascending: true })
    .limit(20);

    const allEvents = deduplicateEvents((data || []) as Event[]);
    const events = allEvents.filter(
    (event) =>
      event.tags?.some((tag) =>
        RETREAT_TAGS.some((rt) => tag.toLowerCase().includes(rt))
      ) ||
      event.title?.toLowerCase().includes("retreat") ||
      event.title?.toLowerCase().includes("auszeit") ||
      event.event_format === "retreat"
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Retreats Hamburg",
    description:
      "Aktuelle Retreats und mehrtägige Auszeiten in Hamburg und Umgebung",
    url: "https://das-portal.online/hamburg/retreat",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
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
            Hamburg · Retreats & Auszeiten
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Retreat in Hamburg — Auszeiten & Termine
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst ein Retreat in oder um Hamburg? Hier findest du aktuelle
            Termine — von Wochenend-Retreats in der Natur bis zu mehrtägigen
            Auszeiten mit Meditation, Yoga und Breathwork.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Hamburg"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Hamburg Events
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
            Aktuelle Retreats in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} ${events.length === 1 ? "Retreat" : "Retreats"} gefunden.`
              : "Gerade keine Retreats geplant — schau bald wieder rein oder tritt der Telegram-Community bei."}
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
                      {event.location_name}
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
                Aktuell keine Retreats eingetragen.
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
                href="/events?city=Hamburg"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle Hamburg Events anzeigen
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Retreat in Hamburg — warum es sich lohnt, rauszukommen
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Hamburg ist schnell. Zwischen Hafen, Meetings und dem ständigen
              Grundrauschen einer Zwei-Millionen-Stadt vergisst man leicht,
              dass der Körper auch mal Pause braucht. Nicht die Art Pause, bei
              der du auf der Couch Netflix schaust. Sondern die Art, bei der du
              wirklich ankommst. Bei dir. Ein Retreat bietet genau das: einen
              bewussten Rahmen, um aus dem Alltag auszusteigen und dich mit dem
              zu verbinden, was unter dem ganzen Lärm liegt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was ein Retreat von einem Urlaub unterscheidet? Struktur und
              Intention. Du fährst nicht einfach irgendwohin und hoffst, dass
              Entspannung passiert. Ein Retreat hat einen roten Faden — ob
              Meditation, Yoga, Breathwork, Fasten oder Stille. Jemand hält
              den Raum, führt dich durch Praktiken und gibt dir die
              Erlaubnis, wirklich loszulassen. Kein WLAN-Checken, keine
              To-do-Listen, kein "ich müsste eigentlich noch".
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Die Retreat-Szene rund um Hamburg ist vielfältiger, als man
              denkt. Im Alten Land, an der Ostsee, in der Lüneburger Heide
              oder direkt in der Stadt gibt es Formate für jeden Geschmack.
              Von einem stillen Wochenende im Kloster bis zu einem aktiven
              Transformations-Retreat mit Tanz, Kakao und Atemarbeit.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Arten von Retreats du in Hamburg findest
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Bandbreite ist groß. Yoga-Retreats sind der Klassiker —
              mehrere Tage mit morgendlicher Asana-Praxis, Meditation und
              bewusstem Essen. Viele finden in schönen Locations außerhalb
              der Stadt statt, mit viel Natur drumherum. Dann gibt es
              Meditations-Retreats, oft in Stille — für alle, die sich
              trauen, mal ein ganzes Wochenende den Mund zu halten und
              hinzuhören, was dann kommt.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Breathwork-Retreats sind in den letzten Jahren immer
              beliebter geworden. Hier steht die bewusste Atemarbeit im
              Zentrum, oft kombiniert mit Körperarbeit, Sharing-Runden und
              Integration. Wer tiefer gehen will, findet auch Retreats mit
              Kakaozeremonien, Soundhealing oder schamanischen Elementen.
              Und dann gibt es die pragmatischen Formate: Fasten-Retreats,
              Digital-Detox-Wochenenden oder Natur-Retreats, bei denen es
              vor allem darum geht, den Kopf freizukriegen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was alle gemeinsam haben: Du gehst mit einer anderen Energie
              raus, als du reingegangen bist. Nicht weil irgendjemand
              Magie macht, sondern weil du dir bewusst Zeit gegeben hast.
              Und das ist in einer Welt, die ständig "mehr, schneller,
              weiter" ruft, ziemlich radikal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Retreat-Locations rund um Hamburg
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Du musst nicht nach Bali fliegen, um ein gutes Retreat zu
              erleben. Rund um Hamburg gibt es Orte, die sich perfekt
              eignen. An der Ostsee — Timmendorfer Strand, Scharbeutz
              oder die Holsteinische Schweiz — findest du Retreat-Häuser
              mit Meerblick und Strandnähe. Die Lüneburger Heide bietet
              Stille und weite Landschaft, ideal für Meditations- und
              Yoga-Retreats.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Im Alten Land, direkt vor den Toren Hamburgs, gibt es
              umgebaute Bauernhöfe und kleine Seminar-Häuser, die sich
              auf Retreats spezialisiert haben. Und auch mitten in der
              Stadt finden Retreats statt — in Yoga-Studios, Lofts oder
              Co-Working-Spaces, die am Wochenende zum Retreat-Raum werden.
              Die Nähe macht es einfach: Freitag nach der Arbeit hin,
              Sonntag zurück — ohne Flug, ohne Jetlag, ohne Aufwand.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Auf Das Portal siehst du bei jedem Retreat, wo es stattfindet
              und was dich erwartet. So kannst du entscheiden, ob du lieber
              in der Natur oder in der Stadt sein willst, ob du weit fahren
              oder nah bleiben möchtest.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Dein erstes Retreat — was du wissen solltest
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Wenn du noch nie auf einem Retreat warst, ist der wichtigste
              Tipp: Mach dir keinen Druck. Du musst weder flexibel sein,
              noch meditieren können, noch irgendetwas "richtig" machen.
              Ein gutes Retreat holt dich da ab, wo du bist. Die meisten
              sind explizit für Anfänger offen.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Pack bequeme Kleidung ein, lass dein Laptop zu Hause und
              sag deinem Umfeld, dass du ein paar Tage nicht erreichbar
              bist. Das klingt banal, ist aber für viele der schwierigste
              Teil. Wir sind so gewohnt, immer verfügbar zu sein, dass
              sich echte Offline-Zeit fast rebellisch anfühlt. Genau
              darum geht es.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Ein weiterer Tipp: Lies die Beschreibung genau. Manche
              Retreats sind intensiv und konfrontativ, andere sanft und
              erholsam. Beides hat seine Berechtigung, aber du solltest
              wissen, worauf du dich einlässt. Auf Das Portal beschreiben
              die Anbieter ihre Formate transparent — so findest du das
              Retreat, das zu dir passt.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Warum Retreats gerade jetzt boomen
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Nachfrage nach Retreats ist in den letzten Jahren massiv
              gestiegen — nicht nur bei der "Yoga-Szene", sondern quer
              durch alle Altersgruppen und Berufe. Unternehmer buchen
              Stille-Retreats, um klarer zu denken. Eltern nehmen sich ein
              Wochenende für sich, um aufzutanken. Paare gehen gemeinsam
              auf ein Retreat, um sich jenseits des Alltags wiederzufinden.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Der Grund ist simpel: Wir leben in einer Welt mit
              permanenter Reizüberflutung. Retreats bieten einen
              geschützten Raum, in dem du mal nicht funktionieren musst.
              In dem du nicht produzieren, performen oder unterhalten
              musst. In dem du einfach sein darfst. Das klingt simpel,
              ist aber für viele eine der tiefgreifendsten Erfahrungen
              ihres Lebens.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Retreats in Hamburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Was kostet ein Retreat in Hamburg?",
                a: "Das hängt stark vom Format ab. Ein Tages-Retreat liegt oft zwischen 50 und 150 Euro. Wochenend-Retreats kosten typischerweise 200 bis 500 Euro, mehrtägige Formate mit Unterkunft und Verpflegung 400 bis 1.200 Euro. Manche Anbieter bieten Frühbucher-Preise oder Ermäßigungen an.",
              },
              {
                q: "Muss ich Erfahrung mitbringen?",
                a: "Für die meisten Retreats nicht. Viele Formate sind bewusst für Einsteiger gestaltet. In der Beschreibung steht jeweils, welche Vorkenntnisse erwartet werden. Im Zweifel: Einfach den Anbieter fragen — die freuen sich über ehrliche Fragen.",
              },
              {
                q: "Wie lange dauert ein typisches Retreat?",
                a: "Von einem Tag bis zu einer Woche ist alles dabei. Am häufigsten sind Wochenend-Retreats (Freitag bis Sonntag). Für den Einstieg eignen sich Tages-Retreats gut — ein kompletter Tag, an dem du abends wieder zu Hause bist.",
              },
              {
                q: "Was ist der Unterschied zwischen Retreat und Workshop?",
                a: "Ein Workshop vermittelt in der Regel eine bestimmte Technik oder Fähigkeit in wenigen Stunden. Ein Retreat geht tiefer: Du ziehst dich für einen oder mehrere Tage aus dem Alltag zurück, lebst in einem anderen Rhythmus und tauchst in eine Praxis ein. Der Rückzug selbst ist Teil der Erfahrung.",
              },
              {
                q: "Kann ich alleine auf ein Retreat gehen?",
                a: "Auf jeden Fall — die meisten Teilnehmer kommen alleine. Retreats sind so gestaltet, dass du schnell Anschluss findest, wenn du möchtest. Gleichzeitig ist es völlig in Ordnung, für dich zu bleiben.",
              },
              {
                q: "Wo finde ich Retreats in der Nähe von Hamburg?",
                a: "Auf Das Portal listen wir Retreats in Hamburg und Umgebung — an der Ostsee, in der Lüneburger Heide, im Alten Land und auch in der Stadt selbst. Tritt unserer Telegram-Community bei, um über neue Termine informiert zu werden.",
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
            Kein Retreat verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Retreats
            direkt zugeschickt. Oder trag dich in die Warteliste ein.
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
