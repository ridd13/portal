"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { Event } from "@/lib/types";
import type { UserLocation } from "@/lib/geo";
import { geocodeNominatim, saveUserLocation } from "@/lib/geo";
import { LocationInput } from "@/components/LocationInput";

const EventMap = dynamic(
  () => import("@/components/EventMap").then((mod) => mod.EventMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[50vh] animate-pulse rounded-2xl bg-bg-secondary md:h-[60vh]" />
    ),
  }
);

interface EventMapWrapperProps {
  events: Event[];
  /** Pre-set PLZ from the URL (e.g. /events/22041 → rewritten to ?plz=22041). */
  initialPlz?: string;
}

export function EventMapWrapper({ events, initialPlz }: EventMapWrapperProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Events auf der Karte
        </h2>
        <LocationInput onLocationChange={handleLocationChange} />
      </div>
      <EventMap
        events={events}
        userLat={userLocation?.lat}
        userLng={userLocation?.lng}
      />
    </div>
  );
}
