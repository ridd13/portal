import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Mecklenburg-Vorpommern — Termine & Community | Das Portal",
  description:
    "Ganzheitliche Events in Mecklenburg-Vorpommern: Retreats, Yoga, Meditation und Community-Formate in Rostock, Schwerin, Greifswald, Stralsund und der ganzen Region.",
  alternates: {
    canonical: "https://das-portal.online/mecklenburg-vorpommern",
  },
  openGraph: {
    title: "Ganzheitliche Events in Mecklenburg-Vorpommern — Das Portal",
    description:
      "Retreats, Yoga, Meditation und ganzheitliche Events in Mecklenburg-Vorpommern auf einen Blick.",
    url: "https://das-portal.online/mecklenburg-vorpommern",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const cities = [
  { name: "Rostock", href: "/rostock" },
  { name: "Schwerin", href: "/events?city=Schwerin" },
  { name: "Greifswald", href: "/events?city=Greifswald" },
  { name: "Stralsund", href: "/events?city=Stralsund" },
  { name: "Wismar", href: "/events?city=Wismar" },
  { name: "Rügen", href: "/events?city=Rügen" },
  { name: "Usedom", href: "/events?city=Usedom" },
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

export default async function MecklenburgVorpommernPage() {
  const supabase = getSupabaseServerClient();

  const mvCities = ["rostock", "schwerin", "greifswald", "stralsund", "wismar",
    "warnemünde", "warnemuende", "rügen", "ruegen", "usedom", "güstrow",
    "neubrandenburg", "waren", "müritz", "mecklenburg", "vorpommern"];

  const orFilter = mvCities.map(c => `address.ilike.%${c}%`).join(",");

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
    name: "Ganzheitliche Events in Mecklenburg-Vorpommern",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Mecklenburg-Vorpommern",
    url: "https://das-portal.online/mecklenburg-vorpommern",
    itemListElement: events.slice(0, 5).map((event: Record<string, unknown>, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title as string,
        startDate: event.start_at as string,
        location: { "@type": "Place", name: (event.location_name as string) || "Mecklenburg-Vorpommern", address: "Mecklenburg-Vorpommern" },
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
            Mecklenburg-Vorpommern · Ganzheitliche Region
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Mecklenburg-Vorpommern
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Retreats an der Ostsee, Yoga auf Rügen, Meditationsabende in
            Rostock und Schwerin — Das Portal bündelt alle ganzheitlichen
            Termine aus MV.
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
            Nächste Events in Mecklenburg-Vorpommern
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
                      {event.location_name as string}
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
          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Mecklenburg-Vorpommern — was dich erwartet
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Mecklenburg-Vorpommern ist kein Zufall als Retreat-Destination. Die Region bietet etwas, das sich in dichter besiedelten Bundesländern nur schwer realisieren lässt: Stille, Raum und eine Natur, die wirklich beeindruckt. Wenn du ein ganzheitliches Event in MV suchst, wirst du wahrscheinlich weniger urbane Yoga-Kurse finden, dafür aber desto mehr Retreats an Orten, die tatsächlich transformativ wirken können.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Rügen mit seiner zerklüfteten Kreideküste, der Darß mit seinen Waldlandschaften, die Mecklenburgische Seenplatte mit über 1000 Seen, und Usedom mit seinen breiten Sandstränden — das sind die Orte, die ganzheitliche Formate prägen. Hier entstehen nicht eben mal ein Yoga-Workshop. Hier finden mehrtägige Retreats statt, wo Menschen wirklich ankommen. Gutshäuser und umgebaute Landhäuser in dieser Region sind über die Jahre zur ersten Wahl für Retreat-Anbieter geworden. Viele davon haben inzwischen mehrjährige Wartelisten.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Das Portal bündelt jetzt erstmals alle ganzheitlichen Veranstaltungen in Mecklenburg-Vorpommern — egal ob in der Küstenstadt Rostock, im Schlossseenparadies um Schwerin oder auf einer der Inseln. So kannst du überhaupt erst einmal überblicken, was es in MV gibt. Und als Anbieter wird deine Veranstaltung endlich zentral sichtbar statt in lokalen Facebook-Gruppen zu verschwinden.
            </p>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Die Szene in MV: Natur als Fundament
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Wenn du auf ganzheitliche Events im Süden Deutschlands schaust, findest du oft ein großes Angebot an wöchentlichen Kursen, Zirkelgruppen und lokalen Communities. Mecklenburg-Vorpommern funktioniert anders. Hier dreht sich vieles um mehrtägige Formate — das ist nicht ein Nachteil, sondern die Stärke der Region. Outdoor-Yoga an der Steilküste von Rügen. Waldlicht-Meditationen im Forst. Silent Retreats auf Hiddensee. Strandhaus-Seminare auf Usedom mit Blick auf den Polen. Das ist MV.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Die urbanen Zentren wie Rostock und Schwerin haben natürlich auch ihre Communities: regelmäßige Meditationsabende, Yoga-Studios, Breathwork und gelegentliches Soundhealing. Greifswald mit seiner Universität bringt eine jüngere, experimentelle Energie in die Szene. Stralsund und Wismar, beide UNESCO-Welterbe-Städte mit maritimer Geschichte, ziehen eher reflektive und spirituelle Menschen an. Aber das Rückgrat der ganzheitlichen Szene in MV ist und bleibt die Natur und die Retreat-Formate, die sie ermöglicht.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Ein wichtiger Punkt: Die Szene wächst. Noch vor fünf Jahren waren Retreat-Gutshöfe Rarität. Jetzt gibt es sie an der Darßer Küste, in der Seenplatte, auf Rügen, auf Usedom. Facilitators aus Hamburg, Berlin und Köln buchen sich in MV Häuser für ihre Program me. Und die lokalen Anbieter werden professioneller. Das Portal soll diese Professionalisierung unterstützen, indem es sichtbar macht, was läuft.
            </p>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Welche Formate gibt es in Mecklenburg-Vorpommern?
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Die Top-Kategorie: <strong>Retreats</strong>. Das ist die DNA von MV. Ob 2-Tage-Intensiv, Wochenendretreat oder ganze Wochen — Retreats nutzen die Landschaft. Meditationsretreats sind dabei und bleiben klassisch. Daneben wachsen Yoga-Retreats stark (vor allem Yin & Yang, weniger Power Yoga). Und es gibt Spezial-Formate: Soundbaths in Gutshöfen, Tarot-Retreats, Coaching-Intensives mit Waldarbeit, Atemwegseminare in der Salzluft der Küste.
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>Yoga</strong> ist überall: von traditionellem Hatha in Rostock bis zu Kirtan-Sessions auf der Insel. <strong>Meditation</strong> findet du in regelmäßigen Gruppen in den Städten, aber auch als Tagesworkshops. <strong>Breathwork</strong> ist kleiner, aber aktiv. <strong>Soundhealing</strong> wächst — es gibt Anbieter, die spezialisierte Räume mit Gongs und Klangschalen betreiben.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Was es weniger gibt: wöchentliche Kurse über längere Zeiträume (eher Workshops und Intensives). Das heißt aber nicht, dass die Szene schwach ist — es bedeutet nur, dass MV eine Sommerdestination ist. Von Mai bis September konzentriert sich das Event-Angebot. Winter ist ruhiger, aber gerade deshalb attraktiv für stille, innenorientierte Retreats.
            </p>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Mecklenburg-Vorpommern?
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Hauptsächlich drei Gruppen: Die erste sind Menschen aus Hamburg und Berlin, die bewusst ausbrechen. Sie fahren nach Rügen oder in die Seenplatte, um aus den Großstädten herauszukommen, aber nicht so weit, dass es unbequem wird. München ist 8 Stunden entfernt. Rostock von Berlin aus 2 Stunden mit dem Auto. Diese Gruppe macht eine große Anzahl der Retreat-Besucher aus.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Die zweite Gruppe sind die Locals — Leute, die in MV leben und ihre eigene kleine Gemeinschaft aufbauen. Sie nutzen das Portal und die Telegram-Community, um herauszufinden, was in der Nähe läuft. Diese Gruppe ist oft älter, netzwerkig und bleibt länger treu.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Die dritte Gruppe sind Neuankommer: Menschen, die aus anderen Bundesländern zuziehen, gerade das Netzwerk aufbauen und durch ganzheitliche Events sofort mit ähnlich orientierten Menschen in Kontakt kommen. Für diese Gruppe ist Das Portal oft die erste Station.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Was alle drei Gruppen eint: Sie schätzen Ruhe und Natur. Sie sind nicht auf der Suche nach ständig neuen Events, sondern nach tieferer Erfahrung. Das prägt MV. Events hier sind oft weniger „Business-Networking" und mehr „Ich möchte mich selbst begegnen".
            </p>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Die Region als Retreat-Destination
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Mecklenburg-Vorpommern hat einen großen wirtschaftlichen Vorteil als Retreat-Ziel: Es ist günstiger als Bayern, günstiger als Sylt, günstiger als die Alpen. Eine Nacht im Gutshaus kostet ein Drittel dessen, was vergleichbare Häuser in Tirol kosten. Der Flug von Hamburg oder Berlin ist nicht nötig — du fährst. Das macht es zugänglich.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Gleichzeitig ist die Natur nicht weniger beeindruckend. Die Rügener Kreideküste mit ihren weißen Klippen ist ein UNESCO-Weltnaturerbe. Der Darß ist eines der größten zusammenhängenden Waldgebiete Norddeutschlands. Die Mecklenburgische Seenplatte hat mehr Seen als der Norden Kanadas hat Seen pro Quadratkilometer — oder zumindest fühlt es sich so an. Und die Strände sind leer. Auch im August findest du auf vielen Inseln große Sandstrände ohne Massentourismus.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Das ist das Value Proposition: Retreat-Qualität bei Accessibility-Preisen. Kein Wunder, dass Hamburg-Yoga-Studios inzwischen regelmäßig Retreat-Gruppen nach Rügen fahren. Kein Wunder, dass Facilitators aus Berlin sich lieber ein Gutshaus in MV buchen als zu versuchen, irgendwo in Brandenburg etwas Ruhiges zu finden.
            </p>
          </article>

          {/* FAQ */}
          <article className="mt-12 space-y-6 border-t border-border pt-8">
            <h2 className="text-2xl font-semibold">
              Häufig gestellte Fragen (FAQ)
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-text-primary">
                  Was sind ganzheitliche Events?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Ganzheitliche Events sind Veranstaltungen, die Geist, Körper und Seele adressieren. Das können Yoga-Kurse sein, Meditationen, Breathwork-Seminare, Klangschalen-Bäder oder mehrtägige Retreats in der Natur. Das Portal konzentriert sich auf Events, bei denen es um innere Entwicklung, Achtsamkeit und ganzheitliches Wohlbefinden geht — nicht um Sport oder Fitness allein, sondern um tiefer gehende Erfahrung.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Wie finde ich Events in Mecklenburg-Vorpommern?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Oben auf dieser Seite sind alle aktuellen Events aus MV gelistet. Du kannst nach Stadt filtern (Rostock, Schwerin, Greifswald, Stralsund, Rügen, Usedom etc.) oder auf „Alle Events" klicken. Du kannst auch unserer <Link href="https://t.me/+C1QQY29LZlExZWIy" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">Telegram-Community</Link> beitreten und bekommst sofort Updates zu neuen Events.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Bin ich Anfänger und kenne mich mit ganzheitlichen Events nicht aus — kann ich trotzdem teilnehmen?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Ja, absolut. Ganzheitliche Events sind ausdrücklich für Anfänger zugänglich. Viele Facilitators bieten gerade Anfänger-Retreats und Einsteiger-Kurse an. Was du brauchst ist einzig die Bereitschaft, dich zwei, drei oder sieben Tage Zeit für dich selbst zu nehmen. Das ist oft schwerer als die Sache selbst.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Wie viel kosten Events in Mecklenburg-Vorpommern?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Das variiert stark. Es gibt kostenlose Meditationsabende in Rostock. Ein Yoga-Workshop kostet oft 20–60 Euro. Ein Wochenend-Retreat (2–3 Tage) liegt üblicherweise zwischen 150 und 400 Euro, je nach Art und Anbieter. Mehrtägige Retreats (5–7 Tage) in Gutshöfen kosten 400–1200 Euro. Das Portal zeigt für jedes Event, ob es kostenlos, kostenpflichtig ist oder welches Preis-Modell gilt.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Ich bin Yoga-Facilitator oder Meditation-Teacher und möchte mein Event eintragen. Wie geht das?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Klick oben auf „Du bist Anbieter in Mecklenburg-Vorpommern?" oder auf den Link „So funktioniert es". Der Prozess ist kostenlos und dauert 5 Minuten. Du füllst ein einfaches Formular aus, und dein Event wird sofort sichtbar. Es gibt keine versteckten Gebühren, keine monatlichen Kosten — Das Portal ist eine gemeinnützige Initiative.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Wann ist die beste Jahreszeit für ganzheitliche Events in Mecklenburg-Vorpommern?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Mai bis September ist Hochsaison — Wetter, Natur und Angebot sind optimal. Besonders Juli und August sind beliebt. Allerdings: Gerade die Ruhesuchenden schätzen September und Oktober, wenn die meisten Touristen weg sind, das Wetter aber noch mild ist. Winter und Frühjahr sind ruhiger, aber gerade deshalb manchmal intensiver. Stille Retreats im November auf einer Insel können transformativer sein als überlaufene Sommerveranstaltungen.
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* Nachbar-Regionen */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">
            Weitere Regionen
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { name: "Hamburg", href: "/hamburg" },
              { name: "Schleswig-Holstein", href: "/schleswig-holstein" },
              { name: "Niedersachsen", href: "/niedersachsen" },
              { name: "Bremen", href: "/bremen" },
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

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Du bist Anbieter in Mecklenburg-Vorpommern?
          </h2>
          <p className="mt-3 text-text-secondary">
            Mach deine Events sichtbar — kostenlos, ohne Haken.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/fuer-facilitators"
              className="rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              So funktioniert es →
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

        {/* Keine Events verpassen */}
        <section className="mt-12 rounded-3xl border border-border bg-bg-card p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keine Events verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Folge uns auf Telegram und bleib auf dem Laufenden — neue Retreats, Workshops und Veranstaltungen landen direkt in deinem Feed.
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
          </div>
        </section>
      </div>
    </>
  );
}
