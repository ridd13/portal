import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { formatEventDate, getHostPreview } from "@/lib/event-utils";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Event, Host } from "@/lib/types";

interface EventDetailProps {
  params: Promise<{ slug: string }>;
}

type EventWithHost = Omit<Event, "hosts"> & { hosts: Host | Host[] | null };

export default async function EventDetailPage({ params }: EventDetailProps) {
  const supabase = getSupabaseServerClient();
  const { slug } = await params;

  const { data, error } = await supabase
    .from("events")
    .select("*, hosts(name, slug, description, website_url, social_links)")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    return (
      <article className="mx-auto max-w-3xl rounded-2xl border border-[#e4b6a8] bg-[#f7e8e2] p-6 text-[#7a3f2c]">
        Event konnte nicht geladen werden. Bitte später erneut versuchen.
      </article>
    );
  }

  if (!data) {
    notFound();
  }

  const event = data as EventWithHost;
  const hostRaw = event.hosts;
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;
  const hostPreview = getHostPreview({
    ...event,
    hosts: hostRaw,
  });

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <div className="overflow-hidden rounded-3xl border border-border bg-bg-card shadow-[0_10px_30px_rgba(44,36,24,0.08)]">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            width={1200}
            height={384}
            className="h-72 w-full object-cover sm:h-96"
          />
        ) : (
          <div className="h-72 w-full bg-linear-to-br from-[#f0e2d1] via-[#eadfce] to-[#d5decb] sm:h-96" />
        )}

        <div className="space-y-5 p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-secondary">
              {formatEventDate(event.start_at)}
              {event.end_at ? ` - ${formatEventDate(event.end_at)}` : ""}
            </p>
            <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {event.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#efe6da] px-3 py-1 text-xs font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {event.description ? (
            <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-text-primary">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-text-primary">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => <p>{children}</p>,
                  ul: ({ children }) => (
                    <ul className="list-disc space-y-1 pl-5">{children}</ul>
                  ),
                }}
              >
                {event.description}
              </ReactMarkdown>
            </div>
          ) : null}

          <section className="rounded-2xl border border-border bg-bg-secondary p-4">
            <h2 className="mb-2 text-xl font-semibold text-text-primary">Ort</h2>
            <p className="text-text-secondary">
              {[event.location_name, event.address].filter(Boolean).join(", ") ||
                "Ort wird noch bekanntgegeben."}
            </p>
          </section>

          {host ? (
            <section className="rounded-2xl border border-border bg-bg-secondary p-4">
              <h2 className="mb-2 text-xl font-semibold text-text-primary">Host</h2>
              <p className="font-medium text-text-primary">{hostPreview?.name}</p>
              {host.description ? (
                <p className="mt-2 text-sm text-text-secondary">{host.description}</p>
              ) : null}
              {host.website_url ? (
                <a
                  href={host.website_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-block text-sm font-semibold text-accent-secondary hover:underline"
                >
                  Website besuchen
                </a>
              ) : null}
            </section>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-text-secondary">
              {event.price_model || "Preis auf Anfrage"}
            </p>
            {event.ticket_link ? (
              <a
                href={event.ticket_link}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Zur Anmeldung
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex items-center text-sm font-semibold text-accent-secondary hover:underline"
      >
        Zurück zur Übersicht
      </Link>
    </article>
  );
}
