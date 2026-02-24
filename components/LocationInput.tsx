"use client";

import { useEffect, useState, useCallback } from "react";
import {
  type UserLocation,
  geocodeNominatim,
  loadUserLocation,
  saveUserLocation,
} from "@/lib/geo";

interface LocationInputProps {
  onLocationChange: (location: UserLocation | null) => void;
}

/**
 * Read localStorage once during initial state.
 */
function getInitialLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  return loadUserLocation();
}

/**
 * Check if geolocation should be requested on mount.
 * Returns true if no saved location and browser supports geolocation.
 */
function shouldRequestGeo(): boolean {
  if (typeof window === "undefined") return false;
  if (loadUserLocation()) return false;
  return !!navigator.geolocation;
}

export function LocationInput({ onLocationChange }: LocationInputProps) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "geocoding" | "error">("idle");
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(
    getInitialLocation
  );
  // Initialize geoActive based on whether we should request geolocation
  const [geoActive, setGeoActive] = useState(shouldRequestGeo);
  const [parentNotified, setParentNotified] = useState(false);

  // Derived state: notify parent about initial saved location
  if (currentLocation && !parentNotified) {
    setParentNotified(true);
  }

  // Call onLocationChange once parentNotified flips to true
  useEffect(() => {
    if (parentNotified && currentLocation) {
      onLocationChange(currentLocation);
    }
  }, [parentNotified]); // eslint-disable-line react-hooks/exhaustive-deps

  // Request browser geolocation if geoActive was initialized to true
  useEffect(() => {
    if (!geoActive) return;
    if (!navigator.geolocation) return;

    const controller = new AbortController();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (controller.signal.aborted) return;
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Dein Standort",
        };
        setCurrentLocation(loc);
        saveUserLocation(loc);
        onLocationChange(loc);
        setGeoActive(false);
      },
      () => {
        if (controller.signal.aborted) return;
        setGeoActive(false);
      },
      { timeout: 8000, maximumAge: 300000 }
    );

    return () => {
      controller.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGeocode = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setStatus("geocoding");
    const result = await geocodeNominatim(trimmed);

    if (!result) {
      setStatus("error");
      return;
    }

    const loc: UserLocation = {
      lat: result.lat,
      lng: result.lng,
      label: trimmed,
    };
    setCurrentLocation(loc);
    saveUserLocation(loc);
    onLocationChange(loc);
    setStatus("idle");
    setInput("");
  }, [input, onLocationChange]);

  const clearLocation = useCallback(() => {
    setCurrentLocation(null);
    onLocationChange(null);
    try {
      localStorage.removeItem("portal_user_location");
    } catch {
      // ignore
    }
  }, [onLocationChange]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentLocation ? (
        <div className="flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1.5 text-sm text-text-primary">
          <svg
            className="h-4 w-4 text-accent-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{currentLocation.label}</span>
          <button
            onClick={clearLocation}
            className="ml-1 text-text-muted transition hover:text-text-primary"
            aria-label="Standort entfernen"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGeocode();
                }
              }}
              placeholder="PLZ oder Stadt eingeben"
              className={`rounded-xl border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-sage ${
                status === "error" ? "border-error-border" : "border-border"
              }`}
            />
          </div>
          <button
            onClick={handleGeocode}
            disabled={status === "geocoding" || !input.trim()}
            className="rounded-xl bg-accent-sage px-3 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {status === "geocoding" ? "Suche…" : "Finden"}
          </button>
          {geoActive && (
            <span className="text-xs text-text-muted">Standort wird ermittelt…</span>
          )}
          {status === "error" && (
            <span className="text-xs text-error-text">Ort nicht gefunden</span>
          )}
        </>
      )}
    </div>
  );
}
