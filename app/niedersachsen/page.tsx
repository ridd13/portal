import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Niedersachsen — Termine & Community | Das Portal",
  description:
    "Ganzheitliche Events in Niedersachsen: Retreats, Yoga, Meditation und Community-Formate in Hannover, Braunschweig, Oldenburg, Lüneburg und der ganzen Region.",
  alternates: {
    canonical: "https://das-portal.online/niedersachsen",
  },
  openGraph: {
    title: "Ganzheitliche Events in Niedersachsen — Das Portal",
    description:
      "Retreats, Yoga, Meditation und ganzheitliche Events in Niedersachsen auf einen Blick.",
    url: "https://das-portal.online/niedersachsen",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const cities = [
  { name: "Hannover", href: "/events?city=Hannover" },
  { name: "Braunschweig", href: "/events?city=Braunschweig" },
  { name: "Oldenburg", href: "/events?city=Oldenburg" },
  { name: "Lüneburg", href: "/events?city=Lüneburg" },
  { name: "Osnabrück", href: "/events?city=Osnabrück" },
  { name: "Göttingen", href: "/events?city=Göttingen" },
  { name: "Wolfsburg", href: "/events?city=Wolfsburg" },
  { name: "Bremen", href: "/bremen" },
  { name: "Hamburg", href: "/hamburg" },
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

export default async function NiedersachsenPage() {
  const supabase = getSupabaseServerClient();

  const nsCities = ["hannover", "braunschweig", "oldenburg", "lüneburg", "lueneburg",
    "osnabrück", "osnabrueck", "göttingen", "goettingen", "wolfsburg", "hildesheim",
    "salzgitter", "delmenhorst", "wilhelmshaven", "celle", "leer", "emden",
    "cuxhaven", "stade", "niedersachsen"];

  const orFilter = nsCities.map(c => `address.ilike.%${c}%`).join(",");

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, address, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or(orFilter)
    .order("start_at", { ascending: true })
    .limit(8);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events in Niedersachsen",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Niedersachsen",
    url: "https://das-portal.online/niedersachsen",
    itemListElement: events.slice(0, 5).map((event: Event, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
        location: { "@type": "Place", name: event.location_name || "Niedersachsen", address: "Niedersachsen" },
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
            Niedersachsen · Ganzheitliche Region
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Niedersachsen
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Von Hannover bis zur Nordsee, von Lüneburg bis Göttingen —
            Niedersachsen hat eine wachsende ganzheitliche Community.
            Das Portal bündelt alle Termine der Region.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Events ansehen →
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
            Nächste Events in Niedersachsen
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Region.`
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
                      {event.location_name}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/events"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Events anzeigen →
            </Link>
          </div>
        </section>

        {/* Städte */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">
            Events nach Stadt
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Niedersachsen — was dich erwartet
            </h2>
            <div className="mt-4 space-y-4 text-text-secondary leading-relaxed">
              <p>
                Niedersachsen ist das zweitgrößte Bundesland Deutschlands — und entsprechend vielfältig. Von der urbanen Energie Hannovers mit seinen alternativen Vierteln wie Linden und Nordstadt bis zu den weiten Natur-Räumen der Lüneburger Heide, vom Harz mit seinen Waldretreats bis zu den Nordsee-Inseln: Die Kulisse für ganzheitliche Events könnte kaum unterschiedlicher sein.
              </p>
              <p>
                Was macht Niedersachsen als Ort für ganzheitliche Formate interessant? Es ist die Mischung. In den Städten findest du spezialisierte Studios und Communities mit erfahrenen Teachers. Im ländlichen Raum locken großzügige Retreat-Räume — Bauernhöfe, umgebaute Gutshöfe, Seminarhäuser direkt neben der Natur. Und für viele Praktizierende ist Niedersachsen ohne Fernverkehr von Hamburg, Bremen oder Berlin erreichbar.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Szene in Niedersachsen: Vielfältiger als gedacht
            </h2>
            <div className="mt-4 space-y-4 text-text-secondary leading-relaxed">
              <p>
                <strong>Hannover</strong> ist der urbane Kern. Die Stadt hat eine etablierte Yoga- und Meditationsszene mit Studios, deren Angebote von klassischem Hatha über Vinyasa bis zu Yin-Yoga reichen. Die Bezirke Linden und Nordstadt sind traditionell die Hotspots für alternative Kultur — dort findest du auch Breathwork-Workshops, Schamanische Zeremonien und kleinere Community-Events.
              </p>
              <p>
                <strong>Lüneburg</strong> ist etwas Besonderes. Die Universitätsstadt hat einen unerwarteten Reichtum an ganzheitlichen Angeboten entwickelt. Hier treffen sich kreative Menschen, der Spirit ist offener als in manchen größeren Städten. Die Nähe zu Hamburg hilft — etablierte Teachers pendeln zwischen beiden Städten. Plus: Lüneburg sitzt direkt an der Lüneburger Heide, der klassischen Retreat-Region Norddeutschlands.
              </p>
              <p>
                <strong>Oldenburg, Braunschweig, Göttingen, Osnabrück</strong> — jede Stadt hat ihre eigene, oft überraschend lebendige Community. Oldenburg profitiert von der kulturellen Tradition, Göttingen von der Studentenschaft, Braunschweig und Osnabrück haben unterschätzte Yoga- und Meditationsszenen.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Formate gibt es?
            </h2>
            <div className="mt-4 space-y-4 text-text-secondary leading-relaxed">
              <p>
                <strong>Yoga</strong> ist der Klassiker — in verschiedensten Varianten. <strong>Meditation und Achtsamkeit</strong> wachsen konstant, besonders in den Städten. <strong>Retreat-Wochenenden</strong> und mehrtägige Formate boomen, getragen von den Kapazitäten in der Lüneburger Heide, im Harz und auf den Nordsee-Inseln wie Juist, Norderney und Langeoog.
              </p>
              <p>
                <strong>Breathwork und spezifische Techniken</strong> (Wim Hof, Holotropes Atmen) wachsen vor allem in den Städten. <strong>Kakaozeremonien und Schamanische Kreise</strong> sind noch Nischen, aber vorhanden und wachsend. Besonders in jüngerer Zeit entstehen <strong>Kontemplations-Retreats</strong> und <strong>Natur-Immersions-Programme</strong> — der Harz und die Heide sind dafür prädestiniert.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Niedersachsen?
            </h2>
            <div className="mt-4 space-y-4 text-text-secondary leading-relaxed">
              <p>
                Diese Frage beantwortet sich selbst: Für dich, wenn du in Niedersachsen lebst oder regelmäßig dort bist. Aber auch für viele Pendler aus Hamburg, Bremen und Osnabrücker Land, die gerne auch mal raus in die Natur fahren für ein Wochenend-Retreat.
              </p>
              <p>
                Sichtbar wird die Vielfalt in den Events selbst: <strong>Urban Professionals in Hannover</strong> nutzen Mittags-Yoga und After-Work-Meditationen. <strong>Studierende in Göttingen und Lüneburg</strong> sind oft kostenbewusst und suchen günstige oder kostenlose Angebote. <strong>Natursucher und Retreat-Gänger</strong> pendeln gezielt in die Heide und in den Harz — auch überregional. Und überall findest du Menschen, die ohne Vorerfahrung anfangen und in einer offenen Community aufgefangen werden möchten.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Niedersachsen als Retreat-Region
            </h2>
            <div className="mt-4 space-y-4 text-text-secondary leading-relaxed">
              <p>
                Das Besondere an Niedersachsen für mehrtägige Events: Du brauchst nicht in die Schweiz oder nach Österreich fahren. Die <strong>Lüneburger Heide</strong> ist eine der klassischen Retreat-Destinationen Deutschlands — endlose Flächen, Ruhe, Geschichte, und etablierte Retreat-Häuser mit guter Infrastruktur.
              </p>
              <p>
                Der <strong>Harz</strong> bietet Berglandschaften, Wanderungen und spezialisierte Seminarhäuser. Die <strong>Nordsee-Inseln</strong> (Juist, Norderney, Langeoog, Wangerooge) sind ideal für Intensiv-Wochen, besonders im Frühjahr und Herbst. Und überraschend unterschätzt: die <strong>Weserbergland</strong>-Region mit umgebauten Bauernhöfen und grünen Hanglagen.
              </p>
              <p>
                Preis-leistungs-Verhältnis ist auf diesem Niveau deutlich besser als in Bayern oder Baden-Württemberg. Transport ist einfach — gute Bahn-Anbindung, Parkplätze nicht knapp. Das macht Niedersachsen zu einer praktischen Retreat-Region, gerade für längerfristige Programme oder wiederholte Events.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufig gefragt
          </h2>

          <div className="space-y-4">
            <details className="group cursor-pointer rounded-lg border border-border bg-bg-card p-5 transition-all hover:border-accent-primary">
              <summary className="flex items-center justify-between font-medium text-text-primary">
                <span>Was sind ganzheitliche Events?</span>
                <span className="text-lg text-accent-primary group-open:rotate-180 transition-transform">→</span>
              </summary>
              <div className="mt-4 text-text-secondary leading-relaxed">
                <p>
                  Ganzheitliche Events sind Formate, die Körper, Geist und Seele ansprechen. Yoga, Meditation, Atemarbeit, Tantra, Schamanismus, Kakaozeremonien, Kontemplatione-Retreats — all das gehört dazu. Der gemeinsame Nenner: Es geht nicht nur um Wissen, sondern um direktes, unmittelbares Erleben und Transformation. Oft sind die Events mehrstündig oder mehrtägig, nicht selten mit Übernachtung.
                </p>
              </div>
            </details>

            <details className="group cursor-pointer rounded-lg border border-border bg-bg-card p-5 transition-all hover:border-accent-primary">
              <summary className="flex items-center justify-between font-medium text-text-primary">
                <span>Wie finde ich Events in Niedersachsen?</span>
                <span className="text-lg text-accent-primary group-open:rotate-180 transition-transform">→</span>
              </summary>
              <div className="mt-4 text-text-secondary leading-relaxed">
                <p>
                  Du bist gerade richtig. Auf dieser Seite siehst du aktuelle Termine aus Niedersachsen. Nutze die Filter nach Stadt (oben) um in deiner Nähe zu suchen, oder schau auf der Seite "Alle Events" für eine größere Liste. Du kannst auch unseren Telegram-Kanal abonnieren — dort werden neue Events direkt angekündigt.
                </p>
              </div>
            </details>

            <details className="group cursor-pointer rounded-lg border border-border bg-bg-card p-5 transition-all hover:border-accent-primary">
              <summary className="flex items-center justify-between font-medium text-text-primary">
                <span>Ich bin kompletter Anfänger — passe ich dazu?</span>
                <span className="text-lg text-accent-primary group-open:rotate-180 transition-transform">→</span>
              </summary>
              <div className="mt-4 text-text-secondary leading-relaxed">
                <p>
                  Ja. Die große Mehrheit der Anbieter im Portal arbeitet bewusst anfängerfreundlich. Auf jeder Event-Seite siehst du, ob Vorerfahrung nötig ist — wenn nicht erwähnt, ist es offen für alle. Das Schöne an der ganzheitlichen Community ist die Offenheit. Viele Menschen beginnen genau so, wie du jetzt.
                </p>
              </div>
            </details>

            <details className="group cursor-pointer rounded-lg border border-border bg-bg-card p-5 transition-all hover:border-accent-primary">
              <summary className="flex items-center justify-between font-medium text-text-primary">
                <span>Was kosten ganzheitliche Events?</span>
                <span className="text-lg text-accent-primary group-open:rotate-180 transition-transform">→</span>
              </summary>
              <div className="mt-4 text-text-secondary leading-relaxed">
                <p>
                  Sehr unterschiedlich. Einige Meditationen und Yoga-Kurse sind kostenlos oder zahle-was-du-kannst. Einzelne Workshops liegen zwischen 15 und 60 Euro. Retreat-Wochenenden in der Heide oder im Harz kosten je nach Länge und Ausstattung zwischen 150 und 600 Euro inkl. Unterkunft. Es gibt für (fast) jedes Budget etwas.
                </p>
              </div>
            </details>

            <details className="group cursor-pointer rounded-lg border border-border bg-bg-card p-5 transition-all hover:border-accent-primary">
              <summary className="flex items-center justify-between font-medium text-text-primary">
                <span>Wie trage ich meine Events ein?</span>
                <span className="text-lg text-accent-primary group-open:rotate-180 transition-transform">→</span>
              </summary>
              <div className="mt-4 text-text-secondary leading-relaxed">
                <p>
                  Kostenlos und ohne versteckte Gebühren. Besuch die Seite <Link href="/#warteliste" className="text-accent-primary hover:underline">Eintragen</Link>, fülle das Formular aus und schreib uns eine kurze Nachricht. Wir überprüfen die Infos und aktivieren dein Event dann. Oder schreib direkt an unseren <Link href="https://t.me/+C1QQY29LZlExZWIy" target="_blank" className="text-accent-primary hover:underline">Telegram-Kanal</Link>.
                </p>
              </div>
            </details>

            <details className="group cursor-pointer rounded-lg border border-border bg-bg-card p-5 transition-all hover:border-accent-primary">
              <summary className="flex items-center justify-between font-medium text-text-primary">
                <span>Welche Retreat-Locations gibt es in Niedersachsen?</span>
                <span className="text-lg text-accent-primary group-open:rotate-180 transition-transform">→</span>
              </summary>
              <div className="mt-4 text-text-secondary leading-relaxed">
                <p>
                  Hauptregionen sind die <strong>Lüneburger Heide</strong> (etablierte Seminarhäuser, idyllisch), der <strong>Harz</strong> (Bergnatur, Wanderungen), die <strong>Nordsee-Inseln</strong> (Juist, Norderney, Langeoog — intensiv und abgeschieden) und die <strong>Weserbergland</strong> (Bauernhöfe, weniger touristisch). Viele Events sind über die Such-Funktion mit "Retreat" oder "Wochenende" zu finden.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* CTA Warteliste */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keine Events verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Trag dich ein und bleib über neue Termine in Niedersachsen informiert.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/#warteliste"
              className="rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Eintragen →
            </Link>
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-6 py-3 font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Telegram Community
            </Link>
          </div>
        </section>

        {/* CTA Anbieter */}
        <section className="mt-10 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Du bist Anbieter in Niedersachsen?
          </h2>
          <p className="mt-3 text-text-secondary">
            Mach deine Events sichtbar — kostenlos, ohne Haken.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/#warteliste"
              className="rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Event eintragen →
            </Link>
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-6 py-3 font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Telegram Community
            </Link>
          </div>
        </section>

        {/* Nachbar-Regionen */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">
            Weitere Regionen
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { name: "Hamburg", href: "/hamburg" },
              { name: "Bremen", href: "/bremen" },
              { name: "Schleswig-Holstein", href: "/schleswig-holstein" },
              { name: "Mecklenburg-Vorpommern", href: "/mecklenburg-vorpommern" },
            ].map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
