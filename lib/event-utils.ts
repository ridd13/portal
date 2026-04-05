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

/**
 * Kuratierte Liste deutscher Städte für Filter-Dropdowns.
 * Wird gegen event.address gematcht (case-insensitive, Wortgrenzen).
 * Bei neuen Städten mit Events: hier ergänzen.
 */
export const KNOWN_CITIES = [
  "Hamburg", "Berlin", "München", "Köln", "Freiburg", "Stuttgart",
  "Düsseldorf", "Dortmund", "Essen", "Bonn", "Frankfurt",
  "Kiel", "Lübeck", "Flensburg", "Rostock", "Hannover",
  "Bremen", "Leipzig", "Dresden", "Nürnberg", "Tübingen",
  "Dachau", "Kirchzarten", "Emmendingen", "Chemnitz",
  "Karlsruhe", "Augsburg", "Heidelberg", "Kassel", "Göttingen",
] as const;

/** Match an address against known cities. Returns the city name or null. */
export function matchCity(address: string | null): string | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const city of KNOWN_CITIES) {
    // Match "München" in "Brunhamstraße 19 A, 81249 München" or "München, Bayern, Deutschland"
    if (lower.includes(city.toLowerCase())) return city;
  }
  // Also match common transliterations
  if (lower.includes("muenchen")) return "München";
  if (lower.includes("koeln")) return "Köln";
  if (lower.includes("nuernberg")) return "Nürnberg";
  if (lower.includes("goettingen")) return "Göttingen";
  if (lower.includes("tuebingen")) return "Tübingen";
  if (lower.includes("luebeck")) return "Lübeck";
  if (lower.includes("duesseldorf")) return "Düsseldorf";
  return null;
}

const BUNDESLAENDER = new Set([
  "baden-württemberg", "bayern", "berlin", "brandenburg", "bremen",
  "hamburg", "hessen", "mecklenburg-vorpommern", "niedersachsen",
  "nordrhein-westfalen", "rheinland-pfalz", "saarland", "sachsen",
  "sachsen-anhalt", "schleswig-holstein", "thüringen",
]);

const COUNTRY_SUFFIXES = /,?\s*(deutschland|germany|schweiz\/.*|österreich|austria|portugal|españa|spain|indonesia|australia|colombia|united states|france|belgien|belgium|belgique|belgi[eë])\s*$/i;

const CITY_ALIASES: Record<string, string> = {
  "muenchen": "München",
  "koeln": "Köln",
  "nuernberg": "Nürnberg",
  "freiburg im breisgau": "Freiburg",
  "berlin kreuzberg": "Berlin",
  "düsseldorf-pempelfort": "Düsseldorf",
  "essen-rüttenscheid": "Essen",
};

/** Returns null for anything that doesn't look like an actual German city name */
function validateCity(raw: string): string | null {
  const s = raw.trim();
  if (!s || s.length < 3 || s.length > 30) return null;

  const lower = s.toLowerCase();

  // Check alias first
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];

  // Reject pure numbers, PLZ (DE 5-digit, AT 4-digit, foreign with dash)
  if (/^\d/.test(s)) return null;

  // Reject street addresses: "Str.", "straße", "weg ", "platz ", "gasse", "allee"
  if (/\b(str\.|straße|strasse|weg\b|platz\b|gasse|allee\b|ring\b|damm\b|ufer\b|chaussee)/i.test(s)) return null;

  // Reject if ends with a house number pattern ("250", "15", "1", "19 A", "47 A")
  if (/\d+\s*[a-zA-Z]?\s*$/.test(s)) return null;

  // Reject location descriptions, directions, vague text
  if (/^(adresse|anschrift|genaue|online|bei\s|nach\s|am\s|an\s|im\s|auf\s|vor\s|\d+\s*min|wird noch)/i.test(s)) return null;

  // Reject URLs
  if (/\.(com|de|org|online|net|io)/.test(s)) return null;

  // Reject slashes (foreign multi-language names like "België / Belgique / Belgien")
  if (s.includes("/")) return null;

  // Reject Landkreise, regions, cantons, admin divisions
  if (/\b(landkreis|kreis|bodenseekreis|bezirk|region|kanton|comunidad|oberland|chiemgau|allgäu|allgau|schwarzwald|pfalz|eifel|vulkaneifel|hinterland)\b/i.test(s)) return null;

  // Reject foreign regions/areas
  if (/^(andaluc|alentejo|algarve|berner|tirol|engiadina|jawa)/i.test(s)) return null;

  // Reject "Hinterhof", "Werbelinsee" and similar non-city descriptors
  if (/\b(hinterhof|see\b|wald\b|berg\b|tal\b|hof\b|mühle|wiese|garten|insel)/i.test(s)) return null;

  // Reject entries with "Stadt" prefix from Nominatim
  if (/^(stadt|basel-stadt)/i.test(s)) return null;

  return s;
}

export const getCityFromAddress = (address: string | null): string | null => {
  if (!address) return null;
  const s = address.trim();
  if (s.length < 3) return null;

  // Quick junk reject
  if (/^(adresse|anschrift|genaue|online|\d+\s*min|bei\s)/i.test(s)) return null;
  if (/\.(com|de|org|online)/.test(s)) return null;

  // Pattern: "PLZ City" anywhere → extract City after 5-digit German PLZ
  const plzMatch = s.match(/\b(\d{5})\s+([A-ZÄÖÜa-zäöüß][A-Za-zÄÖÜäöüß\s-]+)/);
  if (plzMatch) {
    const cityPart = plzMatch[2].split(",")[0].split("(")[0].trim();
    return validateCity(cityPart);
  }

  // Nominatim or comma-separated: strip country, bundesland, PLZ from end
  const cleaned = s.replace(COUNTRY_SUFFIXES, "").trim();
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);

  // Walk backwards to find the city
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const lower = part.toLowerCase();
    if (BUNDESLAENDER.has(lower)) continue;
    // Skip PLZ (5-digit DE, 4-digit AT, foreign with dash)
    if (/^\d{4,5}(-\d+)?$/.test(part)) continue;
    // Skip Nominatim admin labels
    if (/^(ortsbeirat|vvg|landkreis|bezirk|region|gem\b|vgem)/i.test(part)) continue;
    const city = validateCity(part);
    if (city) return city;
  }

  return null;
};
