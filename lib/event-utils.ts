import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Event, EventFormat, HostPreview } from "@/lib/types";

export const PAGE_SIZE = 12;

/** Human-readable labels for event formats */
export const FORMAT_LABELS: Record<EventFormat, string> = {
  event: "Event",
  workshop: "Workshop",
  retreat: "Retreat",
  kurs: "Kurs",
  festival: "Festival",
  kreis: "Kreis",
};

/** Format badge color classes */
export const FORMAT_COLORS: Record<EventFormat, string> = {
  event: "bg-accent-sage/20 text-accent-sage",
  workshop: "bg-accent-primary/15 text-accent-primary",
  retreat: "bg-[#8b6d9b]/15 text-[#8b6d9b]",
  kurs: "bg-[#5b8a72]/15 text-[#5b8a72]",
  festival: "bg-[#c4793a]/15 text-[#c4793a]",
  kreis: "bg-accent-secondary/15 text-accent-secondary",
};

export const formatEventDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Hide time if it's likely a parsing artifact (00:00, 01:00, 02:00) or placeholder (12:00)
  const suspiciousTime =
    minutes === 0 && (hours === 0 || hours === 1 || hours === 2 || hours === 12);

  return suspiciousTime
    ? format(date, "EEE dd.MM.yyyy", { locale: de })
    : format(date, "EEE dd.MM.yyyy HH:mm", { locale: de });
};

export const getHostPreview = (event: Event): HostPreview | null => {
  if (!event.hosts) return null;
  if (Array.isArray(event.hosts)) return event.hosts[0] ?? null;
  return event.hosts;
};

export function buildGoogleCalendarUrl(event: {
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  location_name?: string | null;
  address?: string | null;
}): string {
  const formatGCal = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const start = formatGCal(event.start_at);
  const end = event.end_at
    ? formatGCal(event.end_at)
    : formatGCal(new Date(new Date(event.start_at).getTime() + 2 * 3600000).toISOString());

  const location = [event.location_name, event.address].filter(Boolean).join(", ");
  const details = event.description?.slice(0, 500) || "";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });
  if (location) params.set("location", location);
  if (details) params.set("details", details);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Format the price for display.
 * Shows price_amount (with € sign) if available, otherwise a label from price_model.
 */
export function formatPrice(priceModel: string | null, priceAmount: string | null): string {
  if (priceAmount) {
    // Range like "15-25" or "15–25" → "15 – 25 €"
    const rangeMatch = priceAmount.match(/^(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)$/);
    if (rangeMatch) return `${rangeMatch[1]} – ${rangeMatch[2]} €`;
    // Already has currency symbol
    if (/[€$£]/.test(priceAmount)) return priceAmount;
    return `${priceAmount} €`;
  }
  switch (priceModel) {
    case "free":
      return "Kostenlos";
    case "donation":
      return "Auf Spendenbasis";
    case "sliding":
      return "Sliding Scale";
    case "paid":
    default:
      return "Preis auf Anfrage";
  }
}

export const getCityFromAddress = (address: string | null): string | null => {
  if (!address) return null;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.at(-1) ?? null;
};
