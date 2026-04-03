import Link from "next/link";

interface HostCardProps {
  host: {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    avatar_url: string | null;
  };
  upcomingCount: number;
  topTags: string[];
  primaryCity: string | null;
}

export function HostCard({ host, upcomingCount, topTags, primaryCity }: HostCardProps) {
  const initials = host.name.charAt(0).toUpperCase();

  return (
    <Link
      href={host.slug ? `/hosts/${host.slug}` : "#"}
      className="flex flex-col rounded-2xl border border-border bg-bg-card p-5 transition hover:shadow-[0_8px_24px_rgba(44,36,24,0.1)]"
    >
      <div className="flex items-center gap-4">
        {host.avatar_url ? (
          <img
            src={host.avatar_url}
            alt={host.name}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-sage/20 text-lg font-bold text-accent-sage">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-serif text-xl text-text-primary">{host.name}</p>
          {primaryCity ? (
            <p className="text-sm text-text-muted">{primaryCity}</p>
          ) : null}
        </div>
      </div>

      {host.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
          {host.description.slice(0, 120)}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {upcomingCount > 0 ? (
          <span className="rounded-full bg-accent-sage/10 px-3 py-1 text-xs font-medium text-accent-sage">
            {upcomingCount} kommende{upcomingCount === 1 ? "s" : ""} Event{upcomingCount === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="rounded-full bg-bg-secondary px-3 py-1 text-xs font-medium text-text-muted">
            Keine kommenden Events
          </span>
        )}
        {topTags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-bg-secondary px-2.5 py-0.5 text-xs text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
