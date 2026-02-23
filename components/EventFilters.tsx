"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface EventFiltersProps {
  tags: string[];
  cities: string[];
  selectedTag?: string;
  selectedCity?: string;
  searchQuery?: string;
}

export function EventFilters({
  tags,
  cities,
  selectedTag = "",
  selectedCity = "",
  searchQuery = "",
}: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tag, setTag] = useState(selectedTag);
  const [city, setCity] = useState(selectedCity);
  const [query, setQuery] = useState(searchQuery);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());

    if (tag) next.set("tag", tag);
    else next.delete("tag");

    if (city.trim()) next.set("city", city.trim());
    else next.delete("city");

    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");

    router.push(`/?${next.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 rounded-2xl border border-border bg-bg-secondary p-4 shadow-[0_6px_20px_rgba(44,36,24,0.06)]"
    >
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
          placeholder="Suche nach Titel"
          className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-sage"
        />

        <button
          type="submit"
          className="rounded-xl bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Suchen
        </button>
      </div>
    </form>
  );
}
