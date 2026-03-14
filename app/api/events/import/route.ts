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

function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");
  return apiKey === process.env.EVENT_IMPORT_API_KEY;
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Pflichtfelder prüfen
  const { title, start_at } = body;
  if (!title || !start_at) {
    return NextResponse.json(
      { error: "Missing required fields: title, start_at" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();

  // Host finden: erst per telegram_username, dann per sender_name
  let host: { id: string; name: string } | null = null;

  if (body.host_telegram_username) {
    const { data } = await supabase
      .from("hosts")
      .select("id, name")
      .eq(
        "telegram_username",
        body.host_telegram_username.toLowerCase().replace("@", "")
      )
      .single();
    host = data;
  }

  // Fallback: Host per Name suchen
  if (!host && body.sender_name) {
    const { data } = await supabase
      .from("hosts")
      .select("id, name")
      .ilike("name", `%${body.sender_name}%`)
      .limit(1)
      .single();
    host = data;
  }

  // Kein Host gefunden → neuen Host anlegen
  if (!host) {
    const hostName = body.sender_name || body.host_telegram_username || "Unbekannt";
    const hostSlug = hostName
      .toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);

    const { data: newHost, error: hostCreateError } = await supabase
      .from("hosts")
      .insert({
        name: hostName,
        slug: hostSlug,
        telegram_username: body.host_telegram_username?.toLowerCase().replace("@", "") || null,
      })
      .select("id, name")
      .single();

    if (hostCreateError) {
      console.error("Host create error:", hostCreateError);
      return NextResponse.json({ error: "Host creation failed" }, { status: 500 });
    }
    host = newHost;
  }

  // Deduplizierung: Prüfen ob source_message_id schon existiert
  if (body.source_message_id) {
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("source_message_id", body.source_message_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Event already imported", event_id: existing.id },
        { status: 409 }
      );
    }
  }

  // Geocoding: Koordinaten ermitteln wenn nicht im Request
  let geoLat = body.geo_lat || null;
  let geoLng = body.geo_lng || null;
  let address = body.address || null;

  if (!geoLat && (body.location_name || body.address)) {
    const query =
      body.address || `${body.location_name} Hamburg Schleswig-Holstein`;
    const geo = await geocode(query);
    if (geo) {
      geoLat = geo.lat;
      geoLng = geo.lng;
      if (!address) address = geo.address || null;
    }
  }

  // Default-Cover basierend auf erstem Tag
  const coverUrl =
    body.cover_image_url ||
    DEFAULT_COVERS[body.tags?.[0]?.toLowerCase()] ||
    "/images/defaults/event-default.svg";

  // Slug generieren (Umlaute normalisieren + Timestamp für Eindeutigkeit)
  const slug =
    title
      .toLowerCase()
      .replace(/[äÄ]/g, "ae")
      .replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36);

  // Event anlegen
  const { data: event, error: insertError } = await supabase
    .from("events")
    .insert({
      title: body.title,
      slug,
      description: body.description || null,
      start_at: body.start_at,
      end_at: body.end_at || null,
      location_name: body.location_name || null,
      address,
      geo_lat: geoLat,
      geo_lng: geoLng,
      cover_image_url: coverUrl,
      host_id: host.id,
      is_public: true,
      status: body.auto_publish ? "published" : "draft",
      tags: body.tags || [],
      price_model: body.price_model || null,
      ticket_link: body.ticket_link || null,
      source_type: "telegram",
      source_message_id: body.source_message_id || null,
    })
    .select("id, slug, status")
    .single();

  if (insertError) {
    console.error("Event import error:", insertError);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    event_id: event.id,
    slug: event.slug,
    status: event.status,
    host_name: host!.name,
    host_created: !body.host_telegram_username && !host ? true : false,
    url: `https://www.das-portal.online/events/${event.slug}`,
  });
}
