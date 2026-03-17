import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const ALLOWED_FIELDS = ["name", "description", "website_url", "social_links"];

export async function POST(request: NextRequest) {
  // Verify authentication
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  const { user, error: authError } = await getUserFromAccessToken(accessToken);
  if (authError || !user) {
    return NextResponse.json({ error: "Ungültige Sitzung." }, { status: 401 });
  }

  const body = await request.json();
  const supabase = getSupabaseAdminClient();

  // Find host owned by this user
  const { data: host, error: hostError } = await supabase
    .from("hosts")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (hostError || !host) {
    return NextResponse.json(
      { error: "Kein Anbieter:in-Profil gefunden." },
      { status: 404 }
    );
  }

  // Filter to allowed fields only
  const updates: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("hosts")
    .update(updates)
    .eq("id", host.id)
    .eq("owner_id", user.id);

  if (updateError) {
    console.error("Host update error:", updateError);
    return NextResponse.json({ error: "Aktualisierung fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
