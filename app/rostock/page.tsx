import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Rostock — Termine & Community | Das Portal",
  description:
    "Finde ganzheitliche Events in Rostock und Warnemünde: Yoga, Breathwork, Meditation, Sound Healing und Retreats. Aktuelle Termine auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/rostock",
  },
  openGraph: {
    title: "Ganzheitliche Events in Rostock — Das Portal",
    description:
      "Alle ganzheitlichen Events in Rostock und Warnemünde auf einen Blick.",
    url: "https://das-portal.online/rostock",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

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

export default async function RostockPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Rostock%,address.ilike.%rostock%,address.ilike.%Warnemünde%,address.ilike.%warnemuende%")
    .order("start_at", { ascending: true })
    .limit(8);

  const events = data || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events in Rostock",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Rostock",
    url: "https://das-portal.online/rostock",
    itemListElement: events.slice(0, 5).map((event: Record<string, unknown>, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title as string,
        startDate: event.start_at as string,
        location: { "@type": "Place", name: (event.location_name as string) || "Rostock", address: "Rostock" },
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
            Rostock · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Rostock
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Rostock und Warnemünde verbinden Ostsee-Flair mit einer
            aufstrebenden ganzheitlichen Szene. Yoga am Strand, Breathwork
            in der Altstadt, Retreats im Hinterland — Das Portal zeigt alle
            Termine.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Rostock"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Rostock Events →
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
            Nächste Events in Rostock
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Rostocker Community.`
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
              href="/events?city=Rostock"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Rostock Events anzeigen →
            </Link>
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Rostock — was dich erwartet
            </h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Rostock ist die größte Stadt Mecklenburg-Vorpommerns. Fast 210.000 Menschen leben hier, darunter eine junge, offene Universitätsgemeinde. Die Hafenstadt an der Warnow ist nicht nur für ihre Geschichte bekannt, sondern auch für ihre wachsende Community rund um Yoga, Meditation und alternative Heilmethoden.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Warnemünde, nur wenige Kilometer nördlich, ist Rostocks Tor zur Ostsee. Mit seinem breiten Strand, dem eleganten Leuchtturm und dem maritimen Charme schafft Warnemünde einen einzigartigen Raum für Outdoor-Yoga, Beach-Meditationen und Retreats mit Meerblick. Viele Anbieter nutzen die Sommerzeit, um ihre Angebote ans Wasser zu verlegen — ein Privileg, das nicht alle Städte haben.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Die ganzheitliche Szene in Rostock ist noch überschaubar. Das ist dein Vorteil: Du hast ein aufgeschlossenes Publikum ohne übermäßigen Wettbewerb. Wer hier Yoga, Breathwork oder Soundhealing anbietet, wird bemerkt.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Die Rostocker Szene: Zwischen Ostsee und KTV
            </h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Die Kröpeliner-Tor-Vorstadt — kurz KTV — ist Rostocks Kulturzentrum. Hier findest du kleine Studios, Künstlerwerkstätten, alternative Cafés und kreative Räume. Die KTV ist der natürliche Ort für Yoga-Stunden, Workshops und Kurse. Viele Anbieter sitzen hier, weil die Mieten noch bezahlbar sind und die Community offen ist.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Die Stadtmitte rund um den Neuen Markt ist das historische Herz. Mit seinen Backsteinhäusern und der Marienkirche wirkt sie bewusst und spirituell — ein gutes Terrain für Retreats oder intensive Events. Im Sommer laden die Innenhöfe und Grünanlagen zu Open-Air-Formaten ein.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Warnemünde mit seinem Strand und der Seepromenade ist ideal für Sommerevents. Viele Studios bieten von Mai bis September Outdoor-Yoga an. Die Warnow-Ufer und die Parks rund um Rostock — etwa im Süden in Richtung Rövershagen — sind perfekt für Natur-basierte Formate wie Waldbaden oder Outdoor-Retreats.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Rostock hat eine Ost-West-Geschichte, die bis heute nachwirkt. Diese Vergangenheit hat die Stadt mit einer gewissen Direktheit und Authentizität geprägt — es gibt weniger Kitsch, mehr Aufrichtigkeit. Das macht sie für tiefe, ehrliche ganzheitliche Arbeit attraktiv.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Formate gibt es in Rostock?
            </h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Das Angebot ist vielfältig, aber noch nicht gesättigt. Yoga ist etabliert — mehrere Studios bieten Kurse für verschiedene Level und Stile an. Vinyasa, Hatha, Yin-Yoga finden ihre Schüler. Der Markt wächst, weil die Uni-Stadt junge, mobilitätsfreudige Menschen anzieht.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Meditation findet zunehmend Interesse. Einige Anbieter haben sich auf Vipassana, andere auf geführte Meditationen spezialisiert. Breathwork ist noch neu für viele Rostocker — wer es anbringt, kann Pionier sein.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Sound Healing mit Klangschalen, gongs und Kristallschalen ist eine Nische mit warmem Publikum. Viele Menschen kommen zur Entspannung — es braucht keine langjährige Erfahrung, um von dieser Arbeit zu profitieren.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Retreats an der Ostsee sind im Wachstum. Viele Coaches nutzen die Nähe zu Heiligendamm, Kühlungsborn oder dem Darß, um 2- bis 3-Tages-Programme anzubieten. Die Küste ist dein größtes Verkaufsargument.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Zeremonielles — wie Kakao-Zeremonien oder schamanische Arbeit — ist noch unterrepräsentiert. Wer es professionell und umsichtig anbringt, wird Aufmerksamkeit finden.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Rostock?
            </h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Die Rostocker Zielgruppe ist jung und offen. Studierende der Universität sind eine große Gruppe — sie sind mobil, experimentierfreudig und haben oft kleine Budgets. Viele Jobs an der Uni oder in der Hafenwirtschaft schaffen auch ein Publikum mit mittlerem Einkommen und hoher Lebensqualität.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Zugezogene sind oft die Frühadopter. Menschen, die nach Rostock kommen wegen der Natur, der Hafenromantik oder der besseren Lebensqualität, suchen schnell nach Community. Ganzheitliche Events sind ein Ort, neue Menschen zu treffen.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Anfänger sind willkommen und mitunter die größte Gruppe. Die wenigsten haben tiefe Yoga-Erfahrung oder ein spirituelles Vorwissen — sie suchen einfach nach Entspannung, Kontakt und neuen Impulsen. Das ist deine Stärke: Du brauchst nicht Profis zu adressieren, sondern Neugierige.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Rostock hat auch eine etablierte Wellness- und Naturheil-Szene mit Therapeuten, Heilpraktikern und Coaches, die sich fortbilden und mit anderen vernetzen möchten. Viele besuchen Workshops anderer Anbieter.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Rostock und die Ostseeküste
            </h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Die Ostsee ist Rostocks größtes Merkmal. Du bist keine isolierte Binnenstadt — du hast Strand, Natur, Weite. Das öffnet Türen für Saisonprogramme, Retreat-Serien und Outdoor-Formate.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Heiligendamm, nur 15 km westlich, war Europas ältestes Seebad und hat bis heute seinen eleganten Ruf. Viele Coaches buchen dort Räume für Intensiv-Retreats. Kühlungsborn, noch weiter westlich, ist beliebter Ferienort mit großem Angebot an Unterkunft und Kultur. Der Darß, nördlich von Rostock, ist wild, natürlich und sehr gefragt für Wald-Retreats und Natur-Yoga.
            </p>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Die Infrastruktur ist gut. Es gibt Pension, Häuser und Yoga-Studios entlang der ganzen Küste. Wenn du ein Retreat planst, brauchst du oft nur eine Woche Vorlauf, um einen Ort zu finden.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-16 space-y-8">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen
          </h2>

          <div className="space-y-6">
            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-colors open:bg-[#f9f7f4]">
              <summary className="cursor-pointer font-medium text-text-primary">
                Was sind ganzheitliche Events?
              </summary>
              <p className="mt-3 leading-relaxed text-text-secondary">
                Ganzheitliche Events sind Formate, die Körper, Geist und Seele adressieren — Yoga-Kurse, Meditationen, Breathwork, Sound Healing, Retreats, Workshops mit Coaches und Heilpraktikern. Sie unterscheiden sich von klassischem Fitness durch Achtsamkeit, Zeit und den Aufbau von Community.
              </p>
            </details>

            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-colors open:bg-[#f9f7f4]">
              <summary className="cursor-pointer font-medium text-text-primary">
                Wie finde ich ganzheitliche Events in Rostock?
              </summary>
              <p className="mt-3 leading-relaxed text-text-secondary">
                Das Portal listet alle ankommenden Events. Du kannst nach Stadt, Format und Wochentag filtern. Dazu kommt unser Telegram-Kanal, auf dem Anbieter spontane Termine mitteilen. Das ist die schnellste Quelle für spontane Zusatzstunden oder Pop-up-Events.
              </p>
            </details>

            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-colors open:bg-[#f9f7f4]">
              <summary className="cursor-pointer font-medium text-text-primary">
                Sind ganzheitliche Events etwas für Anfänger?
              </summary>
              <p className="mt-3 leading-relaxed text-text-secondary">
                Absolut. Die meisten Anbieter starten ihre Klassen mit "für alle Level" und helfen Anfängern dabei, in ihr Tempo zu kommen. Viele berichten von ihrem eigenen Anfang und bauen damit eine entspannte Atmosphäre auf. Du brauchst keine Vorerfahrung — nur Neugier.
              </p>
            </details>

            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-colors open:bg-[#f9f7f4]">
              <summary className="cursor-pointer font-medium text-text-primary">
                Was kosten ganzheitliche Events in Rostock?
              </summary>
              <p className="mt-3 leading-relaxed text-text-secondary">
                Das variiert. Einzelne Yoga-Stunden kosten meist 12–18 Euro. Workshops und Intensiv-Kurse liegen bei 30–100 Euro je nach Länge. Mehrtägige Retreats kosten 200–600 Euro inklusive Unterkunft. Manche Anbieter bieten kostenlose Schnupperstunden oder Pay-What-You-Can-Klassen. Das Portal zeigt dir den Preis jedes Events.
              </p>
            </details>

            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-colors open:bg-[#f9f7f4]">
              <summary className="cursor-pointer font-medium text-text-primary">
                Ich bin Anbieter — wie trage ich meine Events ein?
              </summary>
              <p className="mt-3 leading-relaxed text-text-secondary">
                Ganz einfach: Klick auf "Eintragen" im Menü. Du musst weder zahlen noch durch Hürden — wir wollen nur deine Informationen: Titel, Beschreibung, Datum/Zeit, Ort, Preis, ggf. Link zum Ticket. Das Portal ist kostenlos für alle, die die ganzheitliche Szene sichtbar machen wollen.
              </p>
            </details>

            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-colors open:bg-[#f9f7f4]">
              <summary className="cursor-pointer font-medium text-text-primary">
                Gibt es ganzheitliche Events an der Ostseeküste?
              </summary>
              <p className="mt-3 leading-relaxed text-text-secondary">
                Ja. Besonders in den wärmeren Monaten bieten Coaches Retreats an der Küste an. Heiligendamm, Kühlungsborn und der Darß sind beliebte Ziele. Beach-Yoga in Warnemünde ist im Sommer Standard. Die Nähe zur Küste ist einer von Rostocks großen Vorteilen.
              </p>
            </details>
          </div>
        </section>

        {/* Nachbar-Regionen */}
        <section className="mt-16">
          <h2 className="text-lg font-semibold text-text-primary">
            Weitere Regionen
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { name: "Mecklenburg-Vorpommern", href: "/mecklenburg-vorpommern" },
              { name: "Hamburg", href: "/hamburg" },
              { name: "Kiel", href: "/kiel" },
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
            Du bist Anbieter in Rostock?
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
      </div>
    </>
  );
}
