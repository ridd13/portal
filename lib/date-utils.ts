import { format } from "date-fns";
import { de } from "date-fns/locale";

/** Format date as "Do 10.04.2026" */
export function formatDate(isoDate: string): string {
  return format(new Date(isoDate), "EEE dd.MM.yyyy", { locale: de });
}

/** Format time as "18:00" — returns null for suspicious placeholder times */
export function formatTime(isoDate: string): string | null {
  const date = new Date(isoDate);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Hide time if likely a parsing artifact (00:00, 01:00, 02:00) or placeholder (12:00)
  if (minutes === 0 && (hours === 0 || hours === 1 || hours === 2 || hours === 12)) {
    return null;
  }

  return format(date, "HH:mm", { locale: de });
}
