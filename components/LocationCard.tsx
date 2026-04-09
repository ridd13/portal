import Link from "next/link";
import Image from "next/image";
import type { Location } from "@/lib/types";

interface LocationCardProps {
  location: Location;
}

const TYPE_LABELS: Record<string, string> = {
  venue: "Veranstaltungsort",
  retreat_center: "Retreat-Zentrum",
  outdoor: "Outdoor",
  coworking: "Coworking",
  online: "Online",
  private: "Privat",
  other: "Sonstiges",
};

const TYPE_COLORS: Record<string, string> = {
  venue: "bg-accent-sage/15 text-accent-sage",
  retreat_center: "bg-accent-primary/15 text-accent-primary",
  outdoor: "bg-green-100 text-green-800",
  coworking: "bg-blue-100 text-blue-800",
  online: "bg-purple-100 text-purple-800",
  private: "bg-gray-100 text-gray-600",
  other: "bg-bg-secondary text-text-secondary",
};

export function LocationCard({ location }: LocationCardProps) {
  const typeLabel = TYPE_LABELS[location.type] || location.type;
  const typeColor = TYPE_COLORS[location.type] || TYPE_COLORS.other;
  const cityDisplay = [location.city, location.region].filter(Boolean).join(", ");

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_8px_24px_rgba(44,36,24,0.08)] transition-shadow duration-200 hover:shadow-[0_12px_32px_rgba(44,36,24,0.14)]">
      <Link
        href={`/locations/${location.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`${location.name} — Details anzeigen`}
      />

      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-secondary">
        {location.cover_image_url ? (
          <Image
            src={location.cover_image_url}
            alt={location.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-10 w-10 text-text-muted/40"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          </div>
        )}

        {/* Type Badge */}
        <span
          className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${typeColor}`}
        >
          {typeLabel}
        </span>

        {/* Overnight Badge */}
        {location.overnight_possible ? (
          <span className="absolute top-3 right-3 rounded-full bg-accent-primary/15 px-3 py-1 text-xs font-semibold text-accent-primary">
            Übernachtung möglich
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
          {location.name}
        </h3>

        {cityDisplay ? (
          <p className="mt-1 text-sm text-text-secondary">{cityDisplay}</p>
        ) : location.address ? (
          <p className="mt-1 text-sm text-text-secondary line-clamp-1">{location.address}</p>
        ) : null}

        {location.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">
            {location.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-3 pt-4">
          {location.event_count > 0 ? (
            <span className="text-xs text-text-muted">
              {location.event_count} {location.event_count === 1 ? "Event" : "Events"}
            </span>
          ) : null}

          {location.amenities && location.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {location.amenities.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-muted"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
