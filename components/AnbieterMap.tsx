"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Sage green marker for hosts (distinct from gold event markers)
const hostIcon = new L.DivIcon({
  className: "",
  html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#8b9d77"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
});

interface MapHost {
  id: string;
  name: string;
  slug: string | null;
  lat: number;
  lng: number;
  upcomingCount: number;
  primaryCity: string | null;
}

interface AnbieterMapProps {
  hosts: MapHost[];
}

export function AnbieterMap({ hosts }: AnbieterMapProps) {
  // Center on Germany if no hosts, otherwise on the first host
  const center: [number, number] = hosts.length > 0
    ? [hosts[0].lat, hosts[0].lng]
    : [51.1657, 10.4515]; // Center of Germany

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom
      style={{ height: "400px", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hosts.map((host) => (
        <Marker key={host.id} position={[host.lat, host.lng]} icon={hostIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-text-primary">{host.name}</p>
              {host.primaryCity ? (
                <p className="text-xs text-text-muted">{host.primaryCity}</p>
              ) : null}
              <p className="mt-1 text-xs text-accent-sage">
                {host.upcomingCount} kommende{host.upcomingCount === 1 ? "s" : ""} Event{host.upcomingCount === 1 ? "" : "s"}
              </p>
              {host.slug ? (
                <Link
                  href={`/hosts/${host.slug}`}
                  className="mt-1 inline-block text-xs font-semibold text-accent-primary hover:underline"
                >
                  Profil ansehen
                </Link>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
