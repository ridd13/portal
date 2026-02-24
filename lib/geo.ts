/**
 * Haversine distance between two points in km.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

const STORAGE_KEY = "portal_user_location";

export function saveUserLocation(loc: UserLocation): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // localStorage not available
  }
}

export function loadUserLocation(): UserLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
      return parsed as UserLocation;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Geocode a PLZ or city name using Nominatim (OpenStreetMap).
 * Returns coordinates or null.
 */
export async function geocodeNominatim(
  query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query + " Germany"
  )}&format=json&limit=1&accept-language=de`;

  const res = await fetch(url, {
    headers: { "User-Agent": "DasPortal/1.0 (kontakt@das-portal.org)" },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
