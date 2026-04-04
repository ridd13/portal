"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface HostFiltersProps {
  cities: string[];
}

export function HostFilters({ cities }: HostFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSort = searchParams.get("sort") || "events";
  const currentView = searchParams.get("view") || "list";

  const [q, setQ] = useState(currentQ);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`/anbieter?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        {/* Freitext-Suche */}
        <div className="flex-1 basis-48">
          <label htmlFor="host-search" className="mb-1 block text-xs font-medium text-text-muted">
            Suche
          </label>
          <input
            id="host-search"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParams({ q });
            }}
            placeholder="Name oder Beschreibung..."
            className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
          />
        </div>

        {/* Stadt */}
        <div className="basis-40">
          <label htmlFor="host-city" className="mb-1 block text-xs font-medium text-text-muted">
            Stadt
          </label>
          <select
            id="host-city"
            value={currentCity}
            onChange={(e) => updateParams({ city: e.target.value })}
            className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="">Alle Städte</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sortierung */}
        <div className="basis-40">
          <label htmlFor="host-sort" className="mb-1 block text-xs font-medium text-text-muted">
            Sortierung
          </label>
          <select
            id="host-sort"
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="events">Meiste Events</option>
            <option value="alpha">Alphabetisch</option>
            <option value="newest">Neueste</option>
          </select>
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={() => updateParams({ q })}
          className="rounded-xl bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Suchen
        </button>
      </div>

      {/* View Toggle: Liste | Karte */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-bg-secondary p-1">
        <button
          type="button"
          onClick={() => updateParams({ view: "" })}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
            currentView !== "map"
              ? "bg-bg-card text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          Liste
        </button>
        <button
          type="button"
          onClick={() => updateParams({ view: "map" })}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
            currentView === "map"
              ? "bg-bg-card text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          Karte
        </button>
      </div>
    </div>
  );
}
