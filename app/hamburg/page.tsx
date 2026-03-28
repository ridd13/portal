import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Events in Hamburg — Das Portal",
  description:
    "Ganzheitliche und spirituelle Events in Hamburg. Kakaozeremonien, Breathwork, Yoga, Retreats und Community-Formate — alle Termine auf Das Portal.",
  alternates: {
    canonical: "https://www.das-portal.online/hamburg",
  },
  openGraph: {
    title: "Events in Hamburg — Das Portal",
    description:
      "Ganzheitliche und spirituelle Events in Hamburg auf einen Blick.",
    url: "https://www.das-portal.online/hamburg",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const categories = [
  {
    title: "Ganzheitliche Events",
    description:
      "Yoga, Breathwork, Meditation, Ecstatic Dance, Retreats und mehr — das volle Spektrum ganzheitlicher Formate in Hamburg.",
    href: "/hamburg/ganzheitliche-events",
  },
  {
    title: "Spirituelle Events",
    description:
      "Kakaozeremonien, Mondrituale, Frauenkreise, Soundhealing und zeremonielle Formate in Hamburg.",
    href: "/hamburg/spirituelle-events",
  },
];

export default function HamburgPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-8 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-12">
        <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
          Hamburg · Ganzheitliche Community
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Events in Hamburg
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Hamburg hat eine der aktivsten ganzheitlichen Communities in
          Norddeutschland. Das Portal bündelt alle Termine — von Breathwork bis
          Kakaozeremonie.
        </p>
        <div className="mt-6">
          <Link
            href="/events?city=Hamburg"
            className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Alle Hamburg Events →
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        {categories.map(({ title, description, href }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-border bg-bg-card p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-text-primary group-hover:text-accent-primary">
              {title}
            </h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
            <span className="mt-4 inline-block text-sm text-accent-primary">
              Termine ansehen →
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-bg-card p-6 text-center">
        <p className="text-text-secondary">
          Du suchst nach einem bestimmten Event in Hamburg?
        </p>
        <Link
          href="/events?city=Hamburg"
          className="mt-3 inline-block text-sm text-accent-primary hover:underline"
        >
          Alle Events mit Filtern durchsuchen →
        </Link>
      </section>
    </div>
  );
}
