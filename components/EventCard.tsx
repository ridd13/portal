import Link from "next/link";
import Image from "next/image";
import type { Event, EventFormat } from "@/lib/types";
import {
  formatEventDate,
  formatPrice,
  getCityFromAddress,
  getHostPreview,
  FORMAT_LABELS,
  FORMAT_COLORS,
} from "@/lib/event-utils";

interface EventCardProps {
  event: Event;
}

// Tags that duplicate the event_format badge — hide in card
const FORMAT_TAG_NAMES = new Set(["retreat", "workshop", "festival", "kurs", "kreis"]);

export function EventCard({ event }: EventCardProps) {
  const host = getHostPreview(event);
  const city = getCityFromAddress(event.address);
  const displayTags = (event.tags ?? []).filter((t) => !FORMAT_TAG_NAMES.has(t.toLowerCase()));

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_8px_24px_rgba(44,36,24,0.08)] transition-shadow duration-200 hover:shadow-[0_12px_32px_rgba(44,36,24,0.14)]">
      <Link
        href={`/events/${event.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`${event.title} — Details anzeigen`}
      />
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
        <div className="flex flex-wrap gap-1.5">
          {event.event_format && event.event_format !== "event" ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${FORMAT_COLORS[event.event_format]}`}
            >
              {FORMAT_LABELS[event.event_format]}
            </span>
          ) : null}
          {displayTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-tag-bg px-2.5 py-0.5 text-xs font-medium text-text-secondary"
            >
              {tag}
            </span>
          ))}
          {displayTags.length > 2 ? (
            <span className="rounded-full bg-tag-bg px-2.5 py-0.5 text-xs font-medium text-text-muted">
              +{displayTags.length - 2}
            </span>
          ) : null}
        </div>

        <h2 className="line-clamp-2 text-xl font-normal text-text-primary">
          {event.title}
        </h2>

        <p className="text-sm text-text-secondary">
          {host ? (
            <>
              mit{" "}
              {host.slug ? (
                <Link
                  href={`/hosts/${host.slug}`}
                  className="relative z-20 font-medium text-accent-secondary hover:underline"
                >
                  {host.name}
                </Link>
              ) : (
                <span className="font-medium text-accent-secondary">{host.name}</span>
              )}
            </>
          ) : (
            "Unbekannter Anbieter"
          )}
        </p>

        {event.is_online ? (
          <p className="text-sm font-medium text-accent-sage">
            💻 Online
          </p>
        ) : (
          <p className="text-sm text-text-muted">
            {[event.location_name, city].filter(Boolean).join(", ") || "Ort folgt"}
          </p>
        )}

        {event.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
            {event.description}
          </p>
        ) : (
          <p className="text-sm text-text-muted">Beschreibung folgt.</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-sm font-medium text-text-secondary">
            {formatPrice(event.price_model, event.price_amount)}
          </span>
          <span className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition group-hover:brightness-95">
            Details
          </span>
        </div>
      </div>
    </article>
  );
}
