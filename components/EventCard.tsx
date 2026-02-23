import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/lib/types";
import {
  formatEventDate,
  getCityFromAddress,
  getHostPreview,
} from "@/lib/event-utils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const host = getHostPreview(event);
  const city = getCityFromAddress(event.address);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_8px_24px_rgba(44,36,24,0.08)]">
      <div className="border-b border-border bg-bg-secondary px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {formatEventDate(event.start_at)}
      </div>

      {event.cover_image_url ? (
        <Image
          src={event.cover_image_url}
          alt={event.title}
          width={400}
          height={176}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="h-44 w-full bg-linear-to-br from-bg-secondary via-[#E9DACA] to-[#D8C1A5]" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {event.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-tag-bg px-2.5 py-1 text-xs font-medium text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="line-clamp-2 text-xl font-semibold text-text-primary">
          {event.title}
        </h2>

        <p className="text-sm text-text-secondary">
          {host ? (
            <>
              mit{" "}
              {host.slug ? (
                <Link
                  href={`/hosts/${host.slug}`}
                  className="font-medium text-accent-secondary hover:underline"
                >
                  {host.name}
                </Link>
              ) : (
                <span className="font-medium text-accent-secondary">{host.name}</span>
              )}
            </>
          ) : (
            "Unbekannter Host"
          )}
        </p>

        <p className="text-sm text-text-muted">
          {[event.location_name, city].filter(Boolean).join(", ") || "Ort folgt"}
        </p>

        {event.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
            {event.description}
          </p>
        ) : (
          <p className="text-sm text-text-muted">Beschreibung folgt.</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-sm font-medium text-text-secondary">
            {event.price_model || "Preis auf Anfrage"}
          </span>
          <Link
            href={`/events/${event.slug}`}
            className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
