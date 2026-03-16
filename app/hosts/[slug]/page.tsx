import Link from "next/link";
import Image from "next/image";
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

  if (!host) return { title: "Anbieter:in nicht gefunden" };

  const siteUrl = getSiteUrl();
  const typedHost = host as { name: string; slug: string; description: string | null };
  const description = typedHost.description?.slice(0, 155) || `Events von ${typedHost.name} auf Das Portal`;

  return {
    title: `${typedHost.name} | Anbieter:in auf Das Portal`,
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
  const siteUrl = getSiteUrl();

  const { data: host, error: hostError } = await supabase
    .from("hosts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (hostError) {
    return (
      <section className="mx-auto max-w-4xl rounded-2xl border border-error-border bg-error-bg p-6 text-error-text">
        Anbieter:in-Profil konnte nicht geladen werden. Bitte spaeter erneut versuchen.
      </section>
    );
  }

  if (!host) {
    notFound();
  }

  const typedHost = host as Host;
  const profileUrl = `${siteUrl}/hosts/${typedHost.slug}`;
  const initial = typedHost.name.charAt(0).toUpperCase();

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
      {/* Header Section */}
      <section className="rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
        <p className="mb-4 text-sm uppercase tracking-[0.14em] text-text-secondary">
          Anbieter:in-Profil
        </p>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          {typedHost.avatar_url ? (
            <Image
              src={typedHost.avatar_url}
              alt={typedHost.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-sage text-2xl font-semibold text-white">
              {initial}
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl font-semibold text-text-primary sm:text-4xl">
              {typedHost.name}
            </h1>
          </div>
        </div>

        {/* Links */}
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
          {typedHost.email ? (
            <a
              href={`mailto:${typedHost.email}`}
              className="rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
            >
              E-Mail
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

        {/* Description or Unclaimed Placeholder */}
        {typedHost.description ? (
          <p className="mt-6 max-w-3xl leading-relaxed text-text-secondary">
            {typedHost.description}
          </p>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-bg-secondary p-5">
            <p className="text-sm leading-relaxed text-text-secondary">
              {typedHost.name} ist auf Das Portal als Anbieter:in gelistet.
              Dieses Profil wurde noch nicht persönlich beansprucht — sobald{" "}
              {typedHost.name} das Profil übernimmt, findest du hier mehr
              Informationen über Angebote, Hintergrund und Spezialisierungen.
            </p>
            <a
              href={`mailto:portal@justclose.de?subject=${encodeURIComponent(`Profil beanspruchen: ${typedHost.name}`)}&body=${encodeURIComponent(`Hallo, ich möchte mein Profil auf Das Portal beanspruchen.\n\nMein Name: ${typedHost.name}\nProfil-URL: ${profileUrl}`)}`}
              className="mt-4 inline-block rounded-full border border-accent-secondary px-5 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-primary"
            >
              Du bist {typedHost.name}? Profil beanspruchen
            </a>
          </div>
        )}

        {/* Coming soon hint */}
        <p className="mt-4 text-xs text-text-muted">
          Bald können Anbieter:innen hier ihr Profil mit Bildern, Spezialisierungen und mehr ergänzen.
        </p>
      </section>

      {/* Events Section */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-normal text-text-primary">
            Events von {typedHost.name}
          </h2>
          {events[0] ? (
            <p className="text-sm text-text-secondary">
              Nächstes Event: {formatEventDate(events[0].start_at)}
            </p>
          ) : null}
        </div>

        {eventsError ? (
          <div className="rounded-2xl border border-error-border bg-error-bg p-4 text-sm text-error-text">
            Events konnten nicht geladen werden.
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
