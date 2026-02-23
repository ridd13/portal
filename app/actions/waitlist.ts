"use server";

import { getSupabaseServerClient } from "@/lib/supabase";

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
  const { error } = await (supabase.from("waitlist") as any).insert({
    email,
    name,
    role,
    city,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true, message: "Du bist bereits auf der Warteliste!" };
    }
    console.error("Waitlist insert error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  return { success: true, message: "Du bist dabei! Wir melden uns bald bei dir." };
}
