"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const VALID_STATUSES = new Set(["confirmed", "waitlisted", "cancelled", "declined"]);

export async function updateRegistrationStatus(
  _prevState: { error: string | null; success: string | null },
  formData: FormData
) {
  const registrationId = formData.get("registrationId") as string;
  const newStatus = formData.get("status") as string;

  if (!registrationId || !newStatus || !VALID_STATUSES.has(newStatus)) {
    return { error: "Ungültige Anfrage.", success: null };
  }

  // Auth check
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return { error: "Nicht authentifiziert.", success: null };
  }

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) {
    return { error: "Ungültige Sitzung.", success: null };
  }

  const supabase = getSupabaseAdminClient();

  // Verify: user owns the host that owns the event that this registration belongs to
  const { data: registration } = await supabase
    .from("event_registrations")
    .select("id, event_id")
    .eq("id", registrationId)
    .single();

  if (!registration) {
    return { error: "Anmeldung nicht gefunden.", success: null };
  }

  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", registration.event_id)
    .single();

  if (!event) {
    return { error: "Event nicht gefunden.", success: null };
  }

  const { data: host } = await supabase
    .from("hosts")
    .select("id")
    .eq("id", event.host_id)
    .eq("owner_id", user.id)
    .single();

  if (!host) {
    return { error: "Keine Berechtigung.", success: null };
  }

  // Update status
  const { error: updateError } = await supabase
    .from("event_registrations")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", registrationId);

  if (updateError) {
    console.error("Registration update error:", updateError);
    return { error: "Aktualisierung fehlgeschlagen.", success: null };
  }

  revalidatePath("/konto/anmeldungen");
  return { error: null, success: "Status aktualisiert." };
}
