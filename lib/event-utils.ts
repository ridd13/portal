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

export const getCityFromAddress = (address: string | null): string | null => {
  if (!address) return null;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.at(-1) ?? null;
};
