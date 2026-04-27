import { NextRequest, NextResponse } from "next/server";
import { createStatelessAuthClient } from "@/lib/supabase";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { setAuthSessionCookies } from "@/lib/auth-session";

const SITE_URL = "https://das-portal.online";

type ClaimEntityType = "event" | "host" | "location";

const CLAIM_TABLES: Array<{ table: string; type: ClaimEntityType }> = [
  { table: "events", type: "event" },
  { table: "hosts", type: "host" },
  { table: "locations", type: "location" },
];

type ClaimRow = {
  id: string;
  slug: string | null;
  claim_email: string | null;
};

type ClaimOutcome =
  | { kind: "claimed"; type: ClaimEntityType; id: string; slug: string | null }
  | { kind: "email_mismatch" }
  | { kind: "invalid_token" };

async function applyTokenClaim(
  claimToken: string,
  userId: string,
  userEmail: string
): Promise<ClaimOutcome> {
  const admin = getSupabaseAdminClient();
  const userEmailLower = userEmail.toLowerCase().trim();
  const nowIso = new Date().toISOString();

  for (const { table, type } of CLAIM_TABLES) {
    const { data } = await admin
      .from(table)
      .select("id, slug, claim_email")
      .eq("claim_token", claimToken)
      .maybeSingle();

    if (!data) continue;

    const row = data as unknown as ClaimRow;
    const targetEmail = row.claim_email?.toLowerCase().trim() || null;

    if (!targetEmail || targetEmail !== userEmailLower) {
      return { kind: "email_mismatch" };
    }

    const updates: Record<string, unknown> = {
      claim_status: "approved",
      claimed_at: nowIso,
      claimed_by_user_id: userId,
    };
    if (type === "host") {
      updates.owner_id = userId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from(table) as any).update(updates).eq("id", row.id);
    if (error) {
      console.error(`Auto-claim update failed for ${type} ${row.id}:`, error);
      return { kind: "invalid_token" };
    }

    return { kind: "claimed", type, id: row.id, slug: row.slug };
  }

  return { kind: "invalid_token" };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const hostSlug = searchParams.get("host");
  const claimToken = searchParams.get("claim_token");
  const siteUrl = SITE_URL;

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth?error=missing_code`);
  }

  const supabase = createStatelessAuthClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${siteUrl}/auth?error=invalid_code`);
  }

  // Determine redirect destination
  let redirectPath = "/konto";

  if (claimToken) {
    const user = data.session.user;
    if (!user.email) {
      redirectPath = "/konto?claim_error=missing_email";
    } else {
      const outcome = await applyTokenClaim(claimToken, user.id, user.email);
      if (outcome.kind === "claimed") {
        redirectPath =
          outcome.type === "host"
            ? "/konto/profil?claimed=1"
            : `/konto?claimed=${outcome.type}`;
      } else if (outcome.kind === "email_mismatch") {
        redirectPath = "/konto?claim_error=email_mismatch";
      } else {
        redirectPath = "/konto?claim_error=invalid_token";
      }
    }
  } else if (hostSlug) {
    redirectPath = `/auth?mode=claim-confirm&host=${encodeURIComponent(hostSlug)}`;
  }

  const response = NextResponse.redirect(`${siteUrl}${redirectPath}`);

  // Set auth cookies
  setAuthSessionCookies(
    response,
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in
  );

  return response;
}
