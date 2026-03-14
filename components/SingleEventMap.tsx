"use client";

import dynamic from "next/dynamic";
import type { Event } from "@/lib/types";

const EventMap = dynamic(
  () => import("@/components/EventMap").then((mod) => mod.EventMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded-2xl bg-bg-secondary" />
    ),
  }
);

interface SingleEventMapProps {
  event: Pick<Event, "id" | "title" | "slug" | "start_at" | "geo_lat" | "geo_lng" | "location_name" | "address">;
}

export function SingleEventMap({ event }: SingleEventMapProps) {
  if (!event.geo_lat || !event.geo_lng) return null;

  return (
    <div className="overflow-hidden rounded-2xl">
      <EventMap events={[event as Event]} />
    </div>
  );
}
