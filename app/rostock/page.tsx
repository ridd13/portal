import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Rostock — Termine & Community | Das Portal",
  description:
    "Finde ganzheitliche Events in Rostock und Warnemünde: Yoga, Breathwork, Meditation, Sound Healing und Retreats. Aktuelle Termine auf Das Portal.",
  alternates: {
    canonical: "https://www.das-portal.online/rostock",
  },
  openGraph: {
    title: "Ganzheitliche Events in Rostock — Das Portal",
    description:
      "Alle ganzheitlichen Events in Rostock und Warnemünde auf einen Blick.",
    url: "https://www.das-portal.online/rostock",
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

export default async function RostockPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Rostock%,address.ilike.%rostock%,address.ilike.%Warnemünde%,address.ilike.%warnemuende%")
    .order("start_at", { ascending: true })
    .limit(8);

  const events = data || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ganzheitliche Events in Rostock",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Rostock",
    url: "https://www.das-portal.online/rostock",
    isPartOf: { "@type": "WebSite", name: "Das Portal", url: "https://www.das-portal.online" },
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
            Rostock · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Rostock
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Rostock und Warnemünde verbinden Ostsee-Flair mit einer
            aufstrebenden ganzheitlichen Szene. Yoga am Strand, Breathwork
            in der Altstadt, Retreats im Hinterland — Das Portal zeigt alle
            Termine.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Rostock"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Rostock Events →
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
            Nächste Events in Rostock
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Rostocker Community.`
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
              href="/events?city=Rostock"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Rostock Events anzeigen →
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
              { name: "Mecklenburg-Vorpommern", href: "/mecklenburg-vorpommern" },
              { name: "Hamburg", href: "/hamburg" },
              { name: "Kiel", href: "/kiel" },
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
        <section className="mt-16 space-y-6 text-text-primary">
          <h2 className="text-2xl font-semibold">
            Ganzheitliche Szene in Rostock
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Rostock ist die größte Stadt Mecklenburg-Vorpommerns und das
            Tor zur Ostsee. Die Universitätsstadt zieht junge, offene
            Menschen an — und mit ihnen wächst die Nachfrage nach Yoga,
            Meditation und alternativen Gesundheitsformaten. Warnemünde
            bietet mit seinem Strand und dem maritimen Flair einen
            besonderen Rahmen für Outdoor-Events.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Die Kröpeliner-Tor-Vorstadt (KTV) und die Stadtmitte sind die
            Anlaufpunkte für Studios und Veranstaltungsräume. Im Sommer
            verlagern sich viele Formate an den Strand oder in die
            Natur rund um die Warnow. Das Portal sammelt all diese Angebote
            und macht die Rostocker Szene sichtbar.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Du bist Anbieter in Rostock?
          </h2>
          <p className="mt-3 text-text-secondary">
            Mach deine Events sichtbar — kostenlos, ohne Haken.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/fuer-facilitators"
              className="rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              So funktioniert es →
            </Link>
            <Link
              href="https://t.me/+C1QQY29LZlExZWIy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-6 py-3 font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Telegram Community
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
