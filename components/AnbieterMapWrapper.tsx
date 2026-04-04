"use client";

import dynamic from "next/dynamic";

const AnbieterMap = dynamic(
  () => import("@/components/AnbieterMap").then((mod) => mod.AnbieterMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-2xl bg-bg-secondary" />
    ),
  }
);

interface MapHost {
  id: string;
  name: string;
  slug: string | null;
  lat: number;
  lng: number;
  upcomingCount: number;
  primaryCity: string | null;
}

interface AnbieterMapWrapperProps {
  hosts: MapHost[];
}

export function AnbieterMapWrapper({ hosts }: AnbieterMapWrapperProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <AnbieterMap hosts={hosts} />
    </div>
  );
}
