"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useMemo } from "react";
import type { Event } from "@/lib/types";
import type { UserLocation } from "@/lib/geo";
import { haversineKm, geocodeNominatim, saveUserLocation } from "@/lib/geo";
import { LocationInput } from "@/components/LocationInput";
import { EventCard } from "@/components/EventCard";

const EventMap = dynamic(
  () => import("@/components/EventMap").then((mod) => mod.EventMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[50vh] animate-pulse rounded-2xl bg-bg-secondary md:h-[60vh]" />
    ),
  }
);

interface EventsClientWrapperProps {
  events: Event[];
  initialPlz?: string;
}

export function EventsClientWrapper({
  events,
  initialPlz,
}: EventsClientWrapperProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radius, setRadius] = useState(25);

  // Auto-geocode PLZ from URL on mount
  useEffect(() => {
    if (!initialPlz) return;
    let cancelled = false;
    geocodeNominatim(initialPlz).then((result) => {
      if (cancelled || !result) return;
      const loc: UserLocation = {
        lat: result.lat,
        lng: result.lng,
        label: initialPlz,
      };
      setUserLocation(loc);
      saveUserLocation(loc);
    });
    return () => {
      cancelled = true;
    };
  }, [initialPlz]);

  const handleLocationChange = useCallback(
    (loc: UserLocation | null) => setUserLocation(loc),
    []
  );

  // Events with geo data for the map
  const mapEvents = useMemo(
    () => events.filter((e) => e.geo_lat != null && e.geo_lng != null),
    [events]
  );

  // Filter + sort events by radius when user location is set
  const filteredEvents = useMemo(() => {
    if (!userLocation) return events;

    const withDistance = events.map((event) => {
      if (!event.geo_lat || !event.geo_lng) {
        return { event, distance: null as number | null };
      }
      return {
        event,
        distance: haversineKm(
          userLocation.lat,
          userLocation.lng,
          event.geo_lat,
          event.geo_lng
        ),
      };
    });

    const inRadius = withDistance
      .filter((e) => e.distance !== null && e.distance <= radius)
      .sort((a, b) => a.distance! - b.distance!);

    const noGeo = withDistance.filter((e) => e.distance === null);

    return [...inRadius, ...noGeo].map((e) => e.event);
  }, [events, userLocation, radius]);

  return (
    <>
      {/* Map Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-normal text-text-primary">
            Events auf der Karte
          </h2>
          <LocationInput onLocationChange={handleLocationChange} />
        </div>

        {userLocation ? (
          <div className="flex items-center gap-3">
            <label
              htmlFor="radius-slider"
              className="whitespace-nowrap text-sm text-text-secondary"
            >
              Umkreis:
            </label>
            <input
              id="radius-slider"
              type="range"
              min={5}
              max={100}
              step={5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="flex-1 accent-accent-primary"
            />
            <span className="w-16 text-right text-sm font-medium text-text-primary">
              {radius} km
            </span>
          </div>
        ) : null}

        <EventMap
          events={mapEvents}
          userLat={userLocation?.lat}
          userLng={userLocation?.lng}
          radiusKm={radius}
        />
      </div>

      {/* Event List */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-card p-10 text-center text-text-secondary">
          {userLocation ? (
            <>
              <p>Keine Events im Umkreis von {radius} km gefunden.</p>
              <button
                type="button"
                onClick={() => setRadius(100)}
                className="mt-2 text-sm text-accent-primary underline"
              >
                Auf 100 km erweitern
              </button>
            </>
          ) : (
            "Keine passenden Events gefunden."
          )}
        </div>
      ) : (
        <section>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
