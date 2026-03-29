import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Ganzheitliche Events in Bremen — Termine & Community | Das Portal",
  description:
    "Finde ganzheitliche Events in Bremen: Yoga, Breathwork, Sound Healing, Kakaozeremonien und Retreats. Aktuelle Termine aus der Bremer Community auf Das Portal.",
  alternates: {
    canonical: "https://www.das-portal.online/bremen",
  },
  openGraph: {
    title: "Ganzheitliche Events in Bremen — Das Portal",
    description:
      "Alle ganzheitlichen Events in Bremen auf einen Blick. Yoga, Meditation, Breathwork und mehr.",
    url: "https://www.das-portal.online/bremen",
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

export default async function BremenPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, slug, start_at, location_name, price_model, tags, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .or("address.ilike.%Bremen%,address.ilike.%bremen%,address.ilike.%Bremerhaven%")
    .order("start_at", { ascending: true })
    .limit(8);

  const events = data || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ganzheitliche Events in Bremen",
    description: "Aktuelle ganzheitliche Events, Workshops und Retreats in Bremen",
    url: "https://www.das-portal.online/bremen",
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
            Bremen · Ganzheitliche Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
            Ganzheitliche Events in Bremen
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Bremen verbindet hanseatische Gelassenheit mit einer wachsenden
            ganzheitlichen Szene. Von Yoga im Viertel bis zu Breathwork-Sessions
            an der Weser — Das Portal zeigt alle Termine.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events?city=Bremen"
              className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Alle Bremen Events →
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
            Nächste Events in Bremen
          </h2>
          <p className="mt-2 text-text-secondary">
            {events.length > 0
              ? `${events.length} anstehende Termine aus der Bremer Community.`
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
              href="/events?city=Bremen"
              className="text-sm text-accent-primary hover:underline"
            >
              Alle Bremen Events anzeigen →
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
              { name: "Hamburg", href: "/hamburg" },
              { name: "Niedersachsen", href: "/niedersachsen" },
              { name: "Schleswig-Holstein", href: "/schleswig-holstein" },
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
            Ganzheitliche Szene in Bremen
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Bremen hat sich in den letzten Jahren als unterschätzter Standort
            für ganzheitliche Formate entwickelt. Das Viertel, Findorff und
            die Neustadt sind Hotspots für Yoga-Studios, Meditationsräume und
            alternative Therapiepraxen. Die überschaubare Größe der Stadt
            sorgt für eine enge, persönliche Community.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Besonders Breathwork, Ecstatic Dance und Cacao-Ceremonies haben
            in Bremen eine aktive Anhängerschaft. Viele Anbieter nutzen die
            Nähe zur Weser und die grünen Flächen im Bürgerpark für
            Outdoor-Formate. Das Portal sammelt diese verstreuten Angebote
            und macht sie zentral auffindbar.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-linear-to-br from-[#f5ece1] to-[#e8ddd4] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            Du bist Anbieter:in in Bremen?
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
