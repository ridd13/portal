"use client";

import { useMemo, useState } from "react";
import type { Event } from "@/lib/types";
import { createBrowserClient } from "@/lib/supabase";
import { PAGE_SIZE } from "@/lib/event-utils";
import { EventCard } from "@/components/EventCard";

interface EventListProps {
  initialEvents: Event[];
  selectedTag?: string;
  selectedCity?: string;
  searchQuery?: string;
}

export function EventList({
  initialEvents,
  selectedTag = "",
  selectedCity = "",
  searchQuery = "",
}: EventListProps) {
  const [events, setEvents] = useState(initialEvents);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialEvents.length === PAGE_SIZE);
  const [prevInitial, setPrevInitial] = useState(initialEvents);

  const supabase = useMemo(() => createBrowserClient(), []);

  // Reset state when filters change (new initialEvents)
  if (prevInitial !== initialEvents) {
    setPrevInitial(initialEvents);
    setEvents(initialEvents);
    setPage(1);
    setHasMore(initialEvents.length === PAGE_SIZE);
    setLoadError(null);
  }

  const loadMore = async () => {
    setIsLoading(true);
    setLoadError(null);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("events")
      .select("*, hosts(name, slug)")
      .eq("is_public", true)
      .eq("status", "published")
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true })
      .range(from, to);

    if (selectedTag) {
      query = query.contains("tags", [selectedTag]);
    }

    if (selectedCity) {
      query = query.ilike("address", `%${selectedCity}%`);
    }

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      setLoadError("Weitere Events konnten nicht geladen werden. Bitte erneut versuchen.");
      setIsLoading(false);
      return;
    }

    const next = (data || []) as Event[];

    setEvents((previousEvents) => [...previousEvents, ...next]);
    setPage((previousPage) => previousPage + 1);
    setHasMore(next.length === PAGE_SIZE);
    setIsLoading(false);
  };

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-10 text-center text-text-secondary">
        Keine passenden Events gefunden.
      </div>
    );
  }

  return (
    <section>
      {loadError ? (
        <div className="mb-4 rounded-xl border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
          {loadError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-full border border-accent-secondary bg-bg-card px-6 py-2.5 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Lädt..." : "Mehr laden"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
