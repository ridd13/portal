"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  sendClaimRequestConfirmation,
  sendClaimRequestNotification,
  type ClaimEntityType,
} from "@/lib/email";

export type ClaimResult = { success: boolean; message: string };

const TABLE_BY_TYPE: Record<ClaimEntityType, string> = {
  event: "events",
  host: "hosts",
  location: "locations",
};

const TITLE_COLUMN: Record<ClaimEntityType, string> = {
  event: "title",
  host: "name",
  location: "name",
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function requestClaim(
  _prev: ClaimResult,
  formData: FormData
): Promise<ClaimResult> {
  const token = formData.get("token")?.toString().trim();
  const entityType = formData.get("entity_type")?.toString().trim() as ClaimEntityType | undefined;
  const name = formData.get("claimer_name")?.toString().trim();
  const email = formData.get("claimer_email")?.toString().trim().toLowerCase();
  const message = formData.get("message")?.toString().trim() || null;

  if (!token || !entityType || !(entityType in TABLE_BY_TYPE)) {
    return { success: false, message: "Ungültige Anfrage." };
  }
  if (!name || name.length < 2) {
    return { success: false, message: "Bitte gib deinen Namen ein." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse an." };
  }

  const table = TABLE_BY_TYPE[entityType];
  const titleCol = TITLE_COLUMN[entityType];
  const supabase = getSupabaseAdminClient();

  const { data: row, error: fetchErr } = await supabase
    .from(table)
    .select(`id, ${titleCol}, claim_status, claim_sent_at, claimed_at`)
    .eq("claim_token", token)
    .maybeSingle();

  if (fetchErr || !row) {
    return { success: false, message: "Dieser Link ist ungültig." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = row as any;

  if (r.claimed_at || r.claim_status === "approved") {
    return { success: false, message: "Dieser Eintrag wurde bereits übernommen." };
  }
  if (r.claim_status === "rejected") {
    return { success: false, message: "Diese Anfrage wurde bereits abgelehnt." };
  }
  if (r.claim_sent_at) {
    const age = Date.now() - new Date(r.claim_sent_at).getTime();
    if (age > THIRTY_DAYS_MS) {
      return { success: false, message: "Dieser Link ist abgelaufen." };
    }
  }

  const nowIso = new Date().toISOString();

  // Build update with claim fields + (optional) claimer name/message if columns exist.
  // We store the requester info in the existing claim_email field; name/message go to notification email.
  const update: Record<string, unknown> = {
    claim_status: "requested",
    claim_requested_at: nowIso,
    claim_email: email,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updErr } = await (supabase.from(table) as any)
    .update(update)
    .eq("claim_token", token);

  if (updErr) {
    console.error("Claim update error:", updErr);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  const entityTitle = r[titleCol] as string;

  try {
    await sendClaimRequestNotification({
      entityType,
      entityTitle,
      entityId: r.id,
      claimerEmail: email,
      claimerName: name,
      message,
    });
  } catch (err) {
    console.error("Claim request notification failed:", err);
  }

  try {
    await sendClaimRequestConfirmation({
      email,
      entityType,
      entityTitle,
    });
  } catch (err) {
    console.error("Claim request confirmation failed:", err);
  }

  return {
    success: true,
    message: "Danke! Wir prüfen deine Anfrage.",
  };
}
