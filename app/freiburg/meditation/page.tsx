import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Meditation Freiburg — Termine, Kurse & Retreats auf Das Portal",
  description:
    "Meditation in Freiburg: Stille-Abende, geführte Meditationen, Vipassana-Tage und Meditation-Retreats im Schwarzwald. Aktuelle Termine aus der Freiburger Szene auf Das Portal.",
  alternates: {
    canonical: "https://das-portal.online/freiburg/meditation",
  },
  openGraph: {
    title: "Meditation Freiburg — Das Portal",
    description:
      "Meditationsabende, Vipassana-Tage und Retreats in Freiburg und im Schwarzwald. Alle Termine auf einen Blick.",
    url: "https://das-portal.online/freiburg/meditation",
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

export default async function FreiburgMeditationPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Freiburg%,address.ilike.%freiburg%")
    .contains("tags", ["meditation"])
    .order("start_at", { ascending: true })
    .limit(12);

  const events = deduplicateEvents((data || []) as Event[]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Meditation Events in Freiburg",
    description:
      "Aktuelle Meditationsabende, Vipassana-Tage und Retreats in Freiburg",
    url: "https://das-portal.online/freiburg/meditation",
    itemListElement: events.slice(0, 5).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: event.start_at,
        location: {
          "@type": "Place",
          name: event.location_name || "Freiburg",
          address: event.address || "Freiburg",
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
            Freiburg · Meditation
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Meditation in Freiburg — Termine, Kurse & Retreats
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Du suchst Meditation in Freiburg? Hier findest du aktuelle Termine:
            Stille-Abende, geführte Meditationen, Vipassana-Tage und mehrtägige
            Retreats im Schwarzwald — direkt aus der Freiburger Community.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/freiburg/ganzheitliche-events"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Freiburg Events →
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
            Aktuelle Meditation Events in Freiburg
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} Termine gefunden — von Abendmeditationen bis zu mehrtägigen Retreats.`
              : "Gerade keine Meditation-Termine in Freiburg — schau bald wieder rein oder tritt unserer Telegram-Community bei."}
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
                Aktuell keine Meditation-Events in Freiburg.
              </p>
              <Link
                href="/freiburg/ganzheitliche-events"
                className="mt-3 inline-block text-sm text-accent-primary hover:underline"
              >
                Alle Freiburg Events ansehen →
              </Link>
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/freiburg/ganzheitliche-events"
                className="text-sm text-accent-primary hover:underline"
              >
                Alle ganzheitlichen Events in Freiburg →
              </Link>
            </div>
          )}
        </section>

        {/* Redaktioneller Content */}
        <section className="mt-16 space-y-8 text-text-primary">
          <div>
            <h2 className="text-2xl font-semibold">
              Meditation in Freiburg — eine der aktivsten Szenen im Südwesten
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Freiburg hat eine Besonderheit, die in anderen Städten dieser
              Größe kaum zu finden ist: eine dichte, seit Jahrzehnten gewachsene
              Meditations-Community. Das hat mehrere Gründe — die Nähe zum
              Schwarzwald, eine aktive buddhistische Szene, die Universität mit
              ihren Forschungsfeldern zu Achtsamkeit und Kontemplation, und
              eine Stadtkultur, die Innerlichkeit nie als Nischenthema behandelt
              hat.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Meditation in Freiburg passiert nicht nur in Retreat-Zentren.
              Sie findet in Zen-Dōjos in der Innenstadt, in Yoga-Studios in
              Wiehre, in Gemeinschaftsräumen in Vauban und in kleinen Kreisen
              in Herdern statt. Wöchentliche Abendmeditationen, Halbtage am
              Wochenende, Intensiv-Retreats im Schwarzwald — die Bandbreite
              reicht von zehn Minuten bis zehn Tage.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Das Portal bündelt diese Angebote an einem Ort. Du musst nicht
              mehr durch Studio-Websites, Eventbrite und Instagram-Profile
              klicken — die aktuellen Termine stehen hier.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Welche Meditations-Formate gibt es in Freiburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die Freiburger Szene ist stilistisch breit aufgestellt. Ein paar
              Schwerpunkte, die dir bei der Suche helfen:
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Stille-Meditation und Vipassana:</strong>{" "}
              Die klassische, wortkarge Form. Sitzen, atmen, beobachten.
              Wöchentliche Abendtermine in Freiburg, Tagesretreats und
              mehrtägige Vipassana-Kurse in den umliegenden Häusern im
              Schwarzwald. Für Einsteiger gibt es regelmäßig begleitete
              Erstkontakt-Abende.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Zen und kontemplative Praxis:</strong>{" "}
              Freiburg hat mehrere Zen-Linien vertreten. Zazen in Gruppen,
              Kinhin (Gehmeditation), Koan-Arbeit. Oft in kleinen festen Sanghas
              organisiert, die offene Abende anbieten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Geführte Meditationen und Visualisationen:</strong>{" "}
              Weicher eingebetteter Einstieg, häufig in Kombination mit
              Klangschalen, sanfter Musik oder therapeutischer Begleitung.
              Gut für Menschen, denen Stille anfangs zu hart ist.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">MBSR und Achtsamkeitskurse:</strong>{" "}
              Klinisch validierte 8-Wochen-Programme, oft aus dem
              universitären oder therapeutischen Umfeld. Für Menschen, die
              Meditation pragmatisch als Stress-Prävention nutzen wollen,
              nicht als spirituelle Praxis.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Retreats im Schwarzwald:</strong>{" "}
              Wochenendformate bis zu zehntägigen Schweigeretreats. Viele
              Freiburger Lehrer:innen arbeiten mit Häusern in Sankt Peter,
              Todtmoos oder im Münstertal. Wenn du einen Schritt tiefer willst,
              beginnt hier oft der Weg.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Was Freiburg von München oder Berlin unterscheidet
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Meditation in Großstädten tendiert dazu, entweder stark
              kommerziell (Studios mit Abomodellen) oder stark subkulturell
              (schwer auffindbar, interne Kreise) zu sein. Freiburg liegt
              dazwischen. Die Szene ist offen genug, dass du als Neuling ohne
              Vorkenntnisse einen Einstieg findest, und gleichzeitig
              substanziell genug, dass erfahrene Praktizierende nicht ständig
              bei Anfänger-Formaten hängenbleiben.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Stadtviertel wie die Wiehre, Herdern und Vauban haben sich als
              feste Standorte herauskristallisiert. Viele Lehrer:innen arbeiten
              ortsübergreifend — abends in der Stadt, am Wochenende im
              Schwarzwald. Das macht das Angebot reich, aber manchmal auch
              schwer zu überblicken. Genau hier setzt Das Portal an.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Für wen ist Meditation in Freiburg?
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Die ehrliche Antwort: für praktisch jeden, der bereit ist, 30 bis
              60 Minuten nichts zu tun außer zu sitzen und zu beobachten. Du
              brauchst keine Vorerfahrung. Du brauchst keine Weltanschauung.
              Du brauchst nicht einmal Interesse an Spiritualität — viele
              Freiburger Meditationsangebote sind bewusst säkular gehalten.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Was du ausprobieren solltest: verschiedene Lehrer:innen und
              verschiedene Formate. Meditation ist nicht gleich Meditation.
              Das was bei dir ankommt, hängt oft weniger von der Tradition ab
              als von der Person, die sie vermittelt. In Freiburg hast du
              genug Auswahl, um das zu testen.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">
            Häufige Fragen zu Meditation in Freiburg
          </h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "Ich habe noch nie meditiert. Wo fange ich in Freiburg an?",
                a: "Such dir einen offenen Abend in einem Zen-Dōjo, einer Vipassana-Gruppe oder einem Yoga-Studio mit Meditationsformat. Viele Freiburger Anbieter haben dedizierte Einsteiger-Termine. Such einen aktuellen Termin auf Das Portal, meld dich an, geh hin. Nach der dritten oder vierten Session merkst du selbst, welche Form zu dir passt.",
              },
              {
                q: "Was ist der Unterschied zwischen Vipassana, Zen und geführter Meditation?",
                a: "Vipassana und Zen sind Stille-Praktiken mit klaren Techniken — Atemfokus, Körperscan, offenes Gewahrsein. Geführte Meditationen werden verbal angeleitet, oft mit Bildern oder Musik. Der Effekt ist ähnlich, der Weg ist unterschiedlich. Manche Menschen kommen über geführte Meditation rein und vertiefen sich später in Stille.",
              },
              {
                q: "Wie viel kostet Meditation in Freiburg?",
                a: "Abendmeditationen kosten oft nichts oder laufen auf Spendenbasis (5–15 €). Tagesretreats liegen meist bei 40–80 €. Mehrtägige Schweigeretreats im Schwarzwald bewegen sich zwischen 200 und 600 € inklusive Unterkunft und Verpflegung. MBSR-Kurse (8 Wochen) kosten 300–450 €.",
              },
              {
                q: "Gibt es Vipassana-Retreats in der Nähe von Freiburg?",
                a: "Ja, mehrere. Der Schwarzwald ist einer der aktivsten Retreat-Räume im deutschen Raum. Häuser in Sankt Peter, Todtmoos und im Münstertal bieten regelmäßig 3- bis 10-tägige Schweigeretreats an. Viele werden von Freiburger Lehrer:innen geleitet. Aktuelle Termine siehst du im Event-Grid oben.",
              },
              {
                q: "Kann ich Meditation mit ADHS oder bei Angststörungen machen?",
                a: "Grundsätzlich ja, aber such dir eine qualifizierte Begleitung. MBSR-Lehrer:innen und therapeutisch geschulte Meditationsanbieter:innen sind hier die bessere Adresse als ein reiner Stille-Retreat. Bei akuten psychischen Belastungen: immer zuerst mit Therapeut:in oder Ärzt:in abklären.",
              },
              {
                q: "Ist Meditation religiös?",
                a: "Je nach Tradition. Vipassana stammt aus dem buddhistischen Kontext, wird aber oft säkular vermittelt. MBSR ist komplett säkular. Zen ist traditionell buddhistisch, viele Zen-Gruppen in Freiburg sind aber offen für Menschen jeder Weltanschauung. Die Praxis selbst — Atem beobachten, sitzen — ist religionsunabhängig.",
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
            Neue Meditation-Termine in Freiburg nicht verpassen
          </h2>
          <p className="mt-3 text-text-secondary">
            Tritt unserer Telegram-Community bei und bekomm neue Events direkt
            zugeschickt. Oder trag dich in die Warteliste für frühen Zugang
            zur Plattform ein.
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
