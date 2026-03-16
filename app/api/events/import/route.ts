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

/**
 * Telegram-Bild runterladen und in Supabase Storage hochladen.
 * Gibt die öffentliche URL zurück oder null bei Fehler.
 */
async function uploadPhotoToStorage(
  photoUrl: string,
  slug: string,
  supabase: ReturnType<typeof getSupabaseAdminClient>
): Promise<string | null> {
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const filePath = `events/${slug}.${ext}`;
    const buffer = Buffer.from(await res.arrayBuffer());

    const { error } = await supabase.storage
      .from("covers")
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("covers")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (e) {
    console.error("Photo upload failed:", e);
    return null;
  }
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

  // Host finden: erst per telegram_username, dann per Name
  let host: { id: string; name: string } | null = null;
  const hostName = body.host_name || body.sender_name || null;
  const cleanTelegramUsername = body.host_telegram_username
    ? body.host_telegram_username.toLowerCase().replace("@", "")
    : null;

  // 1. Per Telegram Username suchen (eindeutigster Identifier)
  if (cleanTelegramUsername) {
    const { data } = await supabase
      .from("hosts")
      .select("id, name")
      .eq("telegram_username", cleanTelegramUsername)
      .single();
    host = data;

    // Falls gefunden, Host-Daten aktualisieren (Name, Website)
    if (host) {
      const updates: Record<string, string> = {};
      if (hostName && hostName !== host.name) updates.name = hostName;
      if (body.ticket_link) updates.website_url = body.ticket_link;
      if (Object.keys(updates).length > 0) {
        await supabase.from("hosts").update(updates).eq("id", host.id);
        if (updates.name) host.name = updates.name;
      }
    }
  }

  // 2. Fallback: Per Name suchen
  if (!host && hostName) {
    const { data } = await supabase
      .from("hosts")
      .select("id, name")
      .ilike("name", `%${hostName}%`)
      .limit(1)
      .single();
    host = data;

    // Falls gefunden und Telegram-Username vorhanden, diesen nachtragen
    if (host && cleanTelegramUsername) {
      await supabase
        .from("hosts")
        .update({ telegram_username: cleanTelegramUsername })
        .eq("id", host.id);
    }
  }

  // 3. Kein Host gefunden → neuen Host anlegen
  if (!host) {
    const displayName = hostName || cleanTelegramUsername || "Unbekannt";
    const hostSlug = displayName
      .toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);

    const { data: newHost, error: hostCreateError } = await supabase
      .from("hosts")
      .insert({
        name: displayName,
        slug: hostSlug,
        telegram_username: cleanTelegramUsername,
        website_url: body.ticket_link || null,
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

  // Geocoding: Multi-Query-Strategie — mehrere Versuche mit zunehmend breiterem Suchbegriff
  let geoLat = body.geo_lat || null;
  let geoLng = body.geo_lng || null;
  let address = body.address || null;

  if (!geoLat && (body.location_name || body.address)) {
    const city = body.city || "Hamburg";
    const queries = [
      body.address,
      body.location_name && city ? `${body.location_name} ${city}` : null,
      body.location_name,
      city,
    ].filter((q): q is string => Boolean(q));

    for (const query of queries) {
      const geo = await geocode(query);
      if (geo) {
        geoLat = geo.lat;
        geoLng = geo.lng;
        if (!address) address = geo.address || null;
        break;
      }
    }
  }

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

  // Cover-Bild: Bereits vorhandene URL → Telegram-Bild Upload → Default
  let coverUrl: string | null = body.cover_image_url || null;

  if (!coverUrl && body.photo_url) {
    // Skip localhost URLs (not reachable from Vercel)
    if (
      body.photo_url.startsWith("http://localhost") ||
      body.photo_url.startsWith("http://127.0.0.1")
    ) {
      console.warn(`Skipping localhost photo_url: ${body.photo_url}`);
    } else {
      coverUrl = await uploadPhotoToStorage(body.photo_url, slug, supabase);
    }
  }

  if (!coverUrl) {
    // Default-Cover basierend auf erstem Tag
    const firstTag = body.tags?.[0]?.toLowerCase();
    coverUrl =
      (firstTag && DEFAULT_COVERS[firstTag]) ||
      "/images/defaults/event-default.svg";
  }

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
      price_amount: body.price_amount || null,
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
