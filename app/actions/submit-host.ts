"use server";

import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload-image";
import { sendClaimInvitation } from "@/lib/email";
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
  try {
    return await _submitHost(formData);
  } catch (err) {
    console.error("submitHost unhandled error:", err);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }
}

async function _submitHost(formData: FormData): Promise<SubmitResult> {
  // Honeypot
  if (formData.get("website_url_confirm")) {
    return { success: true, message: "Danke für deine Einreichung!" };
  }

  const name = formData.get("name")?.toString().trim();
  const city = formData.get("city")?.toString().trim() || null;
  const region = formData.get("region")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const websiteUrl = formData.get("website_url")?.toString().trim() || null;
  const telegramUsername = formData.get("telegram_username")?.toString().trim().replace(/^@/, "") || null;
  const instagram = formData.get("instagram")?.toString().trim().replace(/^@/, "") || null;
  const facebook = formData.get("facebook")?.toString().trim() || null;
  const linkedin = formData.get("linkedin")?.toString().trim() || null;
  const isOwnEntry = formData.get("is_own_entry") === "yes";
  const isThirdParty = formData.get("is_own_entry") === "no";
  const claimEmailRaw = formData.get("claim_email")?.toString().trim().toLowerCase() || "";
  const claimEmail = isThirdParty && claimEmailRaw.includes("@") ? claimEmailRaw : null;
  const claimToken = claimEmail ? randomUUID() : null;

  if (!name || name.length < 2) {
    return { success: false, message: "Bitte gib deinen Namen ein (mind. 2 Zeichen)." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse an." };
  }
  if (!isOwnEntry && !isThirdParty) {
    return { success: false, message: "Bitte wähle aus, ob das dein eigenes Profil ist." };
  }

  const socialLinks: Record<string, string> = {};
  if (instagram) socialLinks.instagram = `https://instagram.com/${instagram}`;
  if (facebook) socialLinks.facebook = facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`;
  if (linkedin) socialLinks.linkedin = linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`;

  const slug = slugify(name) + "-" + Date.now().toString(36);

  // Photo upload
  const photoFile = formData.get("photo") as File | null;
  let avatarUrl: string | null = null;
  if (photoFile && photoFile.size > 0) {
    avatarUrl = await uploadImage(photoFile, "hosts", slug);
  }

  const supabase = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("hosts") as any).insert({
    name,
    slug,
    city,
    region,
    description,
    email,
    website_url: websiteUrl,
    telegram_username: telegramUsername,
    social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
    avatar_url: avatarUrl,
    submitted_by_third_party: isThirdParty,
    claim_email: claimEmail,
    claim_token: claimToken,
    claim_status: claimToken ? "invited" : "none",
    claim_sent_at: claimToken ? new Date().toISOString() : null,
  });

  if (error) {
    console.error("Host submit error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  if (claimToken && claimEmail) {
    try {
      await sendClaimInvitation({
        email: claimEmail,
        entityType: "host",
        entityTitle: name,
        claimToken,
      });
    } catch (err) {
      console.error("Claim invitation email failed:", err);
    }
  }

  return {
    success: true,
    message: "Danke! Dein Profil wurde eingereicht und wird geprüft.",
  };
}
