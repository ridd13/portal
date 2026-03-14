import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

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
  const { title, start_at, host_telegram_username } = body;
  if (!title || !start_at || !host_telegram_username) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: title, start_at, host_telegram_username",
      },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();

  // Host über Telegram-Username finden
  const { data: host, error: hostError } = await supabase
    .from("hosts")
    .select("id, name")
    .eq(
      "telegram_username",
      host_telegram_username.toLowerCase().replace("@", "")
    )
    .single();

  if (hostError || !host) {
    return NextResponse.json(
      { error: "Host not found", telegram_username: host_telegram_username },
      { status: 404 }
    );
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
      address: body.address || null,
      geo_lat: body.geo_lat || null,
      geo_lng: body.geo_lng || null,
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
    host_name: host.name,
    url: `https://www.das-portal.online/events/${event.slug}`,
  });
}
