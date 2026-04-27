import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Hamburg — Termine & Community | Das Portal",
  description:
    "Finde ganzheitliche Events in Hamburg: Yoga, Breathwork, Kakaozeremonien, Retreats, Frauenkreise und mehr. Aktuelle Termine aus der Hamburger Community auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/hamburg",
  },
  openGraph: {
    title: "Ganzheitliche Events in Hamburg — Das Portal",
    description:
      "Alle ganzheitlichen Events in Hamburg auf einen Blick. Yoga, Meditation, Breathwork, Kakaozeremonien und Retreats.",
    url: "https://das-portal.online/hamburg",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const categories = [
  {
    title: "Ganzheitliche Events",
    description:
      "Yoga, Breathwork, Meditation, Ecstatic Dance, Retreats und mehr — das volle Spektrum ganzheitlicher Formate in Hamburg.",
    href: "/hamburg/ganzheitliche-events",
  },
  {
    title: "Spirituelle Events",
    description:
      "Kakaozeremonien, Mondrituale, Frauenkreise, Soundhealing und zeremonielle Formate in Hamburg.",
    href: "/hamburg/spirituelle-events",
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HamburgPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Hamburg%,address.ilike.%hamburg%")
    .order("start_at", { ascending: true })
    .limit(8);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events in Hamburg",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Hamburg",
    url: "https://das-portal.online/hamburg",
    itemListElement: events.slice(0, 5).map((event: Event, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
        location: {
          "@type": "Place",
          name: event.location_name || "Hamburg",
          address: "Hamburg",
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
            Hamburg · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Hamburg
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Hamburg hat eine der aktivsten ganzheitlichen Communities in
            Norddeutschland. Das Portal bündelt alle Termine — von Breathwork
            über Kakaozeremonien bis zu Retreats an der Alster.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Hamburg"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Hamburg Events →
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
            Nächste Events in Hamburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Hamburger Community.`
              : "Aktuell keine Termine — schau bald wieder rein."}
          </p>

          {events.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {events.map((event: Event) => (
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
                  {Boolean(event.location_name) && (
                    <p className="mt-0.5 text-sm text-text-muted">
                      📍 {event.location_name}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/events?city=Hamburg"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Hamburg Events anzeigen →
            </Link>
          </div>
        </section>

        {/* Kategorien */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Events nach Kategorie
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {categories.map(({ title, description, href }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-border bg-bg-card p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="text-xl font-semibold text-text-primary group-hover:text-accent-primary">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {description}
                </p>
                <span className="mt-4 inline-block text-sm text-accent-primary">
                  Termine ansehen →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Hamburg — was dich erwartet
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Hamburg ist Norddeutschlands ganzheitliche Hochburg. In der Hansestadt haben sich Yoga-Studios, Healing-Räume und Facilitators aus aller Welt angesiedelt. Das Schanzenviertel mit seinen coolen Locations, das familienfreundliche Altona mit seinen Wellness-Studios, das bunte Eimsbüttel mit seinen Community-Räumen — die Stadt ist ein Biotop für Menschen die sich selbst und anderen helfen wollen.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Was Hamburg besonders macht: es gibt kein "typisch" ganzheitlich. In der gleichen Woche findest du hier Ecstatic Dance neben klassischem Hatha Yoga, Kakaozeremonien neben wissenschaftlich fundiertem Breathwork, Moonlight-Frauenkreise neben Taiji im Stadtpark. Viele Anbieter sind hier beheimatet, andere reisen an. Das bedeutet: konstantes Angebot, ständig neue Formate, verschiedene Preisklassen, unterschiedliche Sprachen.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Das macht die Szene reich. Es macht sie aber auch fragmentiert. Termine sind verteilt über Dutzende Instagram-Accounts, Telegram-Kanäle, WhatsApp-Gruppen und persönliche Netzwerke. Genau dafür gibt es Das Portal — eine zentrale Übersicht, unabhängig davon ob der Facilitator Instagram nutzt oder nicht.
            </p>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Welche ganzheitlichen Events gibt es in Hamburg?
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Die Bandbreite ist gross. Grob lassen sich die Formate in einige Kategorien aufteilen, aber es gibt Überschneidungen:
            </p>
            <div className="space-y-4 pl-4 border-l border-border">
              <div>
                <h3 className="font-semibold text-text-primary">Körperarbeit</h3>
                <p className="mt-1 text-text-secondary leading-relaxed">
                  Yoga (klassische Styles wie Hatha, Vinyasa, Yin), Ecstatic Dance, Contact Improvisation, Feldenkrais, Pilates, bewusste Bewegungsformen. Die meisten Studios und Studios sind in Altona, Eimsbüttel und St. Pauli konzentriert.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Atemarbeit</h3>
                <p className="mt-1 text-text-secondary leading-relaxed">
                  Breathwork in verschiedenen Stilen, Pranayama, holotrope Atemarbeit. Atemarbeit schafft schnelle Shifts im Nervensystem — die Formate sind intensiv, fokussiert und haben oft therapeutische Komponenten.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Zeremonielle Formate</h3>
                <p className="mt-1 text-text-secondary leading-relaxed">
                  Kakaozeremonien, Mondrituale, Frauenkreise, Soundhealing, Gong-Sessions. Diese Events haben oft einen gemeinschaftlichen, meditativen oder zelebrierenden Charakter. Sie finden in Studios, Räumen und teils privaten Locations statt.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Retreats</h3>
                <p className="mt-1 text-text-secondary leading-relaxed">
                  Mehrtägige intensive Formate. Viele finden in Hamburg statt, manche auch an der Alster, auf den Inseln vor Hamburg oder in der Lüneburger Heide. Das sind oft die immersiven Erfahrungen für tiefere Arbeit.
                </p>
              </div>
            </div>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Die Hamburger Szene: Was sie besonders macht
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Hamburg hat eine einzigartige Mischung. Auf der einen Seite: eine grosse internationale Community. Menschen aus Brasilien, Kolumbien, Spanien, Australien haben hier ihre Wurzeln geschlagen und unterrichten ihre Praktiken. Das bringt Vielfalt, neue Stile und Cross-Pollination.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Auf der anderen Seite: eine solide lokale Basis. Es gibt Praktiker:innen mit 10, 20 Jahren Erfahrung. Es gibt etablierte Studios und vertrauensvolle Netzwerke. Das bedeutet Kontinuität und Qualität.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Das ist auch die Crux. Nur die Hälfte dieser Events ist auf Instagram zu finden. Die andere Hälfte verbreitet sich über Mundpropaganda, Telegram-Gruppen, Email-Listen oder private Kanäle. Ein:e Neuankömmling oder Interessierte:r kann leicht 80% der Events verpassen — einfach weil sie nicht im "öffentlichen" Internet sind.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Das Portal löst das Problem: Alle Termine an einem Ort, unabhängig von Marketing-Kanälen. Die Facilitators tragen ihre Events ein, oder Operator wie wir helfen dabei. Das Ergebnis ist eine transparente, zentrale Übersicht der ganzheitlichen Hamburg-Szene.
            </p>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Hamburg?
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Kurze Antwort: für Dich. Egal ob Du vollkommener Anfänger:in bist oder schon seit Jahren meditierst, Yoga machst oder mit Atemarbeit arbeitest.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Die meisten Formate sind bewusst offen und niedrigschwellig gestaltet. "Anfänger:innen willkommen" ist Standard, nicht Ausnahme. Kaum ein Event erfordert Vorerfahrung. Bei Yoga-Klassen wird dir gezeigt wie du Haltungen modifizieren kannst. Bei Kakaozeremonien sitzt du mit, wenn du dich bereit fühlst, kannst auch einfach dabei sein. Bei Breathwork erklärt der:die Facilitator:in vorher was passiert.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Manche Menschen kommen allein, andere mit Freund:innen. Beide funktionieren. Die Szene ist mixgender, altersdivers, und die meisten Räume sind wirklich herzlich wenn Neuankömmende kommen.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Es gibt auch nichts zu verlieren. Du magst ein Event nicht? Dann probierst du das nächste. Die Vielfalt auf Das Portal bedeutet, dass du wahrscheinlich etwas findest das sich für dich richtig anfühlt.
            </p>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Preise, Anmeldung und was du mitbringst
            </h2>
            <p className="text-text-secondary leading-relaxed">
              <strong>Kostenlos:</strong> Viele Community-Events. Manche sind Spendendasis, manche wirklich umsonst. Diese Formate sind oft klein und persönlich.
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>Workshops & Einzelklassen:</strong> Meist 20–80 EUR. Yoga-Klassen in Studios oft im unteren Bereich (20–35 EUR), spezialisierte Workshops wie Breathwork oder Kakaozeremonien eher 40–80 EUR.
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>Mehrteilige Serien & Retreats:</strong> 200–500+ EUR. Das sind intensive Erfahrungen über mehrere Tage oder Wochen.
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>Anmeldung:</strong> Events haben meistens einen Ticket-Link (Eventbrite, Ticketmaster, eigenes System, oder PayPal). Manchmal auch einfach Email-Registrierung. Du rufst das Event-Profil auf Das Portal auf und siehst sofort wie du dich anmeldest.
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>Was du mitbringst:</strong> Das ist ganz einfach. Für Yoga: eine Yogamatte (oder eine wird bereitgestellt), bequeme Kleidung, Wasser. Für Atemarbeit: bequeme Kleidung, leerer Magen (eine Stunde vorher nicht viel essen), offene Haltung. Für Kakaozeremonien: dich selbst und eine Bereitschaft für Ruhe und Gemeinschaft. Die meisten Anbieter:innen schreiben dazu was du konkret brauchst.
            </p>
          </article>
        </section>

        {/* FAQs */}
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-4">
            <details className="group rounded-2xl border border-border bg-bg-card p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-text-primary">
                Was genau sind ganzheitliche Events?
                <span className="transition-transform group-open:rotate-180">+</span>
              </summary>
              <div className="mt-4 space-y-3 text-text-secondary leading-relaxed">
                <p>
                  Ganzheitliche Events beschäftigen sich mit Körper, Geist und Seele zusammen. Das Gegenteil von Separation. Das können Yoga-Klassen sein, Atemarbeit, Meditation, Tanzen, Heilkreise, Soundhealing — alles Formate die davon ausgehen, dass Mensch ein integrates System ist, kein nur-Körper und kein nur-Verstand.
                </p>
                <p>
                  Die philosophische Wurzel ist in vielen Traditionen (Yoga, Ayurveda, Schamanismus, Taoismus) zu finden. Modern ausgedrückt: Formate bei denen es um inneres Wachstum, physisches Wohlbefinden und Community auf einer tieferen Ebene geht.
                </p>
              </div>
            </details>

            <details className="group rounded-2xl border border-border bg-bg-card p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-text-primary">
                Wie finde ich aktuelle ganzheitliche Events in Hamburg?
                <span className="transition-transform group-open:rotate-180">+</span>
              </summary>
              <div className="mt-4 space-y-3 text-text-secondary leading-relaxed">
                <p>
                  Das ist genau wofür Das Portal da ist. Ganz oben auf dieser Seite siehst du die nächsten Events in Hamburg aufgelistet. Du kannst auch nach Kategorie filtern (Ganzheitliche Events vs. Spirituelle Events) oder alle Hamburg-Events auf der Übersichtsseite ansehen.
                </p>
                <p>
                  Zusätzlich: Treten der Telegram-Community bei (Button auf dieser Seite). Dort geben wir schnelle Updates wenn neue Events hinzukommen.
                </p>
              </div>
            </details>

            <details className="group rounded-2xl border border-border bg-bg-card p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-text-primary">
                Sind die Events für Anfänger:innen geeignet?
                <span className="transition-transform group-open:rotate-180">+</span>
              </summary>
              <div className="mt-4 space-y-3 text-text-secondary leading-relaxed">
                <p>
                  Ja, fast alle. Die ganzheitliche Community in Hamburg ist bewusst anfänger:innenfreundlich. Es gibt kein "du musst vorher X Jahr Yoga gemacht haben" oder "nur für Experten". Alle Events auf Das Portal sind offen für Anfänger:innen, wenn nicht explizit anders angegeben.
                </p>
                <p>
                  Wenn du nervös bist: Komm früh an, red mit dem:der Facilitator:in. Die Hamburg-Szene ist wirklich herzlich.
                </p>
              </div>
            </details>

            <details className="group rounded-2xl border border-border bg-bg-card p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-text-primary">
                Was kosten ganzheitliche Events in Hamburg?
                <span className="transition-transform group-open:rotate-180">+</span>
              </summary>
              <div className="mt-4 space-y-3 text-text-secondary leading-relaxed">
                <p>
                  Das ist sehr unterschiedlich: von kostenlos (Community Events) bis 80 EUR für spezialisierte Workshops. Yoga-Klassen in Studios kosten meist 20–35 EUR. Breathwork oder Kakaozeremonien 40–80 EUR. Mehrtägige Retreats 200–500+ EUR.
                </p>
                <p>
                  Die meisten Events sind bezahlbar und es gibt oft Rabatte wenn du mehrere Klassen buchen möchtest. Check das Event-Profil auf Das Portal für genaue Preise.
                </p>
              </div>
            </details>

            <details className="group rounded-2xl border border-border bg-bg-card p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-text-primary">
                Kann ich als Anbieter:in meine Events auf Das Portal eintragen?
                <span className="transition-transform group-open:rotate-180">+</span>
              </summary>
              <div className="mt-4 space-y-3 text-text-secondary leading-relaxed">
                <p>
                  Ja. Du kannst auf Das Portal ein Profil (Host-Profil) erstellen und deine Events selbst hochladen. Das funktioniert für Studios, einzelne Facilitators, Healing-Räume, alle Formate.
                </p>
                <p>
                  Klick auf "Eintragen" oben in der Navigation um zu starten. Wir unterstützen auch wenn du Fragen hast.
                </p>
              </div>
            </details>

            <details className="group rounded-2xl border border-border bg-bg-card p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-text-primary">
                Gibt es auch Retreats in der Nähe von Hamburg?
                <span className="transition-transform group-open:rotate-180">+</span>
              </summary>
              <div className="mt-4 space-y-3 text-text-secondary leading-relaxed">
                <p>
                  Ja, viele. Nicht nur in Hamburg selbst, sondern auch in Schleswig-Holstein (Lüneburger Heide, Inseln, Küste), Bremen, und sogar internationale Retreats werden oft von Hamburg aus organisiert.
                </p>
                <p>
                  Auf Das Portal siehst du alle Retreats in der Region mit Filterung. Manche Facilitators organisieren auch regelmässig mehrtägige Programme.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keine Events verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt der Telegram-Community bei und bekomm neue Events direkt
            zugeschickt.
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
