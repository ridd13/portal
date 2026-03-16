import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EventCard } from "@/components/EventCard";
import { formatEventDate } from "@/lib/event-utils";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";
import { SocialLinks } from "@/components/SocialLinks";
import type { Event, Host } from "@/lib/types";

interface HostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: HostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();
  const { data: host } = await supabase
    .from("hosts")
    .select("name, slug, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!host) return { title: "Host nicht gefunden" };

  const siteUrl = getSiteUrl();
  const typedHost = host as { name: string; slug: string; description: string | null };
  const description = typedHost.description?.slice(0, 155) || `Events von ${typedHost.name}`;

  return {
    title: typedHost.name,
    description,
    openGraph: {
      type: "profile",
      locale: "de_DE",
      url: `${siteUrl}/hosts/${slug}`,
      title: typedHost.name,
      description,
    },
    alternates: { canonical: `/hosts/${slug}` },
  };
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
      <section className="mx-auto max-w-4xl rounded-2xl border border-error-border bg-error-bg p-6 text-error-text">
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
          {typedHost.telegram_username ? (
            <a
              href={`https://t.me/${typedHost.telegram_username}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              @{typedHost.telegram_username}
            </a>
          ) : null}
          <Link
            href="/events"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-secondary"
          >
            Zur Event-Übersicht
          </Link>
        </div>
        {typedHost.social_links ? (
          <div className="mt-4">
            <SocialLinks links={typedHost.social_links as Record<string, string>} />
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-normal text-text-primary">Kommende Events</h2>
          {events[0] ? (
            <p className="text-sm text-text-secondary">
              Nächstes Event: {formatEventDate(events[0].start_at)}
            </p>
          ) : null}
        </div>

        {eventsError ? (
          <div className="rounded-2xl border border-error-border bg-error-bg p-4 text-sm text-error-text">
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
