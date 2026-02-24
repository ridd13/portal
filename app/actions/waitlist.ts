"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/email";

export type WaitlistResult = {
  success: boolean;
  message: string;
};

export async function joinWaitlist(
  _prev: WaitlistResult,
  formData: FormData
): Promise<WaitlistResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const name = formData.get("name")?.toString().trim() || null;
  const role = formData.get("role")?.toString().trim() || null;
  const city = formData.get("city")?.toString().trim() || null;

  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  const supabase = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("waitlist") as any)
    .insert({ email, name, role, city, confirmed: false })
    .select("confirmation_token")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Bereits registriert — prüfen ob schon confirmed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase.from("waitlist") as any)
        .select("confirmed, confirmation_token")
        .eq("email", email)
        .single();

      if (existing?.confirmed) {
        return { success: true, message: "Du bist bereits auf der Warteliste und bestätigt!" };
      }

      // Nicht bestätigt → E-Mail erneut senden
      if (existing?.confirmation_token) {
        try {
          await sendConfirmationEmail(email, name, existing.confirmation_token);
        } catch (e) {
          console.error("Resend error:", e);
        }
        return {
          success: true,
          message: "Wir haben dir erneut eine Bestätigungs-E-Mail geschickt. Bitte check dein Postfach!",
        };
      }

      return { success: true, message: "Du bist bereits auf der Warteliste!" };
    }
    console.error("Waitlist insert error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  // E-Mail senden
  try {
    await sendConfirmationEmail(email, name, data.confirmation_token);
  } catch (e) {
    console.error("Resend error:", e);
    // Insert hat geklappt, nur E-Mail nicht — trotzdem Erfolg zeigen
  }

  return {
    success: true,
    message: "Fast geschafft! Bitte bestätige deine E-Mail-Adresse — check dein Postfach.",
  };
}
