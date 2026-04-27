import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eintragen",
  description:
    "Reiche dein Event, dein Profil oder deinen Ort bei Das Portal ein – kostenlos und ohne Registrierung.",
  alternates: { canonical: "https://das-portal.online/einreichen" },
};

const cards = [
  {
    title: "Event einreichen",
    description: "Workshop, Zeremonie, Retreat oder Seminar – stelle dein Event vor.",
    href: "/einreichen/event",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: "Profil erstellen",
    description: "Zeig dich als Facilitator, Coach oder Heiler auf Das Portal.",
    href: "/einreichen/host",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    title: "Ort hinzufügen",
    description: "Studio, Retreat-Zentrum oder Outdoor-Spot – teile einen besonderen Ort.",
    href: "/einreichen/location",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
];

export default function EinreichenPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section className="text-center">
        <h1 className="font-serif text-3xl font-semibold text-text-primary sm:text-4xl">
          Bei Das Portal eintragen
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-text-secondary">
          Du möchtest ein Event vorstellen, dein Profil anlegen oder einen Ort teilen?
          Alles geht ohne Registrierung – und ist kostenlos.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col rounded-2xl border border-border bg-bg-card p-6 transition hover:border-accent-primary/40 hover:shadow-lg"
          >
            <div className="mb-4 text-accent-primary">{card.icon}</div>
            <h2 className="font-serif text-lg font-semibold text-text-primary group-hover:text-accent-primary">
              {card.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-text-secondary">{card.description}</p>
            <span className="mt-4 text-sm font-medium text-accent-primary">
              Zum Formular &rarr;
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl bg-bg-secondary p-5 text-center text-sm text-text-secondary">
        Alle Einträge werden vor der Veröffentlichung geprüft.
      </div>
    </div>
  );
}
