import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getCityFromAddress } from "@/lib/event-utils";

export const metadata: Metadata = {
  title: "Für Anbieter",
  description:
    "Werde sichtbar als Coach, Heiler oder Facilitator. Registriere dich auf Das Portal und erreiche die Menschen, die dich suchen.",
  alternates: { canonical: "https://das-portal.online/fuer-facilitators" },
};

export default async function FacilitatorsPage() {
  const supabase = getSupabaseServerClient();

  const { count: eventCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("is_public", true)
    .eq("status", "published");

  const { count: hostCount } = await supabase
    .from("hosts")
    .select("*", { count: "exact", head: true });

  const { data: cityData } = await supabase
    .from("events")
    .select("address")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString());

  const cityCount = new Set(
    (cityData || [])
      .map((e: { address: string | null }) => getCityFromAddress(e.address))
      .filter(Boolean)
  ).size;

  return (
    <div className="mx-auto max-w-4xl space-y-16 pb-8">
      {/* Hero */}
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] px-6 py-12 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:px-10 sm:py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-accent-sage">
          Für Anbieter
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Deine Arbeit verdient
          <br />
          Sichtbarkeit.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary sm:text-xl">
          Das Portal ist die Plattform für Coaches, Heiler und Facilitators, die ihre Events
          und Angebote den richtigen Menschen zeigen wollen — ohne Marketing-Stress.
        </p>
        {/* Social Proof */}
        {(eventCount || hostCount) ? (
          <div className="mt-8 flex gap-8">
            {hostCount ? (
              <div>
                <p className="text-3xl font-bold text-accent-primary">{hostCount}+</p>
                <p className="text-sm text-text-muted">Anbieter</p>
              </div>
            ) : null}
            {eventCount ? (
              <div>
                <p className="text-3xl font-bold text-accent-primary">{eventCount}+</p>
                <p className="text-sm text-text-muted">Events</p>
              </div>
            ) : null}
            {cityCount > 0 ? (
              <div>
                <p className="text-3xl font-bold text-accent-primary">{cityCount}+</p>
                <p className="text-sm text-text-muted">Städte</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Problem → Lösung */}
      <section className="space-y-10">
        <h2 className="text-center text-3xl font-normal text-text-primary sm:text-4xl">
          Kennst du das?
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <div className="mb-3 text-2xl">🔇</div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              Deine Events bleiben unsichtbar
            </h3>
            <p className="text-text-secondary">
              Du veranstaltest Workshops, Retreats oder Zeremonien — aber die Menschen in deiner
              Region wissen nichts davon.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <div className="mb-3 text-2xl">😤</div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              Marketing frisst deine Energie
            </h3>
            <p className="text-text-secondary">
              Social Media, Website, Newsletter — du bist Experte in deinem Fach, nicht in
              Online-Marketing.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <div className="mb-3 text-2xl">🏝️</div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              Du arbeitest allein statt vernetzt
            </h3>
            <p className="text-text-secondary">
              Dir fehlt ein Ort, an dem du mit Gleichgesinnten sichtbar bist und voneinander
              profitierst.
            </p>
          </div>
        </div>
      </section>

      {/* Was Das Portal bietet */}
      <section className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-normal text-text-primary sm:text-4xl">
            Was Das Portal für dich tut
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
            Wir machen dich sichtbar — ohne dass du dafür zum Marketing-Profi werden musst.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              📍 Dein Profil im Anbieter-Verzeichnis
            </h3>
            <p className="text-text-secondary">
              Werde gefunden, wenn Menschen in deiner Stadt nach Coaching, Heilarbeit oder
              spirituellen Angeboten suchen.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              🗓️ Automatischer Event-Import
            </h3>
            <p className="text-text-secondary">
              Deine Events werden automatisch aus den Community-Gruppen importiert und auf deinem
              Profil angezeigt.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              🌱 Wachse mit der Community
            </h3>
            <p className="text-text-secondary">
              Vernetze dich mit anderen Anbietern in deiner Region. Empfehlungen und echtes
              Miteinander statt Einzelkampf.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              ✏️ Trage dich ein
            </h3>
            <p className="text-text-secondary">
              Erstelle dein Profil, beschreibe deine Arbeit und verlinke deine Website —
              ganz einfach über unser Einreichungsformular.
            </p>
          </div>
        </div>
      </section>

      {/* Für wen */}
      <section className="rounded-3xl bg-bg-secondary px-6 py-10 sm:px-10">
        <h2 className="mb-6 text-center text-3xl font-normal text-text-primary sm:text-4xl">
          Für wen ist Das Portal?
        </h2>
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
          {[
            "Coaches",
            "Heiler",
            "Schamanen",
            "Therapeuten",
            "Yogalehrer",
            "Meditationslehrer",
            "Facilitators",
            "Workshop-Leiter",
            "Breathwork-Guides",
            "Klangheiler",
          ].map((role) => (
            <span
              key={role}
              className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm font-medium text-text-primary"
            >
              {role}
            </span>
          ))}
        </div>
        <p className="mt-6 text-center text-text-secondary">
          Wenn du ganzheitlich arbeitest, ist Das Portal für dich gemacht — egal wo in Deutschland.
        </p>
      </section>

      {/* So funktioniert es */}
      <section className="space-y-10">
        <h2 className="text-center text-3xl font-normal text-text-primary sm:text-4xl">
          So funktioniert es
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-sage text-xl font-bold text-white">
              1
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">Trage dich ein</h3>
            <p className="text-text-secondary">
              Fülle das kurze Einreichungsformular aus — dein Profil, deine Events oder deinen Raum. Dauert keine 5 Minuten.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary text-xl font-bold text-white">
              2
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">Wir prüfen und veröffentlichen</h3>
            <p className="text-text-secondary">
              Dein Eintrag wird kurz geprüft und dann auf Das Portal veröffentlicht — mit eigenem Profil und SEO-Sichtbarkeit.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-secondary text-xl font-bold text-white">
              3
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">Werde gefunden</h3>
            <p className="text-text-secondary">
              Menschen in deiner Region finden dich über die Suche, den Event-Kalender oder
              Empfehlungen.
            </p>
          </div>
        </div>
      </section>

      {/* Vergleichstabelle */}
      <section className="space-y-6">
        <h2 className="text-center text-3xl font-normal text-text-primary sm:text-4xl">
          Wie Das Portal sich unterscheidet
        </h2>

        {/* Desktop: Tabelle */}
        <div className="hidden overflow-hidden rounded-2xl border border-border sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-secondary">
                <th className="px-4 py-3 font-medium text-text-muted" />
                <th className="px-4 py-3 font-semibold text-accent-primary">Das Portal</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Eventbrite</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Meetup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Kosten</td>
                <td className="px-4 py-3 font-semibold text-accent-sage">Kostenlos</td>
                <td className="px-4 py-3 text-text-secondary">Commission</td>
                <td className="px-4 py-3 text-text-secondary">Ab 168 €/Jahr</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Eigenes Profil</td>
                <td className="px-4 py-3 font-semibold text-accent-sage">Ja</td>
                <td className="px-4 py-3 text-text-secondary">Nein</td>
                <td className="px-4 py-3 text-text-secondary">Gruppen-Seite</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Zielgruppe</td>
                <td className="px-4 py-3 font-semibold text-accent-sage">Bewusste Events</td>
                <td className="px-4 py-3 text-text-secondary">Alles</td>
                <td className="px-4 py-3 text-text-secondary">Hobbys</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">SEO-Profil</td>
                <td className="px-4 py-3 font-semibold text-accent-sage">Ja</td>
                <td className="px-4 py-3 text-text-secondary">—</td>
                <td className="px-4 py-3 text-text-secondary">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile: Cards */}
        <div className="grid gap-4 sm:hidden">
          {[
            { label: "Kosten", portal: "Kostenlos", rest: "Eventbrite: Commission · Meetup: Ab 168 €/Jahr" },
            { label: "Eigenes Profil", portal: "Ja", rest: "Eventbrite: Nein · Meetup: Gruppen-Seite" },
            { label: "Zielgruppe", portal: "Bewusste Events", rest: "Eventbrite: Alles · Meetup: Hobbys" },
            { label: "SEO-Profil", portal: "Ja", rest: "Eventbrite: — · Meetup: —" },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-xs font-medium text-text-muted">{row.label}</p>
              <p className="mt-1 text-base font-semibold text-accent-sage">Das Portal: {row.portal}</p>
              <p className="mt-1 text-xs text-text-secondary">{row.rest}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-6">
        <h2 className="text-center text-3xl font-normal text-text-primary sm:text-4xl">
          Häufige Fragen
        </h2>
        <div className="mx-auto max-w-2xl divide-y divide-border rounded-2xl border border-border bg-bg-card">
          {[
            {
              q: "Kostet Das Portal etwas?",
              a: "Nein, Das Portal ist komplett kostenlos — für Anbieter und Besucher. Kein Abo, keine Provision.",
            },
            {
              q: "Wie werden Events importiert?",
              a: "Events werden automatisch aus Community-Gruppen importiert. Zusätzlich kannst du eigene Events über das Einreichungsformular eintragen.",
            },
            {
              q: "Kann ich mein Profil bearbeiten?",
              a: "Im Moment kannst du dein Profil über das Einreichungsformular anlegen. Ein eigenes Dashboard mit Bearbeitungsfunktion kommt bald.",
            },
            {
              q: "Muss ich in einer bestimmten Region sein?",
              a: "Nein, Das Portal ist deutschlandweit offen. Egal ob du in Hamburg, Berlin, München oder auf dem Land arbeitest.",
            },
          ].map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-text-primary hover:bg-bg-secondary/50">
                <span className="font-medium">{faq.q}</span>
                <span className="ml-2 text-text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-text-secondary">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="eintragen"
        className="scroll-mt-24 rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] px-6 py-10 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:px-10 sm:py-14"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-normal text-text-primary sm:text-4xl">
            Bereit? Trag dich ein.
          </h2>
          <p className="mt-3 text-text-secondary">
            Erstelle dein Profil, reiche deine Events ein oder trage deinen Raum ein — komplett kostenlos.
          </p>
          <Link
            href="/einreichen"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-lg font-semibold text-white transition hover:brightness-95"
          >
            Jetzt eintragen
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
