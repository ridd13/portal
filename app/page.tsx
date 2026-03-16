import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { EventCard } from "@/components/EventCard";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Das Portal | Ganzheitliche Events in deiner Nähe",
  description:
    "Entdecke Breathwork, Yoga, Sound Healing, Kakao-Zeremonien und mehr in Hamburg & Schleswig-Holstein.",
};

export const revalidate = 300; // ISR: alle 5 Minuten neue Event-Daten

export default async function LandingPage() {
  const supabase = getSupabaseServerClient();

  // Nächste 4 Events als Preview laden
  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(4);

  const upcomingEvents = (data || []) as Event[];

  // Statistiken fuer Social Proof
  const { count: eventCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString());

  const { count: hostCount } = await supabase
    .from("hosts")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-16 pb-8">
      {/* Hero — Besucher-fokussiert */}
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] px-6 py-12 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:px-10 sm:py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-accent-sage">
          Hamburg & Schleswig-Holstein
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text-primary sm:text-5xl lg:text-6xl">
          Entdecke ganzheitliche
          <br />
          Events in deiner Nähe
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary sm:text-xl">
          Breathwork, Yoga, Sound Healing, Kakao-Zeremonien und mehr — finde dein nächstes
          transformatives Erlebnis.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/events"
            className="inline-flex items-center rounded-xl bg-accent-primary px-6 py-3 text-base font-semibold text-white shadow-md transition hover:brightness-95"
          >
            Events entdecken
          </Link>
          <Link
            href="/fuer-facilitators"
            className="inline-flex items-center rounded-xl border border-border bg-bg-card px-6 py-3 text-base font-medium text-text-primary transition hover:bg-bg-secondary"
          >
            Du bist Facilitator?
          </Link>
        </div>

        {/* Social Proof */}
        {(eventCount || hostCount) ? (
          <div className="mt-8 flex gap-8">
            {eventCount ? (
              <div>
                <p className="text-3xl font-bold text-accent-primary">{eventCount}+</p>
                <p className="text-sm text-text-muted">Kommende Events</p>
              </div>
            ) : null}
            {hostCount ? (
              <div>
                <p className="text-3xl font-bold text-accent-primary">{hostCount}+</p>
                <p className="text-sm text-text-muted">Anbieter:innen</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Event-Previews */}
      {upcomingEvents.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-normal text-text-primary sm:text-3xl">
              Nächste Events
            </h2>
            <Link
              href="/events"
              className="text-sm font-semibold text-accent-secondary hover:underline"
            >
              Alle Events anzeigen
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Kategorie-Kacheln */}
      <section className="space-y-6">
        <h2 className="text-center text-2xl font-normal text-text-primary sm:text-3xl">
          Was interessiert dich?
        </h2>
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
          {[
            "Breathwork",
            "Yoga",
            "Sound Healing",
            "Kakao-Zeremonie",
            "Meditation",
            "Tantra",
            "Workshop",
            "Community",
          ].map((category) => (
            <Link
              key={category}
              href={`/events?tag=${encodeURIComponent(category.toLowerCase())}`}
              className="rounded-full border border-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-primary transition hover:bg-bg-secondary hover:text-accent-primary"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Telegram CTA */}
      <section className="rounded-3xl bg-bg-secondary px-6 py-10 text-center sm:px-10">
        <h2 className="text-2xl font-normal text-text-primary sm:text-3xl">
          Keine Events verpassen
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-text-secondary">
          Erhalte tägliche Event-Updates direkt auf dein Handy — in unserem Telegram-Kanal.
        </p>
        <a
          href="https://t.me/dasgrosseportal"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-base font-semibold text-white shadow-md transition hover:brightness-95"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          Telegram-Kanal beitreten
        </a>
      </section>
    </div>
  );
}
