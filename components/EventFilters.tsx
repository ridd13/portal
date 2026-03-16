"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface EventFiltersProps {
  tags: string[];
  cities: string[];
  selectedTag?: string;
  selectedCity?: string;
  searchQuery?: string;
  selectedFromDate?: string;
  selectedToDate?: string;
}

/** Return today as YYYY-MM-DD in local time. */
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function EventFilters({
  tags,
  cities,
  selectedTag = "",
  selectedCity = "",
  searchQuery = "",
  selectedFromDate = "",
  selectedToDate = "",
}: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tag, setTag] = useState(selectedTag);
  const [city, setCity] = useState(selectedCity);
  const [query, setQuery] = useState(searchQuery);
  const [fromDate, setFromDate] = useState(selectedFromDate);
  const [toDate, setToDate] = useState(selectedToDate);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const applyFilters = (overrides?: {
    from?: string;
    to?: string;
  }) => {
    const next = new URLSearchParams(searchParams.toString());

    if (tag) next.set("tag", tag);
    else next.delete("tag");

    if (city.trim()) next.set("city", city.trim());
    else next.delete("city");

    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");

    const f = overrides?.from ?? fromDate;
    const t = overrides?.to ?? toDate;

    if (f) next.set("from", f);
    else next.delete("from");

    if (t) next.set("to", t);
    else next.delete("to");

    // Remove PLZ param (comes from middleware rewrite, not user-controlled)
    next.delete("plz");

    const params = next.toString();
    router.push(params ? `/events?${params}` : "/events");
  };

  const setQuickDate = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    // Apply immediately
    applyFilters({ from, to });
  };

  const getNextWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek);
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    return {
      from: saturday.toISOString().split("T")[0],
      to: sunday.toISOString().split("T")[0],
    };
  };

  const getThisWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      from: monday.toISOString().split("T")[0],
      to: sunday.toISOString().split("T")[0],
    };
  };

  const getNext30Days = () => {
    const today = todayStr();
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    return {
      from: today,
      to: in30.toISOString().split("T")[0],
    };
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 space-y-4 rounded-2xl border border-border bg-bg-secondary p-4 shadow-[0_6px_20px_rgba(44,36,24,0.06)]"
    >
      {/* Row 1: Tag, City, Search, Submit */}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.5fr_auto]">
        <select
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
        >
          <option value="">Alle Kategorien</option>
          {tags.map((availableTag) => (
            <option key={availableTag} value={availableTag}>
              {availableTag}
            </option>
          ))}
        </select>

        <select
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
        >
          <option value="">Alle Städte</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Suche nach Events..."
          className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-sage"
        />

        <button
          type="submit"
          className="rounded-xl bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Suchen
        </button>
      </div>

      {/* Row 2: Date Range */}
      <div className="space-y-2">
        <p className="font-serif text-sm font-semibold text-text-primary">
          Zeitraum
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="from-date" className="mb-1 block text-xs text-text-secondary">
              Von
            </label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
            />
          </div>
          <div>
            <label htmlFor="to-date" className="mb-1 block text-xs text-text-secondary">
              Bis
            </label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
            />
          </div>
        </div>

        {/* Quick-Select Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setQuickDate(todayStr(), todayStr())}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-text-secondary transition hover:bg-bg-card"
          >
            Heute
          </button>
          <button
            type="button"
            onClick={() => {
              const we = getNextWeekend();
              setQuickDate(we.from, we.to);
            }}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-text-secondary transition hover:bg-bg-card"
          >
            Dieses Wochenende
          </button>
          <button
            type="button"
            onClick={() => {
              const w = getThisWeek();
              setQuickDate(w.from, w.to);
            }}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-text-secondary transition hover:bg-bg-card"
          >
            Diese Woche
          </button>
          <button
            type="button"
            onClick={() => {
              const d = getNext30Days();
              setQuickDate(d.from, d.to);
            }}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-text-secondary transition hover:bg-bg-card"
          >
            30 Tage
          </button>
          <button
            type="button"
            onClick={() => setQuickDate("", "")}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-text-secondary transition hover:bg-bg-card"
          >
            Alle
          </button>
        </div>
      </div>
    </form>
  );
}
