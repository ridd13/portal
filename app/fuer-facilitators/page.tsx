import type { Metadata } from "next";
import { ProviderSignupForm } from "@/components/ProviderSignupForm";

export const metadata: Metadata = {
  title: "Für Anbieter:innen | Das Portal",
  description:
    "Werde sichtbar als Coach, Heiler:in oder Facilitator. Registriere dich auf Das Portal und erreiche die Menschen, die dich suchen.",
};

export default function FacilitatorsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 pb-8">
      {/* Hero */}
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] px-6 py-12 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:px-10 sm:py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-accent-sage">
          Für Anbieter:innen
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Deine Arbeit verdient
          <br />
          Sichtbarkeit.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary sm:text-xl">
          Das Portal ist die Plattform für Coaches, Heiler:innen und Facilitators, die ihre Events
          und Angebote den richtigen Menschen zeigen wollen — ohne Marketing-Stress.
        </p>
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
              Vernetze dich mit anderen Anbieter:innen in deiner Region. Empfehlungen und echtes
              Miteinander statt Einzelkampf.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-normal text-text-primary">
              ✏️ Ergänze dein Profil
            </h3>
            <p className="text-text-secondary">
              Beschreibe deine Arbeit, verlinke deine Website und zeig, was dich ausmacht —
              alles über dein persönliches Dashboard.
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
            "Heiler:innen",
            "Schamanen",
            "Therapeut:innen",
            "Yogalehrer:innen",
            "Meditationslehrer:innen",
            "Facilitators",
            "Workshop-Leiter:innen",
            "Breathwork-Guides",
            "Klangheiler:innen",
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
          Wenn du ganzheitlich arbeitest und in Schleswig-Holstein oder Hamburg aktiv bist,
          ist Das Portal für dich gemacht.
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
            <h3 className="mb-2 text-lg font-normal text-text-primary">Registriere dich</h3>
            <p className="text-text-secondary">
              Gib deine E-Mail ein und bestätige sie per Magic Link. In wenigen Sekunden bist du dabei.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary text-xl font-bold text-white">
              2
            </div>
            <h3 className="mb-2 text-lg font-normal text-text-primary">Beanspruche dein Profil</h3>
            <p className="text-text-secondary">
              Wenn deine Events bereits importiert wurden, kannst du dein Profil beanspruchen und ergänzen.
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

      {/* Registration CTA */}
      <section
        id="registrierung"
        className="scroll-mt-24 rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] px-6 py-10 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:px-10 sm:py-14"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-normal text-text-primary sm:text-4xl">
            Jetzt registrieren
          </h2>
          <p className="mt-3 text-text-secondary">
            Registriere dich und werde Teil der Community. Dein Profil wartet auf dich.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <ProviderSignupForm />
        </div>
      </section>
    </div>
  );
}
