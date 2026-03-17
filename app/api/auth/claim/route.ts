import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  // Verify authentication
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Nicht authentifiziert. Bitte melde dich an." },
      { status: 401 }
    );
  }

  const { user, error: authError } = await getUserFromAccessToken(accessToken);
  if (authError || !user) {
    return NextResponse.json(
      { error: "Ungültige Sitzung. Bitte melde dich erneut an." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { hostSlug } = body;

  if (!hostSlug) {
    return NextResponse.json(
      { error: "Host-Slug ist erforderlich." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();

  // Find the host
  const { data: host, error: hostError } = await supabase
    .from("hosts")
    .select("id, name, owner_id")
    .eq("slug", hostSlug)
    .single();

  if (hostError || !host) {
    return NextResponse.json(
      { error: "Anbieter:in-Profil nicht gefunden." },
      { status: 404 }
    );
  }

  // Check if already claimed
  if (host.owner_id) {
    return NextResponse.json(
      { error: "Dieses Profil wurde bereits beansprucht. Falls du der/die Inhaber:in bist, melde dich an." },
      { status: 409 }
    );
  }

  // Check for existing pending claim
  const { data: existingClaim } = await supabase
    .from("claim_requests")
    .select("id")
    .eq("host_id", host.id)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (existingClaim) {
    return NextResponse.json(
      { error: "Für dieses Profil liegt bereits eine Anfrage vor." },
      { status: 409 }
    );
  }

  // Create claim request
  const { error: insertError } = await supabase
    .from("claim_requests")
    .insert({
      host_id: host.id,
      user_id: user.id,
      user_email: user.email || "",
      status: "pending",
    });

  if (insertError) {
    console.error("Claim request insert error:", insertError);
    return NextResponse.json(
      { error: "Anfrage konnte nicht erstellt werden. Bitte versuche es erneut." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, hostName: host.name });
}
