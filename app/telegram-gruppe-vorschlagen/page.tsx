import type { Metadata } from "next";
import Link from "next/link";
import { SuggestGroupForm } from "@/components/SuggestGroupForm";

export const metadata: Metadata = {
  title: "Telegram-Gruppe vorschlagen — Das Portal",
  description:
    "Kennst du eine Telegram-Gruppe mit ganzheitlichen Events in Norddeutschland? Schlag sie vor und hilf uns, alle Termine sichtbar zu machen.",
  alternates: {
    canonical: "https://das-portal.online/telegram-gruppe-vorschlagen",
  },
};

export default function SuggestGroupPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          Telegram-Gruppe vorschlagen
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Du kennst eine Telegram-Gruppe in der ganzheitliche Events geteilt
          werden? Schlag sie uns vor — wir nehmen sie in unsere
          Event-Erkennung auf.
        </p>
      </section>

      {/* Formular */}
      <section className="mt-10 rounded-2xl border border-border bg-bg-card p-6 sm:p-8">
        <SuggestGroupForm />
      </section>

      {/* Erklärung */}
      <section className="mt-10 space-y-4 text-text-secondary">
        <h2 className="text-lg font-semibold text-text-primary">
          Wie funktioniert das?
        </h2>
        <p className="leading-relaxed">
          Das Portal erkennt Events automatisch aus Telegram-Gruppen in
          Norddeutschland. Je mehr Gruppen wir kennen, desto vollständiger
          wird die Event-Übersicht. Dein Vorschlag hilft der ganzen
          Community.
        </p>
        <p className="leading-relaxed">
          Nach deinem Vorschlag prüfen wir die Gruppe und nehmen sie auf,
          sobald wir beigetreten sind. Du musst nichts weiter tun.
        </p>
      </section>

      {/* Zurück */}
      <div className="mt-10 text-center">
        <Link
          href="/events"
          className="text-sm text-accent-primary hover:underline"
        >
          Zurück zur Event-Übersicht
        </Link>
      </div>
    </div>
  );
}
