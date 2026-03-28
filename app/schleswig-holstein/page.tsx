import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Events in Schleswig-Holstein — Das Portal",
  description:
    "Ganzheitliche Events in Schleswig-Holstein: Retreats, Yoga, Meditation und Community-Formate in Kiel, Lübeck, Flensburg und der ganzen Region.",
  alternates: {
    canonical: "https://www.das-portal.online/schleswig-holstein",
  },
  openGraph: {
    title: "Events in Schleswig-Holstein — Das Portal",
    description:
      "Alle ganzheitlichen Events in Schleswig-Holstein auf einen Blick.",
    url: "https://www.das-portal.online/schleswig-holstein",
    siteName: "Das Portal",
    locale: "de_DE",
    type: "website",
  },
};

const categories = [
  {
    title: "Ganzheitliche Events",
    description:
      "Von Kiel bis Flensburg, von Lübeck bis an die Westküste — Retreats, Workshops, Zeremonien und Community-Formate aus ganz Schleswig-Holstein.",
    href: "/schleswig-holstein/ganzheitliche-events",
  },
];

const cities = [
  { name: "Kiel", href: "/events?city=Kiel" },
  { name: "Lübeck", href: "/events?city=Lübeck" },
  { name: "Flensburg", href: "/events?city=Flensburg" },
  { name: "Neumünster", href: "/events?city=Neumünster" },
  { name: "Hamburg", href: "/hamburg" },
];

export default function SchleswigHolsteinPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-8 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-12">
        <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
          Schleswig-Holstein · Ganzheitliche Region
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Events in Schleswig-Holstein
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Schleswig-Holstein bietet Retreats in Gutshäusern, Yoga an der
          Ostsee, Meditationsabende in Kiel und Lübeck — Das Portal bündelt
          alle ganzheitlichen Termine der Region.
        </p>
        <div className="mt-6">
          <Link
            href="/events"
            className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Alle Events ansehen →
          </Link>
        </div>
      </section>

      <section className="mt-12">
        {categories.map(({ title, description, href }) => (
          <Link
            key={href}
            href={href}
            className="group block rounded-2xl border border-border bg-bg-card p-6 transition-shadow hover:shadow-md"
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

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-text-primary">
          Events nach Stadt
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {cities.map(({ name, href }) => (
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

      <section className="mt-12 rounded-2xl border border-border bg-bg-card p-6 text-center">
        <p className="text-text-secondary">
          Du bist Anbieter:in in Schleswig-Holstein?
        </p>
        <Link
          href="/fuer-facilitators"
          className="mt-3 inline-block text-sm text-accent-primary hover:underline"
        >
          Erfahre wie du deine Events auf Das Portal bringst →
        </Link>
      </section>
    </div>
  );
}
