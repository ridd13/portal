import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Bremen — Termine & Community | Das Portal",
  description:
    "Finde ganzheitliche Events in Bremen: Yoga, Breathwork, Sound Healing, Kakaozeremonien und Retreats. Aktuelle Termine aus der Bremer Community auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/bremen",
  },
  openGraph: {
    title: "Ganzheitliche Events in Bremen — Das Portal",
    description:
      "Alle ganzheitlichen Events in Bremen auf einen Blick. Yoga, Meditation, Breathwork und mehr.",
    url: "https://das-portal.online/bremen",
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

export default async function BremenPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Bremen%,address.ilike.%bremen%,address.ilike.%Bremerhaven%")
    .order("start_at", { ascending: true })
    .limit(8);

  const events = data || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events in Bremen",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Bremen",
    url: "https://das-portal.online/bremen",
    itemListElement: events.slice(0, 5).map((event: Record<string, unknown>, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title as string,
        startDate: event.start_at as string,
        location: { "@type": "Place", name: (event.location_name as string) || "Bremen", address: "Bremen" },
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
            Bremen · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Bremen
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Bremen verbindet hanseatische Gelassenheit mit einer wachsenden
            ganzheitlichen Szene. Von Yoga im Viertel bis zu Breathwork-Sessions
            an der Weser — Das Portal zeigt alle Termine.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Bremen"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Bremen Events →
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
            Nächste Events in Bremen
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Bremer Community.`
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
              href="/events?city=Bremen"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Bremen Events anzeigen →
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
              { name: "Niedersachsen", href: "/niedersachsen" },
              { name: "Schleswig-Holstein", href: "/schleswig-holstein" },
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

        {/* SEO Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <h2 className="text-2xl font-semibold">
            Ganzheitliche Events in Bremen — was dich erwartet
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Bremen ist eine Stadt der Gegensätze. Hanseatische Nüchternheit trifft auf kreativen Widerstand. Im Viertel, in Findorff und der Neustadt brodelt es. Hier sitzen Yoga-Lehrer neben Künstlern, Heiler neben Musikern. Und immer mehr Menschen suchen hier nach etwas, das über den Alltag hinausgeht.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Ganzheitliche Events sind in Bremen kein Trend — sie sind real. Nicht übertrieben, nicht ausgefallen. Echt. Menschen hier mögen es bodenständig. Sie wollen spüren, was funktioniert, nicht was modisch ist. Das macht Bremen wertvoll für Anbieter, die echte Arbeit leisten: keine Überreizung, keine Hype-Maschinerie.
          </p>

          <h2 className="text-2xl font-semibold">
            Die Bremer Szene: Klein, aber echt
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Du fragst dich, was es in Bremen zu erleben gibt? Fang im Viertel an. Hier konzentrieren sich Studios, Praxen und Kulturräume. Das Kulturzentrum Schlachthof, das Lagerhaus — diese Orte sind aktiv. Schwachhausen ist ein zweites Zentrum für etablierte Praxen. Und die Neustadt? Das ist die junge, experimentelle Ecke.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Das Besondere: Viele Praktiker in Bremen arbeiten parallel in Hamburg. Sie bringen Erfahrung mit, wissen, was woanders funktioniert. Die Nachbarschaft zu Hamburg (nur eine Stunde) macht Bremen zu einem Laboratorium. Regelmäßig entstehen hier neue Formate, die dann auch überregional funktionieren.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Nach Corona ist die Nachfrage gewachsen. Menschen mögen Nähe wieder. Sie wollen gemeinsam praktizieren, sich austauschen, sich weiterentwickeln. Bremen bietet dafür die perfekte Größe: groß genug für Vielfalt, klein genug für echte Beziehungen.
          </p>

          <h2 className="text-2xl font-semibold">
            Welche Formate gibt es in Bremen?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Yoga ist stark vertreten. Von Hatha bis Vinyasa, von Anfänger bis Advanced — Bremen hat mehrere spezialisierte Studios. Meditation ist ebenso etabliert, mit regelmäßigen Gruppen und geführten Sitzungen.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Breathwork ist das junge Genre. Das Interesse wächst sichtbar. Es gibt regelmäßige Sessions, Workshops mit auswärtigen Facilitators. Frauenkreise sind aktiv — oft thematisch ausgerichtet: Zykluswissen, Weiblichkeit, Empowerment.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Kakaozeremonien finden gelegentlich statt, oft kombiniert mit Musik oder Tanz. Ecstatic Dance ist in Bremen präsent, vor allem in alternativen Räumen. Und dann gibt es noch Sound Healing, therapeutische Massagen, schamanische Arbeit — ein großes Spektrum für eine Stadt dieser Größe.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Der rote Faden: Es geht um Erfahrung, nicht um Esoterik-Zirkus. Das schätzen die Bremer.
          </p>

          <h2 className="text-2xl font-semibold">
            Für wen sind ganzheitliche Events in Bremen?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Kurze Antwort: für dich, egal wer du bist. Ganzheitliche Events sind nicht nur was für spirituelle Menschen. Sie sind für Neugierige. Für Menschen, die eine Pause brauchen. Für diejenigen, die verstehen, dass Körper, Geist und Seele zusammenhängen.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Bremen ist Uni-Stadt. Das bedeutet viele junge, wache Menschen. Sie sind offen, probieren aus, wollen verstehen. Sie bringen Energie mit. Gleichzeitig gibt es viele etablierte Profis — Geschäftsführer, Therapeuten, Kreative — die gezielt nach Balance suchen. Sie wissen, dass Prävention günstiger ist als Krise.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Anfängererfahrung ist kein Problem. Viele Events sind speziell für Anfänger ausgelegt. Die Facilitators verstehen, dass Anfänger andere Bedürfnisse haben als Fortgeschrittene. Es ist eine Selbstverständlichkeit, dies zu berücksichtigen.
          </p>

          <h2 className="text-2xl font-semibold">
            Bremen und die Region
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Bremen ist nicht isoliert. Die Stadt ist Sprungbrett zu größeren Formaten. Das Umland Niedersachsens bietet sich für Retreats an — Fläche, Stille, Natur. Viele Anbieter nutzen die Nähe zur Weser oder die grünen Flächen des Bürgerparks für Outdoor-Sessions.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Worpswede, das Künstlerdorf in der Nähe, wird immer populärer als Retreat-Destination. Manche Events starten in Bremen und verlängern sich ins Umland. Hamburg ist nur eine Stunde entfernt — manche Bremer besuchen dort auch Events und umgekehrt.
          </p>

          {/* FAQs */}
          <div className="mt-12 space-y-8 border-t border-border pt-12">
            <h2 className="text-2xl font-semibold">
              Häufig gestellte Fragen
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-text-primary">
                  Was sind ganzheitliche Events?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Ganzheitliche Events adressieren Mensch ganzheitlich: Körper, Geist, Seele. Das kann Yoga sein. Meditation. Atemarbeit. Kakaozeremonie. Sound Healing. Tanz. Der Fokus liegt auf Erfahrung, nicht auf intellektueller Information. Du machst etwas aktiv mit deinem Körper, deinem Atem, deinen Gefühlen — nicht nur mit deinem Kopf.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Wie finde ich Events in Bremen?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Du bist genau richtig auf Das Portal. Hier listet du alle aktuellen ganzheitlichen Events in Bremen auf. Du kannst filtern nach Kategorie, Datum, Ort. Oder abonniere die Telegram Community — dort posten Anbieter neue Events, und die Community teilt Tipps und Erfahrungen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Sind die Events für Anfänger?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Die meisten ja. Events sind meist als "Level 1" oder "offen für alle" ausgeschrieben. Viele Facilitators unterrichten gezielt anfängerfreundlich. Wenn ein Event Vorkenntnisse erfordert, wird das deutlich gemacht. Vertrau deinem Instinkt — wenn eine Beschreibung sich für dich richtig anfühlt, dann ist es wahrscheinlich auch passen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Was kosten die Events?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Die Spanne ist groß. Einige Events sind kostenlos (oft Community-Sessions). Viele kosten zwischen 15 und 40 Euro. Intensivere Workshops oder Retreats können mehr kosten. Bei der Beschreibung siehst du immer, wie der Preis kalkuliert ist — und ob es Rabatte oder Gleitskalaveranstaltungen gibt. Quality über Quantity ist das Motto.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Kann ich meine Events auf Das Portal eintragen?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Ja — kostenlos und ohne versteckte Haken. Facilitators, Studios und Räume-Anbieter können ihre Events direkt eintragen oder die Telegram Community kontaktieren. Dein Event wird nach kurzer Prüfung sichtbar. Das Portal ist nicht-kommerziell, dient nur der Sichtbarkeit. Keine Provisionen, keine Marketing-Versprechungen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary">
                  Gibt es Retreats in der Nähe von Bremen?
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  Ja. Das Umland Niedersachsens bietet Platz und Ruhe für Retreats. Worpswede ist nur eine knappe Stunde weg und wird immer beliebter. Hamburg ist auch nah — dort gibt es größere Retreat-Angebote. Viele Anbieter aus Bremen nutzen die Region für mehrtägige Intensivprogramme, die in der Stadt so nicht möglich wären.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Keine Events verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Folge der Telegram Community und sei sofort informiert, wenn neue Events in Bremen entstehen.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Zur Community →
            </Link>
          </div>
          <p className="mt-6 text-sm text-text-muted">
            Du bist Facilitator? <Link href="/#warteliste" className="underline hover:text-text-secondary">Eintragen</Link> ist kostenlos.
          </p>
        </section>
      </div>
    </>
  );
}
