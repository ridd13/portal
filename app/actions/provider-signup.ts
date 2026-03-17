"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase";

export type ProviderSignupResult = {
  success: boolean;
  message: string;
};

export async function registerProvider(
  _prev: ProviderSignupResult,
  formData: FormData
): Promise<ProviderSignupResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const name = formData.get("name")?.toString().trim() || null;
  const city = formData.get("city")?.toString().trim() || null;

  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  const supabase = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("provider_signups") as any).insert({
    email,
    name,
    city,
  });

  if (error && error.code !== "23505") {
    console.error("Provider signup insert error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  // Redirect to auth page with email prefilled (works for both new and existing signups)
  redirect(`/auth?mode=magic-link&email=${encodeURIComponent(email)}`);
}
