import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { formatEventDate } from "@/lib/event-utils";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event, Host } from "@/lib/types";

interface HostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const supabase = getSupabaseServerClient();
  const { slug } = await params;

  const { data: host, error: hostError } = await supabase
    .from("hosts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (hostError) {
    return (
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#e4b6a8] bg-[#f7e8e2] p-6 text-[#7a3f2c]">
        Host-Profil konnte nicht geladen werden. Bitte spaeter erneut versuchen.
      </section>
    );
  }

  if (!host) {
    notFound();
  }

  const typedHost = host as Host;

  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .eq("host_id", typedHost.id)
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(8);

  const events = (eventsData || []) as Event[];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
        <p className="mb-2 text-sm uppercase tracking-[0.14em] text-text-secondary">
          Host-Profil
        </p>
        <h1 className="text-4xl font-semibold text-text-primary">{typedHost.name}</h1>
        {typedHost.description ? (
          <p className="mt-4 max-w-3xl text-text-secondary">{typedHost.description}</p>
        ) : (
          <p className="mt-4 text-text-muted">Beschreibung folgt.</p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          {typedHost.website_url ? (
            <a
              href={typedHost.website_url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
            >
              Website
            </a>
          ) : null}
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-secondary"
          >
            Zur Event-Übersicht
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">Kommende Events</h2>
          {events[0] ? (
            <p className="text-sm text-text-secondary">
              Nächstes Event: {formatEventDate(events[0].start_at)}
            </p>
          ) : null}
        </div>

        {eventsError ? (
          <div className="rounded-2xl border border-[#e4b6a8] bg-[#f7e8e2] p-4 text-sm text-[#7a3f2c]">
            Events dieses Hosts konnten nicht geladen werden.
          </div>
        ) : null}

        {!eventsError && events.length === 0 ? (
          <div className="rounded-2xl border border-border bg-bg-card p-8 text-text-secondary">
            Aktuell sind keine zukünftigen öffentlichen Events hinterlegt.
          </div>
        ) : null}

        {events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
