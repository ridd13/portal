import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const CLAIM_TABLES = [
  { table: "events", type: "event" as const },
  { table: "hosts", type: "host" as const },
  { table: "locations", type: "location" as const },
];

export async function POST(request: NextRequest) {
  const { claimToken, userId, userEmail } = await request.json();

  if (!claimToken || !userId || !userEmail) {
    return NextResponse.json({ kind: "invalid_token" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const userEmailLower = (userEmail as string).toLowerCase().trim();
  const nowIso = new Date().toISOString();

  for (const { table, type } of CLAIM_TABLES) {
    const { data } = await admin
      .from(table)
      .select("id, slug, claim_email")
      .eq("claim_token", claimToken)
      .maybeSingle();

    if (!data) continue;

    const row = data as { id: string; slug: string | null; claim_email: string | null };
    const targetEmail = row.claim_email?.toLowerCase().trim() ?? null;

    if (!targetEmail || targetEmail !== userEmailLower) {
      return NextResponse.json({ kind: "email_mismatch" });
    }

    const updates: Record<string, unknown> = {
      claim_status: "approved",
      claimed_at: nowIso,
      claimed_by_user_id: userId,
    };
    if (type === "host") updates.owner_id = userId;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from(table) as any).update(updates).eq("id", row.id);
    if (error) {
      console.error(`apply-claim-token: update failed for ${type} ${row.id}:`, error);
      return NextResponse.json({ kind: "invalid_token" });
    }

    return NextResponse.json({ kind: "claimed", type, slug: row.slug });
  }

  return NextResponse.json({ kind: "invalid_token" });
}
