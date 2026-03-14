import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const DEFAULT_COVERS: Record<string, string> = {
  breathwork: "/images/defaults/breathwork.svg",
  yoga: "/images/defaults/yoga.svg",
  "sound-healing": "/images/defaults/sound-healing.svg",
  "kakao-zeremonie": "/images/defaults/kakao-zeremonie.svg",
  tantra: "/images/defaults/tantra.svg",
  meditation: "/images/defaults/meditation.svg",
  community: "/images/defaults/community.svg",
  workshop: "/images/defaults/workshop.svg",
};

async function geocode(
  query: string
): Promise<{ lat: number; lng: number; address?: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "User-Agent": "DasPortal/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name,
      };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");
  return apiKey === process.env.EVENT_IMPORT_API_KEY;
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const results: { geocoded: string[]; covers: string[] } = {
    geocoded: [],
    covers: [],
  };

  // 1. Backfill Geocoding: Events ohne Koordinaten aber mit Location-Info
  const { data: noGeoEvents } = await supabase
    .from("events")
    .select("id, title, location_name, address")
    .is("geo_lat", null)
    .or("location_name.neq.,address.neq.");

  if (noGeoEvents) {
    for (const event of noGeoEvents) {
      if (!event.location_name && !event.address) continue;

      const query =
        event.address || `${event.location_name} Hamburg Schleswig-Holstein`;
      const geo = await geocode(query);

      if (geo) {
        const update: Record<string, unknown> = {
          geo_lat: geo.lat,
          geo_lng: geo.lng,
        };
        if (!event.address && geo.address) {
          update.address = geo.address;
        }

        await supabase.from("events").update(update).eq("id", event.id);
        results.geocoded.push(event.title);
      }

      // Nominatim Rate-Limit: max 1 req/sec
      await sleep(1100);
    }
  }

  // 2. Backfill Cover-Bilder: Events ohne cover_image_url
  const { data: noCoverEvents } = await supabase
    .from("events")
    .select("id, title, tags, cover_image_url")
    .is("cover_image_url", null);

  if (noCoverEvents) {
    for (const event of noCoverEvents) {
      const firstTag = event.tags?.[0]?.toLowerCase();
      const coverUrl =
        (firstTag && DEFAULT_COVERS[firstTag]) ||
        "/images/defaults/event-default.svg";

      await supabase
        .from("events")
        .update({ cover_image_url: coverUrl })
        .eq("id", event.id);

      results.covers.push(event.title);
    }
  }

  return NextResponse.json({
    success: true,
    geocoded: results.geocoded.length,
    geocoded_events: results.geocoded,
    covers_assigned: results.covers.length,
    covers_events: results.covers,
  });
}
