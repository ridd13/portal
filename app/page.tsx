import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Das Portal | Sichtbarkeit für Coaches, Heiler & Facilitators",
  description:
    "Die Plattform für ganzheitliche Anbieter in Norddeutschland. Werde sichtbar, zeige deine Events und erreiche die Menschen, die dich suchen.",
};

interface LandingPageProps {
  searchParams: Promise<{ confirmed?: string }>;
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-16 pb-8">
      {/* Bestätigungs-Banner */}
      {params.confirmed === "success" && (
        <div className="rounded-2xl border border-success-border bg-success-bg p-4 text-center text-success-text">
          Deine E-Mail ist bestätigt — du bist offiziell auf der Warteliste!
        </div>
      )}
      {params.confirmed === "already" && (
        <div className="rounded-2xl border border-border bg-bg-card p-4 text-center text-text-secondary">
          Deine E-Mail wurde bereits bestätigt.
        </div>
      )}
      {params.confirmed === "invalid" && (
        <div className="rounded-2xl border border-error-border bg-error-bg p-4 text-center text-error-text">
          Ungültiger Bestätigungslink. Bitte trage dich erneut ein.
        </div>
      )}

      {/* Hero */}
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] px-6 py-12 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:px-10 sm:py-16">
        <p className="mb-3 text-sm uppercase tracking-[0.18em] text-accent-sage font-medium">
          Bald verfügbar — Schleswig-Holstein & Hamburg
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text-primary sm:text-5xl lg:text-6xl">
          Deine Arbeit verdient
          <br />
          Sichtbarkeit.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary sm:text-xl">
          Das Portal ist die Plattform für Coaches, Heiler:innen und Facilitators, die ihre Events
          und Angebote den richtigen Menschen zeigen wollen — ohne Marketing-Stress.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#warteliste"
            className="inline-flex items-center rounded-xl bg-accent-primary px-6 py-3 text-base font-semibold text-white shadow-md transition hover:brightness-95"
          >
            Jetzt auf die Warteliste
          </a>
          <Link
            href="/events"
            className="inline-flex items-center rounded-xl border border-border bg-bg-card px-6 py-3 text-base font-medium text-text-primary transition hover:bg-bg-secondary"
          >
            Events ansehen
          </Link>
        </div>
      </section>

      {/* Problem → Lösung */}
      <section className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl">
            Kennst du das?
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <div className="mb-3 text-2xl">🔇</div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Deine Events bleiben unsichtbar
            </h3>
            <p className="text-text-secondary">
              Du veranstaltest Workshops, Retreats oder Zeremonien — aber die Menschen in deiner
              Region wissen nichts davon.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <div className="mb-3 text-2xl">😤</div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Marketing frisst deine Energie
            </h3>
            <p className="text-text-secondary">
              Social Media, Website, Newsletter — du bist Experte in deinem Fach, nicht in
              Online-Marketing.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <div className="mb-3 text-2xl">🏝️</div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
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
          <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl">
            Was Das Portal für dich tut
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
            Wir machen dich sichtbar — ohne dass du dafür zum Marketing-Profi werden musst.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              📍 Dein Profil im Anbieter-Verzeichnis
            </h3>
            <p className="text-text-secondary">
              Werde gefunden, wenn Menschen in deiner Stadt nach Coaching, Heilarbeit oder
              spirituellen Angeboten suchen. Kostenloser Basis-Eintrag.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              🗓️ Deine Events auf einen Blick
            </h3>
            <p className="text-text-secondary">
              Zeige deine Workshops, Retreats und Zeremonien auf der regionalen Event-Übersicht.
              Filter nach Stadt, Thema und Format.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              🌱 Wachse mit der Community
            </h3>
            <p className="text-text-secondary">
              Vernetze dich mit anderen Anbietern in deiner Region. Empfehlungen, gemeinsame
              Events und echtes Miteinander statt Einzelkampf.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              📊 Verstehe deine Reichweite
            </h3>
            <p className="text-text-secondary">
              Sieh, wer dein Profil besucht, welche Events Interesse wecken und wo du mehr
              erreichen kannst. Daten statt Bauchgefühl.
            </p>
          </div>
        </div>
      </section>

      {/* Für wen */}
      <section className="rounded-3xl bg-bg-secondary px-6 py-10 sm:px-10">
        <h2 className="mb-6 text-center text-3xl font-semibold text-text-primary sm:text-4xl">
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
          ist das Portal für dich gemacht.
        </p>
      </section>

      {/* Wie es funktioniert */}
      <section className="space-y-10">
        <h2 className="text-center text-3xl font-semibold text-text-primary sm:text-4xl">
          So funktioniert es
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-sage text-xl font-bold text-white">
              1
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Trag dich ein
            </h3>
            <p className="text-text-secondary">
              Komm auf die Warteliste. Wir starten mit einem kleinen Kreis in SH & Hamburg.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary text-xl font-bold text-white">
              2
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Erstelle dein Profil
            </h3>
            <p className="text-text-secondary">
              Beschreibe deine Arbeit, füge deine Events hinzu und zeig, was dich ausmacht.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-secondary text-xl font-bold text-white">
              3
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Werde gefunden
            </h3>
            <p className="text-text-secondary">
              Menschen in deiner Region finden dich über die Suche, den Event-Kalender oder
              Empfehlungen.
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section
        id="warteliste"
        className="scroll-mt-24 rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] px-6 py-10 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:px-10 sm:py-14"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl">
            Sei von Anfang an dabei
          </h2>
          <p className="mt-3 text-text-secondary">
            Wir starten 2026 mit einem kleinen Pilotprojekt in Schleswig-Holstein und Hamburg.
            Sichere dir jetzt deinen Platz und gestalte das Portal von Beginn an mit.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <WaitlistForm />
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Kein Spam. Nur Updates zum Launch. Du kannst dich jederzeit abmelden.
        </p>

        <div className="mt-6 text-center">
          <p className="mb-3 text-sm text-text-secondary">
            Oder tritt direkt unserer Community bei:
          </p>
          <a
            href="https://t.me/dasgrosseportal"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-primary transition hover:bg-bg-secondary"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-accent-primary" aria-hidden="true">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Telegram-Kanal beitreten
          </a>
        </div>
      </section>
    </div>
  );
}
