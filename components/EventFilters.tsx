"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Category, EventFormat } from "@/lib/types";
import { FORMAT_LABELS } from "@/lib/event-utils";

interface EventFiltersProps {
  categories: Category[];
  cities: string[];
  selectedCategory?: string;
  selectedCity?: string;
  searchQuery?: string;
  selectedFromDate?: string;
  selectedToDate?: string;
  selectedFormat?: string;
  showOnline?: boolean;
}

/** Return today as YYYY-MM-DD in local time. */
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const FORMAT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Alle Formate" },
  { value: "event", label: "Events" },
  { value: "workshop", label: "Workshops" },
  { value: "retreat", label: "Retreats" },
  { value: "kurs", label: "Kurse" },
  { value: "kreis", label: "Kreise" },
  { value: "festival", label: "Festivals" },
];

export function EventFilters({
  categories,
  cities,
  selectedCategory = "",
  selectedCity = "",
  searchQuery = "",
  selectedFromDate = "",
  selectedToDate = "",
  selectedFormat = "",
  showOnline = false,
}: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(selectedCategory);
  const [city, setCity] = useState(selectedCity);
  const [query, setQuery] = useState(searchQuery);
  const [fromDate, setFromDate] = useState(selectedFromDate);
  const [toDate, setToDate] = useState(selectedToDate);
  const [format, setFormat] = useState(selectedFormat);
  const [onlineToggle, setOnlineToggle] = useState(showOnline);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const applyFilters = (overrides?: {
    from?: string;
    to?: string;
    fmt?: string;
    online?: boolean;
  }) => {
    const next = new URLSearchParams(searchParams.toString());

    if (category) next.set("kategorie", category);
    else next.delete("kategorie");

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

    const fmt = overrides?.fmt ?? format;
    if (fmt) next.set("format", fmt);
    else next.delete("format");

    const ol = overrides?.online ?? onlineToggle;
    if (ol) next.set("online", "true");
    else next.delete("online");

    // Remove legacy tag param and PLZ
    next.delete("tag");
    next.delete("plz");

    const params = next.toString();
    router.push(params ? `/events?${params}` : "/events");
  };

  const handleOnlineToggle = () => {
    const next = !onlineToggle;
    setOnlineToggle(next);
    applyFilters({ online: next });
  };

  const setQuickDate = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    applyFilters({ from, to });
  };

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat);
    applyFilters({ fmt: newFormat });
  };

  const getNextWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
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

  // Group categories by group_name
  const grouped = categories.reduce<Record<string, Category[]>>((acc, cat) => {
    if (!acc[cat.group_name]) acc[cat.group_name] = [];
    acc[cat.group_name].push(cat);
    return acc;
  }, {});

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 space-y-4 rounded-2xl border border-border bg-bg-secondary p-4 shadow-[0_6px_20px_rgba(44,36,24,0.06)]"
    >
      {/* Row 0: Format Toggle */}
      <div className="flex flex-wrap gap-2">
        {FORMAT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleFormatChange(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              format === opt.value
                ? "bg-accent-primary text-white"
                : "border border-border bg-bg-card text-text-secondary hover:border-accent-primary hover:text-accent-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Online Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={onlineToggle}
          onClick={handleOnlineToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            onlineToggle ? "bg-accent-sage" : "bg-border"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              onlineToggle ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm text-text-secondary">Auch Online-Events zeigen</span>
      </div>

      {/* Row 1: Category, City, Search, Submit */}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.5fr_auto]">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
        >
          <option value="">Alle Kategorien</option>
          {Object.entries(grouped).map(([groupName, cats]) => (
            <optgroup key={groupName} label={groupName}>
              {cats.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name_de}
                </option>
              ))}
            </optgroup>
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
