import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Event, HostPreview } from "@/lib/types";

export const PAGE_SIZE = 12;

export const formatEventDate = (isoDate: string) =>
  format(new Date(isoDate), "EEE dd.MM.yyyy HH:mm", { locale: de });

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

export const getCityFromAddress = (address: string | null): string | null => {
  if (!address) return null;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.at(-1) ?? null;
};
