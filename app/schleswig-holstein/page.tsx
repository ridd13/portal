import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Schleswig-Holstein — Termine & Community | Das Portal",
  description:
    "Ganzheitliche Events in Schleswig-Holstein: Retreats, Yoga, Meditation und Community-Formate in Kiel, Lübeck, Flensburg und der ganzen Region. Alle Termine auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/schleswig-holstein",
  },
  openGraph: {
    title: "Ganzheitliche Events in Schleswig-Holstein — Das Portal",
    description:
      "Retreats, Yoga, Meditation und ganzheitliche Events in Schleswig-Holstein auf einen Blick.",
    url: "https://das-portal.online/schleswig-holstein",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const categories = [
  {
    title: "Ganzheitliche Events",
    description:
      "Von Kiel bis Flensburg, von Lübeck bis an die Westküste — Retreats, Workshops, Zeremonien und Community-Formate aus ganz Schleswig-Holstein.",
    href: "/schleswig-holstein/ganzheitliche-events",
  },
];

const cities = [
  { name: "Kiel", href: "/events?city=Kiel" },
  { name: "Lübeck", href: "/events?city=Lübeck" },
  { name: "Flensburg", href: "/events?city=Flensburg" },
  { name: "Neumünster", href: "/events?city=Neumünster" },
  { name: "Hamburg", href: "/hamburg" },
];

const faqs = [
  {
    question: "Was sind ganzheitliche Events?",
    answer:
      "Ganzheitliche Events sind Veranstaltungen, die sich mit Körper, Geist und Seele befassen. Dazu gehören Yoga-Klassen, Meditationen, Atemarbeit, Coaching-Sessions, Retreats, Workshops und Community-Treffen. Das Ziel: nicht nur Information zu vermitteln, sondern echte Transformation und Verbindung zu ermöglichen.",
  },
  {
    question: "Wie finde ich Events in meiner Stadt?",
    answer:
      "Das Portal ist nach Städten gefiltert. Wähle Deine Stadt aus (Kiel, Lübeck, Flensburg, Neumünster und weitere) und sieh alle anstehenden Termine auf einen Blick. Alternativ kannst du nach Kategorie filtern — zum Beispiel 'Yoga' oder 'Retreats'. Alles sortiert nach Datum.",
  },
  {
    question: "Ich bin Anfänger. Kann ich trotzdem teilnehmen?",
    answer:
      "Ja, absolut. Die meisten Anbieter arbeiten bewusst mit offenen Gruppen. Nennt sich Hatha-Yoga oder 'Anfänger-freundlich', dann passt es. Im Zweifelsfall kontaktier die Anbieter direkt — jede Session ist für Neueinsteiger offen, wenn nichts anderes angekündigt ist.",
  },
  {
    question: "Was kosten diese Events?",
    answer:
      "Das ist unterschiedlich. Viele Anbieter in SH bieten kostenlose Meditationsabende an. Yoga-Kurse kosten meist 10–20 Euro pro Session. Mehrtägige Retreats (2–7 Tage) kosten je nach Lage und Angebot zwischen 200 und 1500 Euro. Im Portal siehst du die Preisspanne direkt im Event.",
  },
  {
    question: "Wie kann ich meine Events eintragen?",
    answer:
      "Du bist Coach, Yogalehrer oder Facilitator? Über Das Portal meldest du deine Events ein und machst sie sichtbar — kostenlos, ohne versteckte Haken. Schreib uns: Das Portal wächst über Empfehlungen und direkte Ansprache. Dein Netzwerk ist unseres.",
  },
  {
    question: "Gibt es spezielle Retreat-Locations in SH?",
    answer:
      "Ja, viele. Schleswig-Holstein hat historische Gutshöfe (vor allem in der Holsteinischen Schweiz), Seminarhäuser an der Ostsee und auf den Inseln Sylt, Föhr und Amrum. Manche Anbieter buchen auch Natur-Orte wie Seen oder Waldstücke. Das Portal listet Retreats nach Ort auf — praktisch wenn du ein bestimmtes Setting suchst.",
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

export default async function SchleswigHolsteinPage() {
  const supabase = getSupabaseServerClient();

  // Events aus ganz SH laden (alle Städte außer Hamburg)
  const shCities = ["kiel", "lübeck", "luebeck", "flensburg", "neumünster", "neumuenster",
    "norderstedt", "elmshorn", "itzehoe", "husum", "schleswig", "rendsburg",
    "pinneberg", "ahrensburg", "bad segeberg", "eutin", "plön"];

  const orFilter = shCities.map(c => `address.ilike.%${c}%`).join(",");

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, address, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or(orFilter)
    .order("start_at", { ascending: true })
    .limit(8);

  const events = data || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events in Schleswig-Holstein",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Schleswig-Holstein",
    url: "https://das-portal.online/schleswig-holstein",
    itemListElement: events.slice(0, 5).map((event: Record<string, unknown>, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title as string,
        startDate: event.start_at as string,
        location: { "@type": "Place", name: (event.location_name as string) || "Schleswig-Holstein", address: "Schleswig-Holstein" },
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
            Schleswig-Holstein · Ganzheitliche Region
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Schleswig-Holstein
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Retreats in Gutshäusern, Yoga an der Ostsee, Meditationsabende in
            Kiel und Lübeck — Das Portal bündelt alle ganzheitlichen Termine
            der Region.
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
            Nächste Events in Schleswig-Holstein
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Region.`
              : "Aktuell keine Termine — schau bald wieder rein."}
          </p>

          {events.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {events.map((event: Record<string, unknown>) => (
                <Link
                  key={event.id as string}
                  href={`/events/${event.slug}`}
                  className="group rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-text-primary group-hover:text-accent-primary">
                      {event.title as string}
                    </h3>
                    {event.price_model === "free" && (
                      <span className="shrink-0 rounded-full bg-[#edf5e6] px-2 py-0.5 text-xs text-[#4b6841]">
                        kostenlos
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {formatDate(event.start_at as string)} · {formatTime(event.start_at as string)}
                  </p>
                  {Boolean(event.location_name) && (
                    <p className="mt-0.5 text-sm text-text-muted">
                      📍 {event.location_name as string}
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

        {/* Kategorien */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Events nach Kategorie
          </h2>
          <div className="mt-6">
            {categories.map(({ title, description, href }) => (
              <Link
                key={href}
                href={href}
                className="group block rounded-2xl border border-border bg-bg-card p-6 transition-shadow hover:shadow-md"
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

        {/* SEO Content — Hauptartikel */}
        <section className="mt-16 space-y-6 text-text-primary">
          <h2 className="text-2xl font-semibold">
            Ganzheitliche Events in Schleswig-Holstein — was dich erwartet
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Schleswig-Holstein ist die Heimat von Das Portal. Hier zwischen Ostsee und Nordsee hat eine Community aus Coaches, Facilitators, Yogalehrern und Heilpraktikern in den letzten Jahren etwas aufgebaut, das lange unter dem Radar flog: eine wachsende Szene für ganzheitliche Events. Das Portal macht diese Termine endlich sichtbar.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Was war das Problem? Die Events waren verstreut. Eine Yoga-Session am Donnerstag in Kiel angekündigt auf Instagram Stories. Ein Retreat-Wochenende auf einem Gutshof in der Holsteinischen Schweiz zu erfahren nur durch einen Freund. Meditationsabende in Lübeck über lokale Telegram-Gruppen. Kakaozeremonien in Flensburg per Mundpropaganda. Die Qualität war da — die Sichtbarkeit nicht.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Das Portal ändert das. Alle ganzheitlichen Termine aus SH an einem Ort. Filterbar nach Stadt, Kategorie, Datum. Direkt zu den Angeboten. Keine versteckte Algorithmen, keine Marketing-Tricks. Nur gute Events, von Menschen die ihre Sache ernst nehmen.
          </p>

          <h2 className="text-2xl font-semibold">
            Die Szene zwischen den Meeren
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Schleswig-Holstein hat mehrere Zentren mit unterschiedlichen Schwerpunkten. Kiel ist die Landeshauptstadt und hat eine aktive Yoga- und Meditationsszene. In Studios und privaten Lofts laufen regelmäßig Klassen. Das Angebot reicht von klassischem Hatha bis zu Vinyasa-Flows. Parallel gibt es Atemarbeit (Wim-Hof-Methode, Breathwork), Meditationsgruppen und gelegentliche Coaching-Sessions.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Lübeck wiederum hat eine starke Studio-Community. Die Stadt mit der UNESCO-Altstadt ist bekannt für ihre traditionelle Yoga-Schulen und Wellness-Zentren. Das Angebot ist etablierter und größer als in Kiel — mehr Studios, mehr regelmäßige Klassen. Gleichzeitig gibt es aber auch Raum für experimentellere Formate.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Flensburg zeigt eine andere Ausprägung: hier ist die Szene jünger, alternativer, stärker von der dänischen Grenze beeinflusst. Kleinere Gruppen, intimere Formate, weniger Kommerz. Dafür mehr Kreativität und Raum zum Experimentieren. Kakaozeremonien, Frauenkreise, Soundbaths — das funktioniert in Flensburg.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Dann sind da die Landkreise. Die Holsteinische Schweiz mit ihren Seen und Gutshöfen ist eine Hochburg für Retreats. Mehrtägige Intensivprogramme, ruhige Settings, viel Natur. Auch die Inseln — Sylt, Föhr, Amrum — sind beliebte Retreat-Ziele, besonders im Sommer. Kleinere Küstenstädte wie Husum oder Schleswig haben ebenfalls ein Angebot, meist Yoga und Meditation.
          </p>

          <h2 className="text-2xl font-semibold">
            Welche Formate gibt es in Schleswig-Holstein?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Yoga ist die stärkste Kategorie. Das ist nicht überraschend. In Kiel, Lübeck und Flensburg gibt es regelmäßige Yoga-Kurse — von Anfänger-freundlich über Intermediate bis zu intensiven Fortgeschrittenen-Sessions. Hatha, Vinyasa, Kundalini, Power Yoga — das Spektrum ist breiter als viele denken.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Meditation und Achtsamkeit sind die zweite große Kategorie. Geführte Meditationen, Zen-Sitze, Vipassana-Kurse, Stille-Retreats. Viele Anbieter bieten auch Anfänger-Kurse an — gut strukturiert, mit klarer Anleitung. Die Kurse sind meist kostenlos oder zahle-was-du-kannst.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Retreats sind das Besondere in SH. Nicht einzelne Stunden, sondern mehrtägige Intensivprogramme. Auf Gutshöfen, in Waldidyll, an der Küste. Von Yoga-Retreats über Transformations-Wochenenden bis zu stillen Meditationsreisen. Das ist wo SH wirklich glänzt.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Atemarbeit (Breathwork) wird immer beliebter. Wim-Hof-Methode, holotropes Atmen, andere Techniken. Meist in Workshop-Format. Kakaozeremonien gibt es auch, sind aber seltener als in Hamburg oder Berlin. Frauenkreise und Community-Formate wie Singing Bowls oder Soundbaths runden das Angebot ab.
          </p>

          <h2 className="text-2xl font-semibold">
            Für wen sind ganzheitliche Events in Schleswig-Holstein?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Erst mal: für Menschen aus SH. Locals, die nach neuen Angeboten in ihrer Stadt suchen. Vielleicht kennst du bereits Yoga und willst dich vertiefen. Oder du hast noch nie meditiert, aber ein Freund hat dich eingeladen. Das Portal zeigt dir einfach was in deiner Nähe läuft.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Dann gibt es Wochenend-Trippler aus Hamburg. Für viele Hamburger ist SH nah und attraktiv als Retreat-Destination. Ein entspanntes Yoga-Wochenende auf der Ostsee, ein Meditationsretreat auf einem ruhigen Gutshof. Das ist leichter zugänglich als nach Südasien zu reisen.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Dritte Gruppe: Menschen die gezielt Retreats suchen. Ob für Burnout-Erholung, persönliche Entwicklung oder einfach mal Ruhe — SH ist ideal. Du brauchst nicht stundenlang zu fahren. Die Natur ist nah. Die Events sind oft erschwinglicher als größere Studios in München oder Berlin.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Und schließlich: Anfänger. Das Gute an der SH-Szene ist dass sie noch kleiner und persönlicher ist. Du wirst nicht in eine 50-Person-Yoga-Klasse gesteckt, wenn du nicht willst. Viele Anbieter nehmen sich Zeit für Newbies. Es ist niedrigschwellig.
          </p>

          <h2 className="text-2xl font-semibold">
            Schleswig-Holstein als Retreat-Destination
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Das ist das Alleinstellungsmerkmal von SH. Die Retreat-Landschaft ist beeindruckend. Die Gutshöfe der Holsteinischen Schweiz mit ihren alten Häusern, großen Grundstücken und Seen in der Nähe sind ideal. Du hast Ruhe, Natur, Platz. Das Setting trägt selbst schon zur Transformation bei.
          </p>
          <p className="text-text-secondary leading-relaxed">
            An der Ostsee gibt es etablierte Seminarhäuser. Räume mit Yoga-Studios, Schlafplätzen, Gemeinschaftsküchen. Dazu der Klang der Wellen am Morgen. Manche Anbieter nutzen auch private Häuser oder mieten Villen zur Nebensaison. Im Sommer sind die Inseln beliebt — Sylt, Föhr und Amrum haben ein anderes Licht, eine andere Energie.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Die Preise sind realistisch. Ein 3-Tage-Yoga-Retreat kostet etwa 300–600 Euro inkl. Unterkunft und Verpflegung. Das ist deutlich günstiger als in Ballungsräumen. Für Stille-Retreats oder längere Programme kannst du mit 600–1500 Euro rechnen. Es gibt auch Sliding-Scale-Modelle, wo du zahlen kannst was du leisten kannst.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Was macht SH noch reizend? Die Nähe zu Hamburg. Du kannst Freitag fahren, Sonntag zurück. Auch die Dänemark-Nähe bringt gelegentlich Events über die Grenze mit sich. Und am wichtigsten: es ist nicht überlaufen. Die Szene wächst, aber sie ist noch intim.
          </p>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-8">
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-border bg-bg-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  {faq.question}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keine Events verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Melde dich an für Updates zu ganzheitlichen Events in Schleswig-Holstein.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Telegram Community beitreten →
            </Link>
            <Link
              href="/#warteliste"
              className="rounded-full border border-border px-6 py-3 font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Warteliste eintragen
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
