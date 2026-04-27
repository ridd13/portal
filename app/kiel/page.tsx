import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents, formatBerlinISO } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Kiel — Termine & Community",
  description:
    "Finde ganzheitliche Events in Kiel: Yoga, Breathwork, Meditation, Kakaozeremonien, Retreats und mehr. Aktuelle Termine aus der Kieler Community auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/kiel",
  },
  openGraph: {
    title: "Ganzheitliche Events in Kiel — Das Portal",
    description:
      "Alle ganzheitlichen Events in Kiel auf einen Blick. Yoga, Meditation, Breathwork und Retreats.",
    url: "https://das-portal.online/kiel",
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

export default async function KielPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Kiel%,address.ilike.%kiel%")
    .order("start_at", { ascending: true })
    .limit(8);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ganzheitliche Events in Kiel",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Kiel",
    url: "https://das-portal.online/kiel",
    itemListElement: events.slice(0, 5).map((event: Event, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: formatBerlinISO(event.start_at),
        location: {
          "@type": "Place",
          name: event.location_name || "Kiel",
          address: "Kiel",
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
            Kiel · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Kiel
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Kiel ist das Zentrum der ganzheitlichen Szene in Schleswig-Holstein.
            Von Yoga-Studios an der Förde bis zu Breathwork-Sessions in der
            Altstadt — Das Portal bündelt alle Termine.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Kiel"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Kiel Events →
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
            Nächste Events in Kiel
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Kieler Community.`
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
              href="/events?city=Kiel"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Kiel Events anzeigen →
            </Link>
          </div>
        </section>

        {/* Editorial Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-semibold">
              Ganzheitliche Events in Kiel — was dich erwartet
            </h2>
            <div className="mt-4 space-y-3 text-text-secondary">
              <p className="leading-relaxed">
                Kiel ist anders als Hamburg. Hier gibt es weniger Events, dafür mehr Nähe — Menschen sitzen sich tatsächlich in die Augen. Als Landeshauptstadt von Schleswig-Holstein zieht die Stadt eine diverse Community an: Studierende, junge Berufstätige, Familien, und eine wachsende Zahl von Coaches und Facilitators.
              </p>
              <p className="leading-relaxed">
                Die Kieler Förde prägt alles. Yoga-Sessions finden am Wasser statt, Meditationen haben eine salzige Brise als Soundtrack, Retreats nutzen das Umland. Manchmal ist die beste Breathwork-Lektion direkt nach einer Ostsee-Wanderung. Du merkst: Die Formate hier folgen einer anderen Logik.
              </p>
              <p className="leading-relaxed">
                Wer nach Ganzheitlichkeit sucht, wird in Kiel fündig — nicht in der Masse, sondern in der Authentizität. Viele Anbieter arbeiten mit Passion, nicht mit Corporate-Vibes.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-semibold">
              Die Kieler Szene: Kompakt und persönlich
            </h2>
            <div className="mt-4 space-y-3 text-text-secondary">
              <p className="leading-relaxed">
                Gaarden ist die kreative Ecke — alternative Räume, kleine Studios, Community-Projekte. Hier passiert viel Experimentelles. Dann gibt es Schilksee mit seinen Wassernähe-Vibes (perfekt für Yoga, Meditationen, Outdoor-Formate), und die Innenstadt mit etablierten Studios und Co-Working Spaces.
              </p>
              <p className="leading-relaxed">
                Viele Anbieter sind flexibel: Private Wohnzimmer für Frauenkreise, Gemeinschaftsgärten für Ecstatic Dance, Co-Working Spaces für Workshops. Die Szene nutzt, was da ist. Das macht Events spontan und lebendig.
              </p>
              <p className="leading-relaxed">
                Viele Facilitators arbeiten zwischen Kiel und Hamburg, kennen also beide Szenen. Das bringt frische Inputs — Konzepte, die in Hamburg bewährt sind, landen dann in einer kleineren, persönlicheren Form in Kiel. Du brauchst keine großen Namen hier. Du brauchst Menschen, die wissen, wovon sie sprechen.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-semibold">
              Welche Formate gibt es in Kiel?
            </h2>
            <div className="mt-4 space-y-3 text-text-secondary">
              <p className="leading-relaxed">
                Yoga ist das Fundament — mehrere Studios bieten regelmäßige Klassen an, viele mit Fokus auf Alignment, Yin oder Partner-Yoga. Meditationen laufen sowohl als Einzeltermine als auch in Gruppen, oft am frühen Morgen oder abends.
              </p>
              <p className="leading-relaxed">
                Breathwork ist hier ein wachsender Trend. Immer mehr Anbieter bieten Wim-Hof-Methode, kundalini-inspirierte Atemarbeit oder einfach intuitive Breathwork-Sessions an. Kakaozeremonien haben sich etabliert — regelmäßig finden sie in Studios oder privaten Räumen statt.
              </p>
              <p className="leading-relaxed">
                Frauenkreise sind präsent und unterstützen sich gegenseitig. Ecstatic Dance wächst langsam aber stetig. Retreats sind seltener in Kiel selbst, aber viele Anbieter organisieren mehrtägige Formate in der Umgebung — Holsteinische Schweiz, Ostsee-Küste oder sogar Auslandsreisen.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-semibold">
              Für wen sind ganzheitliche Events in Kiel?
            </h2>
            <div className="mt-4 space-y-3 text-text-secondary">
              <p className="leading-relaxed">
                Offizielle Antwort: für alle. Reale Antwort: Die Szene ist jung und offen. Studierende sind überrepräsentiert, aber auch junge Professionals kommen. Wer neu in Kiel ist, findet schnell seinen Platz — die Community ist aktiv beim Onboarden.
              </p>
              <p className="leading-relaxed">
                Anfänger sind willkommen. Niemand erwartet, dass du jahrelang Yoga praktiziert hast. Du brauchst keine Erfahrung, nur die Bereitschaft, offen zu sein. Viele Formate sind bewusst niedrigschwellig — erst Frage stellen, dann anfangen.
              </p>
              <p className="leading-relaxed">
                Eltern finden Events mit Kinderbetreuung, ältere Menschen finden ihre Peers. Die Szene ist heterogen, deswegen braucht es Das Portal — um alle Ecken sichtbar zu machen, nicht nur die lautesten.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-semibold">
              Kiel und die Region: Ganzheitlich im ganzen Norden
            </h2>
            <div className="mt-4 space-y-3 text-text-secondary">
              <p className="leading-relaxed">
                Kiel ist nicht isoliert. Eine Stunde Zugfahrt nach Hamburg öffnet sich die nächste Ebene — Workshops, Kongresse, große Retreats. Gleichzeitig hat Kiel seine eigene Dynamik.
              </p>
              <p className="leading-relaxed">
                Die Umgebung ist Gold: Holsteinische Schweiz für mehrtägige Retreats, Ostsee-Küste für Natur-Events, Lübeck für andere Szenen. Viele Anbieter organisieren Wochenend-Formate, die Kiel als Basecamp nutzen.
              </p>
              <p className="leading-relaxed">
                Das Portal zeigt dir nicht nur, was in der Stadt passiert, sondern auch in der Region. Du kannst eine Session am Dienstagabend in der Innenstadt besuchen und am Wochenende ein Retreat an der Förde machen — alles am gleichen Ort zu sehen.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu ganzheitlichen Events in Kiel
          </h2>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-sm">
              <summary className="cursor-pointer font-medium text-text-primary hover:text-accent-primary">
                Was sind ganzheitliche Events überhaupt?
              </summary>
              <div className="mt-3 text-text-secondary leading-relaxed">
                <p>
                  Ganzheitlich bedeutet: Es geht nicht nur um den Körper. Yoga ist nicht nur Stretching, Meditation nicht nur Entspannung. Ganzheitliche Events arbeiten mit Körper, Geist und Seele — sie wollen dir helfen, dich selbst besser zu verstehen und dein Leben bewusster zu gestalten.
                </p>
                <p className="mt-2">
                  Das kann Atemarbeit sein, ein Coaching-Workshop, ein Healing-Ritual, eine Zeremonie oder einfach Zeit mit einer Gruppe Menschen, die ähnliche Werte teilen. Die Gemeinsamkeit: Es geht um Wachstum, Heilung oder Bewusstsein.
                </p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-sm">
              <summary className="cursor-pointer font-medium text-text-primary hover:text-accent-primary">
                Wie finde ich aktuelle Events in Kiel?
              </summary>
              <div className="mt-3 text-text-secondary leading-relaxed">
                <p>
                  Das Portal zeigt dir alle kommenden Events in einer Liste. Du kannst nach Stadt filtern, sehen, welche Anbieter Events anbieten, und dich direkt anmelden. Oben auf dieser Seite siehst du die nächsten Termine.
                </p>
                <p className="mt-2">
                  Schneller geht es über unsere Telegram-Community: Beitreten, neue Events bekommen zugeschickt, in der Gruppe austauschen. Oder melde dich auf die Warteliste — dann bleibst du auf dem Laufenden.
                </p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-sm">
              <summary className="cursor-pointer font-medium text-text-primary hover:text-accent-primary">
                Sind die Events für Anfänger geeignet?
              </summary>
              <div className="mt-3 text-text-secondary leading-relaxed">
                <p>
                  Ja. Die meisten Events sind offen für alle, unabhängig von Erfahrung. Ein Yoga-Kurs hat keinen Anfänger- und Fortgeschrittenen-Level — der Lehrer passt an, was du brauchst. Atemarbeit, Meditationen, Zeremonien — alles funktioniert ohne Vorkenntnisse.
                </p>
                <p className="mt-2">
                  Wenn du unsicher bist, schau in die Event-Beschreibung oder schreib dem Anbieter einfach — die meisten sind sehr offen und beantworten alle Fragen.
                </p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-sm">
              <summary className="cursor-pointer font-medium text-text-primary hover:text-accent-primary">
                Was kosten Events in Kiel? Gibt es auch kostenlose?
              </summary>
              <div className="mt-3 text-text-secondary leading-relaxed">
                <p>
                  Das hängt vom Format ab. Kostenlose Meditationen oder Yoga-Probestunden gibt es regelmäßig — das Portal kennzeichnet diese als "kostenlos". Regelmäßige Kurse kosten meist 10–20 Euro pro Session.
                </p>
                <p className="mt-2">
                  Workshops und Seminare liegen bei 30–100 Euro, je nach Länge und Intensität. Mehrtägige Retreats kosten mehr. Viele Anbieter bieten Rabatte für Anfänger oder Leuten, denen das Geld knapp ist — einfach nachfragen.
                </p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-sm">
              <summary className="cursor-pointer font-medium text-text-primary hover:text-accent-primary">
                Kann ich als Anbieter mein Event eintragen?
              </summary>
              <div className="mt-3 text-text-secondary leading-relaxed">
                <p>
                  Ja, sehr gerne! Das Portal ist dazu da, um alle Anbieter sichtbar zu machen — egal, ob du eine etablierte Yoga-Lehrerin bist oder gerade anfängst, deine Kakaozeremonien zu teilen.
                </p>
                <p className="mt-2">
                  Klick auf den "Eintragen"-Button oben rechts. Du kannst dein Profil anlegen, deine Events hinzufügen und bleibst automatisch auf dem Portal sichtbar. Die Community sieht dich, Suchmaschinen finden dich, und du wirst Teil des Netzwerks.
                </p>
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="rounded-2xl border border-border bg-bg-card p-5 transition-shadow hover:shadow-sm">
              <summary className="cursor-pointer font-medium text-text-primary hover:text-accent-primary">
                Gibt es auch ganzheitliche Events in der Umgebung von Kiel?
              </summary>
              <div className="mt-3 text-text-secondary leading-relaxed">
                <p>
                  Ja. Die Umgebung ist voll davon. Das Portal listet auch Events in Schleswig-Holstein, der Holsteinischen Schweiz und an der Ostsee-Küste auf. Manche Anbieter organisieren mehrtägige Retreats in der Natur.
                </p>
                <p className="mt-2">
                  Schau dir die Nachbar-Regionen an oder nutze die Filter, um Events in deiner Nähe zu finden. Oft ist ein Wochenend-Retreat näher, als du denkst.
                </p>
              </div>
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
              { name: "Hamburg", href: "/hamburg" },
              { name: "Schleswig-Holstein", href: "/schleswig-holstein" },
              { name: "Rostock", href: "/rostock" },
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
