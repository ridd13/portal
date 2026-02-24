"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect } from "react";
import type { Event } from "@/lib/types";
import { formatEventDate } from "@/lib/event-utils";
import { haversineKm } from "@/lib/geo";

// Fix for default marker icons in Next.js/Webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Warm gold marker matching Portal design
const portalIcon = new L.DivIcon({
  className: "",
  html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#b5651d"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
});

// Blue user location marker
const userIcon = new L.DivIcon({
  className: "",
  html: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
  </svg>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/** Re-centers map when the target location changes. */
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface EventMapProps {
  events: Event[];
  userLat?: number | null;
  userLng?: number | null;
}

export function EventMap({ events, userLat, userLng }: EventMapProps) {
  const mappableEvents = events.filter(
    (e) => e.geo_lat != null && e.geo_lng != null
  );

  if (mappableEvents.length === 0) {
    return (
      <div className="flex h-[40vh] items-center justify-center rounded-2xl border border-border bg-bg-card text-text-muted">
        Keine Events mit Standort-Daten gefunden.
      </div>
    );
  }

  // Center on user location if available, otherwise average of events
  const hasUser = userLat != null && userLng != null;
  const centerLat = hasUser
    ? userLat
    : mappableEvents.reduce((sum, e) => sum + e.geo_lat!, 0) /
      mappableEvents.length;
  const centerLng = hasUser
    ? userLng
    : mappableEvents.reduce((sum, e) => sum + e.geo_lng!, 0) /
      mappableEvents.length;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={9}
      scrollWheelZoom={true}
      className="z-0 h-[50vh] w-full rounded-2xl border border-border md:h-[60vh]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Re-center when user location or events change */}
      <MapRecenter lat={centerLat} lng={centerLng} />

      {/* User location marker */}
      {hasUser && (
        <>
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>
              <p className="text-sm font-semibold">Dein Standort</p>
            </Popup>
          </Marker>
          <Circle
            center={[userLat, userLng]}
            radius={25000}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.06,
              weight: 1,
            }}
          />
        </>
      )}

      {/* Event markers */}
      {mappableEvents.map((event) => {
        const distKm =
          hasUser
            ? haversineKm(userLat, userLng, event.geo_lat!, event.geo_lng!)
            : null;

        return (
          <Marker
            key={event.id}
            position={[event.geo_lat!, event.geo_lng!]}
            icon={portalIcon}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="text-xs text-gray-600">
                  {formatEventDate(event.start_at)}
                </p>
                {event.location_name || event.address ? (
                  <p className="text-xs text-gray-500">
                    {[event.location_name, event.address]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
                {distKm != null && (
                  <p className="text-xs font-medium text-accent-primary">
                    {distKm < 1
                      ? "< 1 km entfernt"
                      : `${Math.round(distKm)} km entfernt`}
                  </p>
                )}
                <Link
                  href={`/events/${event.slug}`}
                  className="mt-1 inline-block text-xs font-medium text-blue-600 hover:underline"
                >
                  Details ansehen
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
