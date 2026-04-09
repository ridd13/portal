"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import type { SubmitResult } from "./submit-event";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function submitHost(
  _prev: SubmitResult,
  formData: FormData
): Promise<SubmitResult> {
  // Honeypot
  if (formData.get("website_url_confirm")) {
    return { success: true, message: "Danke für deine Einreichung!" };
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const websiteUrl = formData.get("website_url")?.toString().trim() || null;
  const telegramUsername = formData.get("telegram_username")?.toString().trim().replace(/^@/, "") || null;
  const instagram = formData.get("instagram")?.toString().trim().replace(/^@/, "") || null;
  const facebook = formData.get("facebook")?.toString().trim() || null;
  const linkedin = formData.get("linkedin")?.toString().trim() || null;

  if (!name || name.length < 2) {
    return { success: false, message: "Bitte gib deinen Namen ein (mind. 2 Zeichen)." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse an." };
  }

  const socialLinks: Record<string, string> = {};
  if (instagram) socialLinks.instagram = `https://instagram.com/${instagram}`;
  if (facebook) socialLinks.facebook = facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`;
  if (linkedin) socialLinks.linkedin = linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`;

  const slug = slugify(name) + "-" + Date.now().toString(36);

  const supabase = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("hosts") as any).insert({
    name,
    slug,
    description,
    email,
    website_url: websiteUrl,
    telegram_username: telegramUsername,
    social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
  });

  if (error) {
    console.error("Host submit error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  return {
    success: true,
    message: "Danke! Dein Profil wurde eingereicht und wird geprüft.",
  };
}
