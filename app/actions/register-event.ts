"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  sendRegistrationConfirmation,
  sendHostRegistrationNotification,
} from "@/lib/email";

export type RegisterResult = {
  success: boolean;
  message: string;
  status?: "confirmed" | "waitlisted" | "pending_confirmation";
};

export async function registerForEvent(
  _prev: RegisterResult,
  formData: FormData
): Promise<RegisterResult> {
  // Honeypot
  if (formData.get("website_url_confirm")) {
    return { success: true, message: "Danke für deine Anmeldung!" };
  }

  const eventId = formData.get("event_id")?.toString().trim();
  const firstName = formData.get("first_name")?.toString().trim();
  const lastName = formData.get("last_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const phone = formData.get("phone")?.toString().trim() || null;
  const message = formData.get("message")?.toString().trim() || null;
  const privacyAccepted = formData.get("privacy") === "on";

  // Validation
  if (!eventId) {
    return { success: false, message: "Event nicht gefunden." };
  }
  if (!firstName || firstName.length < 2) {
    return { success: false, message: "Bitte gib deinen Vornamen ein." };
  }
  if (!lastName || lastName.length < 2) {
    return { success: false, message: "Bitte gib deinen Nachnamen ein." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse an." };
  }
  if (!privacyAccepted) {
    return { success: false, message: "Bitte akzeptiere die Datenschutzerklärung." };
  }

  const supabase = getSupabaseServerClient();
  const adminClient = getSupabaseAdminClient();

  // Load event with capacity info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: event, error: eventError } = await (supabase.from("events") as any)
    .select("id, title, capacity, waitlist_enabled, registration_enabled, host_id, start_at")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, message: "Event nicht gefunden." };
  }

  if (!event.registration_enabled) {
    return { success: false, message: "Die Anmeldung für dieses Event ist nicht möglich." };
  }

  // Check if already registered
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (adminClient.from("event_registrations") as any)
    .select("id, status")
    .eq("event_id", eventId)
    .eq("email", email)
    .maybeSingle();

  if (existing && existing.status !== "cancelled") {
    return { success: false, message: "Du bist bereits für dieses Event angemeldet." };
  }

  // Count current confirmed registrations for capacity check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: confirmedCount } = await (adminClient.from("event_registrations") as any)
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "confirmed");

  // Determine registration status
  let status: "confirmed" | "waitlisted" = "confirmed";
  const currentCount = confirmedCount || 0;

  if (event.capacity && currentCount >= event.capacity) {
    if (event.waitlist_enabled) {
      status = "waitlisted";
    } else {
      return { success: false, message: "Dieses Event ist leider ausgebucht." };
    }
  }

  // Determine payment status based on event price
  const paymentStatus = "not_required"; // Zahlung noch nicht implementiert

  // Insert or update (if previously cancelled)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (adminClient.from("event_registrations") as any)
    .upsert(
      {
        event_id: eventId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        message,
        status,
        payment_status: paymentStatus,
        confirmed_at: new Date().toISOString(),
      },
      { onConflict: "event_id,email" }
    );

  if (insertError) {
    console.error("Registration error:", insertError);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  // Get event slug for email links
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventDetails } = await (supabase.from("events") as any)
    .select("slug, location_name, address")
    .eq("id", eventId)
    .single();

  // Send confirmation email to participant (async, don't block response)
  try {
    await sendRegistrationConfirmation({
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      eventTitle: event.title,
      eventSlug: eventDetails?.slug || eventId!,
      eventDate: event.start_at,
      locationName: eventDetails?.location_name || null,
      address: eventDetails?.address || null,
      status,
      message,
    });
  } catch (e) {
    console.error("Registration confirmation email failed:", e);
  }

  // Send notification email to host
  try {
    await notifyHost(adminClient, event, firstName!, lastName!, email!, message, status, currentCount);
  } catch (e) {
    console.error("Host notification failed:", e);
  }

  if (status === "waitlisted") {
    return {
      success: true,
      status: "waitlisted",
      message: "Du stehst auf der Warteliste! Wir benachrichtigen dich, sobald ein Platz frei wird.",
    };
  }

  return {
    success: true,
    status: "confirmed",
    message: "Deine Anmeldung war erfolgreich! Du erhältst eine Bestätigung per E-Mail.",
  };
}

/** Load host data and send notification email */
async function notifyHost(
  adminClient: ReturnType<typeof getSupabaseAdminClient>,
  event: { id: string; title: string; host_id: string | null; start_at: string; capacity?: number | null },
  firstName: string,
  lastName: string,
  email: string,
  message: string | null,
  status: "confirmed" | "waitlisted",
  currentCount: number
) {
  if (!event.host_id) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: host } = await (adminClient.from("hosts") as any)
    .select("name, email")
    .eq("id", event.host_id)
    .single();

  if (!host?.email) return;

  await sendHostRegistrationNotification({
    hostName: host.name || "Veranstalter",
    hostEmail: host.email,
    eventTitle: event.title,
    eventDate: event.start_at,
    participantFirstName: firstName,
    participantLastName: lastName,
    participantEmail: email,
    participantMessage: message,
    status,
    currentCount: status === "confirmed" ? currentCount + 1 : currentCount,
    capacity: event.capacity || null,
  });
}
